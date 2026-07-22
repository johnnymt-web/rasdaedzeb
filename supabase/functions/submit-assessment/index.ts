// =========================================================================
// submit-assessment — server-authoritative persistence for RIASEC / Skills / EQ
// (G5 Phase B). Scoring is INLINED below (no local import) so the function is
// fully self-contained and cannot fail to boot on bundling. Mirrors the frontend
// scoring exactly (see supabase/functions/submit-assessment/scoring.ts + tests).
// =========================================================================
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------------------------- inlined scoring ----------------------------
type AssessmentType = "riasec" | "skills" | "eq";
type GradeBand = "discovery" | "exploration" | "planning" | "transition" | "unknown";
type Answers = Record<string, number>;
interface ScoredAssessment { results: unknown; questionSetVersion: string; }

class ScoringError extends Error {
  constructor(message: string) { super(message); this.name = "ScoringError"; }
}

function gradeToBand(gradeStr: string | null | undefined): GradeBand {
  if (!gradeStr) return "unknown";
  const match = String(gradeStr).match(/\d+/);
  if (!match) return "unknown";
  const grade = parseInt(match[0], 10);
  if (grade >= 6 && grade <= 8) return "discovery";
  if (grade >= 9 && grade <= 10) return "exploration";
  if (grade >= 11 && grade <= 12) return "planning";
  if (grade >= 13) return "transition";
  return "unknown";
}

function riasecBankKey(band: GradeBand): "discovery" | "exploration" | "planning" {
  if (band === "exploration") return "exploration";
  if (band === "planning" || band === "transition") return "planning";
  return "discovery";
}

function assertValue(type: string, key: string, v: unknown): number {
  if (typeof v !== "number" || !Number.isFinite(v) || v < 1 || v > 5) {
    throw new ScoringError(`${type} item "${key}" has invalid value (${String(v)}); expected an integer 1-5.`);
  }
  return v;
}

const RIASEC_CATEGORIES = ["Realistic", "Investigative", "Artistic", "Social", "Enterprising", "Conventional"] as const;
const RIASEC_ITEMS_PER_CATEGORY = 8;
const RIASEC_TOTAL_ITEMS = 48;

function scoreRiasec(answers: Answers, band: GradeBand): ScoredAssessment {
  const keys = Object.keys(answers);
  if (keys.length !== RIASEC_TOTAL_ITEMS) {
    throw new ScoringError(`RIASEC submission has ${keys.length} answers; expected ${RIASEC_TOTAL_ITEMS} (48-item grade bank). Fallback/other structures are not accepted for server-side scoring.`);
  }
  const sums = new Array(RIASEC_CATEGORIES.length).fill(0);
  for (const key of keys) {
    const id = Number(key);
    if (!Number.isInteger(id) || id < 1 || id > RIASEC_TOTAL_ITEMS) {
      throw new ScoringError(`RIASEC submission contains invalid item id "${key}"; expected ids 1-${RIASEC_TOTAL_ITEMS}.`);
    }
    const v = assertValue("RIASEC", key, answers[key]);
    const catIdx = Math.ceil(id / RIASEC_ITEMS_PER_CATEGORY) - 1;
    sums[catIdx] += v;
  }
  const maxPossible = RIASEC_ITEMS_PER_CATEGORY * 5;
  const results = RIASEC_CATEGORIES.map((category, i) => ({
    category, pct: Math.round((sums[i] / maxPossible) * 100),
  })).sort((a, b) => b.pct - a.pct);
  return { results, questionSetVersion: `riasec_${riasecBankKey(band)}_v1_48` };
}

const SKILLS_MAP: Record<string, string> = {
  "101": "Communication", "102": "Problem Solving", "103": "Digital Literacy", "104": "Teamwork", "105": "Adaptability",
};
const SKILLS_IDS = ["101", "102", "103", "104", "105"];

