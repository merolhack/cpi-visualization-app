const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production.local' });

// Usage: node scripts/grant_production_admin.js <email>
async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error('Usage: node scripts/grant_production_admin.js <email>');
        process.exit(1);
    }

    // Get from production environment variables
    const PROD_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!PROD_URL || !SERVICE_KEY) {
        console.error('Missing production credentials in .env.production.local');
        console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
        process.exit(1);
    }

    const supabase = createClient(PROD_URL, SERVICE_KEY);

    console.log(`🔍 Granting admin role to ${email} in PRODUCTION...`);
    console.log(`📡 Using Supabase URL: ${PROD_URL}`);

    // Get user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('❌ Error listing users:', listError);
        process.exit(1);
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error(`❌ User ${email} not found`);
        process.exit(1);
    }

    console.log(`✅ User found: ${user.id}`);

    // Update auth metadata
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        app_metadata: { claims_admin: true }
    });

    if (updateError) {
        console.error('❌ Update Auth Error:', updateError);
        process.exit(1);
    }

    console.log('✅ Auth metadata updated (claims_admin: true)');

    // Update public table role
    const { error: publicError } = await supabase
        .from('cpi_users')
        .update({ role: 'admin' })
        .eq('user_id', user.id);

    if (publicError) {
        console.error('❌ Public table update error:', publicError);
    } else {
        console.log('✅ Public role updated to "admin"');
    }

    console.log(`\n🎉 Successfully granted admin role to ${email}`);
    console.log('\n⚠️  IMPORTANT: User must LOG OUT and LOG BACK IN for changes to take effect!');
}

main();
