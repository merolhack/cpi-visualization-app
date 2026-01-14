-- Add RLS policies for public read access to reference tables used by dropdowns
-- This is required for the Add Product form to load Country, Category, Establishment, Location options

-- cpi_countries
DROP POLICY IF EXISTS "Allow public read access to cpi_countries" ON public.cpi_countries;
CREATE POLICY "Allow public read access to cpi_countries"
ON public.cpi_countries
FOR SELECT
USING (true);

-- cpi_categories
DROP POLICY IF EXISTS "Allow public read access to cpi_categories" ON public.cpi_categories;
CREATE POLICY "Allow public read access to cpi_categories"
ON public.cpi_categories
FOR SELECT
USING (true);

-- cpi_establishments
DROP POLICY IF EXISTS "Allow public read access to cpi_establishments" ON public.cpi_establishments;
CREATE POLICY "Allow public read access to cpi_establishments"
ON public.cpi_establishments
FOR SELECT
USING (true);

-- cpi_locations (already has policy but adding for completeness)
DROP POLICY IF EXISTS "Allow public read access to cpi_locations" ON public.cpi_locations;
CREATE POLICY "Allow public read access to cpi_locations"
ON public.cpi_locations
FOR SELECT
USING (true);
