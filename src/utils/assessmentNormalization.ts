export type NormalizedAssessmentResult = {
  key: string;
  label: string;
  score?: number;
  pct?: number;
  scale?: "1-5" | "0-100" | "raw" | "unknown";
  source:
    | "riasec"
    | "skills"
    | "big_five"
    | "caas"
    | "work_values"
    | "eq"
    | "onet";
  description?: string;
};

export type NormalizedAssessment = {
  id: string;
  type:
    | "riasec"
    | "skills"
    | "bigfive"
    | "caas"
    | "workvalues"
    | "eq"
    | "onet";
  label: string;
  completedAt?: string;
  results: NormalizedAssessmentResult[];
  isComplete: boolean;
  missingReason?: string;
};

export function scoreToPct(score: number, scale: string): number {
  if (scale === "1-5") {
    return Math.round((score / 5) * 100);
  }
  if (scale === "0-100") {
    return Math.round(score);
  }
  return score;
}

export function isAssessmentComplete(assessment: NormalizedAssessment | null | undefined): boolean {
  if (!assessment) return false;
  return assessment.isComplete && assessment.results && assessment.results.length > 0;
}

export function getTopResults(results: NormalizedAssessmentResult[], limit: number = 3): NormalizedAssessmentResult[] {
  if (!results) return [];
  return [...results].sort((a, b) => (b.pct || 0) - (a.pct || 0)).slice(0, limit);
}

export function getLowResults(results: NormalizedAssessmentResult[], threshold: number = 50): NormalizedAssessmentResult[] {
  if (!results) return [];
  return results.filter(r => (r.pct !== undefined ? r.pct < threshold : false));
}

export function normalizeRiasecAssessment(raw: any): NormalizedAssessment {
  const isComplete = !!(raw && raw.results && Array.isArray(raw.results) && raw.results.length > 0);
  
  const results: NormalizedAssessmentResult[] = isComplete ? raw.results.map((r: any) => ({
    key: r?.category || r?.key || "unknown",
    label: r?.category || r?.label || "Unknown",
    pct: r?.pct || r?.score || 0,
    score: r?.score,
    scale: "0-100",
    source: "riasec" as const
  })) : [];

  return {
    id: raw?.id || "missing-riasec",
    type: "riasec",
    label: "Career Interests (RIASEC)",
    completedAt: raw?.completed_at || raw?.created_at,
    isComplete,
    results,
    missingReason: isComplete ? undefined : "Not completed yet"
  };
}

export function normalizeSkillsAssessment(raw: any): NormalizedAssessment {
  const isComplete = !!(raw && raw.results && Array.isArray(raw.results) && raw.results.length > 0);
  
  const results: NormalizedAssessmentResult[] = isComplete ? raw.results.map((r: any) => ({
    key: r?.category || r?.key || "unknown",
    label: r?.category || r?.label || "Unknown",
    pct: r?.pct || r?.score || 0,
    score: r?.score,
    scale: "0-100",
    source: "skills" as const
  })) : [];

  return {
    id: raw?.id || "missing-skills",
    type: "skills",
    label: "Employability Skills",
    completedAt: raw?.completed_at || raw?.created_at,
    isComplete,
    results,
    missingReason: isComplete ? undefined : "Not completed yet"
  };
}

