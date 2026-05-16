import i18next from "i18next";

export type GradeBand = "discovery" | "exploration" | "planning" | "transition" | "unknown";

/**
 * Maps a numeric or string grade to its developmental grade band.
 */
export const getGradeBand = (gradeStr: string | null | undefined): GradeBand => {
  if (!gradeStr) return "unknown";
  
  const match = gradeStr.match(/\d+/);
  if (!match) return "unknown";
  
  const grade = parseInt(match[0], 10);
  
  if (grade >= 6 && grade <= 8) return "discovery";
  if (grade >= 9 && grade <= 10) return "exploration";
  if (grade >= 11 && grade <= 12) return "planning";
  if (grade >= 13) return "transition";
  
  return "unknown";
};

/**
 * Returns a human-readable label for the grade band.
 */
export const getGradeBandLabel = (band: GradeBand): string => {
  switch (band) {
    case "discovery": return "Discovery Stage (Grades 6–8)";
    case "exploration": return "Exploration & Subject-Choice Stage (Grades 9–10)";
    case "planning": return "Pathway Planning Stage (Grades 11–12)";
    case "transition": return "Transition Stage (Grade 13)";
    default: return "Career Exploration";
  }
};

/**
 * Returns which assessments should be visible for a given grade band.
 */
export const getRecommendedAssessmentsForGradeBand = (band: GradeBand): string[] => {
  switch (band) {
    case "discovery":
      return ["riasec", "skills"];
    case "exploration":
      return ["riasec", "skills", "bigfive", "workvalues"];
    case "planning":
    case "transition":
      return ["riasec", "skills", "bigfive", "caas", "workvalues", "eq"];
    default:
      return ["riasec", "skills"];
  }
};

/**
 * Returns recommended activities for the student's grade band.
 */
export const getRecommendedActivitiesForGradeBand = (band: GradeBand): { key: string; label: string; description: string }[] => {
  switch (band) {
    case "discovery":
      return [
        { key: "career_video", label: "Watch a Career Video", description: "Watch a short video about a career field that sounds interesting to you." },
        { key: "role_model", label: "Role Model Reflection", description: "Think about someone you admire — what do they do that inspires you?" },
        { key: "subject_enjoyment", label: "Subject Enjoyment Map", description: "Make a list of school subjects you enjoy and why." },
        { key: "career_families", label: "Explore Career Families", description: "Browse the six RIASEC career families and see which ones feel right." },
        { key: "reflection_journal", label: "Reflection Journal", description: "Write about what you enjoyed learning this week." },
      ];
    case "exploration":
      return [
        { key: "subject_choice", label: "Subject-Choice Planner", description: "Connect your interests to your upcoming subject choices." },
        { key: "career_comparison", label: "Career Cluster Comparison", description: "Compare two career clusters that interest you." },
        { key: "professional_interview", label: "Interview a Professional", description: "Ask someone about their job — what they like and how they got started." },
        { key: "parent_conversation", label: "Parent Conversation Guide", description: "Use our guide to have a career conversation with your family." },
        { key: "portfolio_start", label: "Start Your Portfolio", description: "Begin collecting evidence of your skills, projects, and achievements." },
      ];
    case "planning":
      return [
        { key: "pathway_planner", label: "Pathway Planner", description: "Compare university, vocational, apprenticeship, and other pathways." },
        { key: "portfolio_builder", label: "Build Your Portfolio", description: "Add projects, certificates, and achievements to your portfolio." },
        { key: "mock_interview", label: "Mock Interview Practice", description: "Practice answering common interview questions." },
        { key: "personal_statement", label: "Personal Statement Draft", description: "Start drafting your personal statement for applications." },
        { key: "deadline_tracker", label: "Deadline Tracker", description: "Track application deadlines and requirements." },
      ];
    case "transition":
      return [
        { key: "final_review", label: "Final Pathway Review", description: "Review and confirm your chosen pathway before graduation." },
        { key: "backup_plan", label: "Backup Plan Builder", description: "Make sure you have a backup plan ready." },
        { key: "financial_planning", label: "Financial Planning Reflection", description: "Think about how you will manage finances after school." },
        { key: "transition_checklist", label: "Transition Checklist", description: "Complete your transition-to-independence checklist." },
        { key: "mentor_match", label: "Mentor/Alumni Matching", description: "Connect with a mentor or alumnus in your field of interest." },
      ];
    default:
      return [
        { key: "career_video", label: "Watch a Career Video", description: "Explore careers by watching short videos about different fields." },
      ];
  }
};

/**
 * Returns the appropriate report tone text for the grade band.
 */
export const getReportToneForGradeBand = (band: GradeBand): string => {
  switch (band) {
    case "discovery":
      return "You are beginning to explore what you enjoy, what you are curious about, and what activities make you feel confident. This is just the start of your journey!";
    case "exploration":
      return "Your current interests and values can help you explore possible subject choices and broad career fields. Use these results to start conversations with your counselor and family.";
    case "planning":
      return "Your results can help you compare realistic pathways, prepare applications, and plan next steps with your counselor and family.";
    case "transition":
      return "This report supports your final transition planning and helps identify what still needs to be completed before graduation.";
    default:
      return "Your interests, strengths, and goals will evolve over time. Use this report as a starting point for exploration and discussion.";
  }
};

