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

const StudentContextSchema = z.object({
  studentName: z.string().max(200),
  grade: z.string().max(50).nullable(),
  results: z.array(z.object({
    category: z.string().max(50),
    pct: z.number().min(0).max(100),
  })),
}).optional();

const RequestSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(50),
  studentContext: StudentContextSchema,
});

const SAFEGUARDING_KEYWORDS = [
  "suicide", "kill myself", "self-harm", "self harm", "cutting myself",
  "want to die", "end my life", "hurt myself", "abuse", "being hit",
  "nobody cares", "can't go on", "give up on life", "hopeless",
];

function checkSafeguarding(text: string): boolean {
  const lower = text.toLowerCase();
  return SAFEGUARDING_KEYWORDS.some((kw) => lower.includes(kw));
}

const SAFEGUARDING_RESPONSE = `I hear you, and I want you to know that what you're sharing matters. I'm an AI assistant and I'm not the right resource to help with this — but there are people who can.

**Please reach out for support:**
- 🏫 Contact your child's school counselor — they can help with family and student concerns
- 📞 Crisis Text Line: Text HOME to 741741
- 📞 National Suicide Prevention Lifeline: 988 (call or text)
- 📞 Childhelp National Child Abuse Hotline: 1-800-422-4453
- 🌐 SAMHSA Helpline: 1-800-662-4357

You are not alone — reaching out is an important step. 💛`;

const BASE_SYSTEM_PROMPT = `You are the Pathfinder Parent Support Assistant — a warm, empathetic, and knowledgeable AI that helps parents and guardians understand and support their child's career exploration journey.

PERSONALITY:
- Warm, reassuring, and non-judgmental
- Use clear, accessible language — no educational jargon
- Be empathetic to parental concerns and anxieties
- Encouraging and empowering — help parents feel confident

RULES:
- Never tell a parent their child should pursue a specific career
- Frame everything as exploration and possibilities
- Acknowledge parental concerns with empathy before offering guidance
- Encourage open, pressure-free conversations with their child
- If asked about mental health or behavioral concerns, recommend speaking with the school counselor
- Keep responses concise (2-4 paragraphs max)
- Suggest practical, actionable steps parents can take
- Reference the child's actual assessment results when relevant — use their name

TOPICS YOU CAN HELP WITH:
- Understanding RIASEC assessment results and what they mean
- How to talk to your child about careers without adding pressure
- Connecting school subjects to career interests
- Understanding different post-school pathways (university, vocational, apprenticeships)
- Supporting children who feel uncertain or anxious about the future
- Balancing parental expectations with the child's own interests
- Finding age-appropriate career exploration activities to do together
- Understanding the difference between career interests and career readiness
- Managing your own expectations and anxiety about your child's future

ALWAYS END with a gentle follow-up question or practical suggestion to keep the conversation going.`;

function buildSystemPrompt(ctx?: { studentName: string; grade: string | null; results: { category: string; pct: number }[] }): string {
  if (!ctx || ctx.results.length === 0) {
    return BASE_SYSTEM_PROMPT + "\n\nNote: No assessment data is available yet for this parent's child.";
  }

  const sorted = [...ctx.results].sort((a, b) => b.pct - a.pct);
  const top3 = sorted.slice(0, 3);
  const bottom = sorted.slice(-1)[0];

  const profileBlock = `
CHILD'S PROFILE:
- Name: ${ctx.studentName}
${ctx.grade ? `- Grade: ${ctx.grade}` : ""}
- Assessment completed: Yes

RIASEC RESULTS (from strongest to weakest):
${sorted.map((r) => `  ${r.category}: ${r.pct}%`).join("\n")}

KEY OBSERVATIONS:
- Strongest interest area: ${top3[0].category} (${top3[0].pct}%) — this is where ${ctx.studentName} shows the most natural curiosity
- Second strongest: ${top3[1]?.category} (${top3[1]?.pct}%) — a complementary area of interest
- Third strongest: ${top3[2]?.category} (${top3[2]?.pct}%) — adds breadth to their profile
- Lowest area: ${bottom.category} (${bottom.pct}%) — this is normal and doesn't mean inability, just less current interest

When the parent asks about their child's results, use these specific numbers and categories. Relate the RIASEC categories to everyday activities and school subjects ${ctx.studentName} might enjoy.`;

  return BASE_SYSTEM_PROMPT + "\n" + profileBlock;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Auth verification ---
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

    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Strip client-supplied system messages to prevent prompt injection
    const messages = parsed.data.messages.filter((m: z.infer<typeof MessageSchema>) => m.role !== "system");
    const { studentContext } = parsed.data;

    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg && checkSafeguarding(lastUserMsg.content)) {
      return new Response(
        JSON.stringify({ safeguarding: true, content: SAFEGUARDING_RESPONSE }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = buildSystemPrompt(studentContext);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-20),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "I'm receiving a lot of questions right now. Please try again in a moment! 😊" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "The AI service needs more credits. Please contact the school administrator." }),
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
    serviceClient.from("ai_logs").insert({
      user_id: authUser.id,
      feature_name: "parent-coach",
      // Privacy: do not persist free-text (may contain student PII); record size only.
      prompt_summary: `[redacted ${lastUserMsg?.content?.length ?? 0} chars]`
    }).then(({ error }: { error: any }) => {
      if (error) console.error("Failed to log AI interaction:", error);
    });

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("parent-coach error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
