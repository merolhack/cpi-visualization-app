// Script to diagnose products page issue on production
// Usage: node scripts/test_products_rpc.js

const { createClient } = require('@supabase/supabase-js');

async function main() {
    // Production credentials - you'll need to set these as environment variables
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_PRODUCTION_URL';
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_KEY';

    console.log('Testing against:', SUPABASE_URL);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    console.log('\n1. Checking if products exist in database...');
    const { data: productsCount, error: countError } = await supabase
        .from('cpi_products')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error counting products:', countError);
    } else {
        console.log(`Found ${productsCount} products in cpi_products table`);
    }

    console.log('\n2. Testing get_all_products_admin RPC...');
    const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_all_products_admin');

    if (rpcError) {
        console.error('RPC Error:', rpcError);
        console.log('\nThe RPC might not exist or there might be a permissions issue.');
        console.log('Try running this SQL in Supabase dashboard:');
        console.log(`
-- Check if function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'get_all_products_admin';

-- If it doesn't exist, create it:
-- (Copy from supabase/migrations/20260116000000_ensure_admin_rpcs.sql)
    `);
    } else {
        console.log('✅ RPC executed successfully');
        console.log(`Returned ${rpcData?.length || 0} products`);
        if (rpcData && rpcData.length > 0) {
            console.log('\nSample product:', JSON.stringify(rpcData[0], null, 2));
        }
    }

    console.log('\n3. Checking RPC permissions...');
    const { data: permissions, error: permError } = await supabase
        .from('pg_proc')
        .select('*')
        .eq('proname', 'get_all_products_admin');

    if (permError) {
        console.log('Could not check permissions (this is normal if using non-admin key)');
    }

    console.log('\n4. Testing with authenticated role (simulating frontend call)...');
    // Create a client with just the anon key
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data: anonData, error: anonError } = await anonClient
        .rpc('get_all_products_admin');

    if (anonError) {
        console.error('Error with anon key:', anonError);
        console.log('\n⚠️ The RPC might not have proper permissions for authenticated users.');
        console.log('Run this SQL to fix:');
        console.log('GRANT EXECUTE ON FUNCTION public.get_all_products_admin() TO authenticated;');
    } else {
        console.log('✅ RPC works with anon key');
        console.log(`Returned ${anonData?.length || 0} products`);
    }
}

main().catch(console.error);
