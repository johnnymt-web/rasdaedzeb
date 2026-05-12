import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envFile = fs.readFileSync('.env', 'utf-8');
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('='))
    .map(([k, ...v]) => [k.trim(), v.join('=').trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '').replace(/\r$/, '')])
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY)

async function test() {
  const { data: assessments, error } = await supabase
    .from("assessments")
    .select("id, results, created_at")
    .eq("user_id", "00930924-e268-4e62-8e40-ce7cf0d2a903")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }
  
  console.log(`Found ${assessments.length} assessments.`);
  assessments.forEach((a, i) => {
    console.log(`\n--- Assessment ${i} (${a.id}) ---`);
    console.log("Type of results:", typeof a.results);
    console.log("Is array?", Array.isArray(a.results));
    console.log("Results value:", JSON.stringify(a.results, null, 2));
  });
}

test();
