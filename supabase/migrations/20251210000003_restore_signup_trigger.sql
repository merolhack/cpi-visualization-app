-- Restore the signup trigger after debugging
-- Re-applies the logic from 20251121000012_fix_signup_trigger.sql
-- Relies on schema fix 20251210000001_fix_cpi_volunteers_schema.sql

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert into cpi_users
  INSERT INTO public.cpi_users (user_id, email)
  VALUES (new.id, new.email);

  -- Insert into cpi_volunteers
  -- Now safe because we ensured columns exist via 20251210000001
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

-- Ensure trigger exists (in case it was dropped manually)
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
