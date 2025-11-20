-- Migration to fix missing signup trigger
-- This ensures that when a new user signs up, they are added to cpi_users and cpi_volunteers

-- 1. Create the handler function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert into cpi_users
  INSERT INTO public.cpi_users (user_id, email)
  VALUES (new.id, new.email);

  -- Insert into cpi_volunteers (defaulting to not suspended)
  -- We use a default name 'Volunteer' because the column is NOT NULL
  INSERT INTO public.cpi_volunteers (user_id, email, name, suspended)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Volunteer'), 
    false
  );

  RETURN new;
END;
$$;

-- 2. Create the trigger
-- We use DO block to avoid error if trigger already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;
