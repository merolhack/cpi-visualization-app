-- Add product_photo_url to cpi_products if it is missing
-- This fixes the local dev environment where an earlier migration created the table without this column

ALTER TABLE IF EXISTS public.cpi_products 
ADD COLUMN IF NOT EXISTS product_photo_url TEXT;
