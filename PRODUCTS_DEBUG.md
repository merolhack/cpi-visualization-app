# Products Page Debugging Guide

## Issue
Products page shows empty on production: `https://indicedeprecios.com/admin/products`

## Diagnostic Steps

### 1. Check if RPC exists on production
Go to Supabase Dashboard → SQL Editor and run:
```sql
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'get_all_products_admin';
```

**Expected result**: Should return one row showing the function exists.

**If empty**: The migration wasn't applied. Run the migration manually:

```sql
-- From migration: 20260116000000_ensure_admin_rpcs.sql
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

GRANT EXECUTE ON FUNCTION public.get_all_products_admin() TO authenticated, service_role, postgres;
```

### 2. Check if products exist in database
```sql
SELECT COUNT(*) FROM cpi_products;
```

**If 0**: Database has no products. You need to add products or restore from backup.

### 3. Test the RPC directly
```sql
SELECT * FROM get_all_products_admin();
```

**Expected**: Should return list of products with id, name, category_name, establishment_count.

### 4. Check RPC permissions
```sql
SELECT 
  proname,
  pg_get_function_identity_arguments(oid) as args,
  proacl
FROM pg_proc 
WHERE proname = 'get_all_products_admin';
```

Look for `authenticated` in the `proacl` column. If missing, run:
```sql
GRANT EXECUTE ON FUNCTION public.get_all_products_admin() TO authenticated;
```

### 5. Use diagnostic script (optional)
Set environment variables and run:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_url \
SUPABASE_SERVICE_ROLE_KEY=your_key \
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key \
node scripts/test_products_rpc.js
```

## Common Fixes

### Fix 1: RPC doesn't exist
Apply the migration manually (see step 1).

### Fix 2: No products in database
Either restore data or check if products were deleted.

### Fix 3: Permission denied
```sql
GRANT EXECUTE ON FUNCTION public.get_all_products_admin() TO authenticated;
```

### Fix 4: RPC returns empty but products exist
Check the JOIN conditions - might be an issue with foreign keys or the `cpi_tracking` table.
