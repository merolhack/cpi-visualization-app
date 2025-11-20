-- RPC to get product price history
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
  v_product_id UUID;
BEGIN
  -- Get product_id from tracking
  SELECT product_id INTO v_product_id
  FROM cpi_tracking
  WHERE id = p_tracking_id;

  RETURN QUERY
  SELECT 
    price as price_value,
    date,
    evidence_image_url as photo_url
  FROM cpi_prices
  WHERE product_id = v_product_id
  ORDER BY date DESC
  LIMIT 20;
END;
$$;

-- RPC to update product price
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
  v_product_id UUID;
  v_establishment_id BIGINT;
  v_location_id BIGINT;
  v_price_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- Get tracking details
  SELECT product_id, establishment_id, location_id 
  INTO v_product_id, v_establishment_id, v_location_id
  FROM cpi_tracking
  WHERE id = p_tracking_id AND user_id = v_user_id AND is_active = true;
  
  IF v_product_id IS NULL THEN
    RAISE EXCEPTION 'Tracking not found or inactive';
  END IF;
  
  -- Insert new price
  INSERT INTO cpi_prices (
    product_id, 
    establishment_id, 
    location_id, 
    price, 
    date, 
    created_by,
    evidence_image_url
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
  RETURNING id INTO v_price_id;
  
  -- Award points (simple logic: 1 point per update if > 30 days since last update)
  -- For now, just award 1 point unconditionally as per the "Did you know" section, 
  -- but ideally we should check the last update date.
  -- Let's implement the check.
  
  IF NOT EXISTS (
    SELECT 1 FROM cpi_prices 
    WHERE product_id = v_product_id 
    AND created_by = v_user_id 
    AND date > (p_date - INTERVAL '30 days')
    AND id != v_price_id
  ) THEN
    INSERT INTO cpi_finances (volunteer_id, points_change, reason, related_entity_type, related_entity_id)
    VALUES (v_user_id, 1, 'Price Update Reward', 'price_update', v_price_id);
  END IF;
  
  RETURN v_price_id;
END;
$$;
