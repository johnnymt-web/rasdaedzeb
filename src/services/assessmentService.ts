import { supabase } from "@/integrations/supabase/client";
import { triggerSynthesisIfReady } from "./aiService";

export interface BigFiveResult {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface CaasResult {
  concern: number;
  control: number;
  curiosity: number;
  confidence: number;
  total_score: number;
}

const TRAIT_MAP: Record<string, keyof BigFiveResult> = {
  e: "extraversion",
  a: "agreeableness",
  c: "conscientiousness",
  n: "neuroticism",
  o: "openness"
};

// 1-5 scale alternating keys for standard IPIP
// But the frontend explicitly sends the correct prefix (e, a, c, n, o)
// Frontend signs: 
// E: + - + - + - + - + -
// A: - + - + - + - + + +
// C: + - + - + - + - + +
// N: + - + - + + + + + +
// O: + - + - + - + + + +
// However, instead of recreating the exact sign map, we can just export it from the frontend, OR assume the frontend already sent the correct value, BUT the frontend just sends raw 1-5 values.
// To perfectly mirror BigFiveAssessment.tsx's items without duplicating, we can just define the sign map here based on the exact ids:
const SIGN_MAP: Record<string, number> = {
  e1: 1, e2: -1, e3: 1, e4: -1, e5: 1, e6: -1, e7: 1, e8: -1, e9: 1, e10: -1,
  a1: -1, a2: 1, a3: -1, a4: 1, a5: -1, a6: 1, a7: -1, a8: 1, a9: 1, a10: 1,
  c1: 1, c2: -1, c3: 1, c4: -1, c5: 1, c6: -1, c7: 1, c8: -1, c9: 1, c10: 1,
  n1: 1, n2: -1, n3: 1, n4: -1, n5: 1, n6: 1, n7: 1, n8: 1, n9: 1, n10: 1,
  o1: 1, o2: -1, o3: 1, o4: -1, o5: 1, o6: -1, o7: 1, o8: 1, o9: 1, o10: 1,
};

export const calculateBigFiveScores = (responses: Record<string, number>): BigFiveResult => {
  const scores: Record<keyof BigFiveResult, number[]> = {
    openness: [],
    conscientiousness: [],
    extraversion: [],
    agreeableness: [],
    neuroticism: []
  };

  Object.entries(responses).forEach(([qid, value]) => {
    const prefix = qid.charAt(0);
    const trait = TRAIT_MAP[prefix];
    const sign = SIGN_MAP[qid];
    if (trait && sign !== undefined) {
      // 1-5 scale. Negative keyed items: 6 - score
      const actualScore = sign === 1 ? value : 6 - value;
      scores[trait].push(actualScore);
    }
  });

  const normalize = (vals: number[]) => {
    if (vals.length === 0) return 0;
    const sum = vals.reduce((a, b) => a + b, 0);
    // Convert to 0-100 scale
    return (sum / (vals.length * 5)) * 100;
  };

  return {
    openness: normalize(scores.openness),
    conscientiousness: normalize(scores.conscientiousness),
    extraversion: normalize(scores.extraversion),
    agreeableness: normalize(scores.agreeableness),
    neuroticism: normalize(scores.neuroticism)
  };
};

const withTimeout = <T>(promise: PromiseLike<T>, ms: number = 15000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Timeout")), ms)
    )
  ]);
};

export const saveBigFiveAssessment = async (studentId: string, responses: Record<string, number>, cycleNumber?: number) => {
  const scores = calculateBigFiveScores(responses);

  const query = supabase
    .from("big_five_assessments")
    .insert({
      student_id: studentId,
      item_responses: responses,
      openness: scores.openness,
      conscientiousness: scores.conscientiousness,
      extraversion: scores.extraversion,
      agreeableness: scores.agreeableness,
      neuroticism: scores.neuroticism,
      facet_scores: scores as any,
      ...(cycleNumber ? { cycle_number: cycleNumber } : {})
    })
    .select()
    .single();

  const { data, error } = await withTimeout(query);

  if (error) throw error;
  // Background: warm the deep-synthesis cache if all recommended assessments are done.
  void triggerSynthesisIfReady(studentId);
  return data;
};

export type CaasSubscale = "concern" | "control" | "curiosity" | "confidence";

// Single source of truth for CAAS scoring: each item id -> its subscale.
// Robust to presentation reordering and self-documenting (replaces the previous
// fragile positional `id <= 6` logic). Must mirror CAAS_ITEMS in CaasAssessment.tsx.
export const CAAS_SUBSCALE_BY_ID: Record<string, CaasSubscale> = {
  q1: "concern", q2: "concern", q3: "concern", q4: "concern", q5: "concern", q6: "concern",
  q7: "control", q8: "control", q9: "control", q10: "control", q11: "control", q12: "control",
  q13: "curiosity", q14: "curiosity", q15: "curiosity", q16: "curiosity", q17: "curiosity", q18: "curiosity",
  q19: "confidence", q20: "confidence", q21: "confidence", q22: "confidence", q23: "confidence", q24: "confidence",
};

export const calculateCaasScores = (responses: Record<string, number>): CaasResult => {
  // 24 items, 6 per subscale, all positively keyed (1-5). Score by the explicit
  // item->subscale map so reordering items can never silently misscore.
  const scales: Record<CaasSubscale, number[]> = {
    concern: [],
    control: [],
    curiosity: [],
    confidence: []
  };

  Object.entries(responses).forEach(([qid, value]) => {
    const subscale = CAAS_SUBSCALE_BY_ID[qid];
    if (subscale) scales[subscale].push(value);
  });

  const mean = (vals: number[]) => vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;

  const result = {
    concern: mean(scales.concern),
    control: mean(scales.control),
    curiosity: mean(scales.curiosity),
    confidence: mean(scales.confidence)
  };

  return {
    ...result,
    total_score: (result.concern + result.control + result.curiosity + result.confidence) / 4
  };
};

export const saveCaasAssessment = async (studentId: string, responses: Record<string, number>, cycleNumber?: number) => {
  const scores = calculateCaasScores(responses);

  const query = supabase
    .from("caas_assessments")
    .insert({
      student_id: studentId,
      item_responses: responses,
      concern: scores.concern,
      control: scores.control,
      curiosity: scores.curiosity,
      confidence: scores.confidence,
      total_score: scores.total_score,
      percentile: Math.round((scores.total_score / 5) * 100),
      ...(cycleNumber ? { cycle_number: cycleNumber } : {})
    })
    .select()
    .single();

  const { data, error } = await withTimeout(query);

  if (error) throw error;
  // Background: warm the deep-synthesis cache if all recommended assessments are done.
  void triggerSynthesisIfReady(studentId);
  return data;
};
