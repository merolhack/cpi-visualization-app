


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."add_product_and_price"("p_product_name" "text", "p_ean_code" "text", "p_country_id" bigint, "p_category_id" bigint, "p_establishment_id" bigint, "p_location_id" bigint, "p_price_value" numeric, "p_price_date" "date") RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_product_id BIGINT;
BEGIN
    -- Paso 1: Intentar encontrar el producto por su código EAN
    SELECT product_id INTO v_product_id
    FROM public.cpi_products
    WHERE ean_code = p_ean_code
    LIMIT 1;

    -- Paso 2: Si el producto no existe, crearlo
    IF v_product_id IS NULL THEN
        INSERT INTO public.cpi_products (country_id, category_id, product_name, ean_code, is_active_product)
        VALUES (p_country_id, p_category_id, p_product_name, p_ean_code, TRUE)
        RETURNING product_id INTO v_product_id;
    END IF;

    -- Paso 3: Insertar el precio usando el ID del producto (existente o nuevo)
    INSERT INTO public.cpi_prices (product_id, establishment_id, location_id, user_id, price_value, date, is_valid)
    VALUES (
        v_product_id,
        p_establishment_id,
        p_location_id,
        auth.uid(), -- Obtiene el UUID del usuario autenticado que realiza la llamada
        p_price_value,
        p_price_date,
        TRUE
    );

    -- Devolver el ID del precio recién insertado
    RETURN (SELECT currval(pg_get_serial_sequence('cpi_prices', 'price_id')));
END;
$$;


