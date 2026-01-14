# Fix for Duplicate RPC Functions

## Problem
The error "function get_all_products_admin() is not unique" means there are multiple versions of the function with different signatures.

## Solution

### Step 1: See all versions of the function
```sql
SELECT 
  p.oid,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type,
  p.prosrc as source_code_snippet
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'get_all_products_admin'
  AND n.nspname = 'public';
```

### Step 2: Drop ALL versions of the function
```sql
-- This will drop all overloaded versions
DROP FUNCTION IF EXISTS public.get_all_products_admin() CASCADE;
DROP FUNCTION IF EXISTS public.get_all_products_admin(integer) CASCADE;
DROP FUNCTION IF EXISTS public.get_all_products_admin(text) CASCADE;
-- Add more variations if needed
```

### Step 3: Create the correct version
```sql
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_all_products_admin() TO authenticated, service_role, postgres, anon;
```

### Step 4: Verify it works
```sql
SELECT * FROM get_all_products_admin() LIMIT 5;
```

This should now return your 11 products successfully!
