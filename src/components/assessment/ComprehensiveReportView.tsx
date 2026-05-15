import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Info, Sparkles, Target, Users, Loader2, BookOpen, CheckCircle2, AlertCircle, BarChart3, ShieldCheck, Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { normalizeAllAssessments, getTopResults, getLowResults } from "@/utils/assessmentNormalization";
import OnetCareerSection from "./OnetCareerSection";


interface Props {
  studentId: string;
  grade?: string;
  isCounselorView?: boolean;
}

const ComprehensiveReportView = ({ studentId, grade: propGrade, isCounselorView }: Props) => {
  const { t } = useTranslation();
  const { user, profile: authProfile } = useAuth();
  const rawGrade = propGrade || authProfile?.grade || user?.user_metadata?.grade || "7";
  const numericGrade = parseInt(rawGrade.toString().replace(/\D/g, "")) || 7;

  const isVisible = (id: string) => {
    const g = numericGrade;
    if (g >= 11) return true;
    if (g >= 9) return ["riasec", "skills", "bigfive", "workvalues"].includes(id);
    return ["riasec", "skills"].includes(id);
  };

  const { data: normData, isLoading } = useQuery({
    queryKey: ["gold-standard-report-normalized", studentId],
    queryFn: async () => {
      const [std, bigFive, caas, workvalues] = await Promise.all([
        supabase.from("assessments").select("*").eq("user_id", studentId).order("created_at", { ascending: false }),
        supabase.from("big_five_assessments" as any).select("*").eq("student_id", studentId).order("completed_at", { ascending: false }).limit(1),
        supabase.from("caas_assessments" as any).select("*").eq("student_id", studentId).order("completed_at", { ascending: false }).limit(1),
        supabase.from("work_values_assessments").select("*").eq("student_id", studentId).order("completed_at", { ascending: false }).limit(1)
      ]);

      return normalizeAllAssessments({
        std: std.data || [],
        bigFive: bigFive.data || [],
        caas: caas.data || [],
        workValues: workvalues.data || [],
      });
    },
    enabled: !!studentId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!normData) return null;

  const { riasec, skills, bigFive, caas, workValues, eq } = normData;
  const anyCompleted = riasec.isComplete || skills.isComplete || bigFive.isComplete || caas.isComplete || workValues.isComplete || eq.isComplete;

  const topInterests = getTopResults(riasec.results, 3);
  const primaryInterest = topInterests[0]?.label || "Unknown";
  
  // Bug 4: Avoid deterministic personas. Use "Exploration Themes"
  const getExplorationTheme = () => {
    let key = "Balanced Exploration";
    const p = topInterests[0]?.key?.toLowerCase();
    
    if (p === 'realistic') key = "Practical & Hands-On Problem Solving";
    else if (p === 'investigative') key = "Analytical & Research-Driven";
    else if (p === 'artistic') key = "Creative & Expressive Design";
    else if (p === 'social') key = "Community Support & Empathy";
    else if (p === 'enterprising') key = "Leadership & Strategic Growth";
    else if (p === 'conventional') key = "Organized & Structured Operations";
    
    return key;
  };

  const explorationTheme = getExplorationTheme();

  return (
    <div className="space-y-12 pb-20">
      <div className="text-[10px] text-muted-foreground opacity-30 text-right">
        Diagnostic Context: Grade {numericGrade}
      </div>
      {/* SECTION 1: Report purpose and disclaimer */}
      <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex gap-4 items-start">
        <Info className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-heading font-bold text-lg text-primary-900 mb-2">Purpose of this Reflection Report</h3>
          <p className="text-sm text-primary-800 leading-relaxed">
            This report summarizes your current career exploration responses. <strong>It does not decide your future career.</strong> It is designed to support reflection, discussion, and planning with your counselor, teachers, and family. Your interests, strengths, and goals will evolve over time.
          </p>
        </div>
      </section>

      {/* SECTION 2: Completion status */}
      <section className="card-warm p-8 shadow-sm">
        <h3 className="text-xl font-heading font-bold mb-6">Your Exploration Progress</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: "riasec", a: riasec, icon: <Sparkles className="w-5 h-5"/>, link: "/student/assessment" },
            { id: "skills", a: skills, icon: <Target className="w-5 h-5"/>, link: "/student/assessment" },
            { id: "bigfive", a: bigFive, icon: <Users className="w-5 h-5"/>, link: "/student/assessment/bigfive" },
            { id: "caas", a: caas, icon: <ShieldCheck className="w-5 h-5"/>, link: "/student/assessment/caas" },
            { id: "workvalues", a: workValues, icon: <BookOpen className="w-5 h-5"/>, link: "/student/assessment/workvalues" },
            { id: "eq", a: eq, icon: <Heart className="w-5 h-5"/>, link: "/student/assessment/eq" },
          ].filter(item => isVisible(item.id)).map((item, idx) => (
            <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between ${item.a.isComplete ? 'bg-white border-green-200' : 'bg-muted/30 border-dashed border-muted-foreground/30'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.a.isComplete ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold">{item.a.label}</h4>
                  <p className="text-[10px] uppercase font-bold tracking-wider mt-1 text-muted-foreground">
                    {item.a.isComplete ? <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Completed</span> : <span className="text-amber-600 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {item.a.missingReason}</span>}
                  </p>
                </div>
              </div>
              {!item.a.isComplete && !isCounselorView && (
                <Link to={item.link}>
                  <Button variant="ghost" size="sm" className="text-xs">Start</Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {anyCompleted ? (
        <>
          {/* SECTION 3: Current exploration profile */}
          <section className="card-warm p-8 shadow-xl bg-gradient-to-br from-white to-primary/5">
            <h3 className="text-2xl font-heading font-black mb-6">Current Exploration Profile</h3>
            {riasec.isComplete ? (
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-primary/10 text-primary font-bold rounded-lg mb-4">
                  Theme: {explorationTheme}
                </div>
                <p className="text-muted-foreground">Your responses indicate a strong alignment with these interest areas. These are broad themes, not fixed career recommendations.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topInterests.map((r, i) => (
                    <div key={i} className="p-4 bg-white rounded-xl border shadow-sm">
                      <div className="text-xs font-bold text-muted-foreground uppercase">{r.label}</div>
                      <div className="text-2xl font-black text-primary mt-1">{r.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground italic">Career Interests assessment not completed yet.</p>
            )}
            
            {skills.isComplete && (
              <div className="mt-8 pt-6 border-t border-primary/10">
                <h4 className="font-heading font-bold mb-4">Top Employability Skills Confidence</h4>
                <div className="flex flex-wrap gap-3">
                  {getTopResults(skills.results, 3).map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-teal-50 text-teal-700 font-medium text-sm rounded-full border border-teal-200">
                      {s.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* SECTION 4: Learning and working style */}
          {isVisible("bigfive") && bigFive.isComplete && (
            <section className="card-warm p-8 shadow-sm">
              <h3 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-500" />
                Learning and Working Style
              </h3>
              <p className="text-muted-foreground text-sm mb-6">This reflects how you tend to approach learning, interact with others, and manage your tasks.</p>
              <div className="grid md:grid-cols-2 gap-6">
                {bigFive.results.map((r, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span>{r.label}</span>
                      <span className="text-violet-600">{r.pct}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${r.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SECTION 5: Career readiness (CAAS) */}
          {isVisible("caas") && (
            <section className="card-warm p-8 shadow-sm">
              <h3 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Career Readiness
            </h3>
            {caas.isComplete ? (
              <>
                <p className="text-muted-foreground text-sm mb-6">These dimensions show your readiness to plan for the future, take responsibility, and explore your options.</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {caas.results.map((r, i) => (
                    <div key={i} className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <div className="text-emerald-800 font-bold mb-1">{r.label}</div>
                      <div className="text-2xl font-black text-emerald-600">{r.score?.toFixed(1)} <span className="text-xs font-normal text-emerald-600/60">/ 5</span></div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-emerald-100 text-sm">
                  {getLowResults(caas.results, 60).length > 0 ? (
                    <div className="text-amber-700 bg-amber-50 p-4 rounded-lg">
                      <strong>Growth Area:</strong> You may benefit from extra support around {getLowResults(caas.results, 60).map(r => r.label.toLowerCase()).join(', ')}. Discuss this with your counselor.
                    </div>
                  ) : (
                    <div className="text-emerald-700 bg-emerald-50 p-4 rounded-lg">
                      <strong>Strength:</strong> You are showing strong adaptability across planning and exploration areas!
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground italic">Career Adaptability reflection has not been completed yet.</p>
            )}
          </section>
        )}

          {/* SECTION 6: Work Values */}
          {isVisible("workvalues") && workValues.isComplete && (
            <section className="card-warm p-8 shadow-sm">
              <h3 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-rose-500" />
                Core Work Values
              </h3>
              <p className="text-muted-foreground text-sm mb-6">These are the aspects of an environment that you value most. Consider these as you explore future options.</p>
              <div className="flex flex-wrap gap-4">
                {getTopResults(workValues.results, 3).map((r, i) => (
                  <div key={i} className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg shadow-sm font-medium">
                    {r.label}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SECTION 7: Emotional and social reflection (EQ) */}
          {isVisible("eq") && eq.isComplete && (
            <section className="card-warm p-8 shadow-sm">
              <h3 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
                <Heart className="w-5 h-5 text-blue-500" />
                Emotional Skills Reflection
              </h3>
              <p className="text-muted-foreground text-sm mb-6">Self-awareness and empathy are key to professional growth. These are not fixed traits, but skills you can develop.</p>
              <div className="grid md:grid-cols-2 gap-4">
                {eq.results.map((r, i) => (
                  <div key={i} className="p-4 rounded-xl border bg-blue-50/30">
                    <div className="text-sm font-bold text-blue-900 mb-2">{r.label}</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${r.pct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-blue-600">{r.score?.toFixed(1)} / 5</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SECTION 8: Suggested exploration areas */}
          <section className="card-warm p-8 shadow-sm border-t-4 border-t-primary">
            <h3 className="text-2xl font-heading font-bold mb-6">Suggested Exploration Areas</h3>
            {riasec.isComplete ? (
              <OnetCareerSection riasecCode={topInterests.map(i => i.key[0].toUpperCase()).join("").slice(0, 3)} />
            ) : (
              <p className="text-muted-foreground italic">Complete your Career Interests assessment to see suggested fields.</p>
            )}
          </section>

          {/* SECTION 9: Recommended next actions */}
          <section className="card-warm p-8 shadow-sm bg-gradient-to-br from-background to-secondary/5">
            <h3 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-secondary" />
              Recommended Next Actions
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3 text-foreground/80 bg-white p-4 rounded-xl border shadow-sm">
                <ArrowRight className="w-5 h-5 text-secondary flex-shrink-0" />
                Watch two career videos related to your top interest areas.
              </li>
              <li className="flex gap-3 text-foreground/80 bg-white p-4 rounded-xl border shadow-sm">
                <ArrowRight className="w-5 h-5 text-secondary flex-shrink-0" />
                Discuss subject choices with your counselor or teacher.
              </li>
              {!caas.isComplete && (
                <li className="flex gap-3 text-foreground/80 bg-white p-4 rounded-xl border shadow-sm">
                  <ArrowRight className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  Complete the Career Adaptability reflection to better understand your readiness.
                </li>
              )}
              {caas.isComplete && (
                <li className="flex gap-3 text-foreground/80 bg-white p-4 rounded-xl border shadow-sm">
                  <ArrowRight className="w-5 h-5 text-secondary flex-shrink-0" />
                  Add one project or activity to your portfolio to build your confidence.
                </li>
              )}
              <li className="flex gap-3 text-foreground/80 bg-white p-4 rounded-xl border shadow-sm">
                <ArrowRight className="w-5 h-5 text-secondary flex-shrink-0" />
                Interview one professional or an older student in a field you are curious about.
              </li>
            </ul>
          </section>

          {/* SECTION 10: Reflection questions */}
          <section className="card-warm p-8 shadow-sm border-l-4 border-l-primary/50">
            <h3 className="text-xl font-heading font-bold mb-6">Reflection Questions</h3>
            <div className="space-y-4 text-foreground/80 italic text-sm">
              <p>• Do these results feel accurate to you? Why or why not?</p>
              <p>• Which result surprised you?</p>
              <p>• Which career field would you like to explore first?</p>
              <p>• What support do you need from a counselor, teacher, or parent?</p>
            </div>
            <div className="mt-6">
              <textarea 
                className="w-full p-4 rounded-xl border bg-muted/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
                rows={4} 
                placeholder="Write your thoughts here..."
              />
            </div>
          </section>
        </>
      ) : (
        <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Awaiting Assessments</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">Complete at least one assessment to generate your comprehensive reflection report.</p>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveReportView;
