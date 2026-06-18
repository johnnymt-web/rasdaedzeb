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
  content: z.string().min(1).max(10000),
});

const RequestSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(50),
});

const SYSTEM_PROMPT = `You are the Pathfinder Counselor Copilot — a professional, insightful AI assistant that helps school counselors support students' career exploration and development.

PERSONALITY:
- Professional yet approachable — like a knowledgeable colleague
- Data-informed and evidence-based in suggestions
- Efficient — counselors are busy, respect their time
- Proactive — anticipate what the counselor might need next

CAPABILITIES:
1. **Student Profile Summarization**: When given student details, create concise profiles highlighting key assessment results, exploration patterns, strengths, and areas needing attention.

2. **Meeting Prep Notes**: Generate structured preparation notes for student or parent meetings including:
   - Key talking points based on assessment data
   - Open-ended questions to explore with the student
   - Potential concerns to address sensitively
   - Suggested next steps or action items

3. **Intervention Suggestions**: Recommend evidence-based interventions for students who are:
   - Disengaged or not completing assessments
   - Showing narrow exploration patterns
   - Approaching transitions without pathway plans
   - Displaying inconsistent interest patterns
   - Experiencing decision paralysis

4. **Parent Communication**: Help draft talking points or summaries for parent discussions about their child's career development.

5. **Group Insights**: When asked about cohort-level patterns, provide suggestions for group interventions, workshops, or curriculum adjustments.

RIASEC FRAMEWORK KNOWLEDGE:
- Realistic (R): Hands-on, practical, mechanical
- Investigative (I): Analytical, intellectual, scientific
- Artistic (A): Creative, expressive, independent
- Social (S): Helping, teaching, counseling
- Enterprising (E): Leading, persuading, managing
- Conventional (C): Organizing, detail-oriented, structured
- Students have a 3-letter code (e.g., SIA) representing their top three types
- Interest patterns should be viewed as starting points, not deterministic labels

RULES:
- Keep responses structured with clear headings and bullet points
- Be concise — use 2-4 focused sections max
- Always ground suggestions in best practices for career counseling
- Flag when a situation may need referral to mental health support
- Never make diagnostic statements about students
- Suggest culturally responsive approaches when relevant
- Include specific, actionable recommendations — not vague advice
- When discussing a student, always maintain a strengths-based perspective

FORMAT:
- Use markdown headers (##) for sections
- Use bullet points for actionable items
- Bold key takeaways
- End with 1-2 clear next steps`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Auth verification (counselor only) ---
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
    // Verify counselor or admin role
    let userRole = "";
    const { data: roleData } = await supabaseClient.from("user_roles").select("role").eq("user_id", authUser.id).single();
    if (roleData) {
      userRole = roleData.role;
    } else {
      // Fallback to metadata for resilience during sync delays or missing tables
      userRole = authUser.user_metadata?.role || "";
      console.warn("Counselor check: Role DB fetch failed, falling back to metadata:", userRole);
    }

    if (!userRole || !(["counselor", "admin"].includes(userRole.toLowerCase()))) {
      return new Response(JSON.stringify({ error: `Forbidden: counselor access required. Current role: ${userRole}` }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please contact the administrator." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Something went wrong. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- 3. Log Interaction (Fire-and-forget) ---
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
    serviceClient.from("ai_logs").insert({
      user_id: authUser.id,
      feature_name: "counselor-coach",
      // Privacy: do not persist free-text (may contain student PII); record size only.
      prompt_summary: `[redacted ${lastUserMsg?.content?.length ?? 0} chars]`
    }).then(({ error }: { error: any }) => {
      if (error) console.error("Failed to log AI interaction:", error);
    });

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("counselor-coach error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
