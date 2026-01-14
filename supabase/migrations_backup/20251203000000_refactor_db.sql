-- Clean up duplicate/redundant policies

-- cpi_criteria
DROP POLICY IF EXISTS "Enable read access for all users" ON public.cpi_criteria;

-- cpi_locations
DROP POLICY IF EXISTS "Enable read access for all users" ON public.cpi_locations;

-- cpi_withdrawals
DROP POLICY IF EXISTS "Users can update own withdrawals" ON public.cpi_withdrawals;
DROP POLICY IF EXISTS "Users can view own withdrawals" ON public.cpi_withdrawals;
DROP POLICY IF EXISTS "Users can insert own withdrawals" ON public.cpi_withdrawals;

-- Add missing index for performance
CREATE INDEX IF NOT EXISTS idx_cpi_products_category_id ON public.cpi_products(category_id);
