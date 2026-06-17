import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Verify Authorization (must be Admin)
    const authHeader = req.headers.get("Authorization")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const { data: roleData } = await userClient.from("user_roles").select("role").eq("user_id", user.id).single();
    if (roleData?.role !== "admin") throw new Error("Forbidden: Admin access required");

    // 2. Get payload
    const { users } = await req.json();
    if (!Array.isArray(users)) throw new Error("Invalid payload: 'users' must be an array");

    console.log(`Processing bulk onboarding for ${users.length} users`);

    const results = [];
    for (const userData of users) {
      const { email, password, full_name, role, grade, school } = userData;
      
      try {
        // Create the user in Auth
        // NOTE: role is intentionally NOT passed here. Since the S1 hardening,
        // handle_new_user() sources the role ONLY from the pre_boarding table
        // (written by BulkTools before this call). Metadata role is ignored.
        const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name, grade, school }
        });

        if (createError) {
          results.push({ email, success: false, error: createError.message });
        } else {
          results.push({ email, success: true, id: newUser.user.id });
        }
      } catch (err) {
        results.push({ email, success: false, error: err.message });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
