-- Fix get_admin_dashboard_stats function - cpi_withdrawals uses sent_date IS NULL instead of status column
DROP FUNCTION IF EXISTS get_admin_dashboard_stats();

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
    (SELECT COUNT(DISTINCT user_id) FROM cpi_volunteers),
    (SELECT COUNT(*) FROM cpi_products),
    (SELECT COUNT(*) FROM cpi_prices),
    (SELECT COUNT(*) FROM cpi_withdrawals WHERE sent_date IS NULL);
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO anon, authenticated;
