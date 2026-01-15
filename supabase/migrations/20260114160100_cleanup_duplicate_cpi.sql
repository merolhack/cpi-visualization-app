-- Fix: Clean up duplicate CPI data
DELETE FROM public.cpi_real_cpi a
USING public.cpi_real_cpi b
WHERE a.real_cpi_id < b.real_cpi_id
  AND a.country_id = b.country_id
  AND a.year = b.year
  AND a.month = b.month
  AND a.criterion_id = b.criterion_id;

-- Verify: Should show only one entry per month now
SELECT 
    year,
    month,
    ROUND(real_cpi_inflation_rate, 2) as inflation_rate,
    to_char(update_date, 'YYYY-MM-DD HH24:MI:SS') as calculated_at
FROM public.cpi_real_cpi
WHERE country_id = 1
ORDER BY year DESC, month DESC;
