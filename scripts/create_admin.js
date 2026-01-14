const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function main() {
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

    const uuid = '43ee42d3-ee55-4046-8902-a192a5a8ab1a';
    const email = 'monteromarco@yahoo.com';
    const password = 'password123';

    console.log(`Processing user ${email}...`);

    // 1. Create or Update Auth User
    const { data, error } = await supabase.auth.admin.createUser({
        id: uuid,
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { name: 'Marco Montero' },
        app_metadata: { claims_admin: true }
    });

    if (error) {
        if (error.status === 422 || error.message.includes('already has been registered')) {
            console.log('User exists. Updating password and metadata...');
            const { error: updateError } = await supabase.auth.admin.updateUserById(uuid, {
                password: password,
                app_metadata: { claims_admin: true }
            });
            if (updateError) console.error('Update Auth Error:', updateError);
            else console.log('Auth updated.');
        } else {
            console.error('Create Error:', error);
        }
    } else {
        console.log('Create Success:', data.user.id);
    }

    // 2. Update Public Table Role
    console.log('Updating public.cpi_users role...');
    const { error: publicError } = await supabase
        .from('cpi_users')
        .update({ role: 'admin' })
        .eq('user_id', uuid); // Assuming PK is user_id or column is user_id

    // Wait, schema might use 'id' or 'user_id'. 
    // Based on error "cpi_users_pkey", PK is likely 'user_id' or just 'id'.
    // My previous migration used `UPDATE public.cpi_users SET role = 'admin'`.
    // It didn't specify column.
    // I will try updating by email if possible? No, email might not be unique in cpi_users?
    // I'll try `eq('email', email)` AND `eq('user_id', uuid)` variants.

    // Checking schema from finding: found 'user_id' in cpi_volunteers referencing it.
    // Assuming cpi_users has 'id' or 'user_id'.
    // I'll update using 'id' (as UUID) first.

    const { error: publicError1 } = await supabase
        .from('cpi_users')
        .update({ role: 'admin' })
        .eq('user_id', uuid);

    if (publicError1) {
        console.log('Update by user_id failed, trying by id...', publicError1.message);
        const { error: publicError2 } = await supabase
            .from('cpi_users')
            .update({ role: 'admin' })
            .eq('id', uuid);

        if (publicError2) console.error('Update public.cpi_users failed:', publicError2);
        else console.log('Public role updated (by id).');
    } else {
        console.log('Public role updated (by user_id).');
    }
}

main();
