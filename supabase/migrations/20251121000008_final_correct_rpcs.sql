-- Final correct RPC migration based on actual DB schema
-- Drop all existing functions first
DROP FUNCTION IF EXISTS get_volunteer_dashboard_stats();
DROP FUNCTION IF EXISTS get_admin_dashboard_stats();
DROP FUNCTION IF EXISTS get_finance_history();
DROP FUNCTION IF EXISTS get_withdrawal_history();
DROP FUNCTION IF EXISTS request_withdrawal(INTEGER, TEXT);
DROP FUNCTION IF EXISTS process_withdrawal(UUID, TEXT);
DROP FUNCTION IF EXISTS get_pending_withdrawals();
DROP FUNCTION IF EXISTS get_products_needing_update_by_volunteer();
DROP FUNCTION IF EXISTS get_available_products_for_tracking(BIGINT, BIGINT, TEXT);
DROP FUNCTION IF EXISTS stop_tracking_product(UUID);
DROP FUNCTION IF EXISTS add_products_to_tracking(BIGINT[], BIGINT, BIGINT, BIGINT);
DROP FUNCTION IF EXISTS get_product_price_history(UUID);
DROP FUNCTION IF EXISTS update_product_price(UUID, NUMERIC, TIMESTAMP WITH TIME ZONE, TEXT);
DROP FUNCTION IF EXISTS get_volunteers();
DROP FUNCTION IF EXISTS get_all_products_admin(TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS toggle_product_status(BIGINT, BOOLEAN);

-- 1. get_volunteer_dashboard_stats
CREATE OR REPLACE FUNCTION get_volunteer_dashboard_stats()
RETURNS TABLE (
  current_points BIGINT,
  products_tracked_count BIGINT,
  pending_updates_count BIGINT,
  rank_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_points NUMERIC;
  v_tracked_count BIGINT;
  v_pending_count BIGINT;
BEGIN
  v_user_id := auth.uid();
  
  -- Get current balance from latest finance record
  SELECT COALESCE(current_balance, 0) INTO v_points
  FROM cpi_finances
  WHERE user_id = v_user_id
  ORDER BY date DESC
  LIMIT 1;
  
  -- Get tracked products count
  SELECT COUNT(*) INTO v_tracked_count
  FROM cpi_tracking
  WHERE user_id = v_user_id AND is_active_tracking = true;
  
  -- Get pending updates count (products not updated in > 30 days)
  SELECT COUNT(*) INTO v_pending_count
  FROM cpi_tracking t
  JOIN cpi_products p ON t.product_id = p.product_id
  LEFT JOIN (
    SELECT product_id, MAX(date) as last_price_date
    FROM cpi_prices
    WHERE user_id = v_user_id
    GROUP BY product_id
  ) lp ON p.product_id = lp.product_id
  WHERE t.user_id = v_user_id 
  AND t.is_active_tracking = true
  AND (lp.last_price_date IS NULL OR lp.last_price_date < CURRENT_DATE - INTERVAL '30 days');

  RETURN QUERY SELECT 
    v_points::BIGINT,
    v_tracked_count,
    v_pending_count,
    'Voluntario'::TEXT;
END;
$$;

-- 2. get_admin_dashboard_stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS TABLE (
  total_volunteers BIGINT,
  total_products BIGINT,
  total_prices BIGINT,
  pending_withdrawals BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT
    (SELECT COUNT(DISTINCT user_id) FROM cpi_tracking),
    (SELECT COUNT(*) FROM cpi_products),
    (SELECT COUNT(*) FROM cpi_prices),
    (SELECT COUNT(*) FROM cpi_withdrawals WHERE sent_date IS NULL); -- Pending = not sent yet
END;
$$;

-- 3. get_finance_history
CREATE OR REPLACE FUNCTION get_finance_history()
RETURNS TABLE (
  id BIGINT,
  points_change NUMERIC,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.finance_id,
    f.amount,
    f.concept,
    f.date
  FROM cpi_finances f
  WHERE f.user_id = auth.uid()
  ORDER BY f.date DESC
  LIMIT 100;
END;
$$;

-- 4. get_withdrawal_history
CREATE OR REPLACE FUNCTION get_withdrawal_history()
RETURNS TABLE (
  id BIGINT,
  amount_points NUMERIC,
  wallet_address TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.withdrawal_id,
    w.amount,
    w.concept as wallet_address, -- concept stores the wallet address
    CASE WHEN w.sent_date IS NULL THEN 'pending' ELSE 'processed' END as status,
    w.request_date,
    w.sent_date
  FROM cpi_withdrawals w
  WHERE w.user_id = auth.uid()
  ORDER BY w.request_date DESC;
END;
$$;

-- 5. request_withdrawal
CREATE OR REPLACE FUNCTION request_withdrawal(
  p_amount INTEGER,
  p_wallet_address TEXT
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_current_balance NUMERIC;
  v_withdrawal_id BIGINT;
  v_new_balance NUMERIC;
  v_previous_balance NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  -- Get current balance
  SELECT COALESCE(current_balance, 0) INTO v_current_balance
  FROM cpi_finances
  WHERE user_id = v_user_id
  ORDER BY date DESC
  LIMIT 1;
  
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;
  
  -- Create withdrawal request
  INSERT INTO cpi_withdrawals (user_id, amount, concept, request_date)
  VALUES (v_user_id, p_amount, p_wallet_address, NOW())
  RETURNING withdrawal_id INTO v_withdrawal_id;
  
  -- Deduct points in finances
  v_previous_balance := v_current_balance;
  v_new_balance := v_current_balance - p_amount;
  
  INSERT INTO cpi_finances (user_id, concept, date, previous_balance, amount, current_balance)
  VALUES (v_user_id, 'Withdrawal Request', NOW(), v_previous_balance, -p_amount, v_new_balance);
  
  RETURN v_withdrawal_id;
END;
$$;

-- 6. process_withdrawal
CREATE OR REPLACE FUNCTION process_withdrawal(p_withdrawal_id BIGINT, p_status TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_withdrawal_amount NUMERIC;
  v_withdrawal_user_id UUID;
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  -- Get withdrawal details
  SELECT amount, user_id INTO v_withdrawal_amount, v_withdrawal_user_id
  FROM cpi_withdrawals
  WHERE withdrawal_id = p_withdrawal_id;
  
  IF p_status = 'processed' THEN
    -- Mark as sent
    UPDATE cpi_withdrawals
    SET sent_date = NOW()
    WHERE withdrawal_id = p_withdrawal_id;
  ELSIF p_status = 'rejected' THEN
    -- Delete withdrawal request
    DELETE FROM cpi_withdrawals WHERE withdrawal_id = p_withdrawal_id;
    
    -- Refund points
    SELECT COALESCE(current_balance, 0) INTO v_current_balance
    FROM cpi_finances
    WHERE user_id = v_withdrawal_user_id
    ORDER BY date DESC
    LIMIT 1;
    
    v_new_balance := v_current_balance + v_withdrawal_amount;
    
    INSERT INTO cpi_finances (user_id, concept, date, previous_balance, amount, current_balance)
    VALUES (v_withdrawal_user_id, 'Withdrawal Rejected - Refund', NOW(), v_current_balance, v_withdrawal_amount, v_new_balance);
  END IF;
END;
$$;

-- 7. get_pending_withdrawals
CREATE OR REPLACE FUNCTION get_pending_withdrawals()
RETURNS TABLE (
  id BIGINT,
  user_id UUID,
  amount_points NUMERIC,
  wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.withdrawal_id,
    w.user_id,
    w.amount,
    w.concept as wallet_address,
    w.request_date
  FROM cpi_withdrawals w
  WHERE w.sent_date IS NULL
  ORDER BY w.request_date ASC;
END;
$$;

-- 8. get_products_needing_update_by_volunteer
CREATE OR REPLACE FUNCTION get_products_needing_update_by_volunteer()
RETURNS TABLE (
  tracking_id BIGINT,
  product_id BIGINT,
  product_name TEXT,
  image_url TEXT,
  last_update_date DATE,
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
    lp.last_price_date,
    EXTRACT(DAY FROM CURRENT_DATE - COALESCE(lp.last_price_date, CURRENT_DATE - INTERVAL '365 days'))::INTEGER as days_since_update
  FROM cpi_tracking t
  JOIN cpi_products p ON t.product_id = p.product_id
  LEFT JOIN (
    SELECT product_id, MAX(date) as last_price_date
    FROM cpi_prices
    WHERE user_id = v_user_id
    GROUP BY product_id
  ) lp ON p.product_id = lp.product_id
  WHERE t.user_id = v_user_id 
  AND t.is_active_tracking = true
  AND (lp.last_price_date IS NULL OR lp.last_price_date < CURRENT_DATE - INTERVAL '30 days')
  ORDER BY days_since_update DESC;
END;
$$;

-- 9. get_available_products_for_tracking
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
  JOIN cpi_categories c ON p.category_id = c.category_id
  WHERE p.is_active_product = true
  AND p.country_id = p_country_id
  AND (p_category_id IS NULL OR p.category_id = p_category_id)
  AND (p_search_term IS NULL OR p.product_name ILIKE '%' || p_search_term || '%')
  AND NOT EXISTS (
    SELECT 1 FROM cpi_tracking t 
    WHERE t.product_id = p.product_id 
    AND t.user_id = v_user_id 
    AND t.is_active_tracking = true
  )
  LIMIT 50;
END;
$$;

-- 10. stop_tracking_product
CREATE OR REPLACE FUNCTION stop_tracking_product(p_tracking_id BIGINT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE cpi_tracking
  SET is_active_tracking = false
  WHERE tracking_id = p_tracking_id AND user_id = auth.uid();
END;
$$;

-- 11. add_products_to_tracking
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
    IF NOT EXISTS (
      SELECT 1 FROM cpi_tracking 
      WHERE user_id = v_user_id 
      AND product_id = v_product_id 
      AND is_active_tracking = true
    ) THEN
      INSERT INTO cpi_tracking (
        user_id, 
        product_id, 
        country_id,
        establishment_id, 
        location_id,
        is_active_tracking
      )
      VALUES (
        v_user_id, 
        v_product_id, 
        p_country_id,
        p_establishment_id, 
        p_location_id,
        true
      );
    END IF;
  END LOOP;
END;
$$;

-- 12. get_product_price_history
CREATE OR REPLACE FUNCTION get_product_price_history(p_tracking_id BIGINT)
RETURNS TABLE (
  price_value NUMERIC,
  date DATE,
  photo_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_id BIGINT;
BEGIN
  SELECT product_id INTO v_product_id
  FROM cpi_tracking
  WHERE tracking_id = p_tracking_id;

  RETURN QUERY
  SELECT 
    pr.price_value,
    pr.date,
    pr.price_photo_url as photo_url
  FROM cpi_prices pr
  WHERE pr.product_id = v_product_id
  ORDER BY pr.date DESC
  LIMIT 20;
END;
$$;

-- 13. update_product_price
CREATE OR REPLACE FUNCTION update_product_price(
  p_tracking_id BIGINT,
  p_price_value NUMERIC,
  p_date TIMESTAMP WITH TIME ZONE,
  p_photo_url TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_product_id BIGINT;
  v_establishment_id BIGINT;
  v_location_id BIGINT;
  v_price_id BIGINT;
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  SELECT product_id, establishment_id, location_id 
  INTO v_product_id, v_establishment_id, v_location_id
  FROM cpi_tracking
  WHERE tracking_id = p_tracking_id AND user_id = v_user_id AND is_active_tracking = true;
  
  IF v_product_id IS NULL THEN
    RAISE EXCEPTION 'Tracking not found or inactive';
  END IF;
  
  INSERT INTO cpi_prices (
    product_id, 
    establishment_id, 
    location_id, 
    price_value, 
    date, 
    user_id,
    price_photo_url
  )
  VALUES (
    v_product_id, 
    v_establishment_id, 
    v_location_id, 
    p_price_value, 
    p_date::DATE, 
    v_user_id,
    p_photo_url
  )
  RETURNING price_id INTO v_price_id;
  
  -- Award points if eligible (no update in last 30 days)
  IF NOT EXISTS (
    SELECT 1 FROM cpi_prices 
    WHERE product_id = v_product_id 
    AND user_id = v_user_id 
    AND date > (p_date::DATE - INTERVAL '30 days')
    AND price_id != v_price_id
  ) THEN
    -- Get current balance
    SELECT COALESCE(current_balance, 0) INTO v_current_balance
    FROM cpi_finances
    WHERE user_id = v_user_id
    ORDER BY date DESC
    LIMIT 1;
    
    v_new_balance := v_current_balance + 1;
    
    INSERT INTO cpi_finances (user_id, concept, date, previous_balance, amount, current_balance)
    VALUES (v_user_id, 'Price Update Reward', NOW(), v_current_balance, 1, v_new_balance);
  END IF;
  
  RETURN v_price_id;
END;
$$;

-- 14. get_volunteers
CREATE OR REPLACE FUNCTION get_volunteers()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  products_tracked BIGINT,
  total_points NUMERIC,
  last_active TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.user_id,
    v.email,
    COUNT(DISTINCT t.product_id) as products_tracked,
    COALESCE((
      SELECT current_balance 
      FROM cpi_finances f 
      WHERE f.user_id = v.user_id 
      ORDER BY f.date DESC 
      LIMIT 1
    ), 0) as total_points,
    MAX(f.date) as last_active
  FROM cpi_volunteers v
  LEFT JOIN cpi_tracking t ON v.user_id = t.user_id AND t.is_active_tracking = true
  LEFT JOIN cpi_finances f ON v.user_id = f.user_id
  GROUP BY v.user_id, v.email;
END;
$$;

-- 15. get_all_products_admin
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
  last_update DATE
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
    (SELECT COUNT(*) FROM cpi_prices pr WHERE pr.product_id = p.product_id) as price_count,
    (SELECT MAX(date) FROM cpi_prices pr WHERE pr.product_id = p.product_id) as last_update
  FROM cpi_products p
  LEFT JOIN cpi_categories c ON p.category_id = c.category_id
  WHERE (p_search IS NULL OR p.product_name ILIKE '%' || p_search || '%')
  ORDER BY p.product_id DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- 16. toggle_product_status
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
