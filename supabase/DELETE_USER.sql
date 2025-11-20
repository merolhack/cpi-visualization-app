-- Script to delete a user by email
-- This will cascade to public.cpi_users and public.cpi_volunteers if foreign keys are set up with ON DELETE CASCADE
-- Run this in the Supabase SQL Editor

-- Replace with the email you want to delete
delete from auth.users where email = 'lenin.meza@the-cocktail.com';

-- If you want to be absolutely sure everything is gone, you can check/delete from public tables manually (though cascade should handle it):
-- delete from public.cpi_volunteers where email = 'lenin.meza@the-cocktail.com';
-- delete from public.cpi_users where email = 'lenin.meza@the-cocktail.com';
