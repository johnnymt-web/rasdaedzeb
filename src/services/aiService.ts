import { supabase } from "@/integrations/supabase/client";
import {
  normalizeAllAssessments,
  getAssessmentCompletionStatus,
  type NormalizedAssessment,
  type NormalizedAssessmentResult,
} from "@/utils/assessmentNormalization";
import {
  getGradeBand,
  getRecommendedAssessmentsForGradeBand,
  type GradeBand,
} from "@/utils/gradeBands";
import {
  buildSynthesisCacheKey,
  type SynthesisInputV2,
  type SynthesisLang,
  type SynthesisV2Response,
  type SynthesisOnetCareer,
} from "./synthesisTypes";

export interface StudentProfileData {
  primaryInterest: string;
  traits: any;
  adapt: any;
  values: any;
  eqResults: Record<string, number> | null;
  gradeBand?: string;
  reportTone?: string;
}

export interface SynthesisResponse {
  summary: string;
  recommendations: string[];
}

/**
 * Service to connect to the Supabase Edge Function that powers
 * the generative AI counselor brief using OpenAI/Claude.
 */
export const generateAiSynthesis = async (
  profileData: StudentProfileData
): Promise<SynthesisResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-synthesis', {
      body: { profileData }
    });

    if (error) throw error;
    if (data) return data as SynthesisResponse;
    
    throw new Error("No data returned from AI service");

  } catch (error) {
    console.warn("AI Synthesis failed, falling back to local logic.", error);
    return generateLocalSynthesis(profileData);
  }
};

/**
 * Fallback local logic used if the Edge Function is not yet deployed 
 * or if there is an error hitting the OpenAI API.
 */
const generateLocalSynthesis = (data: StudentProfileData): SynthesisResponse => {
  const { primaryInterest, traits, adapt, values, eqResults } = data;
  let summary = "Discovery Guidance Brief: ";
  let recommendations = [];
  
  if (primaryInterest === "Social") {
    summary += "You show a strong interest in working with people and collaborative environments. ";
    if (traits?.extraversion > 70) summary += "Your energetic approach to social settings suggests you might enjoy group projects or leadership roles. ";
  } else if (primaryInterest === "Investigative") {
    summary += "You show a strong analytical and problem-solving mindset. ";
    if (traits?.openness > 70) summary += "Your curiosity makes you a great fit for research or exploration-focused activities. ";
  } else {
    summary += `Your primary interest in ${primaryInterest} areas suggests unique strengths to explore. `;
  }

  if (values?.independence > 4) {
    summary += "You seem to value independence and making your own choices. ";
  }
  if (values?.relationships > 4) {
    summary += "Working in a supportive environment with good people is important to you. ";
  }

  if (traits?.conscientiousness && traits.conscientiousness < 40) {
    summary += "You might sometimes find highly structured or strict environments challenging. ";
    recommendations.push("Try breaking large assignments into smaller, manageable steps.");
  }

  if (adapt && adapt.total_score < 3) {
    summary += "You are just starting to map out your future career ideas, which is completely normal. ";
    recommendations.push("Schedule a brief chat with your school counselor to explore what subjects interest you most.");
  }

  if (values?.achievement > 4 && traits?.conscientiousness && traits.conscientiousness < 40) {
    recommendations.push("Focus on celebrating small, short-term wins to keep your motivation high.");
  }

  if (eqResults && eqResults["Self-Awareness"] && eqResults["Self-Awareness"] < 3) {
    summary += "Building your emotional self-awareness could be a great next step. ";
    recommendations.push("Try a simple weekly reflection journal to notice how different tasks make you feel.");
  }
  
  if (eqResults && eqResults["Relationship Management"] && eqResults["Relationship Management"] > 4) {
    summary += "You show great potential for teamwork and helping others succeed. ";
    recommendations.push("Consider joining a peer mentoring program or a club leadership team.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Keep exploring different subjects and extracurriculars to see what sparks your interest.");
    recommendations.push("Discuss your Discovery Profile with your family or counselor.");
  }

  return { summary, recommendations };
};

// ===========================================================================
// V2 — Deep, cached, cross-instrument synthesis (Claude Sonnet via Edge fn)
// ===========================================================================

const mapDims = (a: NormalizedAssessment): { key: string; label: string; pct?: number; score?: number }[] =>
  (a?.isComplete ? a.results : []).map((r: NormalizedAssessmentResult) => ({
    key: r.key,
    label: r.label,
    pct: r.pct,
    score: r.score,
  }));