ALTER FUNCTION "public"."add_product_and_price"("p_product_name" "text", "p_ean_code" "text", "p_country_id" bigint, "p_category_id" bigint, "p_establishment_id" bigint, "p_location_id" bigint, "p_price_value" numeric, "p_price_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_latest_prices_by_country"("p_country_id" bigint) RETURNS TABLE("product_name" "text", "category_name" "text", "establishment_name" "text", "price_value" numeric)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (p.product_id, e.establishment_id)
        p.product_name,
        c.category_name,
        e.establishment_name,
        pr.price_value
    FROM
        public.cpi_prices pr
    JOIN
        public.cpi_products p ON pr.product_id = p.product_id
    JOIN
        public.cpi_establishments e ON pr.establishment_id = e.establishment_id
    JOIN
        public.cpi_categories c ON p.category_id = c.category_id
    WHERE
        p.country_id = p_country_id
        AND p.is_active_product = TRUE
    ORDER BY
        p.product_id, e.establishment_id, pr.date DESC;
END;
$$;


ALTER FUNCTION "public"."get_latest_prices_by_country"("p_country_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."register_volunteer"("p_user_id" "uuid", "p_email" "text", "p_name" "text", "p_country_id" bigint) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Validación 1: Verificar si el email ya existe en cpi_volunteers
  IF EXISTS (SELECT 1 FROM public.cpi_volunteers WHERE email = p_email) THEN
    v_result := json_build_object(
      'success', false,
      'error_code', 'EMAIL_EXISTS',
      'message', 'Este correo electrónico ya está registrado'
    );
    RETURN v_result;
  END IF;

  -- Validación 2: Verificar si el user_id ya existe
  IF EXISTS (SELECT 1 FROM public.cpi_volunteers WHERE user_id = p_user_id) THEN
    v_result := json_build_object(
      'success', false,
      'error_code', 'USER_EXISTS',
      'message', 'Este usuario ya está registrado'
    );
    RETURN v_result;
  END IF;

  -- Validación 3: Verificar que el nombre no esté vacío
  IF LENGTH(TRIM(p_name)) < 2 THEN
    v_result := json_build_object(
      'success', false,
      'error_code', 'INVALID_NAME',
      'message', 'El nombre debe tener al menos 2 caracteres'
    );
    RETURN v_result;
  END IF;

  -- 1. Insertar en cpi_users
  INSERT INTO public.cpi_users (user_id, email)
  VALUES (p_user_id, p_email)
  ON CONFLICT (user_id) DO NOTHING;

  -- 2. Insertar en cpi_volunteers
  INSERT INTO public.cpi_volunteers (
    user_id, 
    email, 
    name, 
    country_id, 
    suspended
  )
  VALUES (
    p_user_id, 
    p_email, 
    p_name, 
    p_country_id, 
    FALSE
  );

  -- 3. Crear registro inicial de finanzas
  INSERT INTO public.cpi_finances (
    user_id, 
    concept, 
    previous_balance, 
    amount, 
    current_balance,
    date
  )
  VALUES (
    p_user_id, 
    'Saldo inicial', 
    0, 
    0, 
    0,
    NOW()
  );

  -- Respuesta exitosa
  v_result := json_build_object(
    'success', true,
    'user_id', p_user_id,
    'message', 'Registro completado exitosamente'
  );

  RETURN v_result;

EXCEPTION
  WHEN unique_violation THEN
    -- Manejo específico para violaciones de unicidad
    v_result := json_build_object(
      'success', false,
      'error_code', 'DUPLICATE_ENTRY',
      'message', 'Este correo electrónico ya está registrado'
    );
    RETURN v_result;
  WHEN OTHERS THEN
    -- Cualquier otro error
    v_result := json_build_object(
      'success', false,
      'error_code', 'SYSTEM_ERROR',
      'message', 'Ocurrió un error al procesar tu registro. Por favor intenta más tarde.'
    );
    RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."register_volunteer"("p_user_id" "uuid", "p_email" "text", "p_name" "text", "p_country_id" bigint) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."register_volunteer"("p_user_id" "uuid", "p_email" "text", "p_name" "text", "p_country_id" bigint) IS 'Registra un nuevo voluntario en el sistema. Puede ser ejecutada por usuarios anónimos durante el signup.';


SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."cpi_annual_product_location_establishment_inflation" (
    "aple_inflation_id" bigint NOT NULL,
    "recent_price_id" bigint,
    "product_id" bigint,
    "country_id" bigint,
    "location_id" bigint,
    "establishment_id" bigint,
    "recent_date" "date" NOT NULL,
    "historical_date" "date" NOT NULL,
    "days_between_measurements" integer NOT NULL,
    "recent_price_value" numeric NOT NULL,
    "historical_price_value" numeric NOT NULL,
    "aple_inflation_rate" numeric
);


ALTER TABLE "public"."cpi_annual_product_location_establishment_inflation" OWNER TO "postgres";


ALTER TABLE "public"."cpi_annual_product_location_establishment_inflation" ALTER COLUMN "aple_inflation_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."cpi_annual_product_location_establishment_aple_inflation_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cpi_branches" (
    "branch_id" bigint NOT NULL,
    "branch_name" "text" NOT NULL
);


ALTER TABLE "public"."cpi_branches" OWNER TO "postgres";


ALTER TABLE "public"."cpi_branches" ALTER COLUMN "branch_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."cpi_branches_branch_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cpi_categories" (
    "category_id" bigint NOT NULL,
    "branch_id" bigint,
    "category_name" "text" NOT NULL,
    "is_essential_category" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."cpi_categories" OWNER TO "postgres";


ALTER TABLE "public"."cpi_categories" ALTER COLUMN "category_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."cpi_categories_category_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cpi_category_inflation" (
    "ci_id" bigint NOT NULL,
    "country_id" bigint,
    "category_id" bigint,
    "ci_inflation_rate" numeric,
    "update_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "month" integer NOT NULL,
    "year" integer NOT NULL
);


ALTER TABLE "public"."cpi_category_inflation" OWNER TO "postgres";


ALTER TABLE "public"."cpi_category_inflation" ALTER COLUMN "ci_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."cpi_category_inflation_ci_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cpi_category_location_inflation" (
    "cli_id" bigint NOT NULL,
    "country_id" bigint,
    "category_id" bigint,
    "location_id" bigint,
    "cli_inflation_rate" numeric,
    "update_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "month" integer NOT NULL,
    "year" integer NOT NULL
);


