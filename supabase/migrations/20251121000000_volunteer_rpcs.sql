-- RPC to get volunteer dashboard stats
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
  v_points BIGINT;
  v_tracked_count BIGINT;
  v_pending_count BIGINT;
BEGIN
  v_user_id := auth.uid();
  
  -- Get current points
  SELECT COALESCE(SUM(points_change), 0) INTO v_points
  FROM cpi_finances
  WHERE volunteer_id = v_user_id;
  
  -- Get tracked products count
  SELECT COUNT(*) INTO v_tracked_count
  FROM cpi_tracking
  WHERE user_id = v_user_id AND is_active = true;
  
  -- Get pending updates count (products not updated in > 30 days)
  SELECT COUNT(*) INTO v_pending_count
  FROM cpi_tracking t
  JOIN cpi_products p ON t.product_id = p.id
  LEFT JOIN (
    SELECT product_id, MAX(date) as last_price_date
    FROM cpi_prices
    WHERE created_by = v_user_id
    GROUP BY product_id
  ) last_prices ON p.id = last_prices.product_id
  WHERE t.user_id = v_user_id 
  AND t.is_active = true
  AND (last_prices.last_price_date IS NULL OR last_prices.last_price_date < NOW() - INTERVAL '30 days');

  RETURN QUERY SELECT 
    v_points,
    v_tracked_count,
    v_pending_count,
    'Voluntario'::TEXT; -- Placeholder for rank system
END;
$$;

-- RPC to get products needing update by volunteer
CREATE OR REPLACE FUNCTION get_products_needing_update_by_volunteer()
RETURNS TABLE (
  tracking_id UUID,
  product_id UUID,
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
    t.id as tracking_id,
    p.id as product_id,
    p.name as product_name,
    p.image_url,
    lp.last_price_date as last_update_date,
    EXTRACT(DAY FROM NOW() - COALESCE(lp.last_price_date, t.created_at))::INTEGER as days_since_update
  FROM cpi_tracking t
  JOIN cpi_products p ON t.product_id = p.id
  LEFT JOIN (
    SELECT product_id, MAX(date) as last_price_date
    FROM cpi_prices
    WHERE created_by = v_user_id
    GROUP BY product_id
  ) lp ON p.id = lp.product_id
  WHERE t.user_id = v_user_id 
  AND t.is_active = true
  AND (lp.last_price_date IS NULL OR lp.last_price_date < NOW() - INTERVAL '30 days')
  ORDER BY days_since_update DESC;
END;
$$;

-- RPC to get available products for tracking
CREATE OR REPLACE FUNCTION get_available_products_for_tracking(
  p_country_id BIGINT,
  p_category_id BIGINT DEFAULT NULL,
  p_search_term TEXT DEFAULT NULL
)
RETURNS TABLE (
  product_id UUID,
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
    p.id,
    p.name,
    c.name as category_name,
    p.image_url
  FROM cpi_products p
  JOIN cpi_categories c ON p.category_id = c.id
  WHERE p.is_active_product = true
  AND (p_category_id IS NULL OR p.category_id = p_category_id)
  AND (p_search_term IS NULL OR p.name ILIKE '%' || p_search_term || '%')
  -- Exclude products already tracked by this user
  AND NOT EXISTS (
    SELECT 1 FROM cpi_tracking t 
    WHERE t.product_id = p.id 
    AND t.user_id = v_user_id 
    AND t.is_active = true
  )
  LIMIT 50;
END;
$$;

-- RPC to stop tracking a product
CREATE OR REPLACE FUNCTION stop_tracking_product(p_tracking_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE cpi_tracking
  SET is_active = false
  WHERE id = p_tracking_id AND user_id = auth.uid();
END;
$$;

-- RPC to request withdrawal
CREATE OR REPLACE FUNCTION request_withdrawal(
  p_amount INTEGER,
  p_wallet_address TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_current_points BIGINT;
  v_withdrawal_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- Check current balance
  SELECT COALESCE(SUM(points_change), 0) INTO v_current_points
  FROM cpi_finances
  WHERE volunteer_id = v_user_id;
  
  IF v_current_points < p_amount THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;
  
  -- Create withdrawal request
  INSERT INTO cpi_withdrawals (user_id, amount_points, wallet_address, status)
  VALUES (v_user_id, p_amount, p_wallet_address, 'pending')
  RETURNING id INTO v_withdrawal_id;
  
  -- Deduct points immediately (hold)
  INSERT INTO cpi_finances (volunteer_id, points_change, reason, related_entity_type, related_entity_id)
  VALUES (v_user_id, -p_amount, 'Withdrawal Request', 'withdrawal', v_withdrawal_id);
  
  RETURN v_withdrawal_id;
END;
$$;

-- RPC to get withdrawal history
CREATE OR REPLACE FUNCTION get_withdrawal_history()
RETURNS TABLE (
  id UUID,
  amount_points INTEGER,
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
    w.id,
    w.amount_points,
    w.wallet_address,
    w.status,
    w.created_at,
    w.processed_at
  FROM cpi_withdrawals w
  WHERE w.user_id = auth.uid()
  ORDER BY w.created_at DESC;
END;
$$;

-- RPC to get finance history
CREATE OR REPLACE FUNCTION get_finance_history()
RETURNS TABLE (
  id UUID,
  points_change INTEGER,
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
    f.id,
    f.points_change,
    f.reason,
    f.created_at
  FROM cpi_finances f
  WHERE f.volunteer_id = auth.uid()
  ORDER BY f.created_at DESC
  LIMIT 100;
END;
$$;
