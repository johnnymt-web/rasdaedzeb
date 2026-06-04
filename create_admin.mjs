import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://sxhzxlfxfveidjrepvwe.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4aHp4bGZ4ZnZlaWRqcmVwdndlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgwMDM1MSwiZXhwIjoyMDkxMzc2MzUxfQ.HLTEc-JT3U6IDN2S_2_sKTFfi2jRcNgEaHgzG0MgsFI";

// Use service role key to bypass RLS
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createAdminUser() {
  console.log("Creating admin user...");

  // Step 1: Create the user via Supabase Admin API
  const { data: userData, error: createError } = await supabase.auth.admin.createUser({
    email: "johnny.mt@gmail.com",
    password: "Betterlife2026$",
    email_confirm: true, // auto-confirm email
    user_metadata: {
      full_name: "Johnny Admin",
      role: "student" // will be overridden below
    }
  });

  if (createError) {
    console.error("Failed to create user:", createError.message);
    process.exit(1);
  }

  const userId = userData.user.id;
  console.log("✅ User created with ID:", userId);

  // Step 2: Update user_roles to admin (overriding the default student role)
  const { error: roleError } = await supabase
    .from('user_roles')
    .update({ role: 'admin' })
    .eq('user_id', userId);

  if (roleError) {
    console.error("Failed to assign admin role:", roleError.message);
    process.exit(1);
  }

  console.log("✅ Admin role assigned successfully!");

  // Step 3: Update profile with a proper name
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: 'Johnny Admin' })
    .eq('id', userId);

  if (profileError) {
    console.error("Failed to update profile:", profileError.message);
  } else {
    console.log("✅ Profile updated!");
  }

  console.log("\n🎉 Admin account is ready!");
  console.log("   Email:    johnny.mt@gmail.com");
  console.log("   Password: Betterlife2026$");
  console.log("   Role:     admin");
}

createAdminUser();
