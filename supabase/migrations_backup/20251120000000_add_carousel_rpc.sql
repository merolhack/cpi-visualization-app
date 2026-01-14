-- Función para obtener productos con cambios significativos de precio para el carrusel
CREATE OR REPLACE FUNCTION public.get_products_with_significant_changes()
RETURNS TABLE (
    product_id BIGINT,
    product_name TEXT,
    product_photo_url TEXT,
    current_price NUMERIC,
    previous_price NUMERIC,
    price_change_percentage NUMERIC,
    last_update_date TIMESTAMP WITH TIME ZONE,
    establishment_name TEXT,
    location_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH LatestPrices AS (
        SELECT 
            p.product_id,
            p.price_value,
            p.date,
            p.establishment_id,
            p.location_id,
            ROW_NUMBER() OVER (PARTITION BY p.product_id ORDER BY p.date DESC) as rn
        FROM 
            cpi_prices p
        WHERE 
            p.is_valid = true
    ),
    PriceComparison AS (
        SELECT 
            curr.product_id,
            curr.price_value as current_price,
            prev.price_value as previous_price,
            curr.date as last_update_date,
            curr.establishment_id,
            curr.location_id,
            ((curr.price_value - prev.price_value) / prev.price_value) * 100 as change_percentage
        FROM 
            LatestPrices curr
        JOIN 
            LatestPrices prev ON curr.product_id = prev.product_id AND prev.rn = 2
        WHERE 
            curr.rn = 1
    )
    SELECT 
        prod.product_id,
        prod.product_name,
        prod.product_photo_url,
        pc.current_price,
        pc.previous_price,
        pc.change_percentage as price_change_percentage,
        pc.last_update_date::timestamp with time zone,
        est.establishment_name,
        loc.location_name
    FROM 
        PriceComparison pc
    JOIN 
        cpi_products prod ON pc.product_id = prod.product_id
    JOIN 
        cpi_establishments est ON pc.establishment_id = est.establishment_id
    JOIN 
        cpi_locations loc ON pc.location_id = loc.location_id
    WHERE 
        ABS(pc.change_percentage) > 5 -- Mostrar solo cambios mayores al 5% (positivo o negativo)
    ORDER BY 
        ABS(pc.change_percentage) DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permitir acceso público a la función
GRANT EXECUTE ON FUNCTION public.get_products_with_significant_changes() TO anon, authenticated;
