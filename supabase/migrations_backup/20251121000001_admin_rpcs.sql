-- RPC to get admin dashboard stats
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
    (SELECT COUNT(DISTINCT user_id) FROM cpi_tracking), -- Estimate active volunteers
    (SELECT COUNT(*) FROM cpi_products),
    (SELECT COUNT(*) FROM cpi_prices),
    (SELECT COUNT(*) FROM cpi_withdrawals WHERE status = 'pending');
END;
$$;

-- RPC to get all volunteers (users who are tracking products)
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
    t.user_id,
    'user@example.com'::TEXT as email, -- Placeholder
    COUNT(DISTINCT t.product_id) as products_tracked,
    COALESCE(SUM(f.points_change), 0) as total_points,
    MAX(t.created_at) as last_active
  FROM cpi_tracking t
  LEFT JOIN cpi_finances f ON t.user_id = f.volunteer_id
  GROUP BY t.user_id;
END;
$$;

-- RPC to get all products for admin
CREATE OR REPLACE FUNCTION get_all_products_admin(
  p_search TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
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
    p.id,
    p.name,
    c.name as category_name,
    p.image_url,
    p.is_active_product as is_active,
    (SELECT COUNT(*) FROM cpi_prices pr WHERE pr.product_id = p.id) as price_count,
    (SELECT MAX(date) FROM cpi_prices pr WHERE pr.product_id = p.id) as last_update
  FROM cpi_products p
  LEFT JOIN cpi_categories c ON p.category_id = c.id
  WHERE (p_search IS NULL OR p.name ILIKE '%' || p_search || '%')
  ORDER BY p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- RPC to toggle product status
CREATE OR REPLACE FUNCTION toggle_product_status(p_product_id UUID, p_status BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE cpi_products
  SET is_active_product = p_status
  WHERE id = p_product_id;
END;
$$;

-- RPC to get pending withdrawals
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
    w.id,
    w.user_id,
    w.amount_points,
    w.wallet_address,
    w.created_at
  FROM cpi_withdrawals w
  WHERE w.status = 'pending'
  ORDER BY w.created_at ASC;
END;
$$;

-- RPC to process withdrawal
CREATE OR REPLACE FUNCTION process_withdrawal(p_withdrawal_id UUID, p_status TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE cpi_withdrawals
  SET 
    status = p_status,
    processed_at = NOW()
  WHERE id = p_withdrawal_id;
  
  -- If rejected, refund points
  IF p_status = 'rejected' THEN
    INSERT INTO cpi_finances (volunteer_id, points_change, reason, related_entity_type, related_entity_id)
    SELECT user_id, amount_points, 'Withdrawal Rejected - Refund', 'withdrawal_refund', id
    FROM cpi_withdrawals
    WHERE id = p_withdrawal_id;
  END IF;
END;
$$;

-- RPC to get all categories for admin
CREATE OR REPLACE FUNCTION get_all_categories_admin()
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  product_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    COUNT(p.id) as product_count
  FROM cpi_categories c
  LEFT JOIN cpi_products p ON c.id = p.category_id
  GROUP BY c.id, c.name
  ORDER BY c.name;
END;
$$;

-- RPC to create category
CREATE OR REPLACE FUNCTION create_category(p_name TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id BIGINT;
BEGIN
  INSERT INTO cpi_categories (name)
  VALUES (p_name)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- RPC to get all establishments for admin
CREATE OR REPLACE FUNCTION get_all_establishments_admin()
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  country_name TEXT,
  location_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.establishment_id as id,
    e.establishment_name as name,
    c.country_name,
    COUNT(DISTINCT l.location_id) as location_count
  FROM cpi_establishments e
  JOIN cpi_countries c ON e.country_id = c.country_id
  LEFT JOIN cpi_locations l ON e.country_id = l.country_id -- Approximation, ideally establishments are linked to locations via prices or tracking
  GROUP BY e.establishment_id, e.establishment_name, c.country_name
  ORDER BY e.establishment_name;
END;
$$;
