CREATE OR REPLACE FUNCTION public.get_all_products_admin()
RETURNS TABLE (
  id bigint,
  name text,
  category_name text,
  establishment_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.product_id,
    p.product_name,
    c.category_name,
    COUNT(DISTINCT t.establishment_id)::bigint
  FROM cpi_products p
  LEFT JOIN cpi_categories c ON p.category_id = c.category_id
  LEFT JOIN cpi_tracking t ON p.product_id = t.product_id
  GROUP BY p.product_id, p.product_name, c.category_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
