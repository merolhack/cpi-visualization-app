# Product Relationship Analysis

## The Challenge
The user wants to relate two products from different retailers that represent the same underlying item:
1.  **Walmart**: "Pollo entero sin cortar por kg peso aprox por pieza 2.1 kg"
2.  **Chedraui**: "Pollo Entero por kg"

## Current Schema Limitations
Currently, the database schema (`cpi_products`) defines a product by its **Name** and **EAN Code**.
*   Since the names differ ("Pollo entero..." vs "Pollo Entero..."), they are treated as **two distinct products**.
*   `cpi_categories` exists, but categories (e.g., "Carnes", "Aves") are typically too broad to imply "equivalence" for price comparison. Comparing the average price of the "Aves" category is useful for inflation trends, but not for comparing the specific price of a "Whole Chicken".

## Proposed Solution: Canonical Products

To enable precise comparison (e.g., "Show me the price of Whole Chicken at Walmart vs Chedraui"), we need a normalization layer.

### 1. New Entity: `cpi_canonical_products` (or `cpi_product_types`)
Create a table to represent the *concept* of the product, independent of retailer branding.

```sql
CREATE TABLE cpi_canonical_products (
  canonical_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  canonical_name TEXT NOT NULL, -- e.g., "Pollo Entero", "Leche 1L", "Huevo 12pz"
  category_id BIGINT REFERENCES cpi_categories(category_id),
  description TEXT
);
```

### 2. Link Existing Products
Add a foreign key to the `cpi_products` table.

```sql
ALTER TABLE cpi_products
ADD COLUMN canonical_id BIGINT REFERENCES cpi_canonical_products(canonical_id);
```

### 3. Workflow Updates
*   **Scraper/Input**: When adding a product, try to map it to a `canonical_id`.
    *   *Exact Match*: If EAN matches a known canonical product.
    *   *Fuzzy Match*: If name contains "Pollo Entero", suggest linking to Canonical ID for "Pollo Entero".
    *   *Manual*: Admin/Volunteer selects "This is a Whole Chicken" from a dropdown.

## Alternative: Keyword Matching (Less Robust)
If modifying the schema is not an option, the application can use text similarity (e.g., Trigrams, Levenshtein distance) or Full Text Search to find "related" products on the fly.
*   **Query**: `SELECT * FROM cpi_products WHERE product_name ILIKE '%Pollo Entero%'`
*   **Pros**: No schema change.
*   **Cons**: Inaccurate (might match "Pechuga de Pollo Entera"), requires complex query logic.

## Recommendation
Implement the **Canonical Product** entity. This provides a robust, database-level relationship that allows for:
1.  **Direct Comparison**: `SELECT * FROM cpi_prices WHERE product_id IN (SELECT product_id FROM cpi_products WHERE canonical_id = X)`
2.  **Aggregated Stats**: "Average price of Whole Chicken in Mexico City".
