import i18next from "i18next";

export interface RIASECResult {
  category: string;
  pct: number;
  score?: number;
}

export const RIASEC_CATEGORIES = [
  "Realistic",
  "Investigative",
  "Artistic",
  "Social",
  "Enterprising",
  "Conventional"
] as const;

export type RIASECCategory = typeof RIASEC_CATEGORIES[number];

export const categoryColors: Record<string, string> = {
  Realistic: "bg-primary",
  Investigative: "bg-secondary",
  Artistic: "bg-accent",
  Social: "bg-primary",
  Enterprising: "bg-secondary",
  Conventional: "bg-accent",
};

/**
 * Normalizes RIASEC results from various possible database formats
 * (Array of objects or flat object) into a consistent sorted array.
 */
export const normalizeRiasecResults = (raw: unknown) => {
  if (!raw) return [];
  const t = i18next.t.bind(i18next);
  
  if (Array.isArray(raw)) {
    return (raw as any[]).map(r => {
      const category = r.category || r.key || r.label || "Unknown";
      // Fallback to score if pct is missing or 0, but ensure we don't divide by zero if we were to scale
      const value = r.pct || r.score || 0;
      
      return {
        name: category,
        label: t(`riasec.${category}`, { defaultValue: category }),
        pct: value,
        color: categoryColors[category] || "bg-primary"
      };
    }).sort((a, b) => b.pct - a.pct);
  }
  
  // Fallback for flat object format: { Realistic: 80, Social: 40, ... }
  const obj = raw as Record<string, number>;
  return RIASEC_CATEGORIES.map((cat) => ({
    name: cat,
    label: t(`riasec.${cat}`, { defaultValue: cat }),
    pct: obj[cat] ?? 0,
    color: categoryColors[cat] || "bg-primary",
  })).sort((a, b) => b.pct - a.pct);
};

/**
 * Returns the top N categories from normalized results.
 */
export const getTopInterests = (raw: unknown, limit = 3) => {
  return normalizeRiasecResults(raw).slice(0, limit);
};
