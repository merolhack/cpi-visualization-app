-- Run these queries in Supabase SQL Editor to get all column names

-- cpi_tracking columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'cpi_tracking' 
ORDER BY ordinal_position;

-- cpi_withdrawals columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'cpi_withdrawals' 
ORDER BY ordinal_position;

-- cpi_prices columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'cpi_prices' 
ORDER BY ordinal_position;

-- cpi_products columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'cpi_products' 
ORDER BY ordinal_position;
