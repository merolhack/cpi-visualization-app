-- Implement the recalculate_daily_cpi function with actual calculation logic
CREATE OR REPLACE FUNCTION "public"."recalculate_daily_cpi"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_criterion_id bigint;
    v_months_calculated integer := 0;
BEGIN
    -- Get the General Basket criterion
    SELECT criterion_id INTO v_criterion_id
    FROM public.cpi_criteria
    WHERE criterion_name = 'General Basket'
    LIMIT 1;

    -- If criterion doesn't exist, create it
    IF v_criterion_id IS NULL THEN
        INSERT INTO public.cpi_criteria (criterion_name, criterion_description, is_active_criterion, acceptance_score)
        VALUES ('General Basket', 'Canasta básica general calculada desde precios reales', true, 1.0)
        RETURNING criterion_id INTO v_criterion_id;
    END IF;

    -- Delete existing data for months we're recalculating (last 6 months to allow corrections)
    DELETE FROM public.cpi_real_cpi
    WHERE country_id = 1
      AND update_date < NOW() - INTERVAL '6 months';

    -- Calculate and insert inflation data using month-over-month comparison
    WITH 
    monthly_prices AS (
        SELECT 
            pr.country_id,
            EXTRACT(YEAR FROM p.date)::integer as year,
            EXTRACT(MONTH FROM p.date)::integer as month,
            pr.product_id,
            AVG(p.price_value) as avg_price
        FROM cpi_prices p
        JOIN cpi_products pr ON p.product_id = pr.product_id
        WHERE p.is_valid = true
          AND pr.country_id = 1
          AND p.date >= NOW() - INTERVAL '1 year'  -- Only last year
        GROUP BY pr.country_id, year, month, pr.product_id
    ),
    month_over_month AS (
        SELECT 
            curr.country_id,
            curr.year,
            curr.month,
            curr.product_id,
            curr.avg_price as current_price,
            prev.avg_price as previous_month_price,
            CASE 
                WHEN prev.avg_price > 0 AND prev.avg_price IS NOT NULL
                THEN ((curr.avg_price - prev.avg_price) / prev.avg_price * 100)
                ELSE NULL
            END as monthly_change_rate
        FROM monthly_prices curr
        LEFT JOIN monthly_prices prev 
            ON curr.product_id = prev.product_id
            AND curr.country_id = prev.country_id
            AND (
                (prev.year = curr.year AND prev.month = curr.month - 1) OR
                (prev.year = curr.year - 1 AND prev.month = 12 AND curr.month = 1)
            )
    ),
    annualized_inflation AS (
        SELECT 
            country_id,
            year,
            month,
            (POWER(1 + AVG(monthly_change_rate)/100, 12) - 1) * 100 as annualized_rate,
            COUNT(*) as products_compared
        FROM month_over_month
        WHERE monthly_change_rate IS NOT NULL
        GROUP BY country_id, year, month
        HAVING COUNT(*) >= 2
    )
    INSERT INTO public.cpi_real_cpi (country_id, criterion_id, real_cpi_inflation_rate, month, year, update_date)
    SELECT 
        ai.country_id,
        v_criterion_id,
        ROUND(COALESCE(ai.annualized_rate, 0)::numeric, 2),
        ai.month,
        ai.year,
        NOW()
    FROM annualized_inflation ai
    WHERE ai.products_compared >= 2
    ON CONFLICT DO NOTHING;

    -- Get count of months calculated
    GET DIAGNOSTICS v_months_calculated = ROW_COUNT;

    -- Log completion
    RAISE NOTICE 'CPI recalculation completed. Calculated % months.', v_months_calculated;
    
END;
$$;

-- Ensure proper permissions
ALTER FUNCTION "public"."recalculate_daily_cpi"() OWNER TO "postgres";
GRANT EXECUTE ON FUNCTION "public"."recalculate_daily_cpi"() TO service_role;
