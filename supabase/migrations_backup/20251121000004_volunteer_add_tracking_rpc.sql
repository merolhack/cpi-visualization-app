-- RPC to add products to tracking
CREATE OR REPLACE FUNCTION add_products_to_tracking(
  p_product_ids UUID[],
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
  v_product_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  FOREACH v_product_id IN ARRAY p_product_ids
  LOOP
    -- Check if already tracking (active)
    IF NOT EXISTS (
      SELECT 1 FROM cpi_tracking 
      WHERE user_id = v_user_id 
      AND product_id = v_product_id 
      AND is_active = true
    ) THEN
      -- Insert tracking record
      INSERT INTO cpi_tracking (
        user_id, 
        product_id, 
        establishment_id, 
        location_id,
        is_active
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
