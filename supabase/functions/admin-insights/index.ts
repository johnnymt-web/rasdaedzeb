// @ts-ignore: Deno URL import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno URL import
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
// @ts-ignore: Deno URL import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(20000),
});

const RequestSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(50),
});

const SYSTEM_PROMPT = `You are the Pathfinder Admin Insights Agent — a strategic AI analyst that helps school administrators understand and act upon student career development data.

PERSONALITY:
- Analytical, objective, and strategic.
- Executive-level communication (concise, data-driven).
- Solution-oriented — don't just point out problems, suggest strategies.

CONTEXT:
You will be provided with aggregate school-wide data including participation rates, grade-level completion, and interest distributions. Your job is to analyze this data to help the admin make better program decisions.

GOALS:
- Identify participation gaps (e.g., which grade bands are falling behind?).
- Analyze interest trends (e.g., are we seeing a surge in Artistic interests that suggests a need for more creative workshops?).
- Suggest strategic actions (e.g., "Parent engagement in Grade 9 is low, consider a webinar").
- Provide summaries of program health.

RULES:
- When given data, reference it explicitly.
- Use markdown for structure (tables, bullet points).
- Keep responses professional and actionable.
- Do not discuss individual student names (privacy).
- If the data is missing or insufficient, state that clearly and suggest what might be needed.

RIASEC ANALYSIS:
- Connect interest distributions to potential extracurricular or elective needs.
- Identify "opportunity gaps" where high student interest in an area might not be matched by school offerings.

FORMAT:
- Use ## for main sections.
- Use bold for key metrics.
- End with a "Strategic Recommendation".`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Auth verification (admin only) ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !authUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Verify admin role strictly from the database
    const { data: roleData, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", authUser.id)
      .single();

    if (roleError || !roleData || roleData.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden: Verified admin access required." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- 2. Server-Side Rate Limit Enforcement ---
    const { data: canProceed, error: limitError } = await supabaseClient.rpc("check_and_increment_ai_usage", {
      _user_id: authUser.id,
      _daily_limit: 50 // Higher limit for admins
    });

    if (limitError) {
      console.error("AI Usage check failed:", limitError);
    } else if (!canProceed) {
      return new Response(
        JSON.stringify({ error: "Daily AI insights limit reached." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Strip client-supplied system messages
    const messages = parsed.data.messages.filter((m: z.infer<typeof MessageSchema>) => m.role !== "system");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-20),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Something went wrong with the AI service. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- 3. Log Interaction (Fire-and-forget) ---
    // Use service role client to bypass RLS on ai_logs table
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
    
    // Await the logging operation to ensure it is not dropped when the isolate terminates
    const { error: logError } = await serviceClient.from("ai_logs").insert({
      user_id: authUser.id,
      feature_name: "admin-insights",
      // Privacy: do not persist free-text (may contain student PII); record size only.
      prompt_summary: `[redacted ${lastUserMsg?.content?.length ?? 0} chars]`
    });
    
    if (logError) {
      console.error("Failed to log AI interaction:", logError);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("admin-insights error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
