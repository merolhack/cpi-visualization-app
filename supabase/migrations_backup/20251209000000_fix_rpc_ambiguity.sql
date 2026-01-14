-- Fix RPC ambiguity for add_product_and_price
-- The error "300 Multiple Choices" occurs because there are multiple function signatures matching the call.
-- This likely happened when we added p_canonical_id without dropping the old 8-argument function.

-- Drop the potential old 8-argument signatures (using BIGINT which is the standard for IDs in this schema)
DROP FUNCTION IF EXISTS add_product_and_price(TEXT, TEXT, BIGINT, BIGINT, BIGINT, BIGINT, NUMERIC, DATE);

-- Just in case it was defined with INTEGERs in an older legacy version (unlikely but safe to try drop)
DROP FUNCTION IF EXISTS add_product_and_price(TEXT, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, NUMERIC, DATE);

-- Recreate the correct function with the 9th argument (optional)
CREATE OR REPLACE FUNCTION add_product_and_price(
  p_product_name TEXT,
  p_ean_code TEXT,
  p_country_id BIGINT,
  p_category_id BIGINT,
  p_establishment_id BIGINT,
  p_location_id BIGINT,
  p_price_value NUMERIC,
  p_price_date DATE,
  p_canonical_id BIGINT DEFAULT NULL
)
RETURNS TABLE (
  product_id BIGINT,
  price_id BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_id BIGINT;
  v_price_id BIGINT;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  -- 1. Find or Create Product
  -- Try to find by EAN first if provided
  IF p_ean_code IS NOT NULL AND p_ean_code != '' THEN
    SELECT p.product_id INTO v_product_id
    FROM cpi_products p
    WHERE p.ean_code = p_ean_code
    LIMIT 1;
  END IF;

  -- If not found by EAN, try by Name (exact match, case insensitive) within the same country
  IF v_product_id IS NULL THEN
    SELECT p.product_id INTO v_product_id
    FROM cpi_products p
    WHERE p.product_name ILIKE p_product_name
    AND p.country_id = p_country_id
    LIMIT 1;
  END IF;

  -- If still not found, create new product
  IF v_product_id IS NULL THEN
    INSERT INTO cpi_products (
      product_name,
      ean_code,
      country_id,
      category_id,
      canonical_id,
      is_active_product
    ) VALUES (
      p_product_name,
      NULLIF(p_ean_code, ''),
      p_country_id,
      p_category_id,
      p_canonical_id,
      true
    )
    RETURNING cpi_products.product_id INTO v_product_id;
  ELSE
    -- Optional: Update canonical_id if it's missing and provided
    IF p_canonical_id IS NOT NULL THEN
      UPDATE cpi_products 
      SET canonical_id = p_canonical_id 
      WHERE cpi_products.product_id = v_product_id 
      AND canonical_id IS NULL;
    END IF;
  END IF;

  -- 2. Insert Price
  INSERT INTO cpi_prices (
    product_id,
    establishment_id,
    location_id,
    price_value,
    date,
    user_id,
    is_valid
  ) VALUES (
    v_product_id,
    p_establishment_id,
    p_location_id,
    p_price_value,
    p_price_date,
    v_user_id,
    true
  )
  RETURNING cpi_prices.price_id INTO v_price_id;

  -- 3. Manage Tracking
  -- Check if tracking exists
  IF NOT EXISTS (
    SELECT 1 FROM cpi_tracking t
    WHERE t.user_id = v_user_id
    AND t.product_id = v_product_id
    AND t.establishment_id = p_establishment_id
    AND t.location_id = p_location_id
  ) THEN
    -- Insert new tracking
    INSERT INTO cpi_tracking (
      user_id,
      product_id,
      establishment_id,
      location_id,
      country_id,
      is_active_tracking
    ) VALUES (
      v_user_id,
      v_product_id,
      p_establishment_id,
      p_location_id,
      p_country_id,
      true
    );
  ELSE
    -- Ensure it's active
    UPDATE cpi_tracking
    SET is_active_tracking = true
    WHERE user_id = v_user_id
    AND product_id = v_product_id
    AND establishment_id = p_establishment_id
    AND location_id = p_location_id
    AND is_active_tracking = false;
  END IF;

  RETURN QUERY SELECT v_product_id, v_price_id;
END;
$$;
