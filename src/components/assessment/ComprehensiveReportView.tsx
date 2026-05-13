import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Sparkles, BookOpen, Target, Users, Loader2, ChevronRight, BarChart3, Briefcase, Award, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { normalizeRiasecResults } from "@/utils/riasec";
import { getGradeBand, getBandMessaging } from "@/utils/gradeBands";
import OnetCareerSection from "./OnetCareerSection";
import BigFiveResultCard from "./BigFiveResultCard";
import EqResultCard from "./EqResultCard";
import CaasResultCard from "./CaasResultCard";
import WorkValuesResultCard from "./WorkValuesResultCard";

// Internal icon helpers moved to top as functions for safe hoisting
const UserIcon = ({className}: {className?: string}) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const Share2Icon = ({className}: {className?: string}) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>;

interface Props {
  studentId: string;
  grade?: string;
  isCounselorView?: boolean;
}

const ComprehensiveReportView = ({ studentId, grade: propGrade, isCounselorView }: Props) => {
  const { t } = useTranslation();
  const { user, profile: authProfile } = useAuth();
  const grade = propGrade || authProfile?.grade || user?.user_metadata?.grade;

  const { data: assessments, isLoading } = useQuery({
    queryKey: ["gold-standard-report", studentId],
    queryFn: async () => {
      const [std, bigFive, caas, workvalues] = await Promise.all([
        supabase.from("assessments").select("*").eq("user_id", studentId).order("created_at", { ascending: false }),
        supabase.from("big_five_assessments" as any).select("*").eq("student_id", studentId).order("completed_at", { ascending: false }).limit(1),
        supabase.from("caas_assessments" as any).select("*").eq("student_id", studentId).order("completed_at", { ascending: false }).limit(1),
        supabase.from("work_values_assessments").select("*").eq("student_id", studentId).order("completed_at", { ascending: false }).limit(1)
      ]);

      const riasec = std.data?.find(a => a.assessment_type === 'riasec');
      const skills = std.data?.find(a => a.assessment_type === 'skills');
      const eq = std.data?.find(a => a.assessment_type === 'eq');

      return {
        riasec,
        skills,
        eq,
        bigFive: bigFive.data?.[0],
        caas: caas.data?.[0],
        workvalues: workvalues.data?.[0]
      };
    },
    enabled: !!studentId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const latestAssessment = assessments?.riasec;
  const latestSkillsAssessment = assessments?.skills;
  const bigFive = assessments?.bigFive as any;
  const eq = assessments?.eq as any;
  const caas = assessments?.caas as any;

  const topInterests = latestAssessment?.results ? normalizeRiasecResults(latestAssessment.results as any)
    .slice(0, 3)
    .map(r => ({
      ...r,
      desc: t(`assessment.riasec.descriptions.${r.name}.tagline`) || ""
    })) : [];

  const primaryInterest = topInterests[0]?.name || "Unknown";
  const primaryLabel = topInterests[0]?.label || t("report.unknown");
  const secondaryLabel = topInterests[1]?.label || t("report.unknown");

  const band = getGradeBand(grade);
  const messaging = getBandMessaging(band);

  // ARCHETYPE LOGIC (The Strategic Persona)
  // Two-tier matching: strict (RIASEC + Big Five/EQ) first, then interest-only fallback
  const getStrategicPersona = () => {
    let key = "Balanced Professional";

    // Tier 1: Combined RIASEC + personality trait match (strongest signal)
    if (primaryInterest === 'Realistic' && bigFive?.conscientiousness > 65) key = "Precision Engineer";
    else if (primaryInterest === 'Investigative' && bigFive?.openness > 70) key = "Visionary Researcher";
    else if (primaryInterest === 'Artistic' && bigFive?.openness > 70) key = "Creative Catalyst";
    else if (primaryInterest === 'Social' && (eq || bigFive?.agreeableness > 60)) key = "Empathetic Strategist";
    else if (primaryInterest === 'Enterprising' && bigFive?.extraversion > 65) key = "Dynamic Growth Leader";
    else if (primaryInterest === 'Conventional' && bigFive?.conscientiousness > 75) key = "Operational Architect";
    // Tier 2: Fallback based on primary RIASEC interest alone
    else if (primaryInterest === 'Realistic') key = "Precision Engineer";
    else if (primaryInterest === 'Investigative') key = "Visionary Researcher";
    else if (primaryInterest === 'Artistic') key = "Creative Catalyst";
    else if (primaryInterest === 'Social') key = "Empathetic Strategist";
    else if (primaryInterest === 'Enterprising') key = "Dynamic Growth Leader";
    else if (primaryInterest === 'Conventional') key = "Operational Architect";
    
    return t(`report_strategic.personas.${key}`, key);
  };

  const persona = getStrategicPersona();

  // SUBJECT & CAREER MAPS
  const subjectMap: Record<string, string[]> = {
    Realistic: ["Engineering", "Applied Physics", "Computer Science", "Design Tech"],
    Investigative: ["Theoretical Math", "Biochemistry", "Data Science", "Economics"],
    Artistic: ["Visual Arts", "Philosophy", "Creative Media", "Architecture"],
    Social: ["Psychological Sciences", "Education Policy", "Public Health", "Sociology"],
    Enterprising: ["Strategic Management", "Law & Ethics", "International Business", "Marketing"],
    Conventional: ["Fintech & Accounting", "Data Analytics", "Systems Operations", "Project Management"],
  };

  const subjectSuggestions = Array.from(new Set(subjectMap[primaryInterest] || [])).slice(0, 5);

  // DYNAMIC ROADMAP LOGIC (Enhanced with cross-test findings)
  const getDynamicRoadmap = () => {
    const numericGrade = parseInt(grade?.replace(/\D/g, "") || "12");
    const bandKey = numericGrade <= 8 ? "discovery" : numericGrade <= 10 ? "alignment" : "decision";
    
    const getTasks = (phase: string, params: any) => {
      const baseTasks = t(`report_strategic.roadmap.bands.${bandKey}.${phase}.tasks`, { 
        returnObjects: true,
        ...params
      }) as string[];

      // Synthesis Logic: Add findings from other tests if they exist
      const extraTasks: string[] = [];
      
      if (phase === "phase_1") {
        if (caas && caas.total_score < 3.5) {
          extraTasks.push(t("report_strategic.roadmap.synthesis.improve_adaptability", "Work with your counselor to improve your 'Career Concern' (planning) score."));
        }
        if (assessments?.workvalues) {
          const topValue = (assessments.workvalues.results as any[]).sort((a,b) => b.score - a.score)[0];
          if (topValue) {
            extraTasks.push(t("report_strategic.roadmap.synthesis.value_alignment", { value: t(`assessment_results.work_values.values.${topValue.name}`) }));
          }
        }
      }

      if (phase === "phase_2") {
        if (bigFive && bigFive.neuroticism < 40) {
          extraTasks.push(t("report_strategic.roadmap.synthesis.stress_management"));
        }
      }

      if (phase === "phase_3") {
        if (eq && eq.results) {
          const lowEq = (eq.results as any[]).find(r => r.score < 50);
          if (lowEq) {
            extraTasks.push(t("report_strategic.roadmap.synthesis.eq_focus", { domain: t(`assessment_results.eq.domains.${lowEq.name}`) }));
          }
        }
      }

      return [...baseTasks, ...extraTasks].slice(0, 4); // Keep it concise
    };

    return [
      {
        phase: "PHASE 01",
        title: bandKey === "discovery" 
          ? t("report_strategic.roadmap.phase_1.title") 
          : t(`report_strategic.roadmap.bands.${bandKey}.phase_1.title`),
        goal: t(`report_strategic.roadmap.bands.${bandKey}.phase_1.goal`, { persona }),
        icon: <UserIcon className="w-5 h-5"/>,
        tasks: getTasks("phase_1", { persona, subjects: subjectSuggestions.slice(0, 2).join(", ") })
      },
      {
        phase: "PHASE 02",
        title: t(`report_strategic.roadmap.bands.${bandKey}.phase_2.title`),
        goal: t(`report_strategic.roadmap.bands.${bandKey}.phase_2.goal`, { primaryLabel }),
        icon: <Share2Icon className="w-5 h-5"/>,
        tasks: getTasks("phase_2", { primaryLabel })
      },
      {
        phase: "PHASE 03",
        title: t(`report_strategic.roadmap.bands.${bandKey}.phase_3.title`),
        goal: t(`report_strategic.roadmap.bands.${bandKey}.phase_3.goal`),
        icon: <Zap className="w-5 h-5"/>,
        tasks: getTasks("phase_3", { primaryLabel })
      }
    ];
  };

  const roadmap = getDynamicRoadmap();

  return (
    <div className="space-y-16 pb-20">
      {latestAssessment && latestAssessment.completed_at ? (
        <>
          {/* SECTION 1: THE EXECUTIVE SUMMARY (PORTRAIT) */}
          <section className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-[2.5rem] -m-4 -z-10" />
            <div className="flex flex-col md:flex-row gap-8 items-center p-8 bg-white/80 backdrop-blur-sm border border-white shadow-2xl rounded-[2.5rem]">
              <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 flex-shrink-0 rotate-3">
                <Award className="w-12 h-12" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-widest">
                  <Sparkles className="w-3 h-3" /> {t("report_strategic.portrait_title")}
                </div>
                <h2 className="text-3xl font-heading font-black text-foreground tracking-tight">
                  {t("report_strategic.persona_prefix")} {persona}
                </h2>
                <p className="text-base text-foreground/80 leading-relaxed max-w-2xl font-medium italic border-l-4 border-primary/20 pl-6 py-2">
                  {t("report_strategic.portrait_desc", { 
                    primary: primaryLabel, 
                    secondary: secondaryLabel,
                    capacity: bigFive 
                      ? (bigFive.openness > bigFive.conscientiousness && bigFive.openness > bigFive.extraversion 
                          ? t("report_strategic.capacity_innovative", "innovative and intellectually curious")
                        : bigFive.conscientiousness > bigFive.extraversion 
                          ? t("report_strategic.conscientious") 
                          : t("report_strategic.capacity_outgoing", "socially dynamic and persuasive"))
                      : t("report_strategic.adaptable") 
                  }).split('<strong>').map((part, i) => {
                    if (part.includes('</strong>')) {
                      const [bold, rest] = part.split('</strong>');
                      return <span key={i}><strong>{bold}</strong>{rest}</span>;
                    }
                    return part;
                  })}
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 1.5: THE DIAGNOSTIC RATIONALE */}
          <section className="card-warm p-8 bg-muted/30 border-muted-foreground/10">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-foreground">{t("report_strategic.rationale_title")}</h3>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed mb-6">
                  {t("report_strategic.rationale_desc")}
                </p>
                <div className="p-4 rounded-xl bg-white/50 border border-border/50">
                  <h4 className="text-xs font-bold text-primary uppercase mb-2">{t("report_strategic.rationale_synthesis_title")}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("report_strategic.rationale_synthesis_desc", {
                      primary: primaryLabel,
                      trait: bigFive ? (bigFive.openness > 60 ? t("assessment_results.big_five.traits.openness") : t("assessment_results.big_five.traits.conscientiousness")) : t("report_strategic.adaptable"),
                      value: assessments?.workvalues ? t(`assessment_results.work_values.values.${(assessments.workvalues.results as any[]).sort((a,b) => b.score - a.score)[0]?.name}`) : t("common.and")
                    })}
                  </p>
                </div>
              </div>
              <div className="md:w-64">
                <h4 className="text-xs font-bold text-secondary uppercase mb-4">{t("report_strategic.evidence_base")}</h4>
                <div className="space-y-3">
                  {assessments?.riasec && (
                    <div className="flex items-center gap-2 text-xs font-medium text-foreground/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" /> RIASEC Interest Profile
                    </div>
                  )}
                  {assessments?.bigFive && (
                    <div className="flex items-center gap-2 text-xs font-medium text-foreground/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500" /> Big Five Personality
                    </div>
                  )}
                  {assessments?.caas && (
                    <div className="flex items-center gap-2 text-xs font-medium text-foreground/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Career Adaptability
                    </div>
                  )}
                  {assessments?.workvalues && (
                    <div className="flex items-center gap-2 text-xs font-medium text-foreground/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Work Values
                    </div>
                  )}
                  {assessments?.eq && (
                    <div className="flex items-center gap-2 text-xs font-medium text-foreground/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Emotional Intelligence
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: MULTIDIMENSIONAL CORE ANALYSIS (CORRELATIONS) */}
          <section className="grid md:grid-cols-3 gap-8">
            {/* Interests & Values */}
            <div className="md:col-span-2 card-warm p-8 bg-white border-primary/10 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <Zap className="w-40 h-40 text-primary" />
              </div>
              <h3 className="text-lg font-heading font-bold text-foreground mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                {t("report_strategic.synergy_title")}
              </h3>
              <div className="space-y-6">
                <p className="text-sm text-foreground/70 leading-relaxed">
                  {t("report_strategic.synergy_desc_base", { primary: primaryLabel }).split('<strong>').map((part, i) => {
                    if (part.includes('</strong>')) {
                      const [bold, rest] = part.split('</strong>');
                      return <span key={i}><strong>{bold}</strong>{rest}</span>;
                    }
                    return part;
                  })}
                  {bigFive ? (
                    bigFive.openness > 65 
                      ? t("report_strategic.synergy_desc_high_openness", { primary: primaryLabel })
                      : t("report_strategic.synergy_desc_disciplined", { primary: primaryLabel })
                  ) : (
                    t("report_strategic.synergy_desc_generic")
                  )}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {topInterests.map((int, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                      <div className="text-[10px] font-black text-muted-foreground uppercase mb-1">{int.label}</div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${int.pct}%` }} />
                        </div>
                        <span className="text-xs font-bold">{int.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Human Capital Index (EQ + CAAS) */}
            <div className="card-warm p-8 bg-gradient-to-br from-secondary/10 to-background border-secondary/20 shadow-lg">
              <h3 className="text-lg font-heading font-bold text-foreground mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-secondary" />
                {t("report_strategic.resilience_title")}
              </h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-black text-secondary">{caas?.total_score ? caas.total_score.toFixed(1) : '4.2'}</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase leading-tight">
                    {t("report_strategic.resilience_adaptability")}
                  </div>
                </div>
                <p className="text-xs text-foreground/70 leading-relaxed">
                  {t("report_strategic.resilience_desc", { 
                    focus: eq ? t("report_strategic.focus_social") : t("report_strategic.focus_technical") 
                  }).split('<strong>').map((part, i) => {
                    if (part.includes('</strong>')) {
                      const [bold, rest] = part.split('</strong>');
                      return <span key={i}><strong>{bold}</strong>{rest}</span>;
                    }
                    return part;
                  })}
                </p>
                <div className="pt-4 border-t border-secondary/10">
                  <div className="text-[10px] font-bold text-secondary uppercase mb-2">{t("report_strategic.resilience_factor_label")}</div>
                  <div className="text-sm font-bold text-foreground italic">
                    "{caas?.curiosity > 3.5 ? t("report_strategic.resilience_factor_curiosity") : t("report_strategic.resilience_factor_control")}"
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: STRATEGIC CAREER PATHWAYS (MATCHES) */}
          <section className="space-y-8">
            <div className="flex items-end justify-between border-b pb-4">
              <div>
                <h3 className="text-2xl font-heading font-bold text-foreground">{t("report_strategic.pathways_title")}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t("report_strategic.pathways_desc")}</p>
              </div>
            </div>
            
            <OnetCareerSection riasecCode={topInterests.map(i => i.name[0]).join("").slice(0, 3)} />

            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-warm p-8 border-sage-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h4 className="font-heading font-bold text-foreground">{t("report_strategic.academic_focus")}</h4>
                </div>
                <div className="flex flex-wrap gap-3">
                  {subjectSuggestions.map((s) => (
                    <div key={s} className="px-5 py-2.5 rounded-xl bg-primary/5 text-primary text-sm font-bold border border-primary/10 hover:bg-primary hover:text-white transition-all cursor-default">
                      {s}
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-warm p-8 border-amber-100 bg-amber-50/30">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-amber-600" />
                  <h4 className="font-heading font-bold text-amber-900">{t("report_strategic.networking_title")}</h4>
                </div>
                <p className="text-sm text-amber-800 leading-relaxed">
                  {t("report_strategic.networking_desc", { primary: primaryLabel }).split('<strong>').map((part, i) => {
                    if (part.includes('</strong>')) {
                      const [bold, rest] = part.split('</strong>');
                      return <span key={i}><strong>{bold}</strong>{rest}</span>;
                    }
                    return part;
                  })}
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 4: PROFESSIONAL DEVELOPMENT ROADMAP (MILESTONES) */}
          <section>
            <div className="bg-foreground text-background rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <Target className="w-40 h-40" />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-8">{t("report_strategic.roadmap_title")}</h3>
              <div className="grid md:grid-cols-3 gap-8">
                {roadmap.map((m: any, i: number) => (
                  <div 
                    key={i} 
                    className="space-y-4 p-7 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/15 transition-all group flex flex-col h-full"
                  >
                    <div className="text-[10px] font-black text-primary/80 group-hover:text-primary transition-colors">{m.phase}</div>
                    <div className="text-xl font-heading font-bold">{m.title}</div>
                    <p className="text-sm text-background/60 leading-relaxed">{m.goal}</p>
                    
                    <div className="pt-4 border-t border-white/10 space-y-3 flex-grow">
                      <div className="text-[10px] font-bold text-primary uppercase tracking-wider">{t("report_strategic.action_plan_label")}</div>
                      <ul className="space-y-2">
                        {m.tasks.map((task: string, idx: number) => (
                          <li key={idx} className="text-xs text-background/80 leading-relaxed flex gap-2">
                            <span className="text-primary">•</span>
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 5: PSYCHOMETRIC DATA APPENDIX (EVIDENCE) */}
          <section className="pt-20 border-t">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-heading font-black text-foreground uppercase tracking-tight">{t("report_strategic.appendix_title")}</h3>
              <p className="text-sm text-muted-foreground mt-2">{t("report_strategic.appendix_desc")}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-10">
              {assessments?.riasec && (
                <div className="card-warm p-8 border-primary/10 shadow-xl">
                  <div className="flex items-center gap-2 mb-6 border-b pb-4">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <h3 className="font-heading font-bold text-xl text-foreground">{t("report_strategic.riasec_profile")}</h3>
                  </div>
                  
                  <div className="mb-8">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">{t("report_strategic.core_interests")}</p>
                    <div className="flex gap-3">
                      {topInterests.map((interest, idx) => (
                        <div key={idx} className="flex-1 p-4 rounded-2xl bg-primary/5 border border-primary/10 text-center shadow-sm">
                          <div className="text-2xl font-black text-primary mb-1">{interest.name[0]}</div>
                          <div className="text-[10px] font-bold uppercase truncate text-muted-foreground">{interest.label}</div>
                          <div className="text-sm font-black mt-1">{interest.pct}%</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-5 mb-8">
                    {(assessments.riasec.results as any[]).sort((a,b) => b.pct - a.pct).map((r, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-[10px] font-black mb-1.5 uppercase tracking-wider">
                          <span className="text-foreground/70">{r.label || r.category}</span>
                          <span className="text-primary">{r.pct}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${i < 3 ? 'bg-primary' : 'bg-primary/20'}`} style={{ width: `${r.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-5 bg-muted/30 rounded-2xl text-xs leading-relaxed text-muted-foreground border border-border/40">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                      <Sparkles className="w-3 h-3" /> {t("report_strategic.market_value_title")}
                    </h4>
                    {t("report_strategic.market_value_desc", { category: primaryLabel }).split('<strong>').map((part, i) => {
                      if (part.includes('</strong>')) {
                        const [bold, rest] = part.split('</strong>');
                        return <span key={i}><strong>{bold}</strong>{rest}</span>;
                      }
                      return part;
                    })}
                  </div>
                </div>
              )}

              {assessments?.skills && (
                <div className="card-warm p-8 border-teal-100 shadow-xl">
                  <div className="flex items-center gap-2 mb-6 border-b pb-4">
                    <Briefcase className="w-5 h-5 text-teal-600" />
                    <h3 className="font-heading font-bold text-xl text-foreground">{t("report_strategic.skills_appendix_title")}</h3>
                  </div>
                  <div className="space-y-5 mb-8">
                    {(assessments.skills.results as any[]).map((s, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-[10px] font-black mb-1.5 uppercase tracking-wider">
                          <span className="text-foreground/70">{s.category || s.label}</span>
                          <span className="text-teal-600">{s.pct}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500" style={{ width: `${s.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-5 bg-teal-50/50 rounded-2xl text-xs leading-relaxed text-teal-900 border border-teal-100">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-teal-700 mb-3 flex items-center gap-2">
                      <Target className="w-3 h-3 text-teal-600" /> {t("report_strategic.market_value_title")}
                    </h4>
                    {t("report_strategic.skills_market_value_desc", { category: (assessments.skills.results as any[])[0]?.category || '' }).split('<strong>').map((part, i) => {
                      if (part.includes('</strong>')) {
                        const [bold, rest] = part.split('</strong>');
                        return <span key={i}><strong>{bold}</strong>{rest}</span>;
                      }
                      return part;
                    })}
                  </div>
                </div>
              )}

              {assessments?.bigFive && <div className="card-warm p-8 shadow-xl border-violet-100"><BigFiveResultCard result={assessments.bigFive} /></div>}
              {assessments?.eq && <div className="card-warm p-8 shadow-xl border-blue-100"><EqResultCard result={assessments.eq} /></div>}
              {assessments?.caas && <div className="card-warm p-8 shadow-xl border-emerald-100"><CaasResultCard result={assessments.caas} /></div>}
              {assessments?.workvalues && <div className="card-warm p-8 shadow-xl border-rose-100"><WorkValuesResultCard result={assessments.workvalues} /></div>}
            </div>
          </section>
        </>
      ) : (
        <div className="text-center py-32 bg-muted/10 rounded-[3rem] border-4 border-dashed border-muted/50">
          <div className="w-24 h-24 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-6">
            <Target className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-heading font-black text-foreground mb-3 uppercase">{t("report_strategic.data_required")}</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-10 text-lg leading-relaxed font-medium">{t("report_strategic.data_required_desc")}</p>
          <Link to="/student/assessment">
            <Button className="rounded-full px-12 py-7 text-lg font-bold shadow-2xl hover:scale-105 transition-transform">{t("report_strategic.start_discovery")}</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveReportView;
