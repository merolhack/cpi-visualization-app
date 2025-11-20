-- ============================================================================
-- OPTIMIZE RLS POLICIES FOR PERFORMANCE
-- This script drops and recreates the cpi_withdrawals policies with optimized
-- auth.uid() calls wrapped in SELECT to prevent re-evaluation per row
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own withdrawals" ON public.cpi_withdrawals;
DROP POLICY IF EXISTS "Users can create their own withdrawals" ON public.cpi_withdrawals;
DROP POLICY IF EXISTS "Users can update their own withdrawals" ON public.cpi_withdrawals;
DROP POLICY IF EXISTS "Users can delete their own withdrawals" ON public.cpi_withdrawals;

-- Recreate with optimized auth.uid() calls
-- Using (SELECT auth.uid()) prevents re-evaluation for each row

CREATE POLICY "Users can view their own withdrawals"
ON public.cpi_withdrawals
FOR SELECT
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own withdrawals"
ON public.cpi_withdrawals
FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own withdrawals"
ON public.cpi_withdrawals
FOR UPDATE
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own withdrawals"
ON public.cpi_withdrawals
FOR DELETE
USING ((SELECT auth.uid()) = user_id);

-- Add comments
COMMENT ON POLICY "Users can view their own withdrawals" ON public.cpi_withdrawals IS 
'Allows authenticated users to view only their own withdrawal records. Optimized with SELECT auth.uid() for better performance.';

COMMENT ON POLICY "Users can create their own withdrawals" ON public.cpi_withdrawals IS 
'Allows authenticated users to create withdrawal records for themselves. Optimized with SELECT auth.uid() for better performance.';

COMMENT ON POLICY "Users can update their own withdrawals" ON public.cpi_withdrawals IS 
'Allows authenticated users to update only their own withdrawal records. Optimized with SELECT auth.uid() for better performance.';

COMMENT ON POLICY "Users can delete their own withdrawals" ON public.cpi_withdrawals IS 
'Allows authenticated users to delete only their own withdrawal records. Optimized with SELECT auth.uid() for better performance.';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify policies were recreated
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'cpi_withdrawals'
ORDER BY policyname;
