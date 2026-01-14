INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000', 
  '43ee42d3-ee55-4046-8902-a192a5a8ab1a', 
  'authenticated', 
  'authenticated', 
  'monteromarco@yahoo.com', 
  'password123', 
  now(), 
  now(), 
  now(), 
  '{"provider":"email","providers":["email"]}', 
  '{"name":"Marco Montero"}', 
  now(), 
  now(), 
  '', 
  '', 
  '', 
  ''
);
