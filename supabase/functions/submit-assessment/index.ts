// =========================================================================
// submit-assessment — server-authoritative persistence for RIASEC / Skills / EQ
// (G5 Phase B). The client may compute results locally for instant display, but
// the STORED results are recomputed here from the raw answers and inserted only
// by this function (service role). Client-sent results are never trusted, and a
// caller can never write an assessment as another user.
// =========================================================================
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  scoreAssessment,
  gradeToBand,
  ScoringError,
  type AssessmentType,
  type Answers,
} from "./scoring.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_TYPES: AssessmentType[] = ["riasec", "skills", "eq"];

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[submit] start");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // 1) Authenticate the caller from their JWT (never trust user_id from the body).
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing Authorization header" }, 401);

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);
    console.log("[submit] auth ok", user.id);

    // 2) Parse + validate the payload.
    let body: { assessment_type?: string; answers?: unknown };
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const assessment_type = body?.assessment_type as AssessmentType;
    if (!ALLOWED_TYPES.includes(assessment_type)) {
      return json({ error: `Unsupported assessment_type. Allowed: ${ALLOWED_TYPES.join(", ")}` }, 400);
    }
    const answers = body?.answers;
    if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
      return json({ error: "Invalid 'answers': expected an object of { itemId: value }" }, 400);
    }
    console.log("[submit] payload ok", assessment_type, "keys:", Object.keys(answers).length);

    // 3) Derive grade_band from the AUTHORITATIVE profile, not the request.
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: profile, error: profErr } = await admin
      .from("profiles")
      .select("grade")
      .eq("id", user.id)
      .single();
    if (profErr) console.log("[submit] profile fetch error:", profErr.message);
    const band = gradeToBand(profile?.grade ?? null);
    console.log("[submit] band", band);

    // 4) Recompute results server-side (rejects malformed / fallback structures).
    let scored;
    try {
      scored = scoreAssessment(assessment_type, answers as Answers, band);
    } catch (e) {
      if (e instanceof ScoringError) {
        console.log("[submit] scoring rejected:", (e as Error).message);
        return json({ error: e.message }, 400);
      }
      throw e;
    }
    console.log("[submit] scored", scored.questionSetVersion);

    // 5) Insert with the service role (bypasses RLS). user_id is the verified caller.
    console.log("[submit] inserting...");
    const { error: insErr } = await admin.from("assessments").insert({
      user_id: user.id,
      assessment_type,
      answers,
      results: scored.results,
      grade_band: band,
      question_set_version: scored.questionSetVersion,
    });
    if (insErr) {
      console.error("[submit] INSERT ERROR:", JSON.stringify(insErr));
      return json({ error: insErr.message }, 500);
    }
    console.log("[submit] inserted OK");

    return json(
      {
        success: true,
        results: scored.results,
        grade_band: band,
        question_set_version: scored.questionSetVersion,
      },
      200,
    );
  } catch (e) {
    console.error("[submit] CAUGHT:", (e as Error)?.stack ?? String(e));
    return json({ error: (e as Error)?.message ?? "Unexpected error" }, 400);
  }
});
