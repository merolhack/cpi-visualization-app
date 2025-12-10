-- Migration: Add RLS policies for tables with RLS enabled but no policies
-- This migration is idempotent (can be run multiple times safely)

-- ============================================================================
-- cpi_locations: Read access for all users (including guests/anonymous)
-- ============================================================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow public read access to cpi_locations" ON public.cpi_locations;

-- Create policy
CREATE POLICY "Allow public read access to cpi_locations"
ON public.cpi_locations
FOR SELECT
USING (true);

-- ============================================================================
-- cpi_withdrawals: User-scoped access (users can only see their own records)
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own withdrawals" ON public.cpi_withdrawals;
DROP POLICY IF EXISTS "Users can create their own withdrawals" ON public.cpi_withdrawals;
DROP POLICY IF EXISTS "Users can update their own withdrawals" ON public.cpi_withdrawals;
DROP POLICY IF EXISTS "Users can delete their own withdrawals" ON public.cpi_withdrawals;

-- Create policies
CREATE POLICY "Users can view their own withdrawals"
ON public.cpi_withdrawals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own withdrawals"
ON public.cpi_withdrawals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own withdrawals"
ON public.cpi_withdrawals
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own withdrawals"
ON public.cpi_withdrawals
FOR DELETE
USING (auth.uid() = user_id);