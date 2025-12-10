-- Fix cpi_volunteers schema mismatch
-- The table was created by 20251115...sql which is missing columns used by the signup trigger in 20251121...sql

ALTER TABLE IF EXISTS public.cpi_volunteers 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS suspended BOOLEAN DEFAULT false; -- trigger expects 'suspended', 20251119 uses 'suspended'
