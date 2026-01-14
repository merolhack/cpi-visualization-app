-- Migration: Add index for foreign key on cpi_products.category_id
-- This improves query performance for foreign key constraint checks and joins

-- Create index on category_id foreign key column
CREATE INDEX IF NOT EXISTS idx_cpi_products_category_id 
ON public.cpi_products (category_id);

COMMENT ON INDEX public.idx_cpi_products_category_id IS 
'Index on category_id foreign key to improve query performance and foreign key constraint checks.';
