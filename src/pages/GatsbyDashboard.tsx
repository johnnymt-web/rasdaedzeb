import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Building2, Users, GraduationCap, Briefcase,
  MapPin, BookOpen, UserCheck, ChevronDown, ChevronUp,
  CheckCircle2, Clock, AlertCircle, Plus, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GatsbyBenchmark {
  id: number;
  title: string;
  description: string;
  category: string;
}

interface BenchmarkProgress {
  benchmark_id: number;
  attainment_level: number;
  evidence_notes: string | null;
}

const BENCHMARK_ICONS: Record<number, any> = {
  1: BookOpen,
  2: BarChart3,
  3: UserCheck,
  4: GraduationCap,
  5: Building2,
  6: MapPin,
  7: GraduationCap,
  8: Users,
};

const ATTAINMENT_LABELS = [
  { level: 0, label: "Not Started", color: "bg-gray-500/10 text-gray-500", icon: Clock },
  { level: 1, label: "Developing", color: "bg-amber-500/10 text-amber-600", icon: AlertCircle },
  { level: 2, label: "Achieving", color: "bg-blue-500/10 text-blue-600", icon: BarChart3 },
  { level: 3, label: "Fully Achieved", color: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle2 },
];

const DEFAULT_BENCHMARKS: GatsbyBenchmark[] = [
  { id: 1, title: "A Stable Careers Programme", description: "Every school should have an embedded programme of career education and guidance.", category: "programme" },
  { id: 2, title: "Learning from Career & Labour Market Information", description: "Every student should have access to good quality information about future study options and labour market opportunities.", category: "information" },
  { id: 3, title: "Addressing the Needs of Each Pupil", description: "Opportunities for advice and support need to be tailored to the needs of each student.", category: "guidance" },
  { id: 4, title: "Linking Curriculum Learning to Careers", description: "All teachers should link curriculum learning with careers.", category: "curriculum" },
  { id: 5, title: "Encounters with Employers and Employees", description: "Every student should have multiple opportunities to learn from employers about work.", category: "employer" },
  { id: 6, title: "Experiences of Workplaces", description: "Every student should have first-hand experiences of the workplace.", category: "experience" },
  { id: 7, title: "Encounters with Further and Higher Education", description: "All students should understand the full range of learning opportunities.", category: "education" },
  { id: 8, title: "Personal Guidance", description: "Every student should have opportunities for guidance interviews with a careers adviser.", category: "guidance" },
];

export default function GatsbyDashboard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [benchmarks] = useState<GatsbyBenchmark[]>(DEFAULT_BENCHMARKS);
  const [progress, setProgress] = useState<Record<number, BenchmarkProgress>>({});
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const currentYear = `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(2)}`;

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    if (!profile?.school_id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("school_gatsby_progress" as any)
        .select("*")
        .eq("school_id", profile.school_id)
        .eq("academic_year", currentYear);

      if (!error && data) {
        const map: Record<number, BenchmarkProgress> = {};
        data.forEach((row: any) => {
          map[row.benchmark_id] = {
            benchmark_id: row.benchmark_id,
            attainment_level: row.attainment_level,
            evidence_notes: row.evidence_notes,
          };
        });
        setProgress(map);
      }
    } catch (err) {
      console.error("Failed to load Gatsby progress:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (benchmarkId: number, level: number) => {
    if (!profile?.school_id || !user) return;
    setSaving(true);
    try {
      await supabase.from("school_gatsby_progress" as any).upsert({
        school_id: profile.school_id,
        benchmark_id: benchmarkId,
        academic_year: currentYear,
        attainment_level: level,
        reviewed_by: user.id,
        last_reviewed_at: new Date().toISOString(),
      }, { onConflict: "school_id,benchmark_id,academic_year" });

      setProgress((prev) => ({
        ...prev,
        [benchmarkId]: {
          ...prev[benchmarkId],
          benchmark_id: benchmarkId,
          attainment_level: level,
        },
      }));
      toast({ title: "Updated", description: `Benchmark ${benchmarkId} progress saved.` });
    } catch (err) {
      toast({ title: "Error", description: "Failed to save progress.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Overall score calculation
  const totalScore = benchmarks.reduce((sum, b) => sum + (progress[b.id]?.attainment_level || 0), 0);
  const maxScore = benchmarks.length * 3;
  const overallPercent = Math.round((totalScore / maxScore) * 100);
  const achieved = benchmarks.filter((b) => (progress[b.id]?.attainment_level || 0) >= 3).length;

  return (
    <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-primary" />
                Gatsby Benchmarks
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your school's career guidance quality — Academic Year {currentYear}
              </p>
            </div>
          </div>

          {/* Overall Score Card */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="card-warm p-6 md:col-span-2">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Overall Compliance</h3>
              <div className="flex items-end gap-4">
                <span className="text-5xl font-heading font-bold text-foreground">{overallPercent}%</span>
                <div className="flex-1 mb-2">
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        overallPercent >= 75 ? "bg-emerald-500" :
                        overallPercent >= 50 ? "bg-blue-500" :
                        overallPercent >= 25 ? "bg-amber-500" : "bg-gray-400"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${overallPercent}%` }}
                      transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="card-warm p-6 flex flex-col items-center justify-center">
              <span className="text-4xl font-heading font-bold text-emerald-600">{achieved}</span>
              <span className="text-sm text-muted-foreground">of {benchmarks.length} Fully Achieved</span>
            </div>
          </div>

          {/* Benchmarks List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {benchmarks.map((bm) => {
                const Icon = BENCHMARK_ICONS[bm.id] || BookOpen;
                const level = progress[bm.id]?.attainment_level ?? 0;
                const attainment = ATTAINMENT_LABELS[level];
                const isExpanded = expandedId === bm.id;

                return (
                  <motion.div
                    key={bm.id}
                    layout
                    className="card-warm border border-border overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : bm.id)}
                      className="w-full flex items-center gap-4 p-5 text-left hover:bg-muted/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground">B{bm.id}</span>
                          <h3 className="font-heading font-semibold text-foreground truncate">{bm.title}</h3>
                        </div>
                      </div>
                      <Badge className={`${attainment.color} text-xs shrink-0`}>
                        {attainment.label}
                      </Badge>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="px-5 pb-5 border-t border-border/50"
                      >
                        <p className="text-sm text-muted-foreground mt-4 mb-4">{bm.description}</p>
                        <div className="flex gap-2">
                          {ATTAINMENT_LABELS.map((att) => (
                            <button
                              key={att.level}
                              onClick={() => updateProgress(bm.id, att.level)}
                              disabled={saving}
                              className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-semibold border-2 transition-all ${
                                level === att.level
                                  ? `${att.color} border-current shadow-sm`
                                  : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
                              }`}
                            >
                              {att.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
    </div>
  );
}
