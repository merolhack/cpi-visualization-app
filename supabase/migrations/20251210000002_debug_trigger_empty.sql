-- Debug: Empty the signup trigger logic to isolate the error
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- TEMPORARILY DISABLED INSERTS FOR DEBUGGING
    -- INSERT INTO public.cpi_users (user_id, email) VALUES (new.id, new.email);
    -- INSERT INTO public.cpi_volunteers (...) ...
    RETURN new;
END;
$$;
