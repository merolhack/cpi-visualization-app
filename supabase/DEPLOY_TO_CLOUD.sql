-- ============================================================================
-- DEPLOYMENT SCRIPT FOR SUPABASE CLOUD
-- Execute this script in the Supabase Dashboard SQL Editor
-- ============================================================================

-- Migration 1: Add RLS Policies
-- File: 20251121000010_add_rls_policies.sql
-- ============================================================================

-- cpi_criteria: Read access for all users (including guests/anonymous)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cpi_criteria' 
    AND policyname = 'Allow public read access to cpi_criteria'
  ) THEN
    CREATE POLICY "Allow public read access to cpi_criteria"
    ON public.cpi_criteria
    FOR SELECT
    USING (true);
  END IF;
END $$;

COMMENT ON POLICY "Allow public read access to cpi_criteria" ON public.cpi_criteria IS 
'Allows all users (authenticated and anonymous) to read criteria data. This is reference data needed by the application.';

-- cpi_locations: Read access for all users (including guests/anonymous)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cpi_locations' 
    AND policyname = 'Allow public read access to cpi_locations'
  ) THEN
    CREATE POLICY "Allow public read access to cpi_locations"
    ON public.cpi_locations
    FOR SELECT
    USING (true);
  END IF;
END $$;

COMMENT ON POLICY "Allow public read access to cpi_locations" ON public.cpi_locations IS 
'Allows all users (authenticated and anonymous) to read location data. This is reference data needed by the application.';

-- cpi_withdrawals: User-scoped access (users can only see their own records)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cpi_withdrawals' 
    AND policyname = 'Users can view their own withdrawals'
  ) THEN
    CREATE POLICY "Users can view their own withdrawals"
    ON public.cpi_withdrawals
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cpi_withdrawals' 
    AND policyname = 'Users can create their own withdrawals'
  ) THEN
    CREATE POLICY "Users can create their own withdrawals"
    ON public.cpi_withdrawals
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cpi_withdrawals' 
    AND policyname = 'Users can update their own withdrawals'
  ) THEN
    CREATE POLICY "Users can update their own withdrawals"
    ON public.cpi_withdrawals
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cpi_withdrawals' 
    AND policyname = 'Users can delete their own withdrawals'
  ) THEN
    CREATE POLICY "Users can delete their own withdrawals"
    ON public.cpi_withdrawals
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

COMMENT ON POLICY "Users can view their own withdrawals" ON public.cpi_withdrawals IS 
'Allows authenticated users to view only their own withdrawal records.';

COMMENT ON POLICY "Users can create their own withdrawals" ON public.cpi_withdrawals IS 
'Allows authenticated users to create withdrawal records for themselves.';

COMMENT ON POLICY "Users can update their own withdrawals" ON public.cpi_withdrawals IS 
'Allows authenticated users to update only their own withdrawal records.';

COMMENT ON POLICY "Users can delete their own withdrawals" ON public.cpi_withdrawals IS 
'Allows authenticated users to delete only their own withdrawal records.';

-- ============================================================================
-- Migration 2: Add Foreign Key Index
-- File: 20251121000011_add_category_id_index.sql
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_cpi_products_category_id 
ON public.cpi_products (category_id);

COMMENT ON INDEX public.idx_cpi_products_category_id IS 
'Index on category_id foreign key to improve query performance and foreign key constraint checks.';

-- ============================================================================
-- VERIFICATION QUERIES
-- Run these after executing the above to verify successful deployment
-- ============================================================================

-- Verify RLS policies were created
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('cpi_criteria', 'cpi_locations', 'cpi_withdrawals')
ORDER BY tablename, policyname;

-- Verify index was created
SELECT indexname, tablename
FROM pg_indexes 
WHERE tablename = 'cpi_products' 
AND indexname = 'idx_cpi_products_category_id';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
-- If both verification queries return results, the migrations were successful!
-- You should see:
-- - 2 policies for cpi_criteria and cpi_locations (public read access)
-- - 4 policies for cpi_withdrawals (user-scoped CRUD)
-- - 1 index for cpi_products.category_id
