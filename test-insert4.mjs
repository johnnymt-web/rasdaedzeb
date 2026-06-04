import { createClient } from '@supabase/supabase-js';

const supabase = createClient("https://sebpxbattjpwrfbipctq.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlYnB4YmF0dGpwd3JmYmlwY3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzkzMjksImV4cCI6MjA5MzY1NTMyOX0.1fPQCBPdtW-gQ1tTWPoF_1UMu6ZYs9CFqi8Ub9DumI4");

async function test() {
  console.log("Logging in...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "j.mtsariashvili@ug.edu.ge",
    password: "Tbilisi2026$"
  });

  if (authError) {
    console.error("Login failed:", authError);
    return;
  }

  const userId = authData.user.id;
  console.log("Logged in as:", userId);

  console.log("Attempting EQ...");
  const { data, error } = await supabase.from("assessments").insert({
    user_id: userId,
    assessment_type: "eq",
    answers: {"test": 1},
    results: [],
    completed_at: new Date(Date.now() - 120000).toISOString()
  });

  console.log("EQ insert:", error ? error.message : "Success");

  console.log("Attempting RIASEC...");
  const { data: d2, error: e2 } = await supabase.from("assessments").insert({
    user_id: userId,
    assessment_type: "riasec",
    answers: {"test": 1},
    results: [],
    completed_at: new Date(Date.now() - 120000).toISOString()
  });

  console.log("RIASEC insert:", e2 ? e2.message : "Success");
}

test();
