# Manual Steps for Database Fixes

This guide provides step-by-step instructions for the manual configuration changes that must be performed via the Supabase Dashboard.

## Prerequisites

- Access to Supabase Dashboard
- Project admin/owner permissions

---

## Step 1: pg_net Extension Schema Warning

**Why**: The `pg_net` extension is currently installed in the `public` schema, which is flagged as a security concern by the linter.

### ⚠️ Important Note

The `pg_net` extension **does not support** the `ALTER EXTENSION ... SET SCHEMA` command. This is a known limitation of the extension.

**Error you may encounter:**
```
ERROR: 0A000: extension "pg_net" does not support SET SCHEMA
```

### Recommended Approach

Since `pg_net` cannot be moved to another schema, you have two options:

#### Option A: Accept the Warning (Recommended)
- **Keep `pg_net` in the `public` schema**
- This is the standard installation for Supabase projects
- The security risk is minimal as `pg_net` is a trusted Supabase extension
- **Action**: No action needed - this warning can be safely ignored

#### Option B: Reinstall in Different Schema (Advanced - Not Recommended)
This requires dropping and recreating the extension, which may break existing functionality:

```sql
-- WARNING: This will break any code using pg_net!
-- Only do this if you're sure nothing depends on it

-- 1. Create extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;

-- 2. Drop the extension (this will fail if there are dependencies)
DROP EXTENSION IF EXISTS pg_net CASCADE;

-- 3. Reinstall in the extensions schema
CREATE EXTENSION pg_net SCHEMA extensions;
```

**Risks of Option B:**
- Will break any RPC functions or triggers using `pg_net`
- Requires updating all code references from `public.pg_net` to `extensions.pg_net`
- May cause downtime if not carefully planned

   - Navigate to your project: https://supabase.com/dashboard/project/YOUR_PROJECT_ID

2. **Navigate to Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Click on "Settings" (or "Policies" depending on your dashboard version)

3. **Enable Password Protection**
   - Look for "Password Protection" or "Password Security" section
   - Find the option "Check for leaked passwords" or "Enable leaked password protection"
   - Toggle it **ON**

4. **Save changes**
   - Click "Save" or "Update" button

### Verification

Test with a known leaked password:

1. **Attempt to register a new user** with a common leaked password (e.g., "password123", "qwerty123")
2. **Expected result**: Registration should fail with an error message like:
   - "Password has been found in a data breach and cannot be used"
   - "This password is too common and has been compromised"

### Additional Configuration (Optional)

You may also want to configure:
- **Minimum password length**: Set to at least 8 characters
- **Password strength requirements**: Enable if available
- **Password complexity**: Require uppercase, lowercase, numbers, symbols

---

## Step 3: Apply Database Migrations

After completing the manual steps above, apply the automated migrations:

```bash
# Reset the local database to apply all migrations
npx supabase db reset

# Or push migrations to remote (production)
npx supabase db push
```

---

## Verification Checklist

After completing all steps, verify:

- [ ] `pg_net` extension is in `extensions` schema (not `public`)
- [ ] Leaked password protection is enabled
- [ ] RLS policies are active on `cpi_criteria`, `cpi_locations`, `cpi_withdrawals`
- [ ] Index exists on `cpi_products.category_id`
- [ ] All existing functionality still works

---

## Rollback Instructions

If you need to rollback these changes:

### Rollback Password Protection
- Simply toggle off the "Check for leaked passwords" setting in the dashboard

### Rollback Migrations
```bash
# Revert to a previous migration
npx supabase db reset --version <previous_migration_timestamp>
```

**Note**: The `pg_net` extension cannot be moved between schemas, so there is no rollback needed for that warning.

---

## Support

If you encounter any issues:
1. Check Supabase logs in the Dashboard
2. Review the [Supabase Database Linter documentation](https://supabase.com/docs/guides/database/database-linter)
3. Contact Supabase support if needed