function scoreSkills(answers: Answers): ScoredAssessment {
  const keys = Object.keys(answers);
  if (keys.length !== SKILLS_IDS.length) {
    throw new ScoringError(`Skills submission has ${keys.length} answers; expected ${SKILLS_IDS.length} (ids 101-105).`);
  }
  for (const id of SKILLS_IDS) {
    if (!(id in answers)) throw new ScoringError(`Skills submission is missing item "${id}".`);
  }
  const results = SKILLS_IDS.map((id) => {
    const v = assertValue("Skills", id, answers[id]);
    return { category: SKILLS_MAP[id], pct: Math.round((v / 5) * 100) };
  }).sort((a, b) => b.pct - a.pct);
  return { results, questionSetVersion: "skills_v1_5" };
}

const EQ_DIMENSIONS = ["Self-Awareness", "Self-Management", "Social Awareness", "Relationship Management"] as const;
const EQ_ITEM_DIMENSION: Record<string, string> = {
  sa1: "Self-Awareness", sa2: "Self-Awareness", sa3: "Self-Awareness",
  sm1: "Self-Management", sm2: "Self-Management", sm3: "Self-Management",
  soa1: "Social Awareness", soa2: "Social Awareness", soa3: "Social Awareness",
  rm1: "Relationship Management", rm2: "Relationship Management", rm3: "Relationship Management",
};
const EQ_IDS = Object.keys(EQ_ITEM_DIMENSION);

function scoreEq(answers: Answers): ScoredAssessment {
  const keys = Object.keys(answers);
  if (keys.length !== EQ_IDS.length) {
    throw new ScoringError(`EQ submission has ${keys.length} answers; expected ${EQ_IDS.length} (sa/sm/soa/rm x3).`);
  }
  for (const id of EQ_IDS) {
    if (!(id in answers)) throw new ScoringError(`EQ submission is missing item "${id}".`);
    assertValue("EQ", id, answers[id]);
  }
  const results = EQ_DIMENSIONS.map((dim) => {
    const items = EQ_IDS.filter((id) => EQ_ITEM_DIMENSION[id] === dim);
    const total = items.reduce((sum, id) => sum + answers[id], 0);
    const score = total / items.length;
    return { category: dim, score, pct: Math.round((score / 5) * 100) };
  });
  return { results, questionSetVersion: "eq_v1_12" };
}

function scoreAssessment(type: AssessmentType, answers: Answers, band: GradeBand): ScoredAssessment {
  switch (type) {
    case "riasec": return scoreRiasec(answers, band);
    case "skills": return scoreSkills(answers);
    case "eq": return scoreEq(answers);
    default: throw new ScoringError(`Unsupported assessment_type "${String(type)}".`);
  }
}
// -------------------------- end inlined scoring --------------------------

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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing Authorization header" }, 401);

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);
    console.log("[submit] auth ok", user.id);

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

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: profile, error: profErr } = await admin
      .from("profiles")
      .select("grade, current_assessment_cycle")
      .eq("id", user.id)
      .single();
    if (profErr) console.log("[submit] profile fetch error:", profErr.message);
    const band = gradeToBand(profile?.grade ?? null);
    console.log("[submit] band", band);

    let scored: ScoredAssessment;
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

    console.log("[submit] inserting...");
    const { error: insErr } = await admin.from("assessments").insert({
      user_id: user.id,
      assessment_type,
      answers,
      results: scored.results,
      grade_band: band,
      question_set_version: scored.questionSetVersion,
      cycle_number: profile?.current_assessment_cycle ?? 1,
    });
    if (insErr) {
      console.error("[submit] INSERT ERROR:", JSON.stringify(insErr));
      return json({ error: insErr.message }, 500);
    }
    console.log("[submit] inserted OK");

    return json(
      { success: true, results: scored.results, grade_band: band, question_set_version: scored.questionSetVersion },
      200,
    );
  } catch (e) {
    console.error("[submit] CAUGHT:", (e as Error)?.stack ?? String(e));
    return json({ error: (e as Error)?.message ?? "Unexpected error" }, 400);
  }
});