ALTER TABLE "public"."cpi_category_location_inflation" OWNER TO "postgres";


ALTER TABLE "public"."cpi_category_location_inflation" ALTER COLUMN "cli_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."cpi_category_location_inflation_cli_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cpi_countries" (
    "country_id" bigint NOT NULL,
    "country_name" "text" NOT NULL,
    "currency" "text" NOT NULL,
    "currency_code" "text" NOT NULL
);


ALTER TABLE "public"."cpi_countries" OWNER TO "postgres";


ALTER TABLE "public"."cpi_countries" ALTER COLUMN "country_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."cpi_countries_country_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cpi_criteria" (
    "criterion_id" bigint NOT NULL,
    "criterion_name" "text" NOT NULL,
    "criterion_description" "text",
    "is_active_criterion" boolean DEFAULT true NOT NULL,
    "acceptance_score" numeric NOT NULL
);


ALTER TABLE "public"."cpi_criteria" OWNER TO "postgres";


ALTER TABLE "public"."cpi_criteria" ALTER COLUMN "criterion_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."cpi_criteria_criterion_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cpi_establishment_categories" (
    "establishment_category_id" bigint NOT NULL,
    "establishment_id" bigint,
    "category_id" bigint
);


ALTER TABLE "public"."cpi_establishment_categories" OWNER TO "postgres";


ALTER TABLE "public"."cpi_establishment_categories" ALTER COLUMN "establishment_category_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."cpi_establishment_categories_establishment_category_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cpi_establishments" (
    "establishment_id" bigint NOT NULL,
    "country_id" bigint,
    "establishment_name" "text" NOT NULL
);


ALTER TABLE "public"."cpi_establishments" OWNER TO "postgres";


ALTER TABLE "public"."cpi_establishments" ALTER COLUMN "establishment_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."cpi_establishments_establishment_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cpi_finances" (
    "finance_id" bigint NOT NULL,
    "user_id" "uuid",
    "concept" "text" NOT NULL,
    "date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "previous_balance" numeric NOT NULL,
    "amount" numeric NOT NULL,
    "current_balance" numeric NOT NULL
);


ALTER TABLE "public"."cpi_finances" OWNER TO "postgres";


ALTER TABLE "public"."cpi_finances" ALTER COLUMN "finance_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."cpi_finances_finance_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cpi_locations" (
    "location_id" bigint NOT NULL,
    "country_id" bigint,
    "location_name" "text" NOT NULL,
    "population" integer NOT NULL
);


ALTER TABLE "public"."cpi_locations" OWNER TO "postgres";


ALTER TABLE "public"."cpi_locations" ALTER COLUMN "location_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."cpi_locations_location_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cpi_prices" (
    "price_id" bigint NOT NULL,
    "product_id" bigint,
    "location_id" bigint,
    "establishment_id" bigint,
    "user_id" "uuid",
    "price_value" numeric(10,2) NOT NULL,
    "date" "date" NOT NULL,
    "price_photo_url" "text",
    "is_valid" boolean DEFAULT true NOT NULL,
    "analyzed_date" timestamp with time zone
);


ALTER TABLE "public"."cpi_prices" OWNER TO "postgres";


ALTER TABLE "public"."cpi_prices" ALTER COLUMN "price_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."cpi_prices_price_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cpi_products" (
    "product_id" bigint NOT NULL,
    "country_id" bigint,
    "category_id" bigint,
    "product_name" "text" NOT NULL,
    "product_photo_url" "text",
    "is_active_product" boolean NOT NULL,
    "ean_code" "text"
);


ALTER TABLE "public"."cpi_products" OWNER TO "postgres";


ALTER TABLE "public"."cpi_products" ALTER COLUMN "product_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."cpi_products_product_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cpi_real_cpi" (
    "real_cpi_id" bigint NOT NULL,
    "country_id" bigint,
    "criterion_id" bigint,
    "real_cpi_inflation_rate" numeric,
    "update_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "month" integer NOT NULL,
    "year" integer NOT NULL
);


