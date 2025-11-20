# Unused Database Indexes

This document lists all indexes reported as unused by the Supabase database linter. These indexes have not been used according to PostgreSQL's statistics, but **should NOT be removed immediately** without thorough production usage analysis.

## ⚠️ Important Notes

- **Do not remove these indexes without careful analysis** - The linter reports indexes as "unused" based on `pg_stat_user_indexes`, which only tracks index usage since the last statistics reset
- **Production usage may differ** - Indexes may be used in production workloads that haven't occurred during the monitoring period
- **Query patterns matter** - Some indexes may be critical for specific query patterns that occur infrequently
- **Recommendation**: Monitor these indexes in production for at least 30 days before considering removal

## Unused Indexes by Table

### cpi_prices (9 indexes)

| Index Name | Column(s) | Recommendation |
|------------|-----------|----------------|
| `idx_cpi_prices_product_id` | product_id | **Keep** - Foreign key, likely used in joins |
| `idx_cpi_prices_establishment_id` | establishment_id | **Keep** - Foreign key, likely used in joins |
| `idx_cpi_prices_date` | date | **Keep** - Temporal queries are common |
| `idx_cpi_prices_location_id` | location_id | **Keep** - Foreign key, likely used in joins |
| `idx_cpi_prices_prod_est` | product_id, establishment_id | **Review** - Composite index, may overlap with single-column indexes |
| `idx_prices_product_date` | product_id, date | **Review** - Composite index for time-series queries |
| `idx_prices_user` | user_id | **Review** - User-scoped queries |

### cpi_tracking (4 indexes)

| Index Name | Column(s) | Recommendation |
|------------|-----------|----------------|
| `idx_tracking_establishment` | establishment_id | **Keep** - Foreign key, likely used in joins |
| `idx_cpi_tracking_location_id` | location_id | **Keep** - Foreign key, likely used in joins |
| `idx_tracking_country` | country_id | **Keep** - Foreign key, likely used in joins |
| `idx_tracking_product_fk` | product_id | **Keep** - Foreign key, likely used in joins |

### cpi_products (2 indexes)

| Index Name | Column(s) | Recommendation |
|------------|-----------|----------------|
| `idx_products_country_active` | country_id, is_active_product | **Keep** - Common filter pattern |

### cpi_withdrawals (2 indexes)

| Index Name | Column(s) | Recommendation |
|------------|-----------|----------------|
| `idx_cpi_withdrawals_user_id` | user_id | **Keep** - User-scoped queries with RLS |
| `idx_withdrawals_finance` | finance_id | **Keep** - Foreign key, likely used in joins |

### cpi_annual_product_location_establishment_inflation (5 indexes)

| Index Name | Column(s) | Recommendation |
|------------|-----------|----------------|
| `idx_aple_recent_price` | recent_price_id | **Review** - May be redundant |
| `idx_aple_establishment` | establishment_id | **Keep** - Foreign key, likely used in joins |
| `idx_aple_location` | location_id | **Keep** - Foreign key, likely used in joins |
| `idx_aple_country` | country_id | **Keep** - Foreign key, likely used in joins |
| `idx_aple_product` | product_id | **Keep** - Foreign key, likely used in joins |

### cpi_categories (1 index)

| Index Name | Column(s) | Recommendation |
|------------|-----------|----------------|
| `idx_categories_branch` | branch_id | **Keep** - Foreign key, likely used in joins |

### cpi_establishment_categories (2 indexes)

| Index Name | Column(s) | Recommendation |
|------------|-----------|----------------|
| `idx_est_cat_category` | category_id | **Keep** - Foreign key, likely used in joins |
| `idx_est_cat_establishment` | establishment_id | **Keep** - Foreign key, likely used in joins |

### cpi_establishments (1 index)

| Index Name | Column(s) | Recommendation |
|------------|-----------|----------------|
| `idx_establishments_country` | country_id | **Keep** - Foreign key, likely used in joins |

### cpi_locations (1 index)

| Index Name | Column(s) | Recommendation |
|------------|-----------|----------------|
| `idx_locations_country` | country_id | **Keep** - Foreign key, likely used in joins |

### cpi_category_inflation (2 indexes)

| Index Name | Column(s) | Recommendation |
|------------|-----------|----------------|
| `idx_cat_inf_category` | category_id | **Keep** - Foreign key, likely used in joins |
| `idx_cat_inf_country` | country_id | **Keep** - Foreign key, likely used in joins |

### cpi_category_location_inflation (3 indexes)

| Index Name | Column(s) | Recommendation |
|------------|-----------|----------------|
| `idx_cat_loc_inf_cat` | category_id | **Keep** - Foreign key, likely used in joins |
| `idx_cat_loc_inf_country` | country_id | **Keep** - Foreign key, likely used in joins |
| `idx_cat_loc_inf_loc` | location_id | **Keep** - Foreign key, likely used in joins |

### cpi_real_cpi (2 indexes)

| Index Name | Column(s) | Recommendation |
|------------|-----------|----------------|
| `idx_real_cpi_country` | country_id | **Keep** - Foreign key, likely used in joins |
| `idx_real_cpi_criterion` | criterion_id | **Keep** - Foreign key, likely used in joins |

### cpi_finances (1 index)

| Index Name | Column(s) | Recommendation |
|------------|-----------|----------------|
| `idx_finances_user` | user_id | **Keep** - User-scoped queries |

### cpi_volunteers (1 index)

| Index Name | Column(s) | Recommendation |
|------------|-----------|----------------|
| `idx_volunteers_country` | country_id | **Keep** - Foreign key, likely used in joins |

### cpi_weights (2 indexes)

| Index Name | Column(s) | Recommendation |
|------------|-----------|----------------|
| `idx_weights_category` | category_id | **Keep** - Foreign key, likely used in joins |
| `idx_weights_criterion` | criterion_id | **Keep** - Foreign key, likely used in joins |

## Summary

- **Total unused indexes**: 35+
- **Recommended to keep**: Most indexes (30+) - These are on foreign keys or common filter columns
- **Recommended for review**: 5-7 indexes - Composite indexes that may overlap or be redundant

## Next Steps

1. **Monitor in production** for at least 30 days
2. **Use `pg_stat_user_indexes`** to track actual index usage:
   ```sql
   SELECT 
     schemaname,
     tablename,
     indexname,
     idx_scan,
     idx_tup_read,
     idx_tup_fetch
   FROM pg_stat_user_indexes
   WHERE schemaname = 'public'
   ORDER BY idx_scan ASC;
   ```
3. **Analyze query patterns** using `EXPLAIN ANALYZE` on critical queries
4. **Consider removing only after confirmation** that indexes are truly unused in production

## References

- [Supabase Database Linter - Unused Index](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index)
- [PostgreSQL Index Maintenance](https://www.postgresql.org/docs/current/indexes.html)
