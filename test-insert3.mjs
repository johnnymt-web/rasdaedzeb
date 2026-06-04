import { createClient } from '@supabase/supabase-js';

const supabase = createClient("https://sebpxbattjpwrfbipctq.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlYnB4YmF0dGpwd3JmYmlwY3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzkzMjksImV4cCI6MjA5MzY1NTMyOX0.1fPQCBPdtW-gQ1tTWPoF_1UMu6ZYs9CFqi8Ub9DumI4");

async function test() {
  const email = `test-${Date.now()}@example.com`;
  const password = "password123";
  
  console.log("Signing up user...");
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password
  });

  if (authError) {
    console.error("Signup failed:", authError);
    return;
  }

  const userId = authData.user.id;
  console.log("Logged in as:", userId);

  console.log("Attempting to insert into assessments...");
  const { data, error } = await supabase.from("assessments").insert({
    user_id: userId,
    assessment_type: "eq",
    answers: {"test": 1},
    results: [],
    completed_at: new Date().toISOString()
  });

  console.log("Insert EQ result:", error ? JSON.stringify(error) : data);

  const { data: d2, error: e2 } = await supabase.from("assessments").insert({
    user_id: userId,
    assessment_type: "riasec",
    answers: {"test": 1},
    results: [],
    completed_at: new Date().toISOString()
  });

  console.log("Insert RIASEC result:", e2 ? JSON.stringify(e2) : d2);
}

test();
