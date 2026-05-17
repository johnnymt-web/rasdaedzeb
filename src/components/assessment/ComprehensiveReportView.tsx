import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Info, Sparkles, Target, Users, Loader2, BookOpen, CheckCircle2, AlertCircle, BarChart3, ShieldCheck, Heart, ArrowRight, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { normalizeAllAssessments, getTopResults, getLowResults } from "@/utils/assessmentNormalization";
import { parseGrade, isAssessmentVisible } from "@/utils/gradeLogic";
import { getGradeBand, getReportToneForGradeBand, GradeBand } from "@/utils/gradeBands";
import { generateAiSynthesis, SynthesisResponse } from "@/services/aiService";
import OnetCareerSection from "./OnetCareerSection";
import { useState } from "react";
import { toast } from "sonner";


interface Props {
  studentId: string;
  grade?: string;
  isCounselorView?: boolean;
}

const ComprehensiveReportView = ({ studentId, grade: propGrade, isCounselorView }: Props) => {
  const { t } = useTranslation();
  const { user, profile: authProfile } = useAuth();
  const numericGrade = parseGrade(propGrade || authProfile?.grade || user?.user_metadata?.grade);
  const gradeBand = getGradeBand(String(numericGrade));
  const reportTone = getReportToneForGradeBand(gradeBand);
  
  const [reflectionText, setReflectionText] = useState("");
  const [isSavingReflection, setIsSavingReflection] = useState(false);

  const handleSaveReflection = async () => {
    if (!reflectionText.trim()) {
      toast.error("Please write something before saving.");
      return;
    }
    setIsSavingReflection(true);
    try {
      const { error } = await (supabase.from("reflections" as any) as any).insert([{
        user_id: studentId,
        prompt: "Discovery Profile Reflection",
        response: reflectionText.trim(),
      }]);
      if (error) throw error;
      toast.success("Reflection saved successfully!");
      setReflectionText("");
    } catch (err: any) {
      console.error("Failed to save reflection:", err);
      toast.error("Could not save reflection. Please try again.");
    } finally {
      setIsSavingReflection(false);
    }
  };

  const isVisible = (id: string) => isAssessmentVisible(id, numericGrade);


  const { data: normData, isLoading } = useQuery({
    queryKey: ["gold-standard-report-normalized", studentId],
    queryFn: async () => {
      const fetchSafe = async (query: any) => {
        try {
          const res = await query;
          if (res.error) {
            console.error("Query failed:", res.error);
            return [];
          }
          return res.data || [];
        } catch (err) {
          console.error("Query threw:", err);
          return [];
        }
      };

      const [std, bigFive, caas, workvalues] = await Promise.all([
        fetchSafe(supabase.from("assessments").select("*").eq("user_id", studentId).order("created_at", { ascending: false })),
        fetchSafe(supabase.from("big_five_assessments" as any).select("*").eq("student_id", studentId).order("completed_at", { ascending: false }).limit(1)),
        fetchSafe(supabase.from("caas_assessments" as any).select("*").eq("student_id", studentId).order("completed_at", { ascending: false }).limit(1)),
        fetchSafe(supabase.from("work_values_assessments").select("*").eq("student_id", studentId).order("completed_at", { ascending: false }).limit(1))
      ]);

      return normalizeAllAssessments({
        std,
        bigFive,
        caas,
        workValues: workvalues
      });
    },
    enabled: !!studentId,
    retry: false,
  });

  const { data: synthesis, isLoading: isSynthesisLoading } = useQuery({
    queryKey: ["ai-report-synthesis", studentId],
    queryFn: async () => {
      if (!normData) return null;
      
      const eqResults: Record<string, number> = {};
      normData.eq.results.forEach(r => {
        if (r.label) eqResults[r.label] = r.score || 0;
      });

      return generateAiSynthesis({
        primaryInterest: getTopResults(normData.riasec.results, 1)[0]?.label || "Unknown",
        traits: normData.bigFive.isComplete ? normData.bigFive.results.reduce((acc: any, r) => ({ ...acc, [r.key]: r.pct }), {}) : null,
        adapt: normData.caas.isComplete ? { total_score: normData.caas.results.reduce((sum, r) => sum + (r.score || 0), 0) / 4 } : null,
        values: normData.workValues.isComplete ? normData.workValues.results.reduce((acc: any, r) => ({ ...acc, [r.key]: r.score }), {}) : null,
        eqResults: normData.eq.isComplete ? eqResults : null
      });
    },
    enabled: !!normData && (normData.riasec.isComplete || normData.bigFive.isComplete),
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

  const SKILL_EXPLANATIONS: Record<string, { desc: string; tip: string }> = {
    communication: {
      desc: "Your confidence in sharing ideas, presenting, and listening actively. Essential for collaborating and sharing your work.",
      tip: "Practice sharing your thoughts clearly in class discussions, and active listening when working in teams."
    },
    "problem solving": {
      desc: "Your confidence in analyzing challenges, using logic, and finding creative solutions to difficult issues.",
      tip: "Take on logic puzzles, coding projects, or volunteer to help solve team problems."
    },
    "digital literacy": {
      desc: "Your comfort with utilizing technology, learning new apps, and managing digital information safely and effectively.",
      tip: "Try learning basic coding, spreadsheets, or editing software to expand your technical tools."
    },
    teamwork: {
      desc: "Your capacity to work cooperatively in groups, respect different points of view, and align towards a common objective.",
      tip: "Engage in team projects, volunteer clubs, or sports to practice active cooperation."
    },
    adaptability: {
      desc: "Your resilience and flexibility when facing changes, sudden issues, or unfamiliar environments.",
      tip: "Embrace sudden changes as exciting learning opportunities, and practice quick adjustments."
    }
  };

  const getRichInterpretation = (key: string, score: number, activeBand: GradeBand): { level: string; explanation: string; guidance: string } => {
    const normalizedScore = score > 5 ? (score / 5) * 100 : score;
    const isHigh = normalizedScore >= 70;
    const isLow = normalizedScore < 45;
    const level = isHigh ? "High Alignment" : isLow ? "Developing Alignment" : "Balanced Alignment";

    const data: Record<string, { high: string; med: string; low: string; guidance: Record<GradeBand, string> }> = {
      realistic: {
        high: "You have a strong preference for hands-on activities, working with tools, building physical objects, or operating machinery. You enjoy seeing concrete, tangible results from your work.",
        med: "You enjoy a balanced mix of hands-on physical activities and conceptual or social tasks.",
        low: "You generally prefer theoretical, creative, or social tasks over working directly with tools and machinery.",
        guidance: {
          discovery: "Try exploring practical electives or building things in science/STEM classes to see what physical projects excite you.",
          exploration: "Look into physics, design technology, or introductory computing courses to connect practical hands-on building to your academic pathway.",
          planning: "Investigate engineering, construction management, or vocational pathways. Try to secure a job shadowing opportunity in a technical field.",
          transition: "Review advanced vocational certifications, specialized technology degrees, or hands-on apprenticeships to transition into the workforce.",
          unknown: "Explore hands-on hobbies or technical projects."
        }
      },
      investigative: {
        high: "You love analytical thinking, researching, and exploring complex theoretical or scientific concepts. You find satisfaction in understanding 'why' things work the way they do.",
        med: "You enjoy occasional problem-solving and logic puzzles, but balance this with action-oriented or creative work.",
        low: "You prefer straightforward, structured tasks or creative expression rather than spending long periods researching or analyzing data.",
        guidance: {
          discovery: "Keep asking questions! Try out science fairs, coding clubs, or logic puzzles to feed your natural curiosity.",
          exploration: "Focus on higher-level mathematics, sciences, or analytical humanities. Look for opportunities to write research reports or participate in debate clubs.",
          planning: "Compare science, technology, academic research, or software engineering pathways. Start researching university programs with strong research departments.",
          transition: "Begin looking for university research assistantships, lab internships, or analytical internships to build your academic resume.",
          unknown: "Engage in research, problem-solving, and science-oriented hobbies."
        }
      },
      artistic: {
        high: "You thrive on creative expression, originality, and self-expression. You dislike rigid structures and prefer open-ended environments where you can innovate and design.",
        med: "You appreciate creativity and design, and enjoy adding an artistic touch to standard projects and tasks.",
        low: "You feel most comfortable in structured environments with clear guidelines, rather than open-ended creative tasks.",
        guidance: {
          discovery: "Experiment with art, writing, music, or design. Don't worry about being perfect — focus on expressing yourself freely.",
          exploration: "Choose creative electives like art history, literature, design, or theater. Consider how design principles apply to modern fields like UX or marketing.",
          planning: "Assemble a portfolio of your creative work. Compare fine arts, marketing, graphic design, architecture, or creative writing pathways.",
          transition: "Update your professional digital portfolio, network with creative directors, and explore freelancing or agency opportunities.",
          unknown: "Engage in creative hobbies, design, and self-expression."
        }
      },
      social: {
        high: "You are highly driven to help, teach, counsel, and care for others. You gain deep satisfaction from making a positive social impact and working closely with people.",
        med: "You enjoy team collaborations and helping others, but also value independent focus time.",
        low: "You prefer focusing on data, systems, or tools rather than spending your day in constant, emotionally demanding social interaction.",
        guidance: {
          discovery: "Participate in group projects, peer tutoring, or community volunteering. You thrive when helping others.",
          exploration: "Consider joining leadership groups, student government, or community service initiatives. These build key collaboration skills.",
          planning: "Look into psychology, education, nursing, social work, or human resources. Look for volunteer roles at local community centers or hospitals.",
          transition: "Seek out internship opportunities in non-profits, educational programs, or public relations to build your professional network.",
          unknown: "Volunteer and seek out community-driven initiatives."
        }
      },
      enterprising: {
        high: "You are a natural leader, persuasive speaker, and strategic thinker. You enjoy taking charge, organizing groups, and driving towards goals or business success.",
        med: "You are comfortable leading when necessary, but also enjoy supporting roles and working collaboratively without being the main leader.",
        low: "You prefer individual contributions or clear, non-competitive guidelines rather than selling ideas or managing group direction.",
        guidance: {
          discovery: "Take on coordinator roles in group projects or explore starting small projects like a class blog or school club.",
          exploration: "Focus on business, economics, or public speaking. Look for leadership roles in sports teams, student councils, or debate clubs.",
          planning: "Research business administration, law, entrepreneurship, or management. Practice pitching ideas or writing mock business plans.",
          transition: "Begin building your professional LinkedIn presence, join entrepreneurship incubators, and seek leadership roles in university student groups.",
          unknown: "Take on strategic, leadership, and public speaking initiatives."
        }
      },
      conventional: {
        high: "You excel at organizing information, following precise procedures, managing details, and working within structured, well-defined systems.",
        med: "You appreciate order and clarity, but are also flexible and comfortable with some ambiguity.",
        low: "You prefer flexible, open-ended environments and dislike repetitive tasks, highly detailed bookkeeping, or rigid rule-following.",
        guidance: {
          discovery: "Practice setting up organization systems for your homework or scheduling your week to harness your natural focus.",
          exploration: "Focus on accounting, statistics, databases, or organizational methodologies. Learn how spreadsheets work to manage projects.",
          planning: "Explore finance, data analytics, administration, operations, or logistics. Look for opportunities to organize large-scale school events.",
          transition: "Look for internships in operations, administrative support, or logistics where your precision and organization are highly valued.",
          unknown: "Build scheduling, data management, and organizational skills."
        }
      },
      openness: {
        high: "You are extremely open to new ideas, cultures, and creative concepts. You enjoy learning new things and are comfortable with abstract theories.",
        med: "You balance practical curiosity with established methods, exploring new ideas when they are useful.",
        low: "You prefer practical, proven, and familiar routines rather than abstract, highly theoretical concepts.",
        guidance: {
          discovery: "Try visiting museums, reading widely, or learning about different cultures to feed your broad imagination.",
          exploration: "Take electives outside your comfort zone. Try learning a new language or joining an astronomy club.",
          planning: "Focus on pathways that require innovation, constant learning, or interdisciplinary study. Ask your counselor about study-abroad options.",
          transition: "Seek opportunities in research, design-thinking, or foreign exchange to expand your academic horizons.",
          unknown: "Engage in diverse reading, cultural exploration, and learning new skills."
        }
      },
      conscientiousness: {
        high: "You are highly disciplined, responsible, and structured. You keep track of deadlines, stay organized, and work diligently toward your goals.",
        med: "You are reliable and organized when it matters, but remain flexible enough to adapt to last-minute changes.",
        low: "You prefer a spontaneous, flexible workflow, though you may sometimes struggle with rigid deadlines or details.",
        guidance: {
          discovery: "Use a simple planner or calendar app to start tracking your homework assignments independently.",
          exploration: "Learn advanced study techniques like the Pomodoro method or block scheduling to organize your study hours.",
          planning: "Practice breaking down large college or career application steps into weekly goals. This keeps stress low.",
          transition: "Create a rigorous tracking sheet for university or job applications, including reference letters and deadlines.",
          unknown: "Use time-management tools and break tasks down into manageable steps."
        }
      },
      extraversion: {
        high: "You gain energy from being around people, socializing, and collaborating in active team settings.",
        med: "You are an ambivert, comfortably balancing active social collaborations with independent, quiet focus time.",
        low: "You are more introverted, gaining energy from quiet, individual focus and deep, one-on-one conversations.",
        guidance: {
          discovery: "Engage in class discussions and collaborative games. Ensure you balance this with downtime to rest.",
          exploration: "Try public speaking, drama, or debate to build your social presence and communication skills.",
          planning: "Explore roles that involve group work, client relations, or public presentations. Make sure to schedule quiet study time.",
          transition: "Focus on networking events, university student panels, and active collaboration spaces to build industry connections.",
          unknown: "Participate in speaking events, or ensure quiet study spaces based on your energy levels."
        }
      },
      agreeableness: {
        high: "You are exceptionally empathetic, cooperative, and eager to help. You value harmony and work very well in team environments.",
        med: "You are collaborative and cooperative, but also comfortable advocating for your own needs and holding firm views.",
        low: "You focus strongly on logic, objectivity, and tasks, sometimes prioritizing results over social consensus.",
        guidance: {
          discovery: "Offer to help classmates who are struggling and focus on building positive friendships.",
          exploration: "Participate in conflict resolution or peer mediation training to develop your naturally strong empathy.",
          planning: "Consider pathways that require strong relationship management, negotiation, or community-building. Practice setting professional boundaries.",
          transition: "Seek mentoring roles, community leadership, or client-facing internships where your warmth and empathy are key assets.",
          unknown: "Engage in teamwork, mediation, and active listening activities."
        }
      },
      neuroticism: {
        high: "You respond very sensitively to stress, pressure, and uncertainty. You may frequently worry or feel anxious about future challenges.",
        med: "You experience typical stress before major deadlines, but generally recover your emotional balance quickly.",
        low: "You are highly emotionally stable, remaining calm, cool, and collected under intense academic or personal pressure.",
        guidance: {
          discovery: "Practice mindfulness, deep breathing, or talk to a parent or counselor when school tests feel overwhelming.",
          exploration: "Learn stress-management and reframing techniques. Build a support network of teachers, counselors, and friends.",
          planning: "Talk openly with your counselor about application anxiety. Establish a healthy work-life balance now to prevent burnout.",
          transition: "Develop a professional support structure, utilize university counseling resources, and practice resilience habits.",
          unknown: "Practice regular stress-reduction techniques and seek support structures."
        }
      },
      concern: {
        high: "You are actively thinking about and preparing for your future career path. You look ahead with foresight and planning.",
        med: "You are aware of future requirements, but balance forward-thinking with focusing on current schoolwork.",
        low: "You live mostly in the present, which is great for mindfulness, but you should start allocating time to look ahead.",
        guidance: {
          discovery: "Start mapping out what school subjects look interesting for the coming years.",
          exploration: "Research the academic prerequisites for university or vocational courses that you find appealing.",
          planning: "Draft a formal 2-year pathway plan including application deadlines, portfolio requirements, and backup choices.",
          transition: "Create a step-by-step career transition checklist for the first year post-graduation.",
          unknown: "Set aside 30 minutes a week to research upcoming opportunities."
        }
      },
      control: {
        high: "You take active ownership and responsibility for your education, career decisions, and future direction.",
        med: "You take responsibility for major choices, but sometimes rely on parents, teachers, or counselors to drive next steps.",
        low: "You tend to let circumstances or others guide your choices. It's time to step into the driver's seat of your future!",
        guidance: {
          discovery: "Take charge of your homework schedule. Try setting your own goals for school projects.",
          exploration: "Take the lead in selecting your school electives. Discuss your rationale with your family, rather than letting them decide for you.",
          planning: "Schedule your own meetings with your school counselor to actively lead your pathway discussions.",
          transition: "Manage your university or job applications independently, ensuring all details are owned by you.",
          unknown: "Practice making active daily choices and setting personal goals."
        }
      },
      curiosity: {
        high: "You are highly motivated to ask questions, explore diverse career fields, and research interesting options.",
        med: "You explore options when prompted, but could benefit from more proactive and diverse research.",
        low: "You tend to stick to familiar, well-known paths. Broaden your horizons by asking questions!",
        guidance: {
          discovery: "Ask family members or teachers about what they do at work. You'll learn about fields you didn't know existed!",
          exploration: "Attend career fairs, use online portals to browse job profiles, and read articles about future industries.",
          planning: "Arrange informational interviews with professionals. Ask what a typical day looks like and what challenges they face.",
          transition: "Attend industry networking events, webinars, and company presentations to explore active market demands.",
          unknown: "Make a list of three unfamiliar careers and spend 15 minutes researching each one."
        }
      },
      confidence: {
        high: "You believe strongly in your ability to overcome challenges, solve problems, and achieve your educational and career goals.",
        med: "You have healthy self-belief, though you may feel insecure when facing entirely new or highly competitive challenges.",
        low: "You often doubt your abilities, which might hold you back from pursuing exciting opportunities. Remember, skills are built through practice!",
        guidance: {
          discovery: "Keep a 'victory log' of times you solved a hard problem, did well on a project, or helped someone.",
          exploration: "Take on a slightly challenging new project or hobby. Experiencing success in small, hard tasks builds strong confidence.",
          planning: "Apply for a competitive role, internship, or leadership position. Even if you don't get it, the process builds resilience.",
          transition: "Practice mock interviews and elevator pitches to feel completely confident representing yourself to professionals.",
          unknown: "Focus on small, achievable goals and celebrate your progress daily."
        }
      },
      achievement: {
        high: "You are driven by a sense of accomplishment, using your best skills, and seeing the results of your hard work.",
        med: "You value accomplishment, but balance it with stable working conditions and personal relationships.",
        low: "You prioritize personal life, supportive environments, or flexibility over high-pressure achievement metrics.",
        guidance: {
          discovery: "Set personal goals for your projects and strive to do your absolute best work.",
          exploration: "Participate in academic or extracurricular competitions to challenge yourself.",
          planning: "Research careers known for clear performance metrics, growth, and high skill utilization.",
          transition: "Seek out roles with clear key performance indicators (KPIs) and opportunities for merit-based advancement.",
          unknown: "Set personal performance targets for your tasks."
        }
      },
      independence: {
        high: "You highly value autonomy, making your own decisions, and working with minimal direct supervision.",
        med: "You enjoy a mix of self-direction and supportive guidance or team collaboration.",
        low: "You feel most comfortable with clear instructions, direct supervision, and structured team directions.",
        guidance: {
          discovery: "Take on independent study projects or explore hobbies where you are the sole creator.",
          exploration: "Try self-paced online courses to build your independent learning skills.",
          planning: "Explore entrepreneurial fields, creative fields, or academic paths that offer high self-direction.",
          transition: "Look for roles that offer flexible or remote working arrangements and value autonomous problem-solving.",
          unknown: "Practice managing your own tasks with minimal check-ins."
        }
      },
      recognition: {
        high: "You are motivated by prestige, social status, leadership opportunities, and public acknowledgment of your work.",
        med: "You appreciate being recognized for good work, but do not require high status or prestige to feel satisfied.",
        low: "You prefer working quietly behind the scenes and dislike public attention or highly competitive environments.",
        guidance: {
          discovery: "Run for class representative or try presenting your work to the class to build your comfort with recognition.",
          exploration: "Take on leadership roles in school clubs or coordinate group events.",
          planning: "Compare careers in law, corporate management, politics, or high-profile specialized fields.",
          transition: "Build a strong personal brand, publish articles or projects, and seek visible leadership roles.",
          unknown: "Seek opportunities to lead projects or share your accomplishments."
        }
      },
      relationships: {
        high: "You desire a highly supportive, friendly, and collaborative work environment where you can help others and build strong relationships.",
        med: "You enjoy working with friendly colleagues, but are comfortable in highly logical or independent work settings too.",
        low: "You prefer task-oriented, highly logical environments and can easily work in non-social or highly competitive settings.",
        guidance: {
          discovery: "Form study groups and focus on building positive, collaborative relationships with classmates.",
          exploration: "Get involved in peer tutoring, mentorship programs, or group community service.",
          planning: "Look into non-profits, healthcare, education, or organizations celebrated for strong team cultures.",
          transition: "Prioritize company culture during your job hunt. Look for organizations that emphasize team cohesion and community.",
          unknown: "Participate in cooperative, relationship-building group projects."
        }
      },
      support: {
        high: "You place great importance on having supportive, fair managers and clear, structured guidance from leadership.",
        med: "You value good leadership, but are comfortable operating with some ambiguity or self-directed guidelines.",
        low: "You are highly independent and do not rely heavily on managerial support or frequent feedback to perform well.",
        guidance: {
          discovery: "Build a positive connection with your teachers by asking questions and seeking guidance when needed.",
          exploration: "Learn how to actively ask for constructive feedback on your projects.",
          planning: "Look for organizations known for strong training, structured mentorship, and transparent leadership.",
          transition: "Ask about training programs and mentorship structures during interviews to find supportive leaders.",
          unknown: "Practice seeking out feedback loops and structured mentoring."
        }
      },
      working_conditions: {
        high: "You strongly prioritize stable pay, job security, good physical working conditions, and a clear work-life balance.",
        med: "You value stability, but are willing to take some calculated risks for exciting or meaningful work.",
        low: "You are highly comfortable with risk, physical challenge, variable hours, or unconventional workspaces.",
        guidance: {
          discovery: "Discuss the practical side of work (salaries, hours, workplaces) with parents or teachers.",
          exploration: "Research which industries offer stable growth, reliable career progression, and healthy work-life balance.",
          planning: "Look into corporate, government, or established technical roles that offer long-term stability and benefits.",
          transition: "Compare full compensation packages, remote work options, and health/retirement benefits when reviewing offers.",
          unknown: "Learn about budgeting, financial planning, and career stability trends."
        }
      },
      self_awareness: {
        high: "You have a deep understanding of your own emotions, strengths, limitations, and what motivates you.",
        med: "You are generally aware of your feelings, but sometimes struggle to pinpoint why you react a certain way under pressure.",
        low: "You rarely check in with your emotions and might find yourself reacting impulsively without knowing why.",
        guidance: {
          discovery: "Journal for 5 minutes a day about what went well, what was stressful, and how you responded.",
          exploration: "Practice identifying your emotional triggers in academic or personal settings.",
          planning: "Reflect on how your emotional states impact your study habits and career choices. Discuss this with a counselor.",
          transition: "Regularly perform self-audits on your stress levels and professional motivations to align your choices.",
          unknown: "Practice daily emotional self-reflection."
        }
      },
      self_management: {
        high: "You excel at managing your emotional impulses, staying calm under pressure, and adapting to changes.",
        med: "You stay composed in most normal situations, but can feel overwhelmed by sudden crises or tight deadlines.",
        low: "You easily feel overwhelmed by academic stress and struggle to stay calm under intense pressure.",
        guidance: {
          discovery: "Learn simple breathing exercises (like box breathing) to use before taking school tests.",
          exploration: "Build stress-resilience habits like regular exercise, a steady sleep schedule, and structured study plans.",
          planning: "Practice mindfulness and proactive stress management to handle high-stakes application seasons.",
          transition: "Implement professional time-blocking and emotional resilience strategies to navigate work demands.",
          unknown: "Practice stress-reduction habits and emotional control under pressure."
        }
      },
      social_awareness: {
        high: "You are exceptionally empathetic, easily picking up on others' feelings and understanding diverse perspectives.",
        med: "You are empathetic to friends and family, but could work on active listening and reading subtle social cues in new groups.",
        low: "You focus heavily on logical details and sometimes miss the emotional needs or perspectives of team members.",
        guidance: {
          discovery: "Practice active listening: repeat back what a friend said in your own words before responding.",
          exploration: "Practice advanced empathy: interact with and try to understand people from different backgrounds.",
          planning: "Read literature or explore studies that focus on diversity, active empathy, and organizational dynamics.",
          transition: "Practice advanced professional empathy: consider what clients, managers, or coworkers need to succeed.",
          unknown: "Practice active listening and perspective-taking daily."
        }
      },
      relationship_management: {
        high: "You are skilled at building strong connections, inspiring others, resolving conflicts, and collaborating in teams.",
        med: "You collaborate well in stable teams, but struggle when managing conflicts or coordinating new, diverse groups.",
        low: "You prefer working completely alone and find team coordination, persuasion, or conflict management highly draining.",
        guidance: {
          discovery: "Practice giving kind, constructive feedback to classmates during team projects.",
          exploration: "Seek out leadership or coordination roles in group projects or school clubs to practice negotiation.",
          planning: "Take conflict-resolution workshops or practice presenting team objectives to build leadership capacity.",
          transition: "Focus on networking, managing peer feedback, and active delegation when coordinating large university or work initiatives.",
          unknown: "Practice team communication, feedback, and group negotiation."
        }
      }
    };

    const item = data[key.toLowerCase()];
    if (!item) {
      return {
        level: level,
        explanation: "Exploration area based on your responses.",
        guidance: "Continue exploring your options."
      };
    }

    const explanation = isHigh ? item.high : isLow ? item.low : item.med;
    const guidance = item.guidance[activeBand] || item.guidance.unknown;

    return { level, explanation, guidance };
  };

  const DESCRIPTIONS: Record<string, string> = {
    // RIASEC
    realistic: "Preference for working with tools, machines, and physical tasks.",
    investigative: "Interest in solving complex problems, research, and learning.",
    artistic: "Interest in creative expression, design, and original ideas.",
    social: "Interest in helping, teaching, and caring for other people.",
    enterprising: "Interest in leading, persuading, and business decision-making.",
    conventional: "Preference for organized data, clear procedures, and structure.",
    // Big Five
    openness: "Reflects your curiosity, imagination, and openness to new ideas.",
    conscientiousness: "Reflects your level of organization, responsibility, and focus.",
    extraversion: "Reflects how much you gain energy from social interactions.",
    agreeableness: "Reflects your tendency to be cooperative, empathetic, and kind.",
    neuroticism: "Reflects how you typically respond to stress and emotional challenges.",
    // CAAS
    concern: "Your ability to look ahead and plan for your future career path.",
    control: "How much responsibility you take for your own choices and actions.",
    curiosity: "Your drive to explore different career options and ask questions.",
    confidence: "Your belief in your ability to overcome challenges and succeed.",
    // Work Values
    achievement: "The need to feel a sense of accomplishment and use your best abilities.",
    independence: "The importance of making your own decisions and working autonomously.",
    recognition: "The value placed on prestige, leadership, and career advancement.",
    relationships: "The desire to work in a supportive environment and help others.",
    support: "The importance of clear guidance and support from management.",
    working_conditions: "The value of job security, pay, and a good physical environment.",
    // EQ
    self_awareness: "Understanding your own emotions and how they impact your actions.",
    self_management: "Managing your impulses and staying focused under pressure.",
    social_awareness: "Empathy and understanding the perspectives of those around you.",
    relationship_management: "Building strong connections and working effectively in teams."
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="text-[10px] text-muted-foreground opacity-30 text-right">
        Grade {numericGrade}
      </div>
      {/* SECTION 1: Report purpose and disclaimer */}
      <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex gap-4 items-start">
        <Info className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-heading font-bold text-lg text-primary-900 mb-2">Purpose of this Reflection Report</h3>
          <p className="text-sm text-primary-800 leading-relaxed">
            This report summarizes your current career exploration responses. <strong>It does not decide your future career.</strong> It is designed to support reflection, discussion, and planning with your counselor, teachers, and family.
          </p>
          <p className="text-sm text-primary-700 leading-relaxed mt-2 italic">
            {reportTone}
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
                <p className="text-muted-foreground text-sm">Your responses indicate a strong alignment with these interest areas. These are broad themes, not fixed career recommendations.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {topInterests.map((r, i) => {
                    const interpret = getRichInterpretation(r.key, r.pct || 0, gradeBand);
                    return (
                      <div key={i} className="p-5 bg-white rounded-2xl border border-primary/10 shadow-sm flex flex-col transition-all hover:shadow-md hover:border-primary/20">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{r.label}</span>
                          <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">{interpret.level}</span>
                        </div>
                        <div className="text-2xl font-black text-primary mt-1 mb-2">{r.pct}%</div>
                        
                        <div className="space-y-4 flex-1 flex flex-col justify-between">
                          <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                            {interpret.explanation}
                          </p>
                          <div className="p-3 bg-secondary/5 rounded-xl border border-secondary/10 mt-auto">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-secondary mb-1">Recommended for your grade stage:</div>
                            <p className="text-[10px] text-secondary-900 leading-snug">
                              {interpret.guidance}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground italic">Career Interests assessment not completed yet.</p>
            )}
            
            {skills.isComplete && (
              <div className="mt-12 pt-8 border-t border-primary/10">
                <h4 className="font-heading font-bold mb-4">Top Employability Skills Confidence</h4>
                <p className="text-muted-foreground text-xs mb-6">Employability skills represent your current self-perception of practical tools and team collaboration readiness.</p>
                <div className="grid md:grid-cols-3 gap-4">
                  {getTopResults(skills.results, 3).map((s, i) => {
                    const info = SKILL_EXPLANATIONS[s.label.toLowerCase()] || {
                      desc: "Strengthened confidence in key professional capabilities.",
                      tip: "Continue building this skill through real-world projects."
                    };
                    return (
                      <div key={i} className="p-5 bg-teal-50/30 rounded-2xl border border-teal-100 flex flex-col shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 rounded-full bg-teal-500" />
                          <h5 className="font-bold text-sm text-teal-900">{s.label}</h5>
                          <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full ml-auto">{s.pct}%</span>
                        </div>
                        <p className="text-xs text-teal-800/80 leading-relaxed mb-4">
                          {info.desc}
                        </p>
                        <div className="mt-auto p-3 bg-white/60 rounded-xl border border-teal-100/50">
                          <div className="text-[9px] font-bold uppercase tracking-wider text-teal-700 mb-1">Quick Growth Tip:</div>
                          <p className="text-[10px] text-teal-900/70 leading-snug">
                            {info.tip}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* SECTION 4: Exploration Synthesis & Correlation */}
          <section className="card-warm p-8 shadow-xl bg-secondary/5 border-l-4 border-l-secondary relative overflow-hidden">
            <h3 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              Discovery Synthesis & Interpretation
            </h3>
            
            {isSynthesisLoading ? (
              <div className="flex items-center gap-3 py-4">
                <Loader2 className="w-5 h-5 animate-spin text-secondary" />
                <span className="text-sm text-muted-foreground animate-pulse">Correlating your assessment results...</span>
              </div>
            ) : synthesis ? (
              <div className="space-y-6 relative z-10">
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground leading-relaxed text-lg italic">
                    "{synthesis.summary}"
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  {synthesis.recommendations.map((rec, i) => (
                    <div key={i} className="p-4 bg-white/60 rounded-xl border border-secondary/20 flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-xs font-medium text-secondary-900 leading-snug">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-muted/20 rounded-xl border border-dashed text-center">
                <p className="text-sm text-muted-foreground">Complete more assessments to generate a cross-domain interpretation.</p>
              </div>
            )}
          </section>

          {/* SECTION 5: Learning and working style */}
          {isVisible("bigfive") && bigFive.isComplete && (
            <section className="card-warm p-8 shadow-sm">
              <h3 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-500" />
                Learning and Working Style
              </h3>
              <p className="text-muted-foreground text-sm mb-6">This reflects how you tend to approach learning, interact with others, and manage your tasks.</p>
              <div className="grid md:grid-cols-2 gap-6">
                {bigFive.results.map((r, i) => {
                  const interpret = getRichInterpretation(r.key, r.pct || 0, gradeBand);
                  return (
                    <div key={i} className="p-5 bg-white rounded-2xl border border-violet-100 shadow-sm flex flex-col transition-all hover:shadow-md hover:border-violet-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-sm text-foreground">{r.label}</span>
                        <span className="text-[10px] font-bold text-violet-600 px-2 py-0.5 bg-violet-50 rounded-full">{interpret.level}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: `${r.pct}%` }} />
                        </div>
                        <span className="text-xs font-bold text-violet-600">{r.pct}%</span>
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed mb-4">
                        {interpret.explanation}
                      </p>
                      <div className="p-3 bg-violet-50/30 rounded-xl border border-violet-100/50 mt-auto">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-violet-700 mb-1">Development Tip for Grade {numericGrade}:</div>
                        <p className="text-[10px] text-violet-900/80 leading-snug">
                          {interpret.guidance}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* SECTION 6: Career readiness (CAAS) */}
          {isVisible("caas") && (
            <section className="card-warm p-8 shadow-sm">
              <h3 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Career Readiness
            </h3>
            {caas.isComplete ? (
              <>
                <p className="text-muted-foreground text-sm mb-6">These dimensions show your readiness to plan for the future, take responsibility, and explore your options.</p>
                <div className="grid md:grid-cols-2 gap-6">
                  {caas.results.map((r, i) => {
                    const interpret = getRichInterpretation(r.key, r.score || 0, gradeBand);
                    return (
                      <div key={i} className="p-5 bg-white rounded-2xl border border-emerald-100 shadow-sm flex flex-col transition-all hover:shadow-md hover:border-emerald-200">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm text-emerald-900">{r.label}</span>
                          <span className="text-[10px] font-bold text-emerald-700 px-2 py-0.5 bg-emerald-50 rounded-full">{interpret.level}</span>
                        </div>
                        <div className="text-2xl font-black text-emerald-600 mb-3">{r.score?.toFixed(1)} <span className="text-xs font-normal text-emerald-600/60">/ 5</span></div>
                        <p className="text-xs text-emerald-850 leading-relaxed mb-4">
                          {interpret.explanation}
                        </p>
                        <div className="p-3 bg-emerald-50/30 rounded-xl border border-emerald-100/50 mt-auto">
                          <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 mb-1">Action for Grade {numericGrade}:</div>
                          <p className="text-[10px] text-emerald-900/80 leading-snug">
                            {interpret.guidance}
                          </p>
                        </div>
                      </div>
                    );
                  })}
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

          {/* SECTION 7: Work Values */}
          {isVisible("workvalues") && workValues.isComplete && (
            <section className="card-warm p-8 shadow-sm">
              <h3 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-rose-500" />
                Core Work Values
              </h3>
              <p className="text-muted-foreground text-sm mb-6">These are the aspects of an environment that you value most. Consider these as you explore future options.</p>
              <div className="grid md:grid-cols-3 gap-6">
                {getTopResults(workValues.results, 3).map((r, i) => {
                  const interpret = getRichInterpretation(r.key, r.pct || 0, gradeBand);
                  return (
                    <div key={i} className="p-5 bg-white rounded-2xl border border-rose-100 shadow-sm flex flex-col transition-all hover:shadow-md hover:border-rose-200">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm text-rose-900">{r.label}</span>
                        <span className="text-[10px] font-bold text-rose-700 px-2 py-0.5 bg-rose-50 rounded-full">{interpret.level}</span>
                      </div>
                      <div className="text-2xl font-black text-rose-600 mb-3">{r.pct}%</div>
                      <p className="text-xs text-rose-800 leading-relaxed mb-4">
                        {interpret.explanation}
                      </p>
                      <div className="p-3 bg-rose-50/30 rounded-xl border border-rose-100/50 mt-auto">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-rose-700 mb-1">Grade {numericGrade} Exploration:</div>
                        <p className="text-[10px] text-rose-900/80 leading-snug">
                          {interpret.guidance}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* SECTION 8: Emotional and social reflection (EQ) */}
          {isVisible("eq") && eq.isComplete && (
            <section className="card-warm p-8 shadow-sm">
              <h3 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
                <Heart className="w-5 h-5 text-blue-500" />
                Emotional Skills Reflection
              </h3>
              <p className="text-muted-foreground text-sm mb-6">Self-awareness and empathy are key to professional growth. These are not fixed traits, but skills you can develop.</p>
              <div className="grid md:grid-cols-2 gap-6">
                {eq.results.map((r, i) => {
                  const interpret = getRichInterpretation(r.key, r.score || 0, gradeBand);
                  return (
                    <div key={i} className="p-5 bg-white rounded-2xl border border-blue-100 shadow-sm flex flex-col transition-all hover:shadow-md hover:border-blue-200">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm text-blue-900">{r.label}</span>
                        <span className="text-[10px] font-bold text-blue-700 px-2 py-0.5 bg-blue-50 rounded-full">{interpret.level}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${r.pct}%` }} />
                        </div>
                        <span className="text-xs font-bold text-blue-600">{r.score?.toFixed(1)} / 5</span>
                      </div>
                      <p className="text-xs text-blue-800 leading-relaxed mb-4">
                        {interpret.explanation}
                      </p>
                      <div className="p-3 bg-blue-50/30 rounded-xl border border-blue-100/50 mt-auto">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-blue-700 mb-1">Growth Guideline:</div>
                        <p className="text-[10px] text-blue-900/80 leading-snug">
                          {interpret.guidance}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* SECTION 9: Suggested exploration areas */}
          <section className="card-warm p-8 shadow-sm border-t-4 border-t-primary">
            <h3 className="text-2xl font-heading font-bold mb-6">Suggested Exploration Areas</h3>
            {riasec.isComplete ? (
              <OnetCareerSection riasecCode={topInterests.map(i => i.key[0].toUpperCase()).join("").slice(0, 3)} />
            ) : (
              <p className="text-muted-foreground italic">Complete your Career Interests assessment to see suggested fields.</p>
            )}
          </section>

          {/* SECTION 10: Recommended next actions */}
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
          {!isCounselorView && (
          <section className="card-warm p-8 shadow-sm border-l-4 border-l-primary/50">
            <h3 className="text-xl font-heading font-bold mb-6">Your Reflection</h3>
            <div className="space-y-4 text-foreground/80 italic text-sm">
              <p>• Do these results feel accurate to you? Why or why not?</p>
              <p>• Which result surprised you?</p>
              <p>• Which career field would you like to explore first?</p>
              <p>• What support do you need from a counselor, teacher, or parent?</p>
              <p>• What is one action you will take this month?</p>
            </div>
            <div className="mt-6 space-y-4">
              <textarea 
                className="w-full p-4 rounded-xl border bg-muted/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
                rows={4} 
                placeholder="Write your thoughts here..."
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
              />
              <Button 
                onClick={handleSaveReflection} 
                disabled={isSavingReflection || !reflectionText.trim()}
                className="bg-primary text-white"
              >
                {isSavingReflection ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Save Reflection</>
                )}
              </Button>
            </div>
          </section>
          )}
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