ALTER TABLE "public"."cpi_real_cpi" OWNER TO "postgres";


ALTER TABLE "public"."cpi_real_cpi" ALTER COLUMN "real_cpi_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."cpi_real_cpi_real_cpi_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cpi_tracking" (
    "tracking_id" bigint NOT NULL,
    "country_id" bigint,
    "product_id" bigint,
    "location_id" bigint,
    "establishment_id" bigint,
    "user_id" "uuid",
    "is_active_tracking" boolean NOT NULL
);


ALTER TABLE "public"."cpi_tracking" OWNER TO "postgres";


ALTER TABLE "public"."cpi_tracking" ALTER COLUMN "tracking_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."cpi_tracking_tracking_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cpi_users" (
    "user_id" "uuid" NOT NULL,
    "email" "text" NOT NULL
);


ALTER TABLE "public"."cpi_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cpi_volunteers" (
    "user_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "name" "text" NOT NULL,
    "whatsapp" "text",
    "country_id" bigint,
    "suspended" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."cpi_volunteers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cpi_weights" (
    "weight_id" bigint NOT NULL,
    "criterion_id" bigint,
    "category_id" bigint,
    "weight_value" numeric DEFAULT 1 NOT NULL
);


ALTER TABLE "public"."cpi_weights" OWNER TO "postgres";


ALTER TABLE "public"."cpi_weights" ALTER COLUMN "weight_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."cpi_weights_weight_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cpi_withdrawals" (
    "withdrawal_id" bigint NOT NULL,
    "user_id" "uuid",
    "amount" numeric NOT NULL,
    "concept" "text" NOT NULL,
    "request_date" timestamp with time zone NOT NULL,
    "finance_id" bigint,
    "sent_date" timestamp with time zone
);


ALTER TABLE "public"."cpi_withdrawals" OWNER TO "postgres";


ALTER TABLE "public"."cpi_withdrawals" ALTER COLUMN "withdrawal_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."cpi_withdrawals_withdrawal_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."cpi_annual_product_location_establishment_inflation"
    ADD CONSTRAINT "cpi_annual_product_location_establishment_inflation_pkey" PRIMARY KEY ("aple_inflation_id");



ALTER TABLE ONLY "public"."cpi_branches"
    ADD CONSTRAINT "cpi_branches_branch_name_key" UNIQUE ("branch_name");



ALTER TABLE ONLY "public"."cpi_branches"
    ADD CONSTRAINT "cpi_branches_pkey" PRIMARY KEY ("branch_id");



ALTER TABLE ONLY "public"."cpi_categories"
    ADD CONSTRAINT "cpi_categories_pkey" PRIMARY KEY ("category_id");



ALTER TABLE ONLY "public"."cpi_category_inflation"
    ADD CONSTRAINT "cpi_category_inflation_pkey" PRIMARY KEY ("ci_id");



ALTER TABLE ONLY "public"."cpi_category_location_inflation"
    ADD CONSTRAINT "cpi_category_location_inflation_pkey" PRIMARY KEY ("cli_id");



ALTER TABLE ONLY "public"."cpi_countries"
    ADD CONSTRAINT "cpi_countries_country_name_key" UNIQUE ("country_name");



ALTER TABLE ONLY "public"."cpi_countries"
    ADD CONSTRAINT "cpi_countries_pkey" PRIMARY KEY ("country_id");



ALTER TABLE ONLY "public"."cpi_criteria"
    ADD CONSTRAINT "cpi_criteria_criterion_name_key" UNIQUE ("criterion_name");



ALTER TABLE ONLY "public"."cpi_criteria"
    ADD CONSTRAINT "cpi_criteria_pkey" PRIMARY KEY ("criterion_id");



ALTER TABLE ONLY "public"."cpi_establishment_categories"
    ADD CONSTRAINT "cpi_establishment_categories_pkey" PRIMARY KEY ("establishment_category_id");



ALTER TABLE ONLY "public"."cpi_establishments"
    ADD CONSTRAINT "cpi_establishments_pkey" PRIMARY KEY ("establishment_id");



