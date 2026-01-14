-- Re-apply fixes for RPCs that might have been reverted by sync
-- Must DROP first because return types might have changed

-- Fix Categories RPC (Use category_id instead of id)
DROP FUNCTION IF EXISTS public.get_all_categories_admin();
CREATE OR REPLACE FUNCTION public.get_all_categories_admin()
RETURNS TABLE (
  category_id bigint,
  category_name text,
  product_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.category_id,
    c.category_name,
    COUNT(p.product_id)::bigint
  FROM cpi_categories c
  LEFT JOIN cpi_products p ON c.category_id = p.category_id
  GROUP BY c.category_id, c.category_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix Products RPC (Ensure correctness)
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
