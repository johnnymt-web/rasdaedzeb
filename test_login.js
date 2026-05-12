import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function test() {
  console.log("Signing in...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'j.mtsariashvili@ug.edu.ge',
    password: 'Tbilisi2027$'
  });

  if (error) {
    console.error("Login failed:", error.message);
    return;
  }
  
  console.log("Logged in as:", data.user?.id);
  
  console.log("Fetching user roles...");
  const { data: roleData, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user?.id)
    .single();
    
  if (roleError) {
    console.error("Role fetch failed:", roleError.message);
  } else {
    console.log("Role data:", roleData);
  }
  
  console.log("Fetching profile...");
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, grade")
    .eq("id", data.user?.id)
    .single();
    
  if (profileError) {
    console.error("Profile fetch failed:", profileError.message);
  } else {
    console.log("Profile data:", profileData);
  }
}

test();