ALTER TABLE ONLY "public"."cpi_finances"
    ADD CONSTRAINT "cpi_finances_pkey" PRIMARY KEY ("finance_id");



ALTER TABLE ONLY "public"."cpi_locations"
    ADD CONSTRAINT "cpi_locations_pkey" PRIMARY KEY ("location_id");



ALTER TABLE ONLY "public"."cpi_prices"
    ADD CONSTRAINT "cpi_prices_pkey" PRIMARY KEY ("price_id");



ALTER TABLE ONLY "public"."cpi_products"
    ADD CONSTRAINT "cpi_products_ean_code_key" UNIQUE ("ean_code");



ALTER TABLE ONLY "public"."cpi_products"
    ADD CONSTRAINT "cpi_products_pkey" PRIMARY KEY ("product_id");



ALTER TABLE ONLY "public"."cpi_real_cpi"
    ADD CONSTRAINT "cpi_real_cpi_pkey" PRIMARY KEY ("real_cpi_id");



ALTER TABLE ONLY "public"."cpi_tracking"
    ADD CONSTRAINT "cpi_tracking_pkey" PRIMARY KEY ("tracking_id");



ALTER TABLE ONLY "public"."cpi_users"
    ADD CONSTRAINT "cpi_users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."cpi_users"
    ADD CONSTRAINT "cpi_users_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."cpi_volunteers"
    ADD CONSTRAINT "cpi_volunteers_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."cpi_volunteers"
    ADD CONSTRAINT "cpi_volunteers_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."cpi_weights"
    ADD CONSTRAINT "cpi_weights_pkey" PRIMARY KEY ("weight_id");



ALTER TABLE ONLY "public"."cpi_withdrawals"
    ADD CONSTRAINT "cpi_withdrawals_pkey" PRIMARY KEY ("withdrawal_id");



ALTER TABLE ONLY "public"."cpi_annual_product_location_establishment_inflation"
    ADD CONSTRAINT "cpi_annual_product_location_establishment__recent_price_id_fkey" FOREIGN KEY ("recent_price_id") REFERENCES "public"."cpi_prices"("price_id");



ALTER TABLE ONLY "public"."cpi_annual_product_location_establishment_inflation"
    ADD CONSTRAINT "cpi_annual_product_location_establishment_establishment_id_fkey" FOREIGN KEY ("establishment_id") REFERENCES "public"."cpi_establishments"("establishment_id");



ALTER TABLE ONLY "public"."cpi_annual_product_location_establishment_inflation"
    ADD CONSTRAINT "cpi_annual_product_location_establishment_infl_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."cpi_locations"("location_id");



ALTER TABLE ONLY "public"."cpi_annual_product_location_establishment_inflation"
    ADD CONSTRAINT "cpi_annual_product_location_establishment_infla_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."cpi_countries"("country_id");



ALTER TABLE ONLY "public"."cpi_annual_product_location_establishment_inflation"
    ADD CONSTRAINT "cpi_annual_product_location_establishment_infla_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."cpi_products"("product_id");



ALTER TABLE ONLY "public"."cpi_categories"
    ADD CONSTRAINT "cpi_categories_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."cpi_branches"("branch_id");



ALTER TABLE ONLY "public"."cpi_category_inflation"
    ADD CONSTRAINT "cpi_category_inflation_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."cpi_categories"("category_id");



ALTER TABLE ONLY "public"."cpi_category_inflation"
    ADD CONSTRAINT "cpi_category_inflation_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."cpi_countries"("country_id");



ALTER TABLE ONLY "public"."cpi_category_location_inflation"
    ADD CONSTRAINT "cpi_category_location_inflation_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."cpi_categories"("category_id");



ALTER TABLE ONLY "public"."cpi_category_location_inflation"
    ADD CONSTRAINT "cpi_category_location_inflation_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."cpi_countries"("country_id");



ALTER TABLE ONLY "public"."cpi_category_location_inflation"
    ADD CONSTRAINT "cpi_category_location_inflation_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."cpi_locations"("location_id");



