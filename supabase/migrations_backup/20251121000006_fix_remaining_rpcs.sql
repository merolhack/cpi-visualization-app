-- Drop functions with return type conflicts before recreating
DROP FUNCTION IF EXISTS get_products_needing_update_by_volunteer();
DROP FUNCTION IF EXISTS get_available_products_for_tracking(BIGINT, BIGINT, TEXT);
DROP FUNCTION IF EXISTS get_product_price_history(UUID);
DROP FUNCTION IF EXISTS update_product_price(UUID, NUMERIC, TIMESTAMP WITH TIME ZONE, TEXT);
DROP FUNCTION IF EXISTS add_products_to_tracking(BIGINT[], BIGINT, BIGINT, BIGINT);
DROP FUNCTION IF EXISTS get_all_products_admin(TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS toggle_product_status(BIGINT, BOOLEAN);
