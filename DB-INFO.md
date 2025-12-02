| routine_name                             | routine_type | return_type | routine_definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------------------- | ------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| add_product_and_price                    | FUNCTION     | bigint      | 
DECLARE
    v_product_id BIGINT;
BEGIN
    -- Paso 1: Intentar encontrar el producto por su código EAN
    SELECT product_id INTO v_product_id
    FROM public.cpi_products
    WHERE ean_code = p_ean_code
    LIMIT 1;

    -- Paso 2: Si el producto no existe, crearlo
    IF v_product_id IS NULL THEN
        INSERT INTO public.cpi_products (country_id, category_id, product_name, ean_code, is_active_product)
        VALUES (p_country_id, p_category_id, p_product_name, p_ean_code, TRUE)
        RETURNING product_id INTO v_product_id;
    END IF;

    -- Paso 3: Insertar el precio usando el ID del producto (existente o nuevo)
    INSERT INTO public.cpi_prices (product_id, establishment_id, location_id, user_id, price_value, date, is_valid)
    VALUES (
        v_product_id,
        p_establishment_id,
        p_location_id,
        auth.uid(), -- Obtiene el UUID del usuario autenticado que realiza la llamada
        p_price_value,
        p_price_date,
        TRUE
    );

    -- Devolver el ID del precio recién insertado
    RETURN (SELECT currval(pg_get_serial_sequence('cpi_prices', 'price_id')));
END;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| add_products_to_tracking                 | FUNCTION     | void        | 
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| create_category                          | FUNCTION     | bigint      | 
DECLARE
  v_id BIGINT;
BEGIN
  INSERT INTO cpi_categories (name)
  VALUES (p_name)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| deactivate_product_tracking              | FUNCTION     | json        | 
DECLARE
  v_user_id UUID;
  v_result JSON;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Actualizar el tracking
  UPDATE public.cpi_tracking
  SET is_active_tracking = FALSE
  WHERE tracking_id = p_tracking_id
    AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tracking no encontrado';
  END IF;

  v_result := json_build_object(
    'success', true,
    'message', 'El producto ha sido removido de tu lista de seguimiento'
  );

  RETURN v_result;
END;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| get_admin_dashboard_stats                | FUNCTION     | record      | 
BEGIN
  RETURN QUERY SELECT
    (SELECT COUNT(DISTINCT user_id) FROM cpi_tracking),
    (SELECT COUNT(*) FROM cpi_products),
    (SELECT COUNT(*) FROM cpi_prices),
    (SELECT COUNT(*) FROM cpi_withdrawals WHERE sent_date IS NULL); -- Pending = not sent yet
END;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| get_all_categories_admin                 | FUNCTION     | record      | 
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| get_all_establishments_admin             | FUNCTION     | record      | 
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| get_all_products_admin                   | FUNCTION     | record      | 
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| get_available_products_for_tracking      | FUNCTION     | record      | 
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| get_available_products_for_tracking      | FUNCTION     | record      | 
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  RETURN QUERY
  SELECT 
    p.product_id,
    p.product_name,
    c.category_name,
    b.branch_name,
    p.product_photo_url,
    EXISTS (
      SELECT 1 
      FROM public.cpi_tracking t
      WHERE t.product_id = p.product_id
        AND t.location_id = p_location_id
        AND t.establishment_id = p_establishment_id
        AND t.user_id = v_user_id
        AND t.is_active_tracking = TRUE
    ) as already_tracking
  FROM public.cpi_products p
  INNER JOIN public.cpi_categories c ON p.category_id = c.category_id
  INNER JOIN public.cpi_branches b ON c.branch_id = b.branch_id
  WHERE p.country_id = p_country_id
    AND p.is_active_product = TRUE
    -- Excluir productos actualizados recientemente en esta combinación
    AND NOT EXISTS (
      SELECT 1
      FROM public.cpi_prices pr
      WHERE pr.product_id = p.product_id
        AND pr.location_id = p_location_id
        AND pr.establishment_id = p_establishment_id
        AND pr.date > CURRENT_DATE - INTERVAL '60 days'
    )
  ORDER BY b.branch_name, c.category_name, p.product_name;
