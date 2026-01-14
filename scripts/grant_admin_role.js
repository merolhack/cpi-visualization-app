const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Usage: node scripts/grant_admin_role.js <email>
async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error('Usage: node scripts/grant_admin_role.js <email>');
        process.exit(1);
    }

    const statusPath = path.join(__dirname, '../supabase_status.json');
    let content;
    try {
        try {
            content = fs.readFileSync(statusPath, 'utf-16le');
        } catch {
            content = fs.readFileSync(statusPath, 'utf8');
        }
    } catch (e) {
        console.error('Status file not found.');
        process.exit(1);
    }

    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    const jsonStr = content.substring(start, end + 1);
    const status = JSON.parse(jsonStr);
    const API_URL = status.API_URL || 'http://127.0.0.1:54321';
    const SERVICE_ROLE_KEY = status.SERVICE_ROLE_KEY;

    if (!SERVICE_ROLE_KEY) {
        console.error('No SERVICE_ROLE_KEY found');
        process.exit(1);
    }

    const supabase = createClient(API_URL, SERVICE_ROLE_KEY);

    console.log(`Granting admin role to ${email}...`);

    // Get user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        process.exit(1);
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error(`User ${email} not found`);
        process.exit(1);
    }

    // Update auth metadata
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        app_metadata: { claims_admin: true }
    });

    if (updateError) {
        console.error('Update Auth Error:', updateError);
        process.exit(1);
    }

    console.log('Auth metadata updated.');

    // Update public table role
    const { error: publicError } = await supabase
        .from('cpi_users')
        .update({ role: 'admin' })
        .eq('user_id', user.id);

    if (publicError) {
        console.error('Public table update error:', publicError);
    } else {
        console.log('Public role updated.');
    }

    console.log(`✅ Successfully granted admin role to ${email}`);
}

main();