/**
 * Returns counselor guidance flags relevant to the grade band.
 */
export const getCounselorFlagsForGradeBand = (band: GradeBand): { key: string; label: string; description: string }[] => {
  const common = [
    { key: "needs_exploration", label: "Needs more exploration", description: "Student may benefit from broader career exposure activities." },
    { key: "assessment_incomplete", label: "Assessment completion incomplete", description: "Student has not finished all recommended reflections for their grade level." },
    { key: "follow_up_overdue", label: "Follow-up overdue", description: "A scheduled follow-up with this student is overdue." },
  ];

  switch (band) {
    case "discovery":
      return [
        ...common,
        { key: "confidence_support", label: "Career confidence support recommended", description: "Student may benefit from activities that build career-related confidence." },
        { key: "career_exposure", label: "Career exposure recommended", description: "Student has not logged any career exposure activities yet." },
      ];
    case "exploration":
      return [
        ...common,
        { key: "subject_choice_discussion", label: "Subject-choice discussion recommended", description: "Student is approaching subject selection and may need guidance." },
        { key: "parent_conversation", label: "Parent conversation may be helpful", description: "Consider involving parents in a career exploration discussion." },
        { key: "portfolio_development", label: "Portfolio development recommended", description: "Student hasn't started building their portfolio yet." },
      ];
    case "planning":
    case "transition":
      return [
        ...common,
        { key: "transition_planning", label: "Transition planning needed", description: "Student needs support preparing for life after school." },
        { key: "pathway_comparison", label: "Pathway comparison recommended", description: "Student should compare at least two possible pathways." },
        { key: "parent_conversation", label: "Parent conversation may be helpful", description: "Consider involving parents in pathway planning discussions." },
        { key: "portfolio_development", label: "Portfolio development recommended", description: "Student should actively build their portfolio for applications." },
      ];
    default:
      return common;
  }
};

/**
 * Returns parent guidance content for the grade band.
 */
export const getParentGuidanceForGradeBand = (band: GradeBand): {
  summary: string;
  conversationPrompts: string[];
  supportActions: string[];
} => {
  switch (band) {
    case "discovery":
      return {
        summary: "At this stage, your child is beginning to discover their interests and strengths. There is no need to choose a career path yet — the focus is on curiosity, confidence, and exposure.",
        conversationPrompts: [
          "What activities make you feel most confident?",
          "Which school subjects do you enjoy the most and why?",
          "What careers have you recently heard about that sounded interesting?",
          "Is there anything you'd like to try or explore?",
        ],
        supportActions: [
          "Encourage your child to try different extracurricular activities.",
          "Watch career-related videos together and discuss what looks interesting.",
          "Avoid pressuring your child toward specific career choices at this stage.",
          "Celebrate curiosity and effort, not just achievement.",
        ],
      };
    case "exploration":
      return {
        summary: "Your child is now connecting their interests to school subjects and broad career fields. This is a good time to discuss subject choices and explore possibilities together.",
        conversationPrompts: [
          "Which subjects are you thinking about choosing and why?",
          "What kind of work environment sounds appealing to you?",
          "Have you talked to anyone about their career recently?",
          "How can I support you without adding pressure?",
        ],
        supportActions: [
          "Help your child research connections between subjects and career fields.",
          "Attend school career events together if possible.",
          "Encourage informational interviews with professionals in interesting fields.",
          "Support their subject choices even if they differ from your expectations.",
        ],
      };
    case "planning":
    case "transition":
      return {
        summary: "Your child is planning their post-school pathway. Your support in exploring realistic options, managing applications, and preparing for transition is especially valuable now.",
        conversationPrompts: [
          "What pathways are you considering and what draws you to them?",
          "Do you feel you have enough information to make your decision?",
          "What worries you most about life after school?",
          "What would you like to explore or prepare before graduation?",
        ],
        supportActions: [
          "Help your child visit universities, workplaces, or training institutions.",
          "Support them in tracking application deadlines and requirements.",
          "Discuss financial planning for their chosen pathway.",
          "Make sure they have a backup plan and feel confident about it.",
        ],
      };
    default:
      return {
        summary: "Your child's career exploration is a journey. These results are a starting point for positive conversations about interests, strengths, and future possibilities.",
        conversationPrompts: [
          "What activities make you feel most confident?",
          "Which subjects do you enjoy most?",
          "What would you like to explore next?",
        ],
        supportActions: [
          "Have regular, low-pressure conversations about interests and the future.",
          "Encourage exploration without forcing specific career choices.",
        ],
      };
  }
};

/**
 * Returns i18n-based band messaging (backwards-compatible with existing code).
 * Maps old band names to new ones for compatibility.
 */
export const getBandMessaging = (band: GradeBand) => {
  const t = i18next.t.bind(i18next);
  
  // Map new band names to existing i18n keys for backwards compatibility
  const i18nKey = band === "exploration" ? "alignment" 
    : band === "planning" || band === "transition" ? "decision" 
    : band === "discovery" ? "discovery"
    : "default";
  
  return {
    dashboardSubtitle: t(`bands.${i18nKey}.dashboardSubtitle`),
    reportInsight: t(`bands.${i18nKey}.reportInsight`),
    coachPrompt: t(`bands.${i18nKey}.coachPrompt`),
  };
};