END;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| get_finance_history                      | FUNCTION     | record      | 
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| get_latest_prices_by_country             | FUNCTION     | record      | 
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (p.product_id, e.establishment_id)
        p.product_name,
        c.category_name,
        e.establishment_name,
        pr.price_value
    FROM
        public.cpi_prices pr
    JOIN
        public.cpi_products p ON pr.product_id = p.product_id
    JOIN
        public.cpi_establishments e ON pr.establishment_id = e.establishment_id
    JOIN
        public.cpi_categories c ON p.category_id = c.category_id
    WHERE
        p.country_id = p_country_id
        AND p.is_active_product = TRUE
    ORDER BY
        p.product_id, e.establishment_id, pr.date DESC;
END;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| get_pending_withdrawals                  | FUNCTION     | record      | 
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| get_product_price_history                | FUNCTION     | record      | 
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| get_products_needing_update              | FUNCTION     | record      | 
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  RETURN QUERY
  SELECT 
    t.tracking_id,
    p.product_name,
    l.location_name,
    e.establishment_name,
    COALESCE(MAX(pr.date), '1900-01-01'::DATE) as last_update_date,
    CURRENT_DATE - COALESCE(MAX(pr.date), '1900-01-01'::DATE) as days_since_update
  FROM public.cpi_tracking t
  INNER JOIN public.cpi_products p ON t.product_id = p.product_id
  INNER JOIN public.cpi_locations l ON t.location_id = l.location_id
  INNER JOIN public.cpi_establishments e ON t.establishment_id = e.establishment_id
  LEFT JOIN public.cpi_prices pr ON 
    pr.product_id = t.product_id 
    AND pr.location_id = t.location_id
    AND pr.establishment_id = t.establishment_id
    AND pr.user_id = v_user_id
  WHERE t.user_id = v_user_id
    AND t.is_active_tracking = TRUE
  GROUP BY t.tracking_id, p.product_name, l.location_name, e.establishment_name
  HAVING CURRENT_DATE - COALESCE(MAX(pr.date), '1900-01-01'::DATE) > 30
  ORDER BY days_since_update DESC;
END;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| get_products_needing_update_by_volunteer | FUNCTION     | record      | 
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| get_products_with_significant_changes    | FUNCTION     | record      | 
BEGIN
    RETURN QUERY
    WITH LatestPrices AS (
        SELECT 
            p.product_id,
            p.price_value,
            p.date,
            p.establishment_id,
            p.location_id,
            ROW_NUMBER() OVER (PARTITION BY p.product_id ORDER BY p.date DESC) as rn
        FROM 
            cpi_prices p
        WHERE 
            p.is_valid = true
    ),
    PriceComparison AS (
        SELECT 
            curr.product_id,
            curr.price_value as current_price,
            prev.price_value as previous_price,
            curr.date as last_update_date,
            curr.establishment_id,
            curr.location_id,
            ((curr.price_value - prev.price_value) / prev.price_value) * 100 as change_percentage
        FROM 
            LatestPrices curr
        JOIN 
            LatestPrices prev ON curr.product_id = prev.product_id AND prev.rn = 2
        WHERE 
            curr.rn = 1
    )
    SELECT 
        prod.product_id,
        prod.product_name,
        prod.product_photo_url,
        pc.current_price,
        pc.previous_price,
        pc.change_percentage as price_change_percentage,
        pc.last_update_date::TIMESTAMP WITH TIME ZONE,
        est.establishment_name,
        loc.location_name
    FROM 
        PriceComparison pc
    JOIN 
        cpi_products prod ON pc.product_id = prod.product_id
    JOIN 
        cpi_establishments est ON pc.establishment_id = est.establishment_id
    JOIN 
        cpi_locations loc ON pc.location_id = loc.location_id
    WHERE 
        ABS(pc.change_percentage) > 5 -- Mostrar solo cambios mayores al 5% (positivo o negativo)
    ORDER BY 
        ABS(pc.change_percentage) DESC
    LIMIT 10;
END;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| get_volunteer_dashboard                  | FUNCTION     | json        | 
DECLARE
  v_user_id UUID;
  v_volunteer_name TEXT;
  v_current_balance NUMERIC;
  v_products_needing_update INTEGER;
  v_result JSON;
