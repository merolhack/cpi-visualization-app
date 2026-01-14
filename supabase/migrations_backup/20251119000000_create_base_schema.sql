-- Base schema migration for IRPC system
-- This creates all the core tables needed by the application

-- ============================================================================
-- 1. Countries
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cpi_countries (
    country_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    country_name TEXT UNIQUE NOT NULL,
    currency TEXT NOT NULL
);

-- ============================================================================
-- 2. Branches (Economic sectors)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cpi_branches (
    branch_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    branch_name TEXT UNIQUE NOT NULL
);

-- ============================================================================
-- 3. Categories
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cpi_categories (
    category_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    branch_id BIGINT REFERENCES public.cpi_branches(branch_id),
    category_name TEXT NOT NULL,
    is_essential_category BOOLEAN DEFAULT false
);

-- ============================================================================
-- 4. Locations
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cpi_locations (
    location_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    country_id BIGINT REFERENCES public.cpi_countries(country_id),
    location_name TEXT NOT NULL,
    population INTEGER
);

-- ============================================================================
-- 5. Establishments
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cpi_establishments (
    establishment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    country_id BIGINT REFERENCES public.cpi_countries(country_id),
    establishment_name TEXT NOT NULL
);

-- ============================================================================
-- 6. Establishment Categories (junction table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cpi_establishment_categories (
    establishment_category_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    establishment_id BIGINT REFERENCES public.cpi_establishments(establishment_id),
    category_id BIGINT REFERENCES public.cpi_categories(category_id),
    UNIQUE(establishment_id, category_id)
);

-- ============================================================================
-- 7. Products
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cpi_products (
    product_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    country_id BIGINT REFERENCES public.cpi_countries(country_id),
    category_id BIGINT REFERENCES public.cpi_categories(category_id),
    product_name TEXT NOT NULL,
    product_photo_url TEXT,
    is_active_product BOOLEAN DEFAULT true
);

-- ============================================================================
-- 8. Users (volunteers) - extends auth.users
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cpi_volunteers (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    whatsapp TEXT,
    country_id BIGINT REFERENCES public.cpi_countries(country_id),
    suspended BOOLEAN DEFAULT false
);

-- ============================================================================
-- 9. Tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cpi_tracking (
    tracking_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    country_id BIGINT REFERENCES public.cpi_countries(country_id),
    product_id BIGINT REFERENCES public.cpi_products(product_id),
    location_id BIGINT REFERENCES public.cpi_locations(location_id),
    establishment_id BIGINT REFERENCES public.cpi_establishments(establishment_id),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_active_tracking BOOLEAN DEFAULT true
);

-- ============================================================================
-- 10. Prices
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cpi_prices (
    price_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT REFERENCES public.cpi_products(product_id),
    location_id BIGINT REFERENCES public.cpi_locations(location_id),
    establishment_id BIGINT REFERENCES public.cpi_establishments(establishment_id),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    price_value NUMERIC(10, 2) NOT NULL,
    date DATE NOT NULL,
    price_photo_url TEXT,
    is_valid BOOLEAN DEFAULT true,
    analyzed_date TIMESTAMPTZ
);

-- ============================================================================
-- 11. Finances
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cpi_finances (
    finance_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    concept TEXT NOT NULL,
    date TIMESTAMPTZ DEFAULT NOW(),
    previous_balance NUMERIC DEFAULT 0,
    amount NUMERIC NOT NULL,
    current_balance NUMERIC DEFAULT 0
);

-- ============================================================================
-- 12. Withdrawals
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cpi_withdrawals (
    withdrawal_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    concept TEXT NOT NULL,
    request_date TIMESTAMPTZ DEFAULT NOW(),
    finance_id BIGINT REFERENCES public.cpi_finances(finance_id),
    sent_date TIMESTAMPTZ
);

-- ============================================================================
-- 13. Criteria
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cpi_criteria (
    criterion_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    criterion_name TEXT UNIQUE NOT NULL,
    criterion_description TEXT,
    is_active_criterion BOOLEAN DEFAULT true,
    acceptance_score NUMERIC
);

-- ============================================================================
-- 14. Weights
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cpi_weights (
    weight_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    criterion_id BIGINT REFERENCES public.cpi_criteria(criterion_id),
    category_id BIGINT REFERENCES public.cpi_categories(category_id),
    weight_value NUMERIC DEFAULT 1,
    UNIQUE(criterion_id, category_id)
);

-- ============================================================================
-- 15. Annual Product Location Establishment Inflation
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cpi_annual_product_location_establishment_inflation (
    aple_inflation_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    recent_price_id BIGINT REFERENCES public.cpi_prices(price_id),
    product_id BIGINT REFERENCES public.cpi_products(product_id),
    country_id BIGINT REFERENCES public.cpi_countries(country_id),
    location_id BIGINT REFERENCES public.cpi_locations(location_id),
    establishment_id BIGINT REFERENCES public.cpi_establishments(establishment_id),
    recent_date DATE,
    historical_date DATE,
    days_between_measurements INTEGER,
    recent_price_value NUMERIC,
    historical_price_value NUMERIC,
    aple_inflation_rate NUMERIC
);

-- ============================================================================
-- 16. Category Location Inflation
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cpi_category_location_inflation (
    cli_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    country_id BIGINT REFERENCES public.cpi_countries(country_id),
    category_id BIGINT REFERENCES public.cpi_categories(category_id),
    location_id BIGINT REFERENCES public.cpi_locations(location_id),
    cli_inflation_rate NUMERIC,
    update_date TIMESTAMPTZ DEFAULT NOW(),
    month INTEGER,
    year INTEGER
);

-- ============================================================================
-- 17. Category Inflation
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cpi_category_inflation (
    ci_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    country_id BIGINT REFERENCES public.cpi_countries(country_id),
    category_id BIGINT REFERENCES public.cpi_categories(category_id),
    ci_inflation_rate NUMERIC,
    update_date TIMESTAMPTZ DEFAULT NOW(),
    month INTEGER,
    year INTEGER
);

-- ============================================================================
-- 18. Real CPI
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cpi_real_cpi (
    real_cpi_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    country_id BIGINT REFERENCES public.cpi_countries(country_id),
    criterion_id BIGINT REFERENCES public.cpi_criteria(criterion_id),
    real_cpi_inflation_rate NUMERIC,
    update_date TIMESTAMPTZ DEFAULT NOW(),
    month INTEGER,
    year INTEGER
);

-- ============================================================================
-- Enable Row Level Security on all tables
-- ============================================================================
ALTER TABLE public.cpi_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpi_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpi_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpi_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpi_establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpi_establishment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpi_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpi_volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpi_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpi_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpi_finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpi_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpi_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpi_weights ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Create indexes for better performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_cpi_prices_product_date ON public.cpi_prices(product_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_cpi_prices_user ON public.cpi_prices(user_id);
CREATE INDEX IF NOT EXISTS idx_cpi_tracking_user ON public.cpi_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_cpi_tracking_product ON public.cpi_tracking(product_id);
CREATE INDEX IF NOT EXISTS idx_cpi_finances_user ON public.cpi_finances(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_cpi_withdrawals_user ON public.cpi_withdrawals(user_id);