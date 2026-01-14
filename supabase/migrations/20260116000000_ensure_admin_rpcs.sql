-- Force re-creation of Products RPC to ensure remote consistency
DROP FUNCTION IF EXISTS public.get_all_products_admin();

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

-- Explicitly grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_all_products_admin() TO authenticated, service_role, postgres;
GRANT EXECUTE ON FUNCTION public.get_volunteers() TO authenticated, service_role, postgres;
