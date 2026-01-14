CREATE OR REPLACE FUNCTION "public"."get_all_categories_admin"() RETURNS TABLE("id" bigint, "name" "text", "product_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.category_id as id,
    c.category_name as name, -- Correct column is category_name
    COUNT(p.product_id) as product_count
  FROM cpi_categories c
  LEFT JOIN cpi_products p ON c.category_id = p.category_id
  GROUP BY c.category_id, c.category_name
  ORDER BY c.category_name;
END;
$$;
ALTER FUNCTION "public"."get_all_categories_admin"() OWNER TO "postgres";
