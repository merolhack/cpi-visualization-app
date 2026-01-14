
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const adminUsersPath = path.join(__dirname, '../supabase/admin_users.json');

async function setPasswords() {
  try {
    const users = JSON.parse(fs.readFileSync(adminUsersPath, 'utf8'));
    console.log(`Setting passwords for ${users.length} users...`);

    for (const user of users) {
      console.log(`Updating password for ${user.email}...`);
      const { error } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: 'password123' }
      );

      if (error) {
        console.error(`Failed to update ${user.email}:`, error.message);
      } else {
        console.log(`Success: ${user.email} -> password123`);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

setPasswords();
