-- Fix RLS Gaps
-- This script adds missing RLS policies for tables flagged in warnings

-- 1. cpi_criteria (Public Read)
ALTER TABLE public.cpi_criteria ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'cpi_criteria' AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users" ON public.cpi_criteria
        FOR SELECT USING (true);
    END IF;
END $$;

-- 2. cpi_locations (Public Read)
ALTER TABLE public.cpi_locations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'cpi_locations' AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users" ON public.cpi_locations
        FOR SELECT USING (true);
    END IF;
END $$;

-- 3. cpi_withdrawals (User-scoped)
ALTER TABLE public.cpi_withdrawals ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'cpi_withdrawals' AND policyname = 'Users can view own withdrawals'
    ) THEN
        CREATE POLICY "Users can view own withdrawals" ON public.cpi_withdrawals
        FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'cpi_withdrawals' AND policyname = 'Users can insert own withdrawals'
    ) THEN
        CREATE POLICY "Users can insert own withdrawals" ON public.cpi_withdrawals
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'cpi_withdrawals' AND policyname = 'Users can update own withdrawals'
    ) THEN
        CREATE POLICY "Users can update own withdrawals" ON public.cpi_withdrawals
        FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;
