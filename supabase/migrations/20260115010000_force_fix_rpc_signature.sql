-- Force drop BOTH versions of add_product_and_price in production
-- Version 1: with p_canonical_id returning TABLE
DROP FUNCTION IF EXISTS public.add_product_and_price(text, text, bigint, bigint, bigint, bigint, numeric, date, bigint) CASCADE;

-- Version 2: with p_user_id returning bigint  
DROP FUNCTION IF EXISTS public.add_product_and_price(text, text, bigint, bigint, bigint, bigint, numeric, date, uuid) CASCADE;

-- Create ONLY the 8-parameter version matching frontend
CREATE FUNCTION public.add_product_and_price(
    p_product_name text,
    p_ean_code text,
    p_country_id bigint,
    p_category_id bigint,
    p_establishment_id bigint,
    p_location_id bigint,
    p_price_value numeric,
    p_price_date date
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_product_id BIGINT;
    v_final_user_id UUID;
BEGIN
    -- Get user ID from auth context
    v_final_user_id := auth.uid();

    -- Try to find product by EAN code
    SELECT product_id INTO v_product_id
    FROM public.cpi_products
    WHERE ean_code = p_ean_code
    LIMIT 1;

    -- If product doesn't exist, create it
    IF v_product_id IS NULL THEN
        INSERT INTO public.cpi_products (country_id, category_id, product_name, ean_code, is_active_product)
        VALUES (p_country_id, p_category_id, p_product_name, p_ean_code, TRUE)
        RETURNING product_id INTO v_product_id;
    END IF;

    -- Insert the price
    INSERT INTO public.cpi_prices (product_id, establishment_id, location_id, user_id, price_value, date, is_valid)
    VALUES (
        v_product_id,
        p_establishment_id,
        p_location_id,
        v_final_user_id,
        p_price_value,
        p_price_date,
        TRUE
    );

    -- Return the product_id so frontend can update image URL
    RETURN v_product_id;
END;
$$;

-- Set ownership and permissions
ALTER FUNCTION public.add_product_and_price(text, text, bigint, bigint, bigint, bigint, numeric, date) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.add_product_and_price(text, text, bigint, bigint, bigint, bigint, numeric, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_product_and_price(text, text, bigint, bigint, bigint, bigint, numeric, date) TO anon;
