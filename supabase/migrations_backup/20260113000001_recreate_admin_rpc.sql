CREATE OR REPLACE FUNCTION get_all_products_admin(
  p_search TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  category_name TEXT,
  image_url TEXT,
  is_active BOOLEAN,
  price_count BIGINT,
  last_update DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.product_id,
    p.product_name,
    c.category_name,
    p.product_photo_url as image_url,
    p.is_active_product as is_active,
    (SELECT COUNT(*) FROM cpi_prices pr WHERE pr.product_id = p.product_id) as price_count,
    (SELECT MAX(date) FROM cpi_prices pr WHERE pr.product_id = p.product_id) as last_update
  FROM cpi_products p
  LEFT JOIN cpi_categories c ON p.category_id = c.category_id
  WHERE (p_search IS NULL OR p.product_name ILIKE '%' || p_search || '%')
  ORDER BY p.product_id DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;
