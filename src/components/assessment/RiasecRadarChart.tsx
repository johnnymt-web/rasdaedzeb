import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip,
} from "recharts";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

interface AssessmentResult {
  category: string;
  pct: number;
}

interface AssessmentEntry {
  id: string;
  results: AssessmentResult[];
  completed_at: string;
  created_at: string;
}

interface RiasecRadarChartProps {
  assessments: AssessmentEntry[];
  /** Max number of assessments to overlay (most recent first). Default 3. */
  maxOverlays?: number;
  /** Custom categories to map (defaults to RIASEC) */
  categories?: string[];
}

const COLORS = [
  "#7C3AED",
  "#0EA5E9",
  "#F59E0B",
  "#10B981",
];

const DEFAULT_CATEGORIES = ["Realistic", "Investigative", "Artistic", "Social", "Enterprising", "Conventional"];

const RiasecRadarChart = ({ assessments, maxOverlays = 3, categories = DEFAULT_CATEGORIES }: RiasecRadarChartProps) => {
  const { t } = useTranslation();
  const visible = assessments.slice(0, maxOverlays);

  // Build unified data: one entry per category with a key per assessment
  const data = categories.map((cat) => {
    const entry: Record<string, string | number> = { 
      category: t(`assessment.riasec.categories.${cat}`, cat) 
    };
    visible.forEach((a, i) => {
      const resultsArray = Array.isArray(a.results) ? a.results : [];
      const r = resultsArray.find((res) => {
        const resCat = (res.category || res.key || res.label || "").toLowerCase();
        return resCat === cat.toLowerCase();
      });
      // Fallback to score if pct is missing
      entry[`a${i}`] = Number(r?.pct || r?.score) || 0;
    });
    return entry;
  });

  const labels = visible.map((a, i) => {
    const date = a.completed_at || a.created_at;
    return i === 0 ? t("assessment.history.latest_badge") : format(new Date(date), "MMM d, yyyy");
  });

  return (
    <div className="w-full h-[340px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
          <PolarGrid stroke="currentColor" strokeOpacity={0.15} />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: "currentColor", fontSize: 12, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tickCount={5}
            tick={{ fontSize: 10, fill: "currentColor", opacity: 0.5 }}
          />
          {visible.map((_, i) => (
            <Radar
              key={i}
              name={labels[i]}
              dataKey={`a${i}`}
              stroke={COLORS[i]}
              fill={COLORS[i]}
              fillOpacity={i === 0 ? 0.35 : 0.12}
              strokeWidth={i === 0 ? 2.5 : 1.5}
              strokeDasharray={i === 0 ? undefined : "5 3"}
            />
          ))}
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: number) => [`${value}%`]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiasecRadarChart;
