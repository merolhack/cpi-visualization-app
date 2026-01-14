-- Drop functions with return type conflicts before recreating
DROP FUNCTION IF EXISTS get_products_needing_update_by_volunteer();
DROP FUNCTION IF EXISTS get_available_products_for_tracking(BIGINT, BIGINT, TEXT);
DROP FUNCTION IF EXISTS get_product_price_history(UUID);
DROP FUNCTION IF EXISTS update_product_price(UUID, NUMERIC, TIMESTAMP WITH TIME ZONE, TEXT);
DROP FUNCTION IF EXISTS add_products_to_tracking(BIGINT[], BIGINT, BIGINT, BIGINT);
DROP FUNCTION IF EXISTS get_all_products_admin(TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS toggle_product_status(BIGINT, BOOLEAN);

-- Recreate get_products_needing_update_by_volunteer
CREATE OR REPLACE FUNCTION get_products_needing_update_by_volunteer()
RETURNS TABLE (
  tracking_id UUID,
  product_id BIGINT,
  product_name TEXT,
  image_url TEXT,
  last_update_date TIMESTAMP WITH TIME ZONE,
  days_since_update INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  RETURN QUERY
  SELECT 
    t.tracking_id,
    p.product_id,
    p.product_name,
    p.product_photo_url as image_url,
    lp.last_price_date as last_update_date,
    EXTRACT(DAY FROM NOW() - COALESCE(lp.last_price_date, t.tracking_created_at))::INTEGER as days_since_update
  FROM cpi_tracking t
  JOIN cpi_products p ON t.tracking_product_id = p.product_id
  LEFT JOIN (
    SELECT price_product_id, MAX(price_date) as last_price_date
    FROM cpi_prices
    WHERE price_created_by = v_user_id
    GROUP BY price_product_id
  ) lp ON p.product_id = lp.price_product_id
  WHERE t.tracking_user_id = v_user_id 
  AND t.tracking_is_active = true
  AND (lp.last_price_date IS NULL OR lp.last_price_date < NOW() - INTERVAL '30 days')
  ORDER BY days_since_update DESC;
END;
$$;

-- Recreate get_available_products_for_tracking
CREATE OR REPLACE FUNCTION get_available_products_for_tracking(
  p_country_id BIGINT,
  p_category_id BIGINT DEFAULT NULL,
  p_search_term TEXT DEFAULT NULL
)
RETURNS TABLE (
  product_id BIGINT,
  product_name TEXT,
  category_name TEXT,
  image_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  RETURN QUERY
  SELECT 
    p.product_id,
    p.product_name,
    c.category_name,
    p.product_photo_url as image_url
  FROM cpi_products p
  JOIN cpi_categories c ON p.product_category_id = c.category_id
  WHERE p.is_active_product = true
  AND (p_category_id IS NULL OR p.product_category_id = p_category_id)
  AND (p_search_term IS NULL OR p.product_name ILIKE '%' || p_search_term || '%')
  -- Exclude products already tracked by this user
  AND NOT EXISTS (
    SELECT 1 FROM cpi_tracking t 
    WHERE t.tracking_product_id = p.product_id 
    AND t.tracking_user_id = v_user_id 
    AND t.tracking_is_active = true
  )
  LIMIT 50;
END;
$$;

-- Recreate stop_tracking_product
CREATE OR REPLACE FUNCTION stop_tracking_product(p_tracking_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE cpi_tracking
  SET tracking_is_active = false
  WHERE tracking_id = p_tracking_id AND tracking_user_id = auth.uid();
END;
$$;

-- Recreate add_products_to_tracking
CREATE OR REPLACE FUNCTION add_products_to_tracking(
  p_product_ids BIGINT[],
  p_country_id BIGINT,
  p_location_id BIGINT,
  p_establishment_id BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_product_id BIGINT;
BEGIN
  v_user_id := auth.uid();
  
  FOREACH v_product_id IN ARRAY p_product_ids
  LOOP
    -- Check if already tracking (active)
    IF NOT EXISTS (
      SELECT 1 FROM cpi_tracking 
      WHERE tracking_user_id = v_user_id 
      AND tracking_product_id = v_product_id 
      AND tracking_is_active = true
    ) THEN
      -- Insert tracking record
      INSERT INTO cpi_tracking (
        tracking_user_id, 
        tracking_product_id, 
        tracking_establishment_id, 
        tracking_location_id,
        tracking_is_active
      )
      VALUES (
        v_user_id, 
        v_product_id, 
        p_establishment_id, 
        p_location_id,
        true
      );
    END IF;
  END LOOP;
END;
$$;

-- Recreate get_product_price_history
CREATE OR REPLACE FUNCTION get_product_price_history(p_tracking_id UUID)
RETURNS TABLE (
  price_value NUMERIC,
  date TIMESTAMP WITH TIME ZONE,
  photo_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_id BIGINT;
BEGIN
  -- Get product_id from tracking
  SELECT tracking_product_id INTO v_product_id
  FROM cpi_tracking
  WHERE tracking_id = p_tracking_id;

  RETURN QUERY
  SELECT 
    price_value,
    price_date as date,
    price_photo_url as photo_url
  FROM cpi_prices
  WHERE price_product_id = v_product_id
  ORDER BY price_date DESC
  LIMIT 20;
END;
$$;

-- Recreate update_product_price
CREATE OR REPLACE FUNCTION update_product_price(
  p_tracking_id UUID,
  p_price_value NUMERIC,
  p_date TIMESTAMP WITH TIME ZONE,
  p_photo_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_product_id BIGINT;
  v_establishment_id BIGINT;
  v_location_id BIGINT;
  v_price_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- Get tracking details
  SELECT tracking_product_id, tracking_establishment_id, tracking_location_id 
  INTO v_product_id, v_establishment_id, v_location_id
  FROM cpi_tracking
  WHERE tracking_id = p_tracking_id AND tracking_user_id = v_user_id AND tracking_is_active = true;
  
  IF v_product_id IS NULL THEN
    RAISE EXCEPTION 'Tracking not found or inactive';
  END IF;
  
  -- Insert new price
  INSERT INTO cpi_prices (
    price_product_id, 
    price_establishment_id, 
    price_location_id, 
    price_value, 
    price_date, 
    price_created_by,
    price_photo_url
  )
  VALUES (
    v_product_id, 
    v_establishment_id, 
    v_location_id, 
    p_price_value, 
    p_date, 
    v_user_id,
    p_photo_url
  )
  RETURNING price_id INTO v_price_id;
  
  -- Award points if eligible (no update in last 30 days)
  IF NOT EXISTS (
    SELECT 1 FROM cpi_prices 
    WHERE price_product_id = v_product_id 
    AND price_created_by = v_user_id 
    AND price_date > (p_date - INTERVAL '30 days')
    AND price_id != v_price_id
  ) THEN
    INSERT INTO cpi_finances (finance_volunteer_id, finance_points_change, finance_reason, finance_related_entity_type, finance_related_entity_id)
    VALUES (v_user_id, 1, 'Price Update Reward', 'price_update', v_price_id);
  END IF;
  
  RETURN v_price_id;
END;
$$;

-- Recreate get_volunteers
CREATE OR REPLACE FUNCTION get_volunteers()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  products_tracked BIGINT,
  total_points BIGINT,
  last_active TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tracking_user_id,
    'user@example.com'::TEXT as email, -- Placeholder
    COUNT(DISTINCT t.tracking_product_id) as products_tracked,
    COALESCE(SUM(f.finance_points_change), 0) as total_points,
    MAX(t.tracking_created_at) as last_active
  FROM cpi_tracking t
  LEFT JOIN cpi_finances f ON t.tracking_user_id = f.finance_volunteer_id
  GROUP BY t.tracking_user_id;
END;
$$;

-- Recreate get_all_products_admin
CREATE OR REPLACE FUNCTION get_all_products_admin(
  p_search TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  category_name TEXT,
  image_url TEXT,
  is_active BOOLEAN,
  price_count BIGINT,
  last_update TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.product_id,
    p.product_name,
    c.category_name,
    p.product_photo_url as image_url,
    p.is_active_product as is_active,
    (SELECT COUNT(*) FROM cpi_prices pr WHERE pr.price_product_id = p.product_id) as price_count,
    (SELECT MAX(price_date) FROM cpi_prices pr WHERE pr.price_product_id = p.product_id) as last_update
  FROM cpi_products p
  LEFT JOIN cpi_categories c ON p.product_category_id = c.category_id
  WHERE (p_search IS NULL OR p.product_name ILIKE '%' || p_search || '%')
  ORDER BY p.product_created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Recreate toggle_product_status
CREATE OR REPLACE FUNCTION toggle_product_status(p_product_id BIGINT, p_status BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE cpi_products
  SET is_active_product = p_status
  WHERE product_id = p_product_id;
END;
$$;
