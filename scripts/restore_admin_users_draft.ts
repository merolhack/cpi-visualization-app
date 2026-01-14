
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

// Load env vars from .env.local if needed, or assume standard local defaults
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required. Please check .env or provide it.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const adminUsersPath = path.join(__dirname, '../supabase/admin_users.json');

async function restoreUsers() {
  try {
    const rawData = fs.readFileSync(adminUsersPath, 'utf8');
    const users = JSON.parse(rawData);

    console.log(`Found ${users.length} users to restore/verify.`);

    for (const user of users) {
      console.log(`Processing user: ${user.email} (${user.id})`);

      // 1. Check if user exists in Auth
      const { data: existingUser, error: findError } = await supabase.auth.admin.getUserById(user.id);

      if (findError || !existingUser.user) {
        // User doesn't exist, create it
        console.log(`Creating auth user...`);
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          uid: user.id, // Supabase Admin API uses 'uid' or just 'id'? usually createUser takes object.
          // Note: supabase-js v2 createUser params: email, password, etc. ID is obscure but often supported in admin.
          // Actually, createUser({ email, password, email_confirm: true, user_metadata: { ... } })
          // To force ID, we might need direct SQL or check if library supports it. 
          // v2 library: attributes object.
          email: user.email,
          password: 'password123', // Default password for local testing
          email_confirm: true,
          user_metadata: { role: user.role }
        });

        // Wait, createUser doesn't always allow setting ID. 
        // If it doesn't, we will get a random ID. We need to update cpi_users with the NEW ID if we can't force it.
        // But we want to preserve history if possible.
        // HOWEVER, for "test locally", preserving exact UUID isn't strictly required unless other tables reference it.
        // cpi_prices REFERENCES cpi_users (matches).
        // cpi_users REFERENCES auth.users.
        // So yes, we NEED the UUID to match because we just seeded cpi_prices with the OLD UUIDs!
        
        // If supabase-js doesn't support setting UUID, we must do it via SQL.
        // "INSERT INTO auth.users (id, email...) VALUES ..."
        // Since we are running against local, we can just run SQL via postgres connection.
        // But doing it via script is cleaner if possible.
        // Actually, supabase-js admin create user usually doesn't allow setting ID.
        // So I will likely generate a SQL file to insert them directly into auth.users.
        // That is safer for preserving IDs.
        
      } else {
        console.log('User already exists in Auth.');
      }
    }
  } catch (err) {
    console.error('Error reading users file:', err);
  }
}

// Since JS client limitation, let's just generate a SQL file 'restore_auth.sql' and print instructions or run it.
// This is better.