BEGIN
  -- Obtener el user_id del usuario autenticado
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Obtener nombre del voluntario
  SELECT name INTO v_volunteer_name
  FROM public.cpi_volunteers
  WHERE user_id = v_user_id;

  -- Obtener saldo actual
  SELECT COALESCE(current_balance, 0) INTO v_current_balance
  FROM public.cpi_finances
  WHERE user_id = v_user_id
  ORDER BY date DESC
  LIMIT 1;

  -- Contar productos que necesitan actualización (>30 días)
  SELECT COUNT(*) INTO v_products_needing_update
  FROM public.cpi_tracking t
  WHERE t.user_id = v_user_id
    AND t.is_active_tracking = TRUE
    AND NOT EXISTS (
      SELECT 1
      FROM public.cpi_prices p
      WHERE p.product_id = t.product_id
        AND p.location_id = t.location_id
        AND p.establishment_id = t.establishment_id
        AND p.user_id = v_user_id
        AND p.date > CURRENT_DATE - INTERVAL '30 days'
    );

  -- Construir respuesta
  v_result := json_build_object(
    'name', v_volunteer_name,
    'current_balance', v_current_balance,
    'products_needing_update', v_products_needing_update
  );

  RETURN v_result;
END;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| get_volunteer_dashboard_stats            | FUNCTION     | record      | 
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| get_volunteer_finance_history            | FUNCTION     | record      | 
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  RETURN QUERY
  SELECT 
    f.finance_id,
    f.concept,
    f.date,
    f.amount,
    f.current_balance
  FROM public.cpi_finances f
  WHERE f.user_id = v_user_id
  ORDER BY f.date DESC
  LIMIT p_limit;
END;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| get_volunteers                           | FUNCTION     | record      | 
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| get_volunteers_needing_reminders         | FUNCTION     | record      | 
BEGIN
  RETURN QUERY
  SELECT 
    t.user_id,
    'user@example.com'::TEXT as email, -- Placeholder, would need auth.users access
    COUNT(DISTINCT t.product_id) as pending_products_count
  FROM cpi_tracking t
  LEFT JOIN (
    SELECT product_id, MAX(date) as last_price_date
    FROM cpi_prices
    GROUP BY product_id
  ) lp ON t.product_id = lp.product_id
  WHERE t.is_active = true
  AND (lp.last_price_date IS NULL OR lp.last_price_date < NOW() - INTERVAL '30 days')
  GROUP BY t.user_id
  HAVING COUNT(DISTINCT t.product_id) > 0;
END;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| get_withdrawal_history                   | FUNCTION     | record      | 
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| process_withdrawal                       | FUNCTION     | void        | 
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| recalculate_daily_cpi                    | FUNCTION     | void        | 
BEGIN
  -- This is a placeholder for the actual CPI calculation logic
  -- The real implementation would:
  -- 1. Get the latest prices for each product
  -- 2. Calculate weighted averages
  -- 3. Update the cpi_real_cpi table
  
  RAISE NOTICE 'CPI recalculation would run here';
  
  -- Example: Update a log table to track when this ran
  -- INSERT INTO cpi_system_logs (event_type, message, created_at)
  -- VALUES ('cpi_recalculation', 'Daily CPI recalculation completed', NOW());
END;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| register_volunteer                       | FUNCTION     | json        | 
DECLARE
  v_result JSON;
