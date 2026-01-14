-- Pre-migration cleanup: Drop existing functions that will be recreated
-- This ensures clean migration without conflicts

-- Drop volunteer panel functions if they exist
DROP FUNCTION IF EXISTS get_volunteer_dashboard_stats();
DROP FUNCTION IF EXISTS get_products_needing_update_by_volunteer();
DROP FUNCTION IF EXISTS get_available_products_for_tracking(BIGINT, BIGINT, TEXT);
DROP FUNCTION IF EXISTS stop_tracking_product(UUID);
DROP FUNCTION IF EXISTS request_withdrawal(INTEGER, TEXT);
DROP FUNCTION IF EXISTS get_withdrawal_history();
DROP FUNCTION IF EXISTS get_finance_history();
DROP FUNCTION IF EXISTS get_product_price_history(UUID);
DROP FUNCTION IF EXISTS update_product_price(UUID, NUMERIC, TIMESTAMP WITH TIME ZONE, TEXT);
DROP FUNCTION IF EXISTS add_products_to_tracking(UUID[], BIGINT, BIGINT, BIGINT);

-- Drop admin panel functions if they exist
DROP FUNCTION IF EXISTS get_admin_dashboard_stats();
DROP FUNCTION IF EXISTS get_volunteers();
DROP FUNCTION IF EXISTS get_all_products_admin(TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS toggle_product_status(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS get_pending_withdrawals();
DROP FUNCTION IF EXISTS process_withdrawal(UUID, TEXT);
DROP FUNCTION IF EXISTS get_all_categories_admin();
DROP FUNCTION IF EXISTS create_category(TEXT);
DROP FUNCTION IF EXISTS get_all_establishments_admin();

-- Drop automation functions if they exist
DROP FUNCTION IF EXISTS recalculate_daily_cpi();
DROP FUNCTION IF EXISTS get_volunteers_needing_reminders();
