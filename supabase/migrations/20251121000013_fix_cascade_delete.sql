-- Migration to add ON DELETE CASCADE to foreign keys
-- This ensures that when a user is deleted from auth.users, their records in public tables are also deleted.

-- Fix cpi_users foreign key
ALTER TABLE public.cpi_users
DROP CONSTRAINT IF EXISTS cpi_users_user_id_fkey;

ALTER TABLE public.cpi_users
ADD CONSTRAINT cpi_users_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Fix cpi_volunteers foreign key
ALTER TABLE public.cpi_volunteers
DROP CONSTRAINT IF EXISTS cpi_volunteers_user_id_fkey;

ALTER TABLE public.cpi_volunteers
ADD CONSTRAINT cpi_volunteers_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;