BEGIN
  -- Validación 1: Verificar si el email ya existe en cpi_volunteers
  IF EXISTS (SELECT 1 FROM public.cpi_volunteers WHERE email = p_email) THEN
    v_result := json_build_object(
      'success', false,
      'error_code', 'EMAIL_EXISTS',
      'message', 'Este correo electrónico ya está registrado'
    );
    RETURN v_result;
  END IF;

  -- Validación 2: Verificar si el user_id ya existe
  IF EXISTS (SELECT 1 FROM public.cpi_volunteers WHERE user_id = p_user_id) THEN
    v_result := json_build_object(
      'success', false,
      'error_code', 'USER_EXISTS',
      'message', 'Este usuario ya está registrado'
    );
    RETURN v_result;
  END IF;

  -- Validación 3: Verificar que el nombre no esté vacío
  IF LENGTH(TRIM(p_name)) < 2 THEN
    v_result := json_build_object(
      'success', false,
      'error_code', 'INVALID_NAME',
      'message', 'El nombre debe tener al menos 2 caracteres'
    );
    RETURN v_result;
  END IF;

  -- 1. Insertar en cpi_users
  INSERT INTO public.cpi_users (user_id, email)
  VALUES (p_user_id, p_email)
  ON CONFLICT (user_id) DO NOTHING;

  -- 2. Insertar en cpi_volunteers
  INSERT INTO public.cpi_volunteers (
    user_id, 
    email, 
    name, 
    country_id, 
    suspended
  )
  VALUES (
    p_user_id, 
    p_email, 
    p_name, 
    p_country_id, 
    FALSE
  );

  -- 3. Crear registro inicial de finanzas
  INSERT INTO public.cpi_finances (
    user_id, 
    concept, 
    previous_balance, 
    amount, 
    current_balance,
    date
  )
  VALUES (
    p_user_id, 
    'Saldo inicial', 
    0, 
    0, 
    0,
    NOW()
  );

  -- Respuesta exitosa
  v_result := json_build_object(
    'success', true,
    'user_id', p_user_id,
    'message', 'Registro completado exitosamente'
  );

  RETURN v_result;

EXCEPTION
  WHEN unique_violation THEN
    -- Manejo específico para violaciones de unicidad
    v_result := json_build_object(
      'success', false,
      'error_code', 'DUPLICATE_ENTRY',
      'message', 'Este correo electrónico ya está registrado'
    );
    RETURN v_result;
  WHEN OTHERS THEN
    -- Cualquier otro error
    v_result := json_build_object(
      'success', false,
      'error_code', 'SYSTEM_ERROR',
      'message', 'Ocurrió un error al procesar tu registro. Por favor intenta más tarde.'
    );
    RETURN v_result;
END;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| request_withdrawal                       | FUNCTION     | bigint      | 
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| request_withdrawal                       | FUNCTION     | json        | 
DECLARE
  v_user_id UUID;
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
  v_finance_id BIGINT;
  v_withdrawal_id BIGINT;
  v_result JSON;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Obtener saldo actual
  SELECT COALESCE(current_balance, 0) INTO v_current_balance
  FROM public.cpi_finances
  WHERE user_id = v_user_id
  ORDER BY date DESC
  LIMIT 1;

  -- Validar que tenga suficiente saldo
  IF p_amount > v_current_balance THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Saldo insuficiente',
      'message', 'Solo puedes solicitar el retiro de ' || v_current_balance || ' puntos como máximo'
    );
  END IF;

  -- Validar cantidad mínima
  IF p_amount < 1 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cantidad inválida',
      'message', 'La cantidad mínima de retiro es 1 punto'
    );
  END IF;

  v_new_balance := v_current_balance - p_amount;

  -- Registrar movimiento financiero
  INSERT INTO public.cpi_finances (
    user_id,
    concept,
    date,
    previous_balance,
    amount,
    current_balance
  ) VALUES (
    v_user_id,
    'Retiro a Polygon ' || p_polygon_address,
    NOW(),
    v_current_balance,
    -p_amount,
    v_new_balance
  ) RETURNING finance_id INTO v_finance_id;

  -- Registrar solicitud de retiro
  INSERT INTO public.cpi_withdrawals (
    user_id,
    amount,
    concept,
    request_date,
    finance_id
  ) VALUES (
    v_user_id,
    p_amount,
    'Retiro a Polygon ' || p_polygon_address,
    NOW(),
    v_finance_id
  ) RETURNING withdrawal_id INTO v_withdrawal_id;

  v_result := json_build_object(
    'success', true,
    'withdrawal_id', v_withdrawal_id,
    'new_balance', v_new_balance,
    'message', 'Tu solicitud de retiro está en proceso. Recibirás un correo cuando sea enviado. Este proceso es manual y puede tardar de 1 a 72 horas.'
  );

  RETURN v_result;