ALTER TABLE ONLY "public"."cpi_establishment_categories"
    ADD CONSTRAINT "cpi_establishment_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."cpi_categories"("category_id");



ALTER TABLE ONLY "public"."cpi_establishment_categories"
    ADD CONSTRAINT "cpi_establishment_categories_establishment_id_fkey" FOREIGN KEY ("establishment_id") REFERENCES "public"."cpi_establishments"("establishment_id");



ALTER TABLE ONLY "public"."cpi_establishments"
    ADD CONSTRAINT "cpi_establishments_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."cpi_countries"("country_id");



ALTER TABLE ONLY "public"."cpi_finances"
    ADD CONSTRAINT "cpi_finances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."cpi_users"("user_id");



ALTER TABLE ONLY "public"."cpi_locations"
    ADD CONSTRAINT "cpi_locations_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."cpi_countries"("country_id");



ALTER TABLE ONLY "public"."cpi_prices"
    ADD CONSTRAINT "cpi_prices_establishment_id_fkey" FOREIGN KEY ("establishment_id") REFERENCES "public"."cpi_establishments"("establishment_id");



ALTER TABLE ONLY "public"."cpi_prices"
    ADD CONSTRAINT "cpi_prices_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."cpi_locations"("location_id");



ALTER TABLE ONLY "public"."cpi_prices"
    ADD CONSTRAINT "cpi_prices_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."cpi_products"("product_id");



ALTER TABLE ONLY "public"."cpi_prices"
    ADD CONSTRAINT "cpi_prices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."cpi_users"("user_id");



ALTER TABLE ONLY "public"."cpi_products"
    ADD CONSTRAINT "cpi_products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."cpi_categories"("category_id");



ALTER TABLE ONLY "public"."cpi_products"
    ADD CONSTRAINT "cpi_products_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."cpi_countries"("country_id");



ALTER TABLE ONLY "public"."cpi_real_cpi"
    ADD CONSTRAINT "cpi_real_cpi_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."cpi_countries"("country_id");



ALTER TABLE ONLY "public"."cpi_real_cpi"
    ADD CONSTRAINT "cpi_real_cpi_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "public"."cpi_criteria"("criterion_id");



ALTER TABLE ONLY "public"."cpi_tracking"
    ADD CONSTRAINT "cpi_tracking_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."cpi_countries"("country_id");



ALTER TABLE ONLY "public"."cpi_tracking"
    ADD CONSTRAINT "cpi_tracking_establishment_id_fkey" FOREIGN KEY ("establishment_id") REFERENCES "public"."cpi_establishments"("establishment_id");



ALTER TABLE ONLY "public"."cpi_tracking"
    ADD CONSTRAINT "cpi_tracking_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."cpi_locations"("location_id");



ALTER TABLE ONLY "public"."cpi_tracking"
    ADD CONSTRAINT "cpi_tracking_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."cpi_products"("product_id");



ALTER TABLE ONLY "public"."cpi_tracking"
    ADD CONSTRAINT "cpi_tracking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."cpi_users"("user_id");



ALTER TABLE ONLY "public"."cpi_volunteers"
    ADD CONSTRAINT "cpi_volunteers_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."cpi_countries"("country_id");



ALTER TABLE ONLY "public"."cpi_volunteers"
    ADD CONSTRAINT "cpi_volunteers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."cpi_users"("user_id");



ALTER TABLE ONLY "public"."cpi_weights"
    ADD CONSTRAINT "cpi_weights_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."cpi_categories"("category_id");



ALTER TABLE ONLY "public"."cpi_weights"
    ADD CONSTRAINT "cpi_weights_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "public"."cpi_criteria"("criterion_id");



ALTER TABLE ONLY "public"."cpi_withdrawals"
    ADD CONSTRAINT "cpi_withdrawals_finance_id_fkey" FOREIGN KEY ("finance_id") REFERENCES "public"."cpi_finances"("finance_id");



ALTER TABLE ONLY "public"."cpi_withdrawals"
    ADD CONSTRAINT "cpi_withdrawals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."cpi_users"("user_id");



