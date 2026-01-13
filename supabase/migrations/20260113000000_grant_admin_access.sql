-- Add role column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cpi_users' AND column_name = 'role') THEN
        ALTER TABLE public.cpi_users ADD COLUMN role text DEFAULT 'user';
    END IF;
END $$;

-- Grant admin access to specific users
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email IN ('monteromarco@yahoo.com', 'marcomontero@hotmail.com');

-- Also update our public profile table
UPDATE public.cpi_users
SET role = 'admin'
WHERE email IN ('monteromarco@yahoo.com', 'marcomontero@hotmail.com');

-- ============================================================================
-- RLS Policies for Admin Access
-- ============================================================================

-- Products
DROP POLICY IF EXISTS "Admins can insert products" ON public.cpi_products;
CREATE POLICY "Admins can insert products"
ON public.cpi_products
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.cpi_users WHERE role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can update products" ON public.cpi_products;
CREATE POLICY "Admins can update products"
ON public.cpi_products
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM public.cpi_users WHERE role = 'admin'
  )
);

-- Prices
DROP POLICY IF EXISTS "Admins can insert prices" ON public.cpi_prices;
CREATE POLICY "Admins can insert prices"
ON public.cpi_prices
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.cpi_users WHERE role = 'admin'
  )
);
