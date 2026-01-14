SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict L9VaLVB1KlqJEnJILniPsMJX7en5F8W6D3hX5t1C0s1bSiRf2B3sHRcFyEAoF52

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '1fcaa08c-34b9-4cf1-9604-a6dc9708161b', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"merolhack@gmail.com","user_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","user_phone":""}}', '2025-09-19 03:44:23.749426+00', ''),
	('00000000-0000-0000-0000-000000000000', '014d7a80-ecc4-49e8-bc86-71e2fa213ce8', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-19 03:44:48.730486+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ac97d575-2936-437a-96dc-bb8ff4944a16', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-19 03:59:19.475303+00', ''),
	('00000000-0000-0000-0000-000000000000', '31e008a9-4ed9-4977-83ff-4264dfd1e692', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-19 04:08:07.282339+00', ''),
	('00000000-0000-0000-0000-000000000000', '528ebbd6-d2b1-42b0-b6d9-3b86a8026394', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-19 12:47:46.339927+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e277469b-ee7e-48dc-81a9-596754b24361', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-19 12:54:17.355112+00', ''),
	('00000000-0000-0000-0000-000000000000', '80c1df7b-d843-413d-98cd-35fede8954b8', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-19 14:34:22.384503+00', ''),
	('00000000-0000-0000-0000-000000000000', '8fa2f81d-6aaf-404d-950e-fcd958ed8d1e', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-19 14:43:54.453029+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c852b5f8-9c76-4e8e-898d-7b7f1c5ef454', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-19 16:28:31.938815+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a283903d-9c36-49c5-909e-2685fa578271', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-20 15:07:11.80066+00', ''),
	('00000000-0000-0000-0000-000000000000', '57290fd5-e7c8-496e-8966-9fa127df563d', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-20 15:07:46.803315+00', ''),
	('00000000-0000-0000-0000-000000000000', '0d367679-b6cc-461b-848c-cdd2c5d4fb13', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-20 15:08:55.178548+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c94a4104-e761-495b-af3a-4806b4c642c2', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-20 15:11:14.733033+00', ''),
	('00000000-0000-0000-0000-000000000000', '90949be3-e624-42db-a243-0e5fe3871919', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-20 15:22:56.69149+00', ''),
	('00000000-0000-0000-0000-000000000000', '13a638aa-ca09-44ba-b7cf-b2c3d1cf75d8', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-20 15:33:25.729503+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd05e9238-9d31-4cc2-a240-d6999c9d0ec4', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-20 15:34:53.730423+00', ''),
	('00000000-0000-0000-0000-000000000000', '374a164e-b2fa-498a-b877-06b5dfc86f2f', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-20 15:41:20.420486+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a3933410-a320-4fd4-a85d-198a6a6e1fc1', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-20 15:49:20.535639+00', ''),
	('00000000-0000-0000-0000-000000000000', '6bbe794a-2380-4729-a5ae-2051986b3fd0', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-20 15:50:33.403081+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd2950c87-fce0-4059-94df-0b07e5070c55', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-20 15:53:10.109069+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f895f5e3-3452-4e61-8ef8-963c83ed91e7', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-20 15:59:02.589406+00', ''),
	('00000000-0000-0000-0000-000000000000', '67e544ff-7a15-49dc-b4ec-43bc981b9495', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-20 16:06:29.810508+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd9d2ed7a-96a1-4c88-a66b-0e2b1cdeacf3', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-09-20 19:08:43.296271+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e01fa9ef-21b2-4558-8e1c-09e0f1c82cf2', '{"action":"user_repeated_signup","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-11-18 06:38:48.439141+00', ''),
	('00000000-0000-0000-0000-000000000000', '153bd0ce-e078-4c46-a548-64cd21bc3572', '{"action":"user_repeated_signup","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-11-18 06:39:13.380686+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bcf3dea1-875a-4f64-83ab-2927137f1ccd', '{"action":"user_repeated_signup","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-11-18 07:19:15.712142+00', ''),
	('00000000-0000-0000-0000-000000000000', '175754e4-20d3-40e8-8a17-4882938f683c', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-18 07:27:20.713468+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a3145b7e-5f8e-4ee7-ab69-380f7e1044a7', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-18 07:27:55.113639+00', ''),
	('00000000-0000-0000-0000-000000000000', '536271fe-0312-446a-ad51-e8a8f8a56164', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-18 07:28:16.629835+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b67056f4-b135-473d-a774-32c682640caa', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-18 07:48:55.510201+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b56dc919-f82a-4157-af4d-821fce8be930', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-18 07:51:09.363096+00', ''),
	('00000000-0000-0000-0000-000000000000', '9822fa55-7c57-4096-8639-c3505a7bd38d', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-18 07:53:28.190142+00', ''),
	('00000000-0000-0000-0000-000000000000', '9fa0c8b6-5e47-463e-a1fa-4cc5925c6a89', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-18 08:22:27.685819+00', ''),
	('00000000-0000-0000-0000-000000000000', '96d7d35c-99ea-4ba9-92cb-525cc8562aaf', '{"action":"logout","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-11-18 08:23:07.894021+00', ''),
	('00000000-0000-0000-0000-000000000000', '051fe934-f551-4eca-981d-9a424865545e', '{"action":"login","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-18 08:48:46.671764+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cd171fdf-349c-4e30-9896-3e67ecad407a', '{"action":"token_refreshed","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-18 10:22:58.709662+00', ''),
	('00000000-0000-0000-0000-000000000000', 'abdc2e0f-2e7a-41b8-a25e-fafc6446dac5', '{"action":"token_revoked","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-18 10:22:58.729024+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fb86d37b-2cc6-46e3-a166-57a84b0d6e6a', '{"action":"token_refreshed","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-19 03:24:06.606509+00', ''),
	('00000000-0000-0000-0000-000000000000', 'aff655be-78aa-4f1a-a356-2b9193c9584c', '{"action":"token_revoked","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-19 03:24:06.613627+00', ''),
	('00000000-0000-0000-0000-000000000000', '1dc2975f-5ed3-440f-9ac7-30487deeda08', '{"action":"token_refreshed","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-19 14:12:19.58303+00', ''),
	('00000000-0000-0000-0000-000000000000', '5d5fd5a4-e366-4725-920d-32d8c56d8fcc', '{"action":"token_revoked","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-19 14:12:19.599007+00', ''),
	('00000000-0000-0000-0000-000000000000', '25d4a01b-bb8e-4653-9290-0d38b9359c2d', '{"action":"token_refreshed","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-19 16:11:54.989211+00', ''),
	('00000000-0000-0000-0000-000000000000', '4c372941-f494-49a3-ba21-d76c7a44470f', '{"action":"token_revoked","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-19 16:11:55.009168+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ba8dd4a1-a21b-49e5-ac0c-a474fabe23b4', '{"action":"token_refreshed","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-19 16:11:55.428623+00', ''),
	('00000000-0000-0000-0000-000000000000', '04e428b9-6ae1-4ad0-a0d9-8d80c89cee9b', '{"action":"token_refreshed","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-19 17:11:39.547002+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f8d670a1-1a3a-48c2-8e65-012ff23d5394', '{"action":"token_revoked","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-19 17:11:39.563918+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b31d94a2-a870-4755-950e-5b3d784408a7', '{"action":"user_confirmation_requested","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-11-19 18:02:56.565577+00', ''),
	('00000000-0000-0000-0000-000000000000', '8285efca-aa32-42fd-9ace-7d8ce6a3fadf', '{"action":"token_refreshed","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-19 21:15:45.991686+00', ''),
	('00000000-0000-0000-0000-000000000000', '0660265c-c24c-4014-af2a-0e4ae7b5ed21', '{"action":"token_revoked","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-19 21:15:46.018024+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd24af920-9323-4434-9be7-cd5f445b837e', '{"action":"token_refreshed","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-19 22:53:35.397819+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f1ee4f91-491f-4dc2-8b03-ffa2f381016c', '{"action":"token_revoked","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-11-19 22:53:35.415552+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd185e07d-ff6d-4186-bd17-08ec1d01f79d', '{"action":"logout","actor_id":"68a5501f-9f74-459d-9b0d-25ef6564937e","actor_username":"merolhack@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-11-19 22:53:59.673888+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bf8dcf9e-4b02-4d31-96ea-7a25bd4c6517', '{"action":"user_confirmation_requested","actor_id":"e063094e-d2be-48c9-b055-d56c12a4e074","actor_username":"lenin.meza@the-cocktail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-11-20 15:51:04.794008+00', ''),
	('00000000-0000-0000-0000-000000000000', '9189eacf-5beb-42ee-abc9-826bacfef010', '{"action":"user_signedup","actor_id":"e063094e-d2be-48c9-b055-d56c12a4e074","actor_username":"lenin.meza@the-cocktail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-20 15:51:23.654759+00', ''),
	('00000000-0000-0000-0000-000000000000', 'de7d19d8-561d-4876-9fd0-f11df62efea3', '{"action":"user_confirmation_requested","actor_id":"8b80a8ce-d3c3-4232-a9ca-e64119e7adea","actor_username":"lenin.meza@the-cocktail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-11-20 16:23:39.340943+00', ''),
	('00000000-0000-0000-0000-000000000000', 'afebc8de-76a2-4663-a39d-93e5e2681b8e', '{"action":"user_signedup","actor_id":"8b80a8ce-d3c3-4232-a9ca-e64119e7adea","actor_username":"lenin.meza@the-cocktail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-20 16:23:58.022232+00', ''),
	('00000000-0000-0000-0000-000000000000', '4b0ad6ec-aa7b-495c-a6a2-f8a526bde821', '{"action":"login","actor_id":"8b80a8ce-d3c3-4232-a9ca-e64119e7adea","actor_username":"lenin.meza@the-cocktail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-20 16:28:17.382149+00', ''),
	('00000000-0000-0000-0000-000000000000', '9ce8c86e-ad78-445a-a737-f28f2a9c686d', '{"action":"user_confirmation_requested","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"user"}', '2025-11-20 16:32:25.085533+00', ''),
	('00000000-0000-0000-0000-000000000000', '51f81355-9cee-4e62-967d-b1770df06094', '{"action":"user_signedup","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-11-20 16:45:43.472362+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fdca496b-2199-49e2-a581-11efed2120a4', '{"action":"login","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-20 16:47:47.36607+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cc55dcd8-ad83-4257-b460-94bb7f0b8ae0', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-11-21 17:14:12.469226+00', ''),
	('00000000-0000-0000-0000-000000000000', '2c336f17-dcb5-4d17-bdfe-85d2ba14175c', '{"action":"token_revoked","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-11-21 17:14:12.490902+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c2701215-54ba-4461-9099-8c0ca1345a47', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-11-22 01:15:55.344689+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ffb0b57d-5b04-492b-825b-dfbceca66952', '{"action":"token_revoked","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-11-22 01:15:55.361726+00', ''),
	('00000000-0000-0000-0000-000000000000', '95863b64-f0bf-4afb-bb56-2e8fed2bc69a', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-01 04:42:36.488049+00', ''),
	('00000000-0000-0000-0000-000000000000', '37d43b47-e215-47c2-abba-05c241a270e7', '{"action":"token_revoked","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-01 04:42:36.508396+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f7186d3a-e723-4a67-8e81-b3f2d5834b6f', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-02 18:54:11.7875+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd50be7b1-3942-437f-8f59-f6128126cd06', '{"action":"token_revoked","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-02 18:54:11.807621+00', ''),
	('00000000-0000-0000-0000-000000000000', '742f8588-55c7-42c5-9721-d45cd0187aa0', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-03 01:06:58.351077+00', ''),
	('00000000-0000-0000-0000-000000000000', '100d3f27-29b4-4496-acdf-031774b58152', '{"action":"token_revoked","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-03 01:06:58.37027+00', ''),
	('00000000-0000-0000-0000-000000000000', '9b71ec0f-b220-4a01-973f-febe77f31741', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-03 01:06:58.433005+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a3d402be-9f5b-46dd-86cd-7fc8e7f73556', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-09 16:34:58.543711+00', ''),
	('00000000-0000-0000-0000-000000000000', '6f3e7a48-cac4-4450-8cb9-b856db83e8bd', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-09 17:45:44.626601+00', ''),
	('00000000-0000-0000-0000-000000000000', '00a4af18-6f21-4559-a160-af5ab8becbb2', '{"action":"token_revoked","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-09 17:45:44.643429+00', ''),
	('00000000-0000-0000-0000-000000000000', '5a9ba002-0144-4200-bc73-255b6cb82c27', '{"action":"login","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-12-11 01:07:48.707081+00', ''),
	('00000000-0000-0000-0000-000000000000', '3363fdb4-e3f1-4eb5-a777-d0a04bcd54a5', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-11 02:22:31.771232+00', ''),
	('00000000-0000-0000-0000-000000000000', '6169387b-536f-47a5-9368-410fff3f6c0c', '{"action":"token_revoked","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-11 02:22:31.800751+00', ''),
	('00000000-0000-0000-0000-000000000000', '9ad204f1-e418-4beb-9bbe-dc604ed5f0d5', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-12 23:44:20.771321+00', ''),
	('00000000-0000-0000-0000-000000000000', '49fa6163-9652-48a8-8c2d-8870cfc0e58a', '{"action":"token_revoked","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-12 23:44:20.796596+00', ''),
	('00000000-0000-0000-0000-000000000000', '1e01b759-5927-4d11-9d2e-e200ac5e1016', '{"action":"user_confirmation_requested","actor_id":"c84569d4-83da-4ee3-8058-8fa0ca3dca11","actor_name":"Web Scraper","actor_username":"webmaster@indicedeprecios.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-12-13 18:50:59.826265+00', ''),
	('00000000-0000-0000-0000-000000000000', '0053b868-58c0-46aa-8148-2f34e5bc131f', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-15 23:48:45.813524+00', ''),
	('00000000-0000-0000-0000-000000000000', '05415b2b-c168-40f2-846f-38694bbd2dea', '{"action":"token_revoked","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-15 23:48:45.833336+00', ''),
	('00000000-0000-0000-0000-000000000000', '43675091-85e7-4c35-b45a-d0434a58ed51', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-16 14:27:10.322853+00', ''),
	('00000000-0000-0000-0000-000000000000', '1dc40d7d-8530-41ca-87ab-a513bddcb7df', '{"action":"token_revoked","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-16 14:27:10.340447+00', ''),
	('00000000-0000-0000-0000-000000000000', '1dfc8f1d-a349-44c2-8a65-ff6eddfaec8f', '{"action":"user_confirmation_requested","actor_id":"b4b133a6-dea6-41f1-8a07-309324354b9e","actor_username":"marcomontero@hotmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-12-16 14:32:18.466357+00', ''),
	('00000000-0000-0000-0000-000000000000', '5bd3c7ba-23b6-4d28-933d-8da2b5e0d059', '{"action":"user_recovery_requested","actor_id":"b4b133a6-dea6-41f1-8a07-309324354b9e","actor_username":"marcomontero@hotmail.com","actor_via_sso":false,"log_type":"user"}', '2025-12-16 14:32:40.879091+00', ''),
	('00000000-0000-0000-0000-000000000000', '917a3f7b-55bb-43bc-abd4-a868b3b63bae', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-16 20:46:25.767758+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b3fc0d1f-d278-4618-a968-439f067b0564', '{"action":"token_revoked","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-16 20:46:25.783939+00', ''),
	('00000000-0000-0000-0000-000000000000', '46646c52-92fb-4824-824d-4d787c69d1bd', '{"action":"user_confirmation_requested","actor_id":"b4b133a6-dea6-41f1-8a07-309324354b9e","actor_username":"marcomontero@hotmail.com","actor_via_sso":false,"log_type":"user"}', '2025-12-16 23:24:12.616657+00', ''),
	('00000000-0000-0000-0000-000000000000', '2df40b6b-c482-4724-bc1b-a8f1eba80205', '{"action":"user_signedup","actor_id":"b4b133a6-dea6-41f1-8a07-309324354b9e","actor_username":"marcomontero@hotmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-12-16 23:25:10.550451+00', ''),
	('00000000-0000-0000-0000-000000000000', '9c2a5c5d-d650-4d00-9e17-ed23e54a130e', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-19 21:42:22.124531+00', ''),
	('00000000-0000-0000-0000-000000000000', '2a6461ed-4a29-4166-9987-0093ebfd310d', '{"action":"token_revoked","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-19 21:42:22.14575+00', ''),
	('00000000-0000-0000-0000-000000000000', '69ef8ecf-433e-402b-8084-133906840133', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-31 17:08:56.640906+00', ''),
	('00000000-0000-0000-0000-000000000000', '2d0dce9f-0672-4f5e-841e-d5f25404b84c', '{"action":"token_revoked","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-31 17:08:56.658568+00', ''),
	('00000000-0000-0000-0000-000000000000', '9bbe0598-9b3a-48c3-8c40-040cf479e5b1', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-31 18:46:13.315878+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ec8b2787-ccd5-48e8-939d-1c305040b459', '{"action":"token_revoked","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-31 18:46:13.332968+00', ''),
	('00000000-0000-0000-0000-000000000000', '89ae9f90-2a21-4df4-942b-3d0076f042f3', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2025-12-31 18:46:15.109768+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd4e2d1e9-ccb1-44de-8733-80f0eaddf904', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2026-01-04 13:31:34.249564+00', ''),
	('00000000-0000-0000-0000-000000000000', '00590359-d2e3-4f59-b13e-c71eee23bb3f', '{"action":"token_revoked","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2026-01-04 13:31:34.265833+00', ''),
	('00000000-0000-0000-0000-000000000000', 'eef9c908-9ef0-4f25-91d5-a65146859d7c', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2026-01-04 16:51:40.396927+00', ''),
	('00000000-0000-0000-0000-000000000000', '724d6a80-e908-4262-8593-b270588b93d2', '{"action":"token_revoked","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2026-01-04 16:51:40.416068+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ac463667-ce91-4ee3-ad41-3c8115ad8422', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2026-01-04 19:05:29.46103+00', ''),
	('00000000-0000-0000-0000-000000000000', '2c10e3f6-6f82-40f8-ba2b-25c14bb3756f', '{"action":"token_revoked","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2026-01-04 19:05:29.47481+00', ''),
	('00000000-0000-0000-0000-000000000000', '5b7f2c16-0bd3-433c-ad1c-0ccd9501d476', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2026-01-04 19:05:33.52895+00', ''),
	('00000000-0000-0000-0000-000000000000', '709bc8a8-8c54-47f7-879c-8e80b6d9c91a', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2026-01-05 19:17:09.87899+00', ''),
	('00000000-0000-0000-0000-000000000000', '671e81a5-2c2e-46ac-8db4-3cf3475dafdf', '{"action":"token_revoked","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2026-01-05 19:17:09.898795+00', ''),
	('00000000-0000-0000-0000-000000000000', '58b246fe-b418-4970-b3eb-c545fda820d1', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2026-01-07 14:45:05.468299+00', ''),
	('00000000-0000-0000-0000-000000000000', 'adcaeb7b-f233-49ac-a8a8-7957eea4dd82', '{"action":"token_revoked","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2026-01-07 14:45:05.487747+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c25aceb8-391d-4b74-81e1-393a474242bb', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2026-01-07 23:49:44.561478+00', ''),
	('00000000-0000-0000-0000-000000000000', '2add82cf-3c69-45e5-9a96-01e5b3ae768a', '{"action":"token_revoked","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2026-01-07 23:49:44.581175+00', ''),
	('00000000-0000-0000-0000-000000000000', '86d9e89f-2d75-40f0-85f6-e6f4b776a9f8', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2026-01-12 23:13:51.188881+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd9ac6728-9c18-4a7f-af1b-cd09eda89505', '{"action":"token_revoked","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2026-01-12 23:13:51.211183+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ea4c86a4-0014-4b11-b006-b07ccbae814e', '{"action":"token_refreshed","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2026-01-13 04:23:35.968892+00', ''),
	('00000000-0000-0000-0000-000000000000', '2b9e3747-4f59-4468-b724-21fce707f9f1', '{"action":"token_revoked","actor_id":"43ee42d3-ee55-4046-8902-a192a5a8ab1a","actor_username":"monteromarco@yahoo.com","actor_via_sso":false,"log_type":"token"}', '2026-01-13 04:23:35.989935+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at") VALUES
	('68af2a89-bb0b-4da0-8b72-096fddad3a4f', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', 'eda07b81-7d96-4c8a-a427-cb5bd208a7a8', 's256', 'LcYAEScnwvpHNAsvkSHD_DM2EAgcIgbITon8LX34tLg', 'email', '', '', '2025-11-19 18:02:56.576707+00', '2025-11-19 18:02:56.576707+00', 'email/signup', NULL),
	('0c91cc15-270d-44fd-aef4-3127f01a9dbc', 'b4b133a6-dea6-41f1-8a07-309324354b9e', '4bb3378f-d28e-41ff-96d1-91ab43e94312', 's256', 'j03mpEWXqoYUlT8ydcAfACKZoyP1rIOxemZx7uNxyo4', 'email', '', '', '2025-12-16 14:32:18.467945+00', '2025-12-16 14:32:18.467945+00', 'email/signup', NULL),
	('277f6c5f-3d48-487b-a2bc-0ef940154c1e', 'b4b133a6-dea6-41f1-8a07-309324354b9e', '86aa65f0-4544-43ac-8512-802cf771b80f', 's256', 'tVEeQdoZHxCE55TB9vawmab9e3K9Brx7qTtXU4wjG5U', 'recovery', '', '', '2025-12-16 14:32:40.875963+00', '2025-12-16 14:32:40.875963+00', 'recovery', NULL);


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'b4b133a6-dea6-41f1-8a07-309324354b9e', 'authenticated', 'authenticated', 'marcomontero@hotmail.com', '$2a$10$i0xd/hDj4xvJfSnHUwqrje0MjS0MFrsy6tcRu4Od5Tlv394Zf//lm', '2025-12-16 23:25:10.551529+00', NULL, '', '2025-12-16 23:24:12.641267+00', 'pkce_904f7bfaccacdc6a692e92fe92d0419f9e42ff47482506da204e709e', '2025-12-16 14:32:40.88162+00', '', '', NULL, '2025-12-16 23:25:10.563075+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "b4b133a6-dea6-41f1-8a07-309324354b9e", "role": "admin", "email": "marcomontero@hotmail.com", "email_verified": true, "phone_verified": false}', NULL, '2025-12-16 14:32:18.423182+00', '2025-12-16 23:25:10.608087+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '68a5501f-9f74-459d-9b0d-25ef6564937e', 'authenticated', 'authenticated', 'merolhack@gmail.com', '$2a$10$iObsdIqdg4MYE.J4hnDAUe/qCqtcZzRkgTHKvkaMCaaudqmKvTyIq', '2025-09-19 03:44:23.764944+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-18 08:48:46.689029+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-09-19 03:44:23.70415+00', '2025-11-19 22:53:35.444887+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '8b80a8ce-d3c3-4232-a9ca-e64119e7adea', 'authenticated', 'authenticated', 'lenin.meza@the-cocktail.com', '$2a$10$El2JqiMCmABh7REdE0nEuOSuNkGGjMMQEPIWm7hGMPaSHppEk9ui2', '2025-11-20 16:23:58.023013+00', NULL, '', '2025-11-20 16:23:39.351847+00', '', NULL, '', '', NULL, '2025-11-20 16:28:17.383923+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "8b80a8ce-d3c3-4232-a9ca-e64119e7adea", "email": "lenin.meza@the-cocktail.com", "email_verified": true, "phone_verified": false}', NULL, '2025-11-20 16:23:39.285668+00', '2025-11-20 16:28:17.38927+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', 'authenticated', 'authenticated', 'monteromarco@yahoo.com', '$2a$10$38p2aQV4QI4Dl0M1ZCKAGelmDLPur9Mb.JEWY0JqbCKYss0ZlmwM6', '2025-11-20 16:45:43.492017+00', NULL, '', '2025-11-20 16:32:25.104401+00', '', NULL, '', '', NULL, '2025-12-11 01:07:48.733747+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "43ee42d3-ee55-4046-8902-a192a5a8ab1a", "role": "admin", "email": "monteromarco@yahoo.com", "email_verified": true, "phone_verified": false}', NULL, '2025-11-19 18:02:56.505118+00', '2026-01-13 04:23:36.023966+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'c84569d4-83da-4ee3-8058-8fa0ca3dca11', 'authenticated', 'authenticated', 'webmaster@indicedeprecios.com', '$2a$10$/DFDLmryac3SNuDTvqSFeOwzzbO4e88nFPkacCuLEq22zYNml6mfy', NULL, NULL, '430e154ff24ac2d23aebae3332855d56ad89884f76f248fbed307fab', '2025-12-13 18:50:59.842488+00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "c84569d4-83da-4ee3-8058-8fa0ca3dca11", "role": "bot", "email": "webmaster@indicedeprecios.com", "full_name": "Web Scraper", "email_verified": false, "phone_verified": false}', NULL, '2025-12-13 18:50:59.705166+00', '2025-12-13 18:51:00.443344+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('68a5501f-9f74-459d-9b0d-25ef6564937e', '68a5501f-9f74-459d-9b0d-25ef6564937e', '{"sub": "68a5501f-9f74-459d-9b0d-25ef6564937e", "email": "merolhack@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-09-19 03:44:23.736769+00', '2025-09-19 03:44:23.736832+00', '2025-09-19 03:44:23.736832+00', '4589f3d5-a61e-4385-b496-708e3182b558'),
	('8b80a8ce-d3c3-4232-a9ca-e64119e7adea', '8b80a8ce-d3c3-4232-a9ca-e64119e7adea', '{"sub": "8b80a8ce-d3c3-4232-a9ca-e64119e7adea", "email": "lenin.meza@the-cocktail.com", "email_verified": true, "phone_verified": false}', 'email', '2025-11-20 16:23:39.331644+00', '2025-11-20 16:23:39.333509+00', '2025-11-20 16:23:39.333509+00', '0fbc339a-f7b4-40ec-9dea-3e1782c6812a'),
	('43ee42d3-ee55-4046-8902-a192a5a8ab1a', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', '{"sub": "43ee42d3-ee55-4046-8902-a192a5a8ab1a", "email": "monteromarco@yahoo.com", "email_verified": true, "phone_verified": false}', 'email', '2025-11-19 18:02:56.552491+00', '2025-11-19 18:02:56.552549+00', '2025-11-19 18:02:56.552549+00', '6a5a7c8c-9485-4f51-b165-37d07273c82b'),
	('c84569d4-83da-4ee3-8058-8fa0ca3dca11', 'c84569d4-83da-4ee3-8058-8fa0ca3dca11', '{"sub": "c84569d4-83da-4ee3-8058-8fa0ca3dca11", "role": "bot", "email": "webmaster@indicedeprecios.com", "full_name": "Web Scraper", "email_verified": false, "phone_verified": false}', 'email', '2025-12-13 18:50:59.806417+00', '2025-12-13 18:50:59.806474+00', '2025-12-13 18:50:59.806474+00', 'a5c73a4b-435e-4fa8-9f8a-7c8cdbe69d43'),
	('b4b133a6-dea6-41f1-8a07-309324354b9e', 'b4b133a6-dea6-41f1-8a07-309324354b9e', '{"sub": "b4b133a6-dea6-41f1-8a07-309324354b9e", "email": "marcomontero@hotmail.com", "email_verified": true, "phone_verified": false}', 'email', '2025-12-16 14:32:18.461185+00', '2025-12-16 14:32:18.461241+00', '2025-12-16 14:32:18.461241+00', '1f675f42-ab0a-43f1-91a9-27e04b894f4a');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('d8e0485b-bb1c-4a0c-b5d1-cae09f9128d3', '8b80a8ce-d3c3-4232-a9ca-e64119e7adea', '2025-11-20 16:23:58.032271+00', '2025-11-20 16:23:58.032271+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', '44.216.213.67', NULL, NULL, NULL, NULL, NULL),
	('055d3fb5-758a-4455-a59e-552e772e7618', '8b80a8ce-d3c3-4232-a9ca-e64119e7adea', '2025-11-20 16:28:17.384038+00', '2025-11-20 16:28:17.384038+00', NULL, 'aal1', NULL, NULL, 'curl/8.7.1', '187.243.193.9', NULL, NULL, NULL, NULL, NULL),
	('55485f1a-7aea-4199-bf61-6c5f85e1dfc3', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', '2025-11-20 16:45:43.529342+00', '2025-11-20 16:45:43.529342+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '189.216.40.183', NULL, NULL, NULL, NULL, NULL),
	('f8ab5228-d6cc-4d9a-922f-44e8f30e0b91', 'b4b133a6-dea6-41f1-8a07-309324354b9e', '2025-12-16 23:25:10.563185+00', '2025-12-16 23:25:10.563185+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36 EdgA/143.0.0.0', '129.222.91.20', NULL, NULL, NULL, NULL, NULL),
	('84f23254-123c-4945-b642-9f39c3c89d9a', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', '2025-12-11 01:07:48.73569+00', '2026-01-12 23:13:51.252345+00', NULL, 'aal1', NULL, '2026-01-12 23:13:51.252219', 'Vercel Edge Functions', '13.52.80.152', NULL, NULL, NULL, NULL, NULL),
	('9d08987a-7a3a-4e65-8b9a-1d3b3dc8587f', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', '2025-11-20 16:47:47.368939+00', '2026-01-13 04:23:36.039285+00', NULL, 'aal1', NULL, '2026-01-13 04:23:36.038018', 'Vercel Edge Functions', '3.101.111.173', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('d8e0485b-bb1c-4a0c-b5d1-cae09f9128d3', '2025-11-20 16:23:58.057514+00', '2025-11-20 16:23:58.057514+00', 'otp', '8f2575c8-5c01-4853-a277-a0ee88c9dc52'),
	('055d3fb5-758a-4455-a59e-552e772e7618', '2025-11-20 16:28:17.390355+00', '2025-11-20 16:28:17.390355+00', 'password', 'bc225758-c73e-4824-93a0-395ec5b767ac'),
	('55485f1a-7aea-4199-bf61-6c5f85e1dfc3', '2025-11-20 16:45:43.580153+00', '2025-11-20 16:45:43.580153+00', 'otp', '150bebb8-e203-4499-bb1a-19db14232665'),
	('9d08987a-7a3a-4e65-8b9a-1d3b3dc8587f', '2025-11-20 16:47:47.373569+00', '2025-11-20 16:47:47.373569+00', 'password', '834edfa3-0507-4fb4-a5e6-5e667db5b4f5'),
	('84f23254-123c-4945-b642-9f39c3c89d9a', '2025-12-11 01:07:48.817212+00', '2025-12-11 01:07:48.817212+00', 'password', 'd522bb56-d740-4f9e-982d-ff642e09435a'),
	('f8ab5228-d6cc-4d9a-922f-44e8f30e0b91', '2025-12-16 23:25:10.610042+00', '2025-12-16 23:25:10.610042+00', 'otp', 'a22369f5-9075-4063-bab4-136250a2a38f');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."one_time_tokens" ("id", "user_id", "token_type", "token_hash", "relates_to", "created_at", "updated_at") VALUES
	('20204fc5-9b9f-4c57-8070-c58f42091a5c', 'c84569d4-83da-4ee3-8058-8fa0ca3dca11', 'confirmation_token', '430e154ff24ac2d23aebae3332855d56ad89884f76f248fbed307fab', 'webmaster@indicedeprecios.com', '2025-12-13 18:51:00.46753', '2025-12-13 18:51:00.46753');


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 49, '2tnqf7grfd23', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', true, '2025-12-11 01:07:48.780436+00', '2025-12-11 02:22:31.802155+00', NULL, '84f23254-123c-4945-b642-9f39c3c89d9a'),
	('00000000-0000-0000-0000-000000000000', 50, 'zdxnjzxjwz25', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', true, '2025-12-11 02:22:31.822775+00', '2025-12-12 23:44:20.798527+00', '2tnqf7grfd23', '84f23254-123c-4945-b642-9f39c3c89d9a'),
	('00000000-0000-0000-0000-000000000000', 48, 'it4wt2ys7oyz', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', true, '2025-12-09 17:45:44.659183+00', '2025-12-15 23:48:45.834749+00', '23lmzdce4kgm', '9d08987a-7a3a-4e65-8b9a-1d3b3dc8587f'),
	('00000000-0000-0000-0000-000000000000', 51, 'nglnr3uxw3ig', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', true, '2025-12-12 23:44:20.816651+00', '2025-12-16 14:27:10.344574+00', 'zdxnjzxjwz25', '84f23254-123c-4945-b642-9f39c3c89d9a'),
	('00000000-0000-0000-0000-000000000000', 52, 'qtpovbxvno3p', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', true, '2025-12-15 23:48:45.852058+00', '2025-12-16 20:46:25.7854+00', 'it4wt2ys7oyz', '9d08987a-7a3a-4e65-8b9a-1d3b3dc8587f'),
	('00000000-0000-0000-0000-000000000000', 55, 'ar67voxflons', 'b4b133a6-dea6-41f1-8a07-309324354b9e', false, '2025-12-16 23:25:10.587275+00', '2025-12-16 23:25:10.587275+00', NULL, 'f8ab5228-d6cc-4d9a-922f-44e8f30e0b91'),
	('00000000-0000-0000-0000-000000000000', 53, 'honmgp64o2kx', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', true, '2025-12-16 14:27:10.357234+00', '2025-12-19 21:42:22.148403+00', 'nglnr3uxw3ig', '84f23254-123c-4945-b642-9f39c3c89d9a'),
	('00000000-0000-0000-0000-000000000000', 56, '4doda7gsi44j', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', true, '2025-12-19 21:42:22.165737+00', '2025-12-31 17:08:56.660026+00', 'honmgp64o2kx', '84f23254-123c-4945-b642-9f39c3c89d9a'),
	('00000000-0000-0000-0000-000000000000', 57, 'lrjhgpfa26cb', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', true, '2025-12-31 17:08:56.676827+00', '2025-12-31 18:46:13.335392+00', '4doda7gsi44j', '84f23254-123c-4945-b642-9f39c3c89d9a'),
	('00000000-0000-0000-0000-000000000000', 54, 'lsyp5ohp5q7i', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', true, '2025-12-16 20:46:25.800564+00', '2026-01-04 13:31:34.266597+00', 'qtpovbxvno3p', '9d08987a-7a3a-4e65-8b9a-1d3b3dc8587f'),
	('00000000-0000-0000-0000-000000000000', 59, 'xltd6atar4cc', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', true, '2026-01-04 13:31:34.283207+00', '2026-01-04 16:51:40.418033+00', 'lsyp5ohp5q7i', '9d08987a-7a3a-4e65-8b9a-1d3b3dc8587f'),
	('00000000-0000-0000-0000-000000000000', 58, 'v6pijck2ew27', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', true, '2025-12-31 18:46:13.346175+00', '2026-01-04 19:05:29.475625+00', 'lrjhgpfa26cb', '84f23254-123c-4945-b642-9f39c3c89d9a'),
	('00000000-0000-0000-0000-000000000000', 61, 'w64zt5u4mxb6', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', true, '2026-01-04 19:05:29.48495+00', '2026-01-05 19:17:09.9002+00', 'v6pijck2ew27', '84f23254-123c-4945-b642-9f39c3c89d9a'),
	('00000000-0000-0000-0000-000000000000', 60, 'vdm3paovrlad', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', true, '2026-01-04 16:51:40.433489+00', '2026-01-07 14:45:05.489814+00', 'xltd6atar4cc', '9d08987a-7a3a-4e65-8b9a-1d3b3dc8587f'),
	('00000000-0000-0000-0000-000000000000', 62, 'vxz7arbuyyse', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', true, '2026-01-05 19:17:09.91361+00', '2026-01-07 23:49:44.582505+00', 'w64zt5u4mxb6', '84f23254-123c-4945-b642-9f39c3c89d9a'),
	('00000000-0000-0000-0000-000000000000', 64, '57kgejlz3inm', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', true, '2026-01-07 23:49:44.597452+00', '2026-01-12 23:13:51.215405+00', 'vxz7arbuyyse', '84f23254-123c-4945-b642-9f39c3c89d9a'),
	('00000000-0000-0000-0000-000000000000', 65, 'b4rywsnsybwt', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', false, '2026-01-12 23:13:51.229759+00', '2026-01-12 23:13:51.229759+00', '57kgejlz3inm', '84f23254-123c-4945-b642-9f39c3c89d9a'),
	('00000000-0000-0000-0000-000000000000', 63, 'pfapxy66u77h', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', true, '2026-01-07 14:45:05.512544+00', '2026-01-13 04:23:35.992463+00', 'vdm3paovrlad', '9d08987a-7a3a-4e65-8b9a-1d3b3dc8587f'),
	('00000000-0000-0000-0000-000000000000', 66, '624yjpqturjp', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', false, '2026-01-13 04:23:36.007933+00', '2026-01-13 04:23:36.007933+00', 'pfapxy66u77h', '9d08987a-7a3a-4e65-8b9a-1d3b3dc8587f'),
	('00000000-0000-0000-0000-000000000000', 39, '2a6wvypgyjzu', '8b80a8ce-d3c3-4232-a9ca-e64119e7adea', false, '2025-11-20 16:23:58.045798+00', '2025-11-20 16:23:58.045798+00', NULL, 'd8e0485b-bb1c-4a0c-b5d1-cae09f9128d3'),
	('00000000-0000-0000-0000-000000000000', 40, 'sfoh7zp5ywdg', '8b80a8ce-d3c3-4232-a9ca-e64119e7adea', false, '2025-11-20 16:28:17.386351+00', '2025-11-20 16:28:17.386351+00', NULL, '055d3fb5-758a-4455-a59e-552e772e7618'),
	('00000000-0000-0000-0000-000000000000', 41, 'cvjed6b3zyow', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', false, '2025-11-20 16:45:43.555676+00', '2025-11-20 16:45:43.555676+00', NULL, '55485f1a-7aea-4199-bf61-6c5f85e1dfc3'),
	('00000000-0000-0000-0000-000000000000', 42, '6y34t2j2xy3p', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', true, '2025-11-20 16:47:47.370698+00', '2025-11-21 17:14:12.492796+00', NULL, '9d08987a-7a3a-4e65-8b9a-1d3b3dc8587f'),
	('00000000-0000-0000-0000-000000000000', 43, '6xynf7pgjh2z', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', true, '2025-11-21 17:14:12.519055+00', '2025-11-22 01:15:55.363109+00', '6y34t2j2xy3p', '9d08987a-7a3a-4e65-8b9a-1d3b3dc8587f'),
	('00000000-0000-0000-0000-000000000000', 44, 'y7xzczwmi2mk', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', true, '2025-11-22 01:15:55.379255+00', '2025-12-01 04:42:36.509759+00', '6xynf7pgjh2z', '9d08987a-7a3a-4e65-8b9a-1d3b3dc8587f'),
	('00000000-0000-0000-0000-000000000000', 45, 'mynniizcx6zi', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', true, '2025-12-01 04:42:36.528061+00', '2025-12-02 18:54:11.809796+00', 'y7xzczwmi2mk', '9d08987a-7a3a-4e65-8b9a-1d3b3dc8587f'),
	('00000000-0000-0000-0000-000000000000', 46, 'h7bbydy4xmee', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', true, '2025-12-02 18:54:11.83529+00', '2025-12-03 01:06:58.372865+00', 'mynniizcx6zi', '9d08987a-7a3a-4e65-8b9a-1d3b3dc8587f'),
	('00000000-0000-0000-0000-000000000000', 47, '23lmzdce4kgm', '43ee42d3-ee55-4046-8902-a192a5a8ab1a', true, '2025-12-03 01:06:58.390382+00', '2025-12-09 17:45:44.645434+00', 'h7bbydy4xmee', '9d08987a-7a3a-4e65-8b9a-1d3b3dc8587f');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 66, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict L9VaLVB1KlqJEnJILniPsMJX7en5F8W6D3hX5t1C0s1bSiRf2B3sHRcFyEAoF52

RESET ALL;