END;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| stop_tracking_product                    | FUNCTION     | void        | 
BEGIN
  UPDATE cpi_tracking
  SET is_active_tracking = false
  WHERE tracking_id = p_tracking_id AND user_id = auth.uid();
END;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| toggle_product_status                    | FUNCTION     | void        | 
BEGIN
  UPDATE cpi_products
  SET is_active_product = p_status
  WHERE product_id = p_product_id;
END;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| update_product_price                     | FUNCTION     | json        | 
DECLARE
  v_user_id UUID;
  v_product_id BIGINT;
  v_location_id BIGINT;
  v_establishment_id BIGINT;
  v_product_name TEXT;
  v_location_name TEXT;
  v_establishment_name TEXT;
  v_price_id BIGINT;
  v_previous_balance NUMERIC;
  v_new_balance NUMERIC;
  v_last_price_date DATE;
  v_points_to_add INTEGER;
  v_result JSON;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Obtener información del tracking
  SELECT 
    t.product_id, 
    t.location_id, 
    t.establishment_id,
    p.product_name,
    l.location_name,
    e.establishment_name
  INTO 
    v_product_id, 
    v_location_id, 
    v_establishment_id,
    v_product_name,
    v_location_name,
    v_establishment_name
  FROM public.cpi_tracking t
  INNER JOIN public.cpi_products p ON t.product_id = p.product_id
  INNER JOIN public.cpi_locations l ON t.location_id = l.location_id
  INNER JOIN public.cpi_establishments e ON t.establishment_id = e.establishment_id
  WHERE t.tracking_id = p_tracking_id
    AND t.user_id = v_user_id;

  IF v_product_id IS NULL THEN
    RAISE EXCEPTION 'Tracking no encontrado';
  END IF;

  -- Obtener fecha del último precio registrado
  SELECT MAX(date) INTO v_last_price_date
  FROM public.cpi_prices
  WHERE product_id = v_product_id
    AND location_id = v_location_id
    AND establishment_id = v_establishment_id
    AND user_id = v_user_id;

  -- Determinar puntos a agregar (solo si han pasado >30 días)
  IF v_last_price_date IS NULL OR (p_date - v_last_price_date) > 30 THEN
    v_points_to_add := 1;
  ELSE
    v_points_to_add := 0;
  END IF;

  -- Insertar precio
  INSERT INTO public.cpi_prices (
    product_id,
    location_id,
    establishment_id,
    user_id,
    price_value,
    date,
    price_photo_url,
    is_valid
  ) VALUES (
    v_product_id,
    v_location_id,
    v_establishment_id,
    v_user_id,
    p_price_value,
    p_date,
    p_photo_url,
    TRUE
  ) RETURNING price_id INTO v_price_id;

  -- Agregar puntos si corresponde
  IF v_points_to_add > 0 THEN
    -- Obtener saldo anterior
    SELECT COALESCE(current_balance, 0) INTO v_previous_balance
    FROM public.cpi_finances
    WHERE user_id = v_user_id
    ORDER BY date DESC
    LIMIT 1;

    v_new_balance := v_previous_balance + v_points_to_add;

    -- Insertar movimiento financiero
    INSERT INTO public.cpi_finances (
      user_id,
      concept,
      date,
      previous_balance,
      amount,
      current_balance
    ) VALUES (
      v_user_id,
      'Actualización precio ' || v_product_name || ' en ' || v_establishment_name || ', ' || v_location_name,
      NOW(),
      v_previous_balance,
      v_points_to_add,
      v_new_balance
    );
  ELSE
    v_new_balance := (
      SELECT COALESCE(current_balance, 0)
      FROM public.cpi_finances
      WHERE user_id = v_user_id
      ORDER BY date DESC
      LIMIT 1
    );
  END IF;

  -- Construir respuesta
  v_result := json_build_object(
    'success', true,
    'price_id', v_price_id,
    'points_added', v_points_to_add,
    'new_balance', v_new_balance,
    'message', CASE 
      WHEN v_points_to_add > 0 THEN 'Precio actualizado. Has ganado ' || v_points_to_add || ' punto.'
      ELSE 'Precio actualizado.'
    END
  );

  RETURN v_result;
END;
 |
| update_product_price                     | FUNCTION     | bigint      | 
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |