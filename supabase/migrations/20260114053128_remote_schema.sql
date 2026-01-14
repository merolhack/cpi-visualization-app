create extension if not exists "pg_cron" with schema "pg_catalog";

drop extension if exists "pg_net";

create extension if not exists "pg_net" with schema "public";

drop policy "Allow public read access on categories" on "public"."cpi_categories";

drop policy "Allow public read access on countries" on "public"."cpi_countries";

drop policy "Allow public read access on establishments" on "public"."cpi_establishments";

drop policy "Allow public read access on prices" on "public"."cpi_prices";

drop policy "Admins can insert products" on "public"."cpi_products";

drop policy "Admins can update products" on "public"."cpi_products";

drop policy "Allow public read access on products" on "public"."cpi_products";

-- Removed drop function get_all_products_admin

set check_function_bodies = off;

-- Removed conflicting get_all_categories_admin definition to avoid signature mismatch with local fix


  create policy "Allow public read access on categories"
  on "public"."cpi_categories"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Allow public read access on countries"
  on "public"."cpi_countries"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Allow public read access on establishments"
  on "public"."cpi_establishments"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Allow public read access on prices"
  on "public"."cpi_prices"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Admins can insert products"
  on "public"."cpi_products"
  as permissive
  for insert
  to public
with check ((auth.uid() IN ( SELECT cpi_users.user_id
   FROM public.cpi_users
  WHERE (cpi_users.role = 'admin'::text))));



  create policy "Admins can update products"
  on "public"."cpi_products"
  as permissive
  for update
  to public
using ((auth.uid() IN ( SELECT cpi_users.user_id
   FROM public.cpi_users
  WHERE (cpi_users.role = 'admin'::text))));



  create policy "Allow public read access on products"
  on "public"."cpi_products"
  as permissive
  for select
  to anon, authenticated
using (true);


CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Allow public read access"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'product-images'::text));



  create policy "Allow service role to delete"
  on "storage"."objects"
  as permissive
  for delete
  to service_role
using ((bucket_id = 'product-images'::text));



  create policy "Allow service role to upload"
  on "storage"."objects"
  as permissive
  for insert
  to service_role
with check ((bucket_id = 'product-images'::text));



