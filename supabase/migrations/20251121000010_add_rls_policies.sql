-- Migration: Add RLS policies for tables with RLS enabled but no policies
-- Tables affected: cpi_criteria, cpi_locations, cpi_withdrawals

-- ============================================================================
-- cpi_criteria: Read access for all users (including guests/anonymous)
-- ============================================================================

-- Allow all users (authenticated and anonymous) to SELECT from cpi_criteria
CREATE POLICY "Allow public read access to cpi_criteria"
ON public.cpi_criteria
FOR SELECT
USING (true);

COMMENT ON POLICY "Allow public read access to cpi_criteria" ON public.cpi_criteria IS 
'Allows all users (authenticated and anonymous) to read criteria data. This is reference data needed by the application.';

-- ============================================================================
-- cpi_locations: Read access for all users (including guests/anonymous)
-- ============================================================================

-- Allow all users (authenticated and anonymous) to SELECT from cpi_locations
CREATE POLICY "Allow public read access to cpi_locations"
ON public.cpi_locations
FOR SELECT
USING (true);

COMMENT ON POLICY "Allow public read access to cpi_locations" ON public.cpi_locations IS 
'Allows all users (authenticated and anonymous) to read location data. This is reference data needed by the application.';

-- ============================================================================
-- cpi_withdrawals: User-scoped access (users can only see their own records)
-- ============================================================================

-- Allow users to SELECT only their own withdrawal records
CREATE POLICY "Users can view their own withdrawals"
ON public.cpi_withdrawals
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to INSERT their own withdrawal records
CREATE POLICY "Users can create their own withdrawals"
ON public.cpi_withdrawals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to UPDATE only their own withdrawal records
CREATE POLICY "Users can update their own withdrawals"
ON public.cpi_withdrawals
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to DELETE only their own withdrawal records
CREATE POLICY "Users can delete their own withdrawals"
ON public.cpi_withdrawals
FOR DELETE
USING (auth.uid() = user_id);

COMMENT ON POLICY "Users can view their own withdrawals" ON public.cpi_withdrawals IS 
'Allows authenticated users to view only their own withdrawal records.';

COMMENT ON POLICY "Users can create their own withdrawals" ON public.cpi_withdrawals IS 
'Allows authenticated users to create withdrawal records for themselves.';

COMMENT ON POLICY "Users can update their own withdrawals" ON public.cpi_withdrawals IS 
'Allows authenticated users to update only their own withdrawal records.';

COMMENT ON POLICY "Users can delete their own withdrawals" ON public.cpi_withdrawals IS 
'Allows authenticated users to delete only their own withdrawal records.';
