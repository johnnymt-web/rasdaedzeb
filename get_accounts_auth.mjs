import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envLocal = fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf8') : '';
const env = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';
const combinedEnv = envLocal + '\n' + env;

const urlMatch = combinedEnv.match(/VITE_SUPABASE_URL="?([^"\n]+)/);
const keyMatch = combinedEnv.match(/VITE_SUPABASE_PUBLISHABLE_KEY="?([^"\n]+)/);

if (!urlMatch || !keyMatch) {
  console.error("Could not find Supabase URL or Key");
  process.exit(1);
}

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function fetchAccounts() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'j.mtsariashvili@ug.edu.ge',
    password: 'Tbilisi2027$'
  });

  if (authError) {
    console.error("Login failed:", authError.message);
    process.exit(1);
  }

  const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*');
  const { data: roles, error: rolesError } = await supabase.from('user_roles').select('*');

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
    process.exit(1);
  }
  
  if (rolesError) {
    console.error("Error fetching roles:", rolesError);
    process.exit(1);
  }

  const report = {};
  profiles.forEach(profile => {
    const userRoles = roles.filter(r => r.user_id === profile.id).map(r => r.role);
    const roleString = userRoles.length > 0 ? userRoles.join(', ') : 'unknown';
    
    if (!report[roleString]) {
      report[roleString] = 0;
    }
    report[roleString]++;
  });
  
  console.log("=== Accounts Report ===");
  console.log(`Total Accounts: ${profiles.length}`);
  console.log("By Role:");
  Object.keys(report).forEach(role => {
    console.log(`  - ${role}: ${report[role]}`);
  });
  
  console.log("\nDetails:");
  profiles.forEach(p => {
    const userRoles = roles.filter(r => r.user_id === p.id).map(r => r.role);
    console.log(`- Name: ${p.full_name || 'No Name'}, Email: (Auth protected), Roles: [${userRoles.join(', ')}]`);
  });
}

fetchAccounts();
