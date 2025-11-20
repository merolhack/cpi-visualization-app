-- Get all column names for the tables we need

-- cpi_finances (we already know: finance_id, user_id, concept, date, previous_balance, amount, current_balance)

-- cpi_tracking
SELECT 'cpi_tracking' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cpi_tracking' 
ORDER BY ordinal_position;

-- cpi_withdrawals  
SELECT 'cpi_withdrawals' as table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'cpi_withdrawals' 
ORDER BY ordinal_position;

-- cpi_prices
SELECT 'cpi_prices' as table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'cpi_prices' 
ORDER BY ordinal_position;

-- cpi_products
SELECT 'cpi_products' as table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'cpi_products' 
ORDER BY ordinal_position;

-- cpi_categories
SELECT 'cpi_categories' as table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'cpi_categories' 
ORDER BY ordinal_position;

-- cpi_establishments
SELECT 'cpi_establishments' as table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'cpi_establishments' 
ORDER BY ordinal_position;
