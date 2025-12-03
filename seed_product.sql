do $$ 
declare 
  v_user_id uuid; 
  v_country_id bigint; 
  v_category_id bigint; 
  v_establishment_id bigint; 
  v_location_id bigint; 
  v_product_id bigint; 
begin 
  select id into v_user_id from auth.users where email = 'test@example.com'; 
  select country_id into v_country_id from cpi_countries limit 1; 
  select category_id into v_category_id from cpi_categories limit 1; 
  select establishment_id into v_establishment_id from cpi_establishments limit 1; 
  select location_id into v_location_id from cpi_locations limit 1; 

  -- Ensure cpi_users exists
  insert into cpi_users (user_id, email) 
  values (v_user_id, 'test@example.com')
  on conflict (user_id) do nothing;
    
  insert into cpi_products (product_name, ean_code, country_id, category_id, is_active_product) 
  values ('Test Product', '12345678', v_country_id, v_category_id, true) 
  returning product_id into v_product_id; 
  
  insert into cpi_prices (product_id, price_value, date, location_id, establishment_id, user_id) 
  values (v_product_id, 100, '2023-01-01', v_location_id, v_establishment_id, v_user_id); 
end $$;
