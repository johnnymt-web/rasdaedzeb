import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function test() {
  // Try to insert a dummy assessment for a fake user id
  // This will probably fail RLS, but we want to see if there's a schema error first
  // Actually we can log in as a real user if we want, but let's see the error first
  const { data, error } = await supabase.from("assessments").insert({
    user_id: "00000000-0000-0000-0000-000000000000",
    assessment_type: "test",
    answers: {},
    results: {},
    completed_at: new Date(Date.now() - 120000).toISOString()
  });

  console.log("Error:", error);
}

test();