/** Fetch + normalize a student's assessments the same way the report view does. */
const fetchNormalizedAssessments = async (studentId: string) => {
  const fetchSafe = async (query: any) => {
    try {
      const { data, error } = await query;
      return error ? [] : (data || []);
    } catch {
      return [];
    }
  };

  const [stdData, bigFiveData, caasData, workValuesData] = await Promise.all([
    fetchSafe(supabase.from("assessments").select("*").eq("user_id", studentId).order("completed_at", { ascending: false, nullsFirst: false })),
    fetchSafe(supabase.from("big_five_assessments").select("*").eq("student_id", studentId).order("completed_at", { ascending: false, nullsFirst: false })),
    fetchSafe(supabase.from("caas_assessments").select("*").eq("student_id", studentId).order("completed_at", { ascending: false, nullsFirst: false })),
    fetchSafe(supabase.from("work_values_assessments").select("*").eq("student_id", studentId).order("completed_at", { ascending: false, nullsFirst: false })),
  ]);

  return normalizeAllAssessments({ std: stdData, bigFive: bigFiveData, caas: caasData, workValues: workValuesData });
};

/** Build the structured V2 input from normalized assessment data. */
export const buildSynthesisInput = (
  studentId: string,
  gradeBand: GradeBand,
  lang: SynthesisLang,
  normData: ReturnType<typeof normalizeAllAssessments>,
  onetCareers?: SynthesisOnetCareer[],
): SynthesisInputV2 => ({
  studentId,
  gradeBand,
  lang,
  riasec: mapDims(normData.riasec),
  bigFive: mapDims(normData.bigFive),
  caas: mapDims(normData.caas),
  workValues: mapDims(normData.workValues),
  eq: mapDims(normData.eq),
  skills: mapDims(normData.skills),
  onetCareers,
});

// Session-scoped memoization keyed by the (lang-inclusive) synthesis cache key.
// Without this, an errored query (e.g. AI disabled -> fail-closed) has no
// successful `data` for React Query to treat as fresh, so switching the report
// language back and forth re-issues a live Edge Function round trip on every
// single toggle. forceRegenerate (the explicit "Regenerate" action) clears the
// entry so the user can always force a fresh attempt without a page reload.
const synthesisMemo = new Map<string, Promise<SynthesisV2Response>>();

/**
 * Generate (or fetch from cache) the deep V2 synthesis report via the Edge Function.
 * Throws on failure so callers can decide whether to show a fallback.
 */
export const generateSynthesisV2 = async (
  input: SynthesisInputV2,
  opts: { forceRegenerate?: boolean } = {},
): Promise<SynthesisV2Response> => {
  const cacheKey = buildSynthesisCacheKey(input);

  if (opts.forceRegenerate) {
    synthesisMemo.delete(cacheKey);
  } else {
    const memoized = synthesisMemo.get(cacheKey);
    if (memoized) return memoized;
  }

  const request = (async () => {
    const { data, error } = await supabase.functions.invoke("generate-synthesis", {
      body: { input, cacheKey, forceRegenerate: opts.forceRegenerate ?? false },
    });
    if (error) throw error;
    if (!data || (data as any).error) throw new Error((data as any)?.error || "No data from synthesis service");
    return data as SynthesisV2Response;
  })();

  synthesisMemo.set(cacheKey, request);
  return request;
};

/**
 * Eager pre-generation: called after an assessment is saved. If the student has
 * completed all assessments recommended for their grade band, warm the cache in
 * the background. Fire-and-forget — never throws into the save flow.
 */
export const triggerSynthesisIfReady = async (
  studentId: string,
  grade?: string | number | null,
  lang: SynthesisLang = "ka",
): Promise<void> => {
  try {
    let resolvedGrade = grade;
    if (resolvedGrade == null) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("grade")
        .eq("id", studentId)
        .maybeSingle();
      resolvedGrade = (prof as any)?.grade ?? null;
    }
    const gradeBand = getGradeBand(resolvedGrade != null ? String(resolvedGrade) : undefined);
    const recommended = getRecommendedAssessmentsForGradeBand(gradeBand);
    const normData = await fetchNormalizedAssessments(studentId);
    const status = getAssessmentCompletionStatus(normData, recommended);

    // Only pre-generate once the recommended set is fully complete.
    if (status.completed < status.total) return;

    const input = buildSynthesisInput(studentId, gradeBand, lang, normData);
    await generateSynthesisV2(input); // warms cache (forceRegenerate=false)
  } catch (err) {
    // Background optimization only — the report view will lazily generate on demand.
    console.warn("triggerSynthesisIfReady skipped:", err);
  }
};

export interface ReportQAMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Report-grounded Q&A: ask the career coach a question answered strictly from
 * the student's own synthesis report. Reuses the existing career-coach Edge Function.
 */
export const askAboutReport = async (
  reportContext: unknown,
  messages: ReportQAMessage[],
  lang: SynthesisLang = "ka",
): Promise<string> => {
  const { data, error } = await supabase.functions.invoke("career-coach", {
    body: { messages, reportContext, lang },
  });
  if (error) throw error;
  if (!data || (data as any).error) throw new Error((data as any)?.error || "No answer returned");
  return (data as any).content as string;
};
