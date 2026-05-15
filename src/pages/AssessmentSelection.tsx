import { motion } from "framer-motion";
import { Sparkles, Briefcase, ChevronRight, BookOpen, Target, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

import { Brain, Compass } from "lucide-react";

const ASSESSMENTS = [
  {
    id: "riasec",
    title: "Career Interest Discovery",
    desc: "The standard RIASEC assessment to find your career matches based on interests.",
    icon: Sparkles,
    color: "bg-primary/10 text-primary",
    bgColor: "from-primary/5 to-transparent",
    href: "/student/assessment/riasec",
    duration: "10 mins"
  },
  {
    id: "skills",
    title: "Employability Skills Check",
    desc: "A self-assessment of your workplace readiness and transition skills.",
    icon: Briefcase,
    color: "bg-amber-500/10 text-amber-600",
    bgColor: "from-amber-500/5 to-transparent",
    href: "/student/assessment/skills",
    duration: "5 mins"
  },
  {
    id: "bigfive",
    title: "Personality Profile (Big Five)",
    desc: "Discover your personality traits across Openness, Conscientiousness, Extraversion, Agreeableness, and Emotional Stability.",
    icon: Brain,
    color: "bg-violet-500/10 text-violet-600",
    bgColor: "from-violet-500/5 to-transparent",
    href: "/student/assessment/bigfive",
    duration: "12 mins"
  },
  {
    id: "caas",
    title: "Career Adaptability (CAAS)",
    desc: "Measure your readiness to handle career transitions across Concern, Control, Curiosity, and Confidence.",
    icon: Compass,
    color: "bg-emerald-500/10 text-emerald-600",
    bgColor: "from-emerald-500/5 to-transparent",
    href: "/student/assessment/caas",
    duration: "8 mins"
  },
  {
    id: "work-values",
    title: "Work Values (O*NET)",
    desc: "Understand what motivates you in a job, from independence and achievement to relationships and support.",
    icon: Target,
    color: "bg-rose-500/10 text-rose-600",
    bgColor: "from-rose-500/5 to-transparent",
    href: "/student/assessment/workvalues",
    duration: "6 mins"
  },
  {
    id: "eq",
    title: "Emotional Intelligence (EQ)",
    desc: "Measure your emotional awareness and interpersonal skills across four core domains.",
    icon: Brain,
    color: "bg-blue-500/10 text-blue-600",
    bgColor: "from-blue-500/5 to-transparent",
    href: "/student/assessment/eq",
    duration: "5 mins"
  },
  {
    id: "onet-official",
    title: "Official O*NET Interest Profiler",
    desc: "The full, official assessment widget provided by the U.S. Department of Labor for interest discovery.",
    icon: ExternalLink,
    color: "bg-blue-600/10 text-blue-600",
    bgColor: "from-blue-600/5 to-transparent",
    href: "/student/assessment/onet",
    duration: "15 mins"
  }
];

export default function AssessmentSelection() {
  const { profile, user } = useAuth();
  const { t } = useTranslation();
  const rawGrade = profile?.grade || user?.user_metadata?.grade || "7";
  const grade = parseInt(rawGrade.toString().replace(/\D/g, "")) || 7;

  const assessments = [
    {
      id: "riasec",
      title: t("discovery_hub.assessments.riasec.title"),
      desc: t("discovery_hub.assessments.riasec.desc"),
      icon: Sparkles,
      color: "bg-primary/10 text-primary",
      bgColor: "from-primary/5 to-transparent",
      href: "/student/assessment/riasec",
      duration: t("discovery_hub.assessments.riasec.duration")
    },
    {
      id: "skills",
      title: t("discovery_hub.assessments.skills.title"),
      desc: t("discovery_hub.assessments.skills.desc"),
      icon: Briefcase,
      color: "bg-amber-500/10 text-amber-600",
      bgColor: "from-amber-500/5 to-transparent",
      href: "/student/assessment/skills",
      duration: t("discovery_hub.assessments.skills.duration")
    },
    {
      id: "bigfive",
      title: t("discovery_hub.assessments.bigfive.title"),
      desc: t("discovery_hub.assessments.bigfive.desc"),
      icon: Brain,
      color: "bg-violet-500/10 text-violet-600",
      bgColor: "from-violet-500/5 to-transparent",
      href: "/student/assessment/bigfive",
      duration: t("discovery_hub.assessments.bigfive.duration")
    },
    {
      id: "caas",
      title: t("discovery_hub.assessments.caas.title"),
      desc: t("discovery_hub.assessments.caas.desc"),
      icon: Compass,
      color: "bg-emerald-500/10 text-emerald-600",
      bgColor: "from-emerald-500/5 to-transparent",
      href: "/student/assessment/caas",
      duration: t("discovery_hub.assessments.caas.duration")
    },
    {
      id: "work-values",
      title: t("discovery_hub.assessments.work_values.title"),
      desc: t("discovery_hub.assessments.work_values.desc"),
      icon: Target,
      color: "bg-rose-500/10 text-rose-600",
      bgColor: "from-rose-500/5 to-transparent",
      href: "/student/assessment/workvalues",
      duration: t("discovery_hub.assessments.work_values.duration")
    },
    {
      id: "eq",
      title: t("discovery_hub.assessments.eq.title"),
      desc: t("discovery_hub.assessments.eq.desc"),
      icon: Brain,
      color: "bg-blue-500/10 text-blue-600",
      bgColor: "from-blue-500/5 to-transparent",
      href: "/student/assessment/eq",
      duration: t("discovery_hub.assessments.eq.duration")
    },
    {
      id: "onet-official",
      title: t("discovery_hub.assessments.onet.title"),
      desc: t("discovery_hub.assessments.onet.desc"),
      icon: ExternalLink,
      color: "bg-blue-600/10 text-blue-600",
      bgColor: "from-blue-600/5 to-transparent",
      href: "/student/assessment/onet",
      duration: t("discovery_hub.assessments.onet.duration")
    }
  ];

  const filteredAssessments = assessments.filter(item => {
    // Level 1: Grades 7-8
    if (grade >= 7 && grade <= 8) {
      return ["riasec", "skills"].includes(item.id);
    }
    // Level 2: Grades 9-10
    if (grade >= 9 && grade <= 10) {
      return ["riasec", "skills", "bigfive", "work-values"].includes(item.id);
    }
    // Level 3: Grades 11-13
    if (grade >= 11) {
      return true; // All assessments
    }
    // Fallback for smaller grades or undefined
    return ["riasec", "skills"].includes(item.id);
  });

  return (
    <div className="py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4 flex items-center justify-center gap-3">
              <Target className="w-10 h-10 text-primary" />
              {t("discovery_hub.title")}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("discovery_hub.subtitle", { grade })}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {filteredAssessments.map((item) => (
              <Link key={item.id} to={item.href} className="group flex flex-col h-full">
                <div className={`flex-1 card-warm p-8 bg-gradient-to-br ${item.bgColor} border border-border group-hover:border-primary/50 transition-all duration-300 relative overflow-hidden`}>
                  <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  
                  <h2 className="text-xl font-heading font-bold mb-3 group-hover:text-primary transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {item.desc}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      {item.duration}
                    </span>
                    <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform p-0 font-bold">
                      {t("discovery_hub.start_btn")}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 p-10 rounded-[2rem] bg-muted/20 border border-border/50 text-center shadow-inner">
            <h3 className="font-heading font-bold text-xl text-foreground mb-3">{t("discovery_hub.history_title")}</h3>
            <Link to="/student/assessment/history">
              <Button variant="outline" className="rounded-full px-8 py-6 text-primary border-primary/20 hover:bg-primary/5 h-auto font-bold transition-all">
                {t("discovery_hub.history_link")}
              </Button>
            </Link>
          </div>
        </motion.div>
    </div>
  );
}