export function normalizeBigFiveAssessment(raw: any): NormalizedAssessment {
  const isComplete = !!(raw && (raw.openness !== undefined || (Array.isArray(raw.results) && raw.results.length > 0)));
  
  let results: NormalizedAssessmentResult[] = [];
  if (isComplete && raw) {
    if (raw.openness !== undefined) {
      results = [
        { key: "openness", label: "Curiosity and imagination", pct: raw.openness, scale: "0-100", source: "big_five" },
        { key: "conscientiousness", label: "Organization and follow-through", pct: raw.conscientiousness, scale: "0-100", source: "big_five" },
        { key: "extraversion", label: "Social energy", pct: raw.extraversion, scale: "0-100", source: "big_five" },
        { key: "agreeableness", label: "Cooperation and empathy", pct: raw.agreeableness, scale: "0-100", source: "big_five" },
        { key: "neuroticism", label: "Emotional sensitivity / stress response", pct: raw.neuroticism, scale: "0-100", source: "big_five" },
      ];
    } else if (Array.isArray(raw.results)) {
      results = raw.results.map((r: any) => {
        let label = r?.category || r?.label || r?.key || "Unknown";
        if (label?.toLowerCase() === 'openness') label = 'Curiosity and imagination';
        if (label?.toLowerCase() === 'conscientiousness') label = 'Organization and follow-through';
        if (label?.toLowerCase() === 'extraversion') label = 'Social energy';
        if (label?.toLowerCase() === 'agreeableness') label = 'Cooperation and empathy';
        if (label?.toLowerCase() === 'neuroticism') label = 'Emotional sensitivity / stress response';
        return {
          key: r?.category || r?.key || label?.toLowerCase(),
          label,
          pct: r?.pct || r?.score || 0,
          scale: "0-100",
          source: "big_five" as const
        };
      });
    }
  }

  return {
    id: raw?.id || "missing-bigfive",
    type: "bigfive",
    label: "Learning and Working Style",
    completedAt: raw?.completed_at || raw?.created_at,
    isComplete,
    results,
    missingReason: isComplete ? undefined : "Not completed yet"
  };
}

export function normalizeCaasAssessment(raw: any): NormalizedAssessment {
  const isComplete = !!(raw && raw.concern !== undefined);
  
  let results: NormalizedAssessmentResult[] = [];
  if (isComplete && raw) {
    results = [
      { key: "concern", label: "Concern", score: raw.concern, pct: scoreToPct(raw.concern, "1-5"), scale: "1-5", source: "caas" },
      { key: "control", label: "Control", score: raw.control, pct: scoreToPct(raw.control, "1-5"), scale: "1-5", source: "caas" },
      { key: "curiosity", label: "Curiosity", score: raw.curiosity, pct: scoreToPct(raw.curiosity, "1-5"), scale: "1-5", source: "caas" },
      { key: "confidence", label: "Confidence", score: raw.confidence, pct: scoreToPct(raw.confidence, "1-5"), scale: "1-5", source: "caas" },
    ];
  }

  return {
    id: raw?.id || "missing-caas",
    type: "caas",
    label: "Career Adaptability",
    completedAt: raw?.completed_at || raw?.created_at,
    isComplete,
    results,
    missingReason: isComplete ? undefined : "Not completed yet"
  };
}

export function normalizeWorkValuesAssessment(raw: any): NormalizedAssessment {
  let results: NormalizedAssessmentResult[] = [];
  let isComplete = false;

  if (raw) {
    if (raw.achievement !== undefined) {
      isComplete = true;
      results = [
        { key: "achievement", label: "Achievement", score: raw.achievement, pct: scoreToPct(raw.achievement, "1-5"), scale: "1-5", source: "work_values" },
        { key: "independence", label: "Independence", score: raw.independence, pct: scoreToPct(raw.independence, "1-5"), scale: "1-5", source: "work_values" },
        { key: "recognition", label: "Recognition", score: raw.recognition, pct: scoreToPct(raw.recognition, "1-5"), scale: "1-5", source: "work_values" },
        { key: "relationships", label: "Relationships", score: raw.relationships, pct: scoreToPct(raw.relationships, "1-5"), scale: "1-5", source: "work_values" },
        { key: "support", label: "Support", score: raw.support, pct: scoreToPct(raw.support, "1-5"), scale: "1-5", source: "work_values" },
        { key: "working_conditions", label: "Working Conditions", score: raw.working_conditions, pct: scoreToPct(raw.working_conditions, "1-5"), scale: "1-5", source: "work_values" },
      ];
    } else if (Array.isArray(raw.results)) {
      isComplete = true;
      results = raw.results.map((r: any) => ({
        key: (r.category || r.key || r.label).toLowerCase().replace(/\s+/g, '_'),
        label: r.category || r.label,
        score: r.score,
        pct: r.pct || (r.score ? scoreToPct(r.score, "1-5") : undefined),
        scale: "1-5",
        source: "work_values" as const
      }));
    }
  }

  return {
    id: raw?.id || "missing-workvalues",
    type: "workvalues",
    label: "Work Values",
    completedAt: raw?.completed_at || raw?.created_at,
    isComplete,
    results,
    missingReason: isComplete ? undefined : "Not completed yet"
  };
}

