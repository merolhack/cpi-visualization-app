# User Flow & Database Integration Summary

This document outlines the core user flows of the CPI Visualization Application and their interaction with the Supabase database. It is intended to guide the integration of an external Web Scraping application.

## 1. Authentication Flow

The application uses **Supabase Auth** for user management.

*   **Login**: Users log in via email/password.
    *   **Page**: `/auth/login`
    *   **Supabase**: `supabase.auth.signInWithPassword({ email, password })`
    *   **Data**: Authenticated user session is established.
*   **Registration**: New users sign up.
    *   **Page**: `/auth/register`
    *   **Supabase**: `supabase.auth.signUp()`
    *   **Triggers**: A database trigger likely creates a corresponding record in `cpi_volunteers` (linked by `user_id`) upon successful signup.
*   **Volunteer Data**: User profile data is stored in the `cpi_volunteers` table.
    *   **Query**: `SELECT * FROM cpi_volunteers WHERE user_id = auth.uid()`

## 2. Dashboard & Volunteer Status

Upon logging in, volunteers are directed to the dashboard to view their performance and pending tasks.

*   **Page**: `/dashboard`
*   **Key Data Fetched**:
    *   **Stats**: Calls RPC `get_volunteer_dashboard_stats` to retrieve:
        *   `current_points`: Total points earned.
        *   `pending_updates_count`: Number of products needing price updates (>30 days).
    *   **Pending Updates**: Calls RPC `get_products_needing_update_by_volunteer` to list specific products.
        *   Returns: `product_name`, `establishment_name`, `location_name`, `days_since_update`.

## 3. Adding a Product (Primary Data Entry)

This is the main flow for inputting new price data.

*   **Page**: `/add-product`
*   **Component**: `AddProductForm`
*   **Process**:
    1.  **Load Metadata**: Fetches dropdown options from:
        *   `cpi_countries`
        *   `cpi_categories`
        *   `cpi_locations` (filtered by country)
        *   `cpi_establishments` (filtered by country)
    2.  **Image Upload** (Optional but common):
        *   Validates image via Edge Function: `validate-image`.
        *   Uploads to Supabase Storage.
    3.  **Submission**:
        *   **RPC Call**: `add_product_and_price` is the critical function.
        *   **Parameters**:
            *   `p_product_name`: Text name of the product.
            *   `p_ean_code`: Barcode (optional).
            *   `p_country_id`, `p_category_id`, `p_establishment_id`, `p_location_id`: Foreign keys.
            *   `p_price_value`: Numeric price.
            *   `p_price_date`: Date of observation.
    4.  **Post-Processing**:
        *   If an image was uploaded, the `cpi_products` table is updated with `product_photo_url`.

## 4. Product Details & History

Viewing the historical data for a specific product.

*   **Page**: `/product/[id]`
*   **Data Fetching**:
    *   **Product Info**: Fetches from `cpi_products` (joins with `cpi_categories`, `cpi_countries`).
    *   **Price History**: Fetches from `cpi_prices`.
        *   **Filters**: `product_id = [id]`, `is_valid = true`.
        *   **Order**: `date` descending.
        *   **Joins**: `cpi_locations`, `cpi_establishments`.
*   **Visualization**:
    *   Generates a price evolution chart based on `cpi_prices` data.
    *   Calculates "Average Current Price" and "Total Records".

## Database Schema Highlights for Scraper Integration

When scraping or inserting data externally, ensure you interact with these key tables/functions:

### Core Tables
*   **`cpi_products`**: Stores static product definitions (Name, EAN, Category).
    *   *Key*: `product_id`
*   **`cpi_prices`**: Stores the time-series price data.
    *   *Key*: `price_id`
    *   *Foreign Keys*: `product_id`, `location_id`, `establishment_id`, `user_id`.
*   **`cpi_establishments`**: Stores store names (e.g., "Walmart", "Soriana").
*   **`cpi_locations`**: Stores geographical locations/cities.

### Critical RPC Functions
*   **`add_product_and_price`**: Use this stored procedure for inserting data. It handles the transactional logic of creating a product (if new) and inserting the price record simultaneously, ensuring data integrity.
