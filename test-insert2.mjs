import { createClient } from '@supabase/supabase-js';

const supabase = createClient("https://sebpxbattjpwrfbipctq.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlYnB4YmF0dGpwd3JmYmlwY3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzkzMjksImV4cCI6MjA5MzY1NTMyOX0.1fPQCBPdtW-gQ1tTWPoF_1UMu6ZYs9CFqi8Ub9DumI4");

async function test() {
  const { data, error } = await supabase.from("assessments").insert({
    user_id: "00000000-0000-0000-0000-000000000000",
    assessment_type: "test",
    answers: {},
    results: {},
    completed_at: new Date(Date.now() - 120000).toISOString()
  });

  console.log("Insert result:", error ? JSON.stringify(error) : data);
}

test();
