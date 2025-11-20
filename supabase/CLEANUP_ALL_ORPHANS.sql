-- Script to delete ALL orphaned records
-- This removes records from public tables where the user_id no longer exists in auth.users

-- Delete orphans from cpi_volunteers
DELETE FROM public.cpi_volunteers
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Delete orphans from cpi_users
DELETE FROM public.cpi_users
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Verify cleanup
SELECT count(*) as orphaned_volunteers FROM public.cpi_volunteers WHERE user_id NOT IN (SELECT id FROM auth.users);
SELECT count(*) as orphaned_users FROM public.cpi_users WHERE user_id NOT IN (SELECT id FROM auth.users);