CREATE POLICY "Allow authenticated users to insert categories" ON "public"."cpi_categories" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to insert products" ON "public"."cpi_products" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to read branches" ON "public"."cpi_branches" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow public read access on categories" ON "public"."cpi_categories" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow public read access on countries" ON "public"."cpi_countries" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow public read access on establishments" ON "public"."cpi_establishments" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow public read access on prices" ON "public"."cpi_prices" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow public read access on products" ON "public"."cpi_products" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow public read on products for search" ON "public"."cpi_products" FOR SELECT TO "authenticated", "anon" USING (("is_active_product" = true));



CREATE POLICY "Users can insert their own finance records" ON "public"."cpi_finances" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read their own finance records" ON "public"."cpi_finances" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read their own user record" ON "public"."cpi_users" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read their own volunteer profile" ON "public"."cpi_volunteers" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own volunteer profile" ON "public"."cpi_volunteers" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."cpi_annual_product_location_establishment_inflation" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cpi_branches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cpi_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cpi_category_inflation" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cpi_category_location_inflation" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cpi_countries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cpi_criteria" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cpi_establishment_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cpi_establishments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cpi_finances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cpi_locations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cpi_prices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cpi_products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cpi_real_cpi" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cpi_tracking" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cpi_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cpi_volunteers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cpi_weights" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cpi_withdrawals" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

















































































































































































