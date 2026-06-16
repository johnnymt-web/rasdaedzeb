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

function clampPct(pct: number): number {
  return Math.min(100, Math.max(0, Math.round(pct)));
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
  const resultsObj = (raw && !Array.isArray(raw.results) && typeof raw.results === 'object') ? raw.results : null;
  const itemResponses = raw?.answers || raw?.item_responses;
  const hasItemResponses = itemResponses && typeof itemResponses === 'object' && Object.keys(itemResponses).length > 0;
  const hasFlatScores = raw && (raw.openness !== undefined || resultsObj?.openness !== undefined);
  const hasResultArray = !!(raw && Array.isArray(raw.results) && raw.results.length > 0);
  const isComplete = hasFlatScores || hasResultArray || hasItemResponses;
  
  let results: NormalizedAssessmentResult[] = [];
  
  if (isComplete && raw) {
    let openness = Number(raw.openness ?? resultsObj?.openness) || 0;
    let conscientiousness = Number(raw.conscientiousness ?? resultsObj?.conscientiousness) || 0;
    let extraversion = Number(raw.extraversion ?? resultsObj?.extraversion) || 0;
    let agreeableness = Number(raw.agreeableness ?? resultsObj?.agreeableness) || 0;
    let neuroticism = Number(raw.neuroticism ?? resultsObj?.neuroticism) || 0;

    const allZero = openness === 0 && conscientiousness === 0 && extraversion === 0 && agreeableness === 0 && neuroticism === 0;

    if (hasItemResponses && (allZero || !hasFlatScores)) {
      const scores: Record<string, number[]> = {
        openness: [],
        conscientiousness: [],
        extraversion: [],
        agreeableness: [],
        neuroticism: []
      };

      const TRAIT_MAP: Record<string, string> = {
        e: "extraversion",
        a: "agreeableness",
        c: "conscientiousness",
        n: "neuroticism",
        o: "openness"
      };

      const SIGN_MAP: Record<string, number> = {
        e1: 1, e2: -1, e3: 1, e4: -1, e5: 1, e6: -1, e7: 1, e8: -1, e9: 1, e10: -1,
        a1: -1, a2: 1, a3: -1, a4: 1, a5: -1, a6: 1, a7: -1, a8: 1, a9: 1, a10: 1,
        c1: 1, c2: -1, c3: 1, c4: -1, c5: 1, c6: -1, c7: 1, c8: -1, c9: 1, c10: 1,
        n1: 1, n2: -1, n3: 1, n4: -1, n5: 1, n6: 1, n7: 1, n8: 1, n9: 1, n10: 1,
        o1: 1, o2: -1, o3: 1, o4: -1, o5: 1, o6: -1, o7: 1, o8: 1, o9: 1, o10: 1,
      };

      Object.entries(itemResponses).forEach(([qid, val]: [string, any]) => {
        const prefix = qid.charAt(0);
        const trait = TRAIT_MAP[prefix];
        const sign = SIGN_MAP[qid];
        const numVal = Number(val);
        if (trait && sign !== undefined && !isNaN(numVal)) {
          const actualScore = sign === 1 ? numVal : 6 - numVal;
          scores[trait].push(actualScore);
        }
      });

      const normalizeTrait = (vals: number[]) => {
        if (vals.length === 0) return 0;
        const sum = vals.reduce((a, b) => a + b, 0);
        return Math.round((sum / (vals.length * 5)) * 100);
      };

      openness = normalizeTrait(scores.openness);
      conscientiousness = normalizeTrait(scores.conscientiousness);
      extraversion = normalizeTrait(scores.extraversion);
      agreeableness = normalizeTrait(scores.agreeableness);
      neuroticism = normalizeTrait(scores.neuroticism);
    }

    if (hasFlatScores || hasItemResponses) {
      results = [
        { key: "openness", label: "Curiosity and imagination", pct: openness, scale: "0-100", source: "big_five" },
        { key: "conscientiousness", label: "Organization and follow-through", pct: conscientiousness, scale: "0-100", source: "big_five" },
        { key: "extraversion", label: "Social energy", pct: extraversion, scale: "0-100", source: "big_five" },
        { key: "agreeableness", label: "Cooperation and empathy", pct: agreeableness, scale: "0-100", source: "big_five" },
        { key: "neuroticism", label: "Emotional sensitivity / stress response", pct: neuroticism, scale: "0-100", source: "big_five" },
      ];
    } else if (hasResultArray) {
      results = raw.results.map((r: any) => {
        const key = (r?.category || r?.key || r?.label || "unknown").toLowerCase();
        let label = r?.label || r?.category || r?.key || "Unknown";
        
        if (key.includes('openness')) label = 'Curiosity and imagination';
        if (key.includes('conscientiousness')) label = 'Organization and follow-through';
        if (key.includes('extraversion')) label = 'Social energy';
        if (key.includes('agreeableness')) label = 'Cooperation and empathy';
        if (key.includes('neuroticism')) label = 'Emotional sensitivity / stress response';
        
        return {
          key: key,
          label: label,
          pct: Math.round(Number(r?.pct || r?.score) || 0),
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
  const resultsObj = (raw && !Array.isArray(raw.results) && typeof raw.results === 'object') ? raw.results : null;
  const isComplete = !!(raw && (raw.concern !== undefined || resultsObj?.concern !== undefined));
  
  let results: NormalizedAssessmentResult[] = [];
  if (isComplete && raw) {
    const concern = raw.concern ?? resultsObj?.concern;
    const control = raw.control ?? resultsObj?.control;
    const curiosity = raw.curiosity ?? resultsObj?.curiosity;
    const confidence = raw.confidence ?? resultsObj?.confidence;

    results = [
      { key: "concern", label: "Concern", score: concern, pct: scoreToPct(concern, "1-5"), scale: "1-5", source: "caas" },
      { key: "control", label: "Control", score: control, pct: scoreToPct(control, "1-5"), scale: "1-5", source: "caas" },
      { key: "curiosity", label: "Curiosity", score: curiosity, pct: scoreToPct(curiosity, "1-5"), scale: "1-5", source: "caas" },
      { key: "confidence", label: "Confidence", score: confidence, pct: scoreToPct(confidence, "1-5"), scale: "1-5", source: "caas" },
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
  const resultsObj = (raw && !Array.isArray(raw.results) && typeof raw.results === 'object') ? raw.results : null;
  let results: NormalizedAssessmentResult[] = [];
  let isComplete = false;

  if (raw) {
    if (raw.achievement !== undefined || resultsObj?.achievement !== undefined) {
      isComplete = true;
      const achievement = raw.achievement ?? resultsObj?.achievement;
      const independence = raw.independence ?? resultsObj?.independence;
      const recognition = raw.recognition ?? resultsObj?.recognition;
      const relationships = raw.relationships ?? resultsObj?.relationships;
      const support = raw.support ?? resultsObj?.support;
      const working_conditions = raw.working_conditions ?? resultsObj?.working_conditions;

      results = [
        { key: "achievement", label: "Achievement", score: achievement, pct: scoreToPct(achievement, "1-5"), scale: "1-5", source: "work_values" },
        { key: "independence", label: "Independence", score: independence, pct: scoreToPct(independence, "1-5"), scale: "1-5", source: "work_values" },
        { key: "recognition", label: "Recognition", score: recognition, pct: scoreToPct(recognition, "1-5"), scale: "1-5", source: "work_values" },
        { key: "relationships", label: "Relationships", score: relationships, pct: scoreToPct(relationships, "1-5"), scale: "1-5", source: "work_values" },
        { key: "support", label: "Support", score: support, pct: scoreToPct(support, "1-5"), scale: "1-5", source: "work_values" },
        { key: "working_conditions", label: "Working Conditions", score: working_conditions, pct: scoreToPct(working_conditions, "1-5"), scale: "1-5", source: "work_values" },
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
        { key: "self_awareness", label: "Self-Awareness", score: raw.self_awareness, pct: clampPct(raw.self_awareness_pct ?? scoreToPct(raw.self_awareness, "1-5")), scale: "1-5", source: "eq" },
        { key: "self_management", label: "Self-Management", score: raw.self_management, pct: clampPct(raw.self_management_pct ?? scoreToPct(raw.self_management, "1-5")), scale: "1-5", source: "eq" },
        { key: "social_awareness", label: "Social Awareness", score: raw.social_awareness, pct: clampPct(raw.social_awareness_pct ?? scoreToPct(raw.social_awareness, "1-5")), scale: "1-5", source: "eq" },
        { key: "relationship_management", label: "Relationship Management", score: raw.relationship_management, pct: clampPct(raw.relationship_management_pct ?? scoreToPct(raw.relationship_management, "1-5")), scale: "1-5", source: "eq" },
      ];
    } else if (Array.isArray(raw.results)) {
      isComplete = true;
      results = raw.results.map((r: any) => ({
        key: (r.category || r.key || r.label).toLowerCase().replace(/\s+/g, '_'),
        label: r.category || r.label,
        score: r.score,
        pct: r.pct !== undefined ? clampPct(r.pct) : (r.score ? clampPct(scoreToPct(r.score, "1-5")) : undefined),
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
} | any[]) {
  let stdRows: any[] = [];
  let bigFiveRows: any[] = [];
  let caasRows: any[] = [];
  let workValuesRows: any[] = [];
  let eqRows: any[] = [];

  if (Array.isArray(rawData)) {
    // New flat structure: group by resolved type
    for (const row of rawData) {
      const type = row.assessment_type ?? row.type ?? 'unknown';
      if (type === 'riasec' || type === 'std') {
        stdRows.push(row);
      } else if (type === 'skills') {
        stdRows.push(row);
      } else if (type === 'bigfive') {
        bigFiveRows.push(row);
      } else if (type === 'caas') {
        caasRows.push(row);
      } else if (type === 'workvalues') {
        workValuesRows.push(row);
      } else if (type === 'eq') {
        eqRows.push(row);
      }
    }
  } else {
    // Legacy object structure
    stdRows = rawData.std || [];
    bigFiveRows = rawData.bigFive || [];
    caasRows = rawData.caas || [];
    workValuesRows = rawData.workValues || [];
    eqRows = rawData.eq || [];
  }

  const riasecRaw = stdRows.find((a: any) => a.assessment_type === 'riasec' || !a.assessment_type || a.assessment_type === 'std' || a.type === 'riasec' || a.type === 'std');
  const skillsRaw = stdRows.find((a: any) => a.assessment_type === 'skills' || a.type === 'skills');
  const bigFiveRaw = bigFiveRows[0] || stdRows.find((a: any) => a.assessment_type === 'bigfive' || a.type === 'bigfive');
  const caasRaw = caasRows[0] || stdRows.find((a: any) => a.assessment_type === 'caas' || a.type === 'caas');
  const workValuesRaw = workValuesRows[0] || stdRows.find((a: any) => a.assessment_type === 'workvalues' || a.type === 'workvalues');
  const eqRaw = eqRows[0] || stdRows.find((a: any) => a.assessment_type === 'eq' || a.type === 'eq');

  return {
    riasec: normalizeRiasecAssessment(riasecRaw),
    skills: normalizeSkillsAssessment(skillsRaw),
    bigFive: normalizeBigFiveAssessment(bigFiveRaw),
    caas: normalizeCaasAssessment(caasRaw),
    workValues: normalizeWorkValuesAssessment(workValuesRaw),
    eq: normalizeEqAssessment(eqRaw)
  };
}

/**
 * Cross-references a student's completed assessments against the
 * recommended assessments for their grade band.
 */
export function getAssessmentCompletionStatus(
  normData: ReturnType<typeof normalizeAllAssessments>,
  recommendedIds: string[]
): { total: number; completed: number; pct: number; missing: string[] } {
  const assessmentMap: Record<string, NormalizedAssessment> = {
    riasec: normData.riasec,
    skills: normData.skills,
    bigfive: normData.bigFive,
    caas: normData.caas,
    workvalues: normData.workValues,
    eq: normData.eq,
  };

  const missing: string[] = [];
  let completed = 0;

  for (const id of recommendedIds) {
    const a = assessmentMap[id];
    if (a && a.isComplete) {
      completed++;
    } else {
      missing.push(a?.label || id);
    }
  }

  return {
    total: recommendedIds.length,
    completed,
    pct: recommendedIds.length > 0 ? Math.round((completed / recommendedIds.length) * 100) : 0,
    missing,
  };
}
