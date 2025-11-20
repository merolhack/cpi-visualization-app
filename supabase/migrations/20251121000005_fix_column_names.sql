-- Fix column name mismatches in RPC functions

-- Fix get_volunteer_dashboard_stats - correct column name
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
  
  -- Get current points - using correct column name
  SELECT COALESCE(SUM(finance_points_change), 0) INTO v_points
  FROM cpi_finances
  WHERE finance_volunteer_id = v_user_id;
  
  -- Get tracked products count
  SELECT COUNT(*) INTO v_tracked_count
  FROM cpi_tracking
  WHERE tracking_user_id = v_user_id AND tracking_is_active = true;
  
  -- Get pending updates count (products not updated in > 30 days)
  SELECT COUNT(*) INTO v_pending_count
  FROM cpi_tracking t
  JOIN cpi_products p ON t.tracking_product_id = p.product_id
  LEFT JOIN (
    SELECT price_product_id, MAX(price_date) as last_price_date
    FROM cpi_prices
    WHERE price_created_by = v_user_id
    GROUP BY price_product_id
  ) last_prices ON p.product_id = last_prices.price_product_id
  WHERE t.tracking_user_id = v_user_id 
  AND t.tracking_is_active = true
  AND (last_prices.last_price_date IS NULL OR last_prices.last_price_date < NOW() - INTERVAL '30 days');

  RETURN QUERY SELECT 
    v_points,
    v_tracked_count,
    v_pending_count,
    'Voluntario'::TEXT; -- Placeholder for rank system
END;
$$;

-- Fix get_admin_dashboard_stats - correct column name
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
    (SELECT COUNT(DISTINCT tracking_user_id) FROM cpi_tracking), -- Estimate active volunteers
    (SELECT COUNT(*) FROM cpi_products),
    (SELECT COUNT(*) FROM cpi_prices),
    (SELECT COUNT(*) FROM cpi_withdrawals WHERE withdrawal_status = 'pending');
END;
$$;

-- Fix get_finance_history - correct column names
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
    f.finance_id,
    f.finance_points_change,
    f.finance_reason,
    f.finance_created_at
  FROM cpi_finances f
  WHERE f.finance_volunteer_id = auth.uid()
  ORDER BY f.finance_created_at DESC
  LIMIT 100;
END;
$$;

-- Fix get_withdrawal_history - correct column names
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
    w.withdrawal_id,
    w.withdrawal_amount_points,
    w.withdrawal_wallet_address,
    w.withdrawal_status,
    w.withdrawal_created_at,
    w.withdrawal_processed_at
  FROM cpi_withdrawals w
  WHERE w.withdrawal_user_id = auth.uid()
  ORDER BY w.withdrawal_created_at DESC;
END;
$$;

-- Fix request_withdrawal - correct column names
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
  SELECT COALESCE(SUM(finance_points_change), 0) INTO v_current_points
  FROM cpi_finances
  WHERE finance_volunteer_id = v_user_id;
  
  IF v_current_points < p_amount THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;
  
  -- Create withdrawal request
  INSERT INTO cpi_withdrawals (withdrawal_user_id, withdrawal_amount_points, withdrawal_wallet_address, withdrawal_status)
  VALUES (v_user_id, p_amount, p_wallet_address, 'pending')
  RETURNING withdrawal_id INTO v_withdrawal_id;
  
  -- Deduct points immediately (hold)
  INSERT INTO cpi_finances (finance_volunteer_id, finance_points_change, finance_reason, finance_related_entity_type, finance_related_entity_id)
  VALUES (v_user_id, -p_amount, 'Withdrawal Request', 'withdrawal', v_withdrawal_id);
  
  RETURN v_withdrawal_id;
END;
$$;

-- Fix process_withdrawal - correct column names
CREATE OR REPLACE FUNCTION process_withdrawal(p_withdrawal_id UUID, p_status TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE cpi_withdrawals
  SET 
    withdrawal_status = p_status,
    withdrawal_processed_at = NOW()
  WHERE withdrawal_id = p_withdrawal_id;
  
  -- If rejected, refund points
  IF p_status = 'rejected' THEN
    INSERT INTO cpi_finances (finance_volunteer_id, finance_points_change, finance_reason, finance_related_entity_type, finance_related_entity_id)
    SELECT withdrawal_user_id, withdrawal_amount_points, 'Withdrawal Rejected - Refund', 'withdrawal_refund', withdrawal_id
    FROM cpi_withdrawals
    WHERE withdrawal_id = p_withdrawal_id;
  END IF;
END;
$$;

-- Fix get_pending_withdrawals - correct column names
CREATE OR REPLACE FUNCTION get_pending_withdrawals()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  amount_points INTEGER,
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
    w.withdrawal_user_id,
    w.withdrawal_amount_points,
    w.withdrawal_wallet_address,
    w.withdrawal_created_at
  FROM cpi_withdrawals w
  WHERE w.withdrawal_status = 'pending'
  ORDER BY w.withdrawal_created_at ASC;
END;
$$;
