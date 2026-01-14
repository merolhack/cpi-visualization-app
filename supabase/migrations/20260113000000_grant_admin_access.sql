DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'cpi_users' AND column_name = 'role') THEN
        ALTER TABLE public.cpi_users ADD COLUMN role text DEFAULT 'user';
    END IF;
END $$;

-- Update admin user role if exists
UPDATE public.cpi_users SET role = 'admin' WHERE email = 'monteromarco@yahoo.com';

-- Policies
DROP POLICY IF EXISTS "Admins can insert products" ON public.cpi_products;
CREATE POLICY "Admins can insert products" ON public.cpi_products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.cpi_users WHERE user_id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins can update products" ON public.cpi_products;
CREATE POLICY "Admins can update products" ON public.cpi_products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.cpi_users WHERE user_id = auth.uid() AND role = 'admin')
);
