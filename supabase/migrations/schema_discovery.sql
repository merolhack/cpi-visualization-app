-- Query to discover actual column names in the database
-- Run this in Supabase SQL Editor to see the real column names

-- Check cpi_finances table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cpi_finances' 
ORDER BY ordinal_position;

-- Check cpi_tracking table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cpi_tracking' 
ORDER BY ordinal_position;

-- Check cpi_withdrawals table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cpi_withdrawals' 
ORDER BY ordinal_position;

-- Check cpi_prices table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cpi_prices' 
ORDER BY ordinal_position;

-- Check cpi_products table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cpi_products' 
ORDER BY ordinal_position;
