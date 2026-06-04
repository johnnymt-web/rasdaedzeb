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

const url = urlMatch[1];
const key = keyMatch[1];

const supabase = createClient(url, key);

async function fetchAccounts() {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error("Error fetching profiles:", error);
    process.exit(1);
  }
  
  const report = {};
  data.forEach(profile => {
    const role = profile.role || 'unknown';
    if (!report[role]) {
      report[role] = 0;
    }
    report[role]++;
  });
  
  console.log("=== Accounts Report ===");
  console.log(`Total Accounts: ${data.length}`);
  console.log("By Role:");
  Object.keys(report).forEach(role => {
    console.log(`  - ${role}: ${report[role]}`);
  });
  
  console.log("\nDetails:");
  data.forEach(p => {
    console.log(`- ${p.full_name || 'No Name'} (${p.email || 'No Email'}) | Role: ${p.role || 'None'}`);
  });
}

fetchAccounts();