GRANT ALL ON FUNCTION "public"."add_product_and_price"("p_product_name" "text", "p_ean_code" "text", "p_country_id" bigint, "p_category_id" bigint, "p_establishment_id" bigint, "p_location_id" bigint, "p_price_value" numeric, "p_price_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."add_product_and_price"("p_product_name" "text", "p_ean_code" "text", "p_country_id" bigint, "p_category_id" bigint, "p_establishment_id" bigint, "p_location_id" bigint, "p_price_value" numeric, "p_price_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_product_and_price"("p_product_name" "text", "p_ean_code" "text", "p_country_id" bigint, "p_category_id" bigint, "p_establishment_id" bigint, "p_location_id" bigint, "p_price_value" numeric, "p_price_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_latest_prices_by_country"("p_country_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_latest_prices_by_country"("p_country_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_latest_prices_by_country"("p_country_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."register_volunteer"("p_user_id" "uuid", "p_email" "text", "p_name" "text", "p_country_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."register_volunteer"("p_user_id" "uuid", "p_email" "text", "p_name" "text", "p_country_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."register_volunteer"("p_user_id" "uuid", "p_email" "text", "p_name" "text", "p_country_id" bigint) TO "service_role";
























GRANT ALL ON TABLE "public"."cpi_annual_product_location_establishment_inflation" TO "anon";
GRANT ALL ON TABLE "public"."cpi_annual_product_location_establishment_inflation" TO "authenticated";
GRANT ALL ON TABLE "public"."cpi_annual_product_location_establishment_inflation" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cpi_annual_product_location_establishment_aple_inflation_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cpi_annual_product_location_establishment_aple_inflation_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cpi_annual_product_location_establishment_aple_inflation_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cpi_branches" TO "anon";
GRANT ALL ON TABLE "public"."cpi_branches" TO "authenticated";
GRANT ALL ON TABLE "public"."cpi_branches" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cpi_branches_branch_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cpi_branches_branch_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cpi_branches_branch_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cpi_categories" TO "anon";
GRANT ALL ON TABLE "public"."cpi_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."cpi_categories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cpi_categories_category_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cpi_categories_category_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cpi_categories_category_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cpi_category_inflation" TO "anon";
GRANT ALL ON TABLE "public"."cpi_category_inflation" TO "authenticated";
GRANT ALL ON TABLE "public"."cpi_category_inflation" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cpi_category_inflation_ci_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cpi_category_inflation_ci_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cpi_category_inflation_ci_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cpi_category_location_inflation" TO "anon";
GRANT ALL ON TABLE "public"."cpi_category_location_inflation" TO "authenticated";
GRANT ALL ON TABLE "public"."cpi_category_location_inflation" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cpi_category_location_inflation_cli_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cpi_category_location_inflation_cli_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cpi_category_location_inflation_cli_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cpi_countries" TO "anon";
GRANT ALL ON TABLE "public"."cpi_countries" TO "authenticated";
GRANT ALL ON TABLE "public"."cpi_countries" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cpi_countries_country_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cpi_countries_country_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cpi_countries_country_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cpi_criteria" TO "anon";
GRANT ALL ON TABLE "public"."cpi_criteria" TO "authenticated";
GRANT ALL ON TABLE "public"."cpi_criteria" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cpi_criteria_criterion_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cpi_criteria_criterion_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cpi_criteria_criterion_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cpi_establishment_categories" TO "anon";
GRANT ALL ON TABLE "public"."cpi_establishment_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."cpi_establishment_categories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cpi_establishment_categories_establishment_category_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cpi_establishment_categories_establishment_category_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cpi_establishment_categories_establishment_category_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cpi_establishments" TO "anon";
GRANT ALL ON TABLE "public"."cpi_establishments" TO "authenticated";
GRANT ALL ON TABLE "public"."cpi_establishments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cpi_establishments_establishment_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cpi_establishments_establishment_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cpi_establishments_establishment_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cpi_finances" TO "anon";
GRANT ALL ON TABLE "public"."cpi_finances" TO "authenticated";
GRANT ALL ON TABLE "public"."cpi_finances" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cpi_finances_finance_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cpi_finances_finance_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cpi_finances_finance_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cpi_locations" TO "anon";
GRANT ALL ON TABLE "public"."cpi_locations" TO "authenticated";
GRANT ALL ON TABLE "public"."cpi_locations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cpi_locations_location_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cpi_locations_location_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cpi_locations_location_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cpi_prices" TO "anon";
GRANT ALL ON TABLE "public"."cpi_prices" TO "authenticated";
GRANT ALL ON TABLE "public"."cpi_prices" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cpi_prices_price_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cpi_prices_price_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cpi_prices_price_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cpi_products" TO "anon";
GRANT ALL ON TABLE "public"."cpi_products" TO "authenticated";
GRANT ALL ON TABLE "public"."cpi_products" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cpi_products_product_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cpi_products_product_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cpi_products_product_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cpi_real_cpi" TO "anon";
GRANT ALL ON TABLE "public"."cpi_real_cpi" TO "authenticated";
GRANT ALL ON TABLE "public"."cpi_real_cpi" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cpi_real_cpi_real_cpi_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cpi_real_cpi_real_cpi_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cpi_real_cpi_real_cpi_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cpi_tracking" TO "anon";
GRANT ALL ON TABLE "public"."cpi_tracking" TO "authenticated";
GRANT ALL ON TABLE "public"."cpi_tracking" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cpi_tracking_tracking_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cpi_tracking_tracking_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cpi_tracking_tracking_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cpi_users" TO "anon";
GRANT ALL ON TABLE "public"."cpi_users" TO "authenticated";
GRANT ALL ON TABLE "public"."cpi_users" TO "service_role";



GRANT ALL ON TABLE "public"."cpi_volunteers" TO "anon";
GRANT ALL ON TABLE "public"."cpi_volunteers" TO "authenticated";
GRANT ALL ON TABLE "public"."cpi_volunteers" TO "service_role";



GRANT ALL ON TABLE "public"."cpi_weights" TO "anon";
GRANT ALL ON TABLE "public"."cpi_weights" TO "authenticated";
GRANT ALL ON TABLE "public"."cpi_weights" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cpi_weights_weight_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cpi_weights_weight_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cpi_weights_weight_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cpi_withdrawals" TO "anon";
GRANT ALL ON TABLE "public"."cpi_withdrawals" TO "authenticated";
GRANT ALL ON TABLE "public"."cpi_withdrawals" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cpi_withdrawals_withdrawal_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cpi_withdrawals_withdrawal_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cpi_withdrawals_withdrawal_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