export function normalizeEqAssessment(raw: any): NormalizedAssessment {
  let results: NormalizedAssessmentResult[] = [];
  let isComplete = false;

  if (raw) {
    if (raw.self_awareness !== undefined) {
      isComplete = true;
      results = [
        { key: "self_awareness", label: "Self-Awareness", score: raw.self_awareness, pct: raw.self_awareness_pct ?? scoreToPct(raw.self_awareness, "1-5"), scale: "1-5", source: "eq" },
        { key: "self_management", label: "Self-Management", score: raw.self_management, pct: raw.self_management_pct ?? scoreToPct(raw.self_management, "1-5"), scale: "1-5", source: "eq" },
        { key: "social_awareness", label: "Social Awareness", score: raw.social_awareness, pct: raw.social_awareness_pct ?? scoreToPct(raw.social_awareness, "1-5"), scale: "1-5", source: "eq" },
        { key: "relationship_management", label: "Relationship Management", score: raw.relationship_management, pct: raw.relationship_management_pct ?? scoreToPct(raw.relationship_management, "1-5"), scale: "1-5", source: "eq" },
      ];
    } else if (Array.isArray(raw.results)) {
      isComplete = true;
      results = raw.results.map((r: any) => ({
        key: (r.category || r.key || r.label).toLowerCase().replace(/\s+/g, '_'),
        label: r.category || r.label,
        score: r.score,
        pct: r.pct || (r.score ? scoreToPct(r.score, "1-5") : undefined),
        scale: "1-5",
        source: "eq" as const
      }));
    }
  }

  return {
    id: raw?.id || "missing-eq",
    type: "eq",
    label: "Emotional Skills Reflection",
    completedAt: raw?.completed_at || raw?.created_at,
    isComplete,
    results,
    missingReason: isComplete ? undefined : "Not completed yet"
  };
}

export function normalizeAllAssessments(rawData: {
  std?: any[];
  bigFive?: any[];
  caas?: any[];
  workValues?: any[];
  eq?: any[];
}) {
  const riasecRaw = rawData.std?.find((a: any) => a.assessment_type === 'riasec' || !a.assessment_type || a.assessment_type === 'std');
  const skillsRaw = rawData.std?.find((a: any) => a.assessment_type === 'skills');
  const bigFiveRaw = rawData.bigFive?.[0] || rawData.std?.find((a: any) => a.assessment_type === 'bigfive');
  const caasRaw = rawData.caas?.[0] || rawData.std?.find((a: any) => a.assessment_type === 'caas');
  const workValuesRaw = rawData.workValues?.[0] || rawData.std?.find((a: any) => a.assessment_type === 'workvalues');
  const eqRaw = rawData.eq?.[0] || rawData.std?.find((a: any) => a.assessment_type === 'eq');

  return {
    riasec: normalizeRiasecAssessment(riasecRaw),
    skills: normalizeSkillsAssessment(skillsRaw),
    bigFive: normalizeBigFiveAssessment(bigFiveRaw),
    caas: normalizeCaasAssessment(caasRaw),
    workValues: normalizeWorkValuesAssessment(workValuesRaw),
    eq: normalizeEqAssessment(eqRaw)
  };
}
