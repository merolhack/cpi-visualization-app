-- Seed data for cpi_countries
INSERT INTO cpi_countries (country_id, country_name, currency_code)
VALUES (1, 'México', 'MXN')
ON CONFLICT (country_id) DO NOTHING;

-- Seed data for cpi_categories
INSERT INTO cpi_categories (category_id, category_name)
VALUES (1, 'Alimentos y Bebidas')
ON CONFLICT (category_id) DO NOTHING;

-- Seed data for cpi_establishments
INSERT INTO cpi_establishments (establishment_id, establishment_name, country_id)
VALUES (1, 'Walmart', 1)
ON CONFLICT (establishment_id) DO NOTHING;

-- Seed data for cpi_locations
INSERT INTO cpi_locations (location_id, location_name, country_id)
VALUES (1, 'Sucursal Centro', 1)
ON CONFLICT (location_id) DO NOTHING;
