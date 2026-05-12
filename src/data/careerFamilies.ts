export type RIASECCode = "R" | "I" | "A" | "S" | "E" | "C";

export interface Profession {
  title: string;
  description: string;
  salary: string;
  growth: string;
  education: string;
}

export interface Pathway {
  name: string;
  duration: string;
  description: string;
  type: "university" | "vocational" | "apprenticeship" | "self-directed";
}

export interface CareerFamily {
  id: string;
  name: string;
  code: RIASECCode;
  emoji: string;
  tagline: string;
  description: string;
  color: string;
  surfaceClass: string;
  badgeClass: string;
  subjects: string[];
  professions: Profession[];
  pathways: Pathway[];
}

export const RIASEC_LABELS: Record<RIASECCode, string> = {
  R: "Realistic",
  I: "Investigative",
  A: "Artistic",
  S: "Social",
  E: "Enterprising",
  C: "Conventional",
};

export const careerFamilies: CareerFamily[] = [
  {
    id: "realistic",
    name: "Builders & Makers",
    code: "R",
    emoji: "🔧",
    tagline: "Hands-on, practical, mechanical",
    description: "You like working with your hands, tools, machines, or animals. You prefer concrete tasks and seeing tangible results from your work.",
    color: "hsl(var(--sage-500))",
    surfaceClass: "surface-sage",
    badgeClass: "badge-sage",
    subjects: ["Design & Technology", "Engineering", "Physics", "Agriculture"],
    professions: [
      { title: "Civil Engineer", description: "Design and oversee construction of infrastructure like roads and bridges", salary: "$65K–$110K", growth: "7%", education: "Bachelor's degree" },
      { title: "Electrician", description: "Install and maintain electrical systems in buildings", salary: "$45K–$80K", growth: "9%", education: "Apprenticeship" },
      { title: "Mechanical Engineer", description: "Design and develop mechanical systems and devices", salary: "$70K–$120K", growth: "5%", education: "Bachelor's degree" },
      { title: "Veterinary Technician", description: "Assist veterinarians in caring for animals", salary: "$30K–$50K", growth: "15%", education: "Associate degree" },
    ],
    pathways: [
      { name: "Engineering Degree", duration: "4 years", description: "University program in mechanical, civil, or electrical engineering", type: "university" },
      { name: "Trades Apprenticeship", duration: "2–4 years", description: "Hands-on training in electrical, plumbing, or carpentry", type: "apprenticeship" },
      { name: "Technical Diploma", duration: "2 years", description: "Vocational program in manufacturing, construction, or mechanics", type: "vocational" },
    ],
  },
  {
    id: "investigative",
    name: "Thinkers & Analysts",
    code: "I",
    emoji: "🔬",
    tagline: "Analytical, intellectual, scientific",
    description: "You enjoy researching, analyzing data, and solving complex problems. You're curious and love understanding how things work.",
    color: "hsl(var(--sky-500))",
    surfaceClass: "surface-sky",
    badgeClass: "badge-sky",
    subjects: ["Mathematics", "Biology", "Chemistry", "Computer Science"],
    professions: [
      { title: "Data Scientist", description: "Analyze large datasets to extract insights and build predictive models", salary: "$80K–$140K", growth: "36%", education: "Master's degree" },
      { title: "Biomedical Researcher", description: "Study diseases and develop treatments to improve health", salary: "$60K–$100K", growth: "17%", education: "Doctoral degree" },
      { title: "Software Developer", description: "Design and build software applications and systems", salary: "$75K–$130K", growth: "25%", education: "Bachelor's degree" },
      { title: "Environmental Scientist", description: "Study the environment and develop solutions to environmental problems", salary: "$55K–$90K", growth: "8%", education: "Bachelor's degree" },
    ],
    pathways: [
      { name: "STEM Degree", duration: "4 years", description: "University program in science, technology, engineering, or math", type: "university" },
      { name: "Research Pathway", duration: "5–7 years", description: "Advanced degree (Master's or PhD) for research roles", type: "university" },
      { name: "Coding Bootcamp", duration: "3–6 months", description: "Intensive training in software development and data science", type: "self-directed" },
    ],
  },
  {
    id: "artistic",
    name: "Creators & Visionaries",
    code: "A",
    emoji: "🎨",
    tagline: "Creative, expressive, independent",
    description: "You value self-expression, creativity, and imagination. You enjoy creating art, music, writing, or design in various forms.",
    color: "hsl(var(--rose-500))",
    surfaceClass: "surface-rose",
    badgeClass: "badge-rose",
    subjects: ["Art & Design", "Music", "Drama", "English Literature", "Media Studies"],
    professions: [
      { title: "UX/UI Designer", description: "Design intuitive and beautiful digital interfaces for apps and websites", salary: "$65K–$115K", growth: "16%", education: "Bachelor's degree" },
      { title: "Architect", description: "Design buildings and spaces that are functional and aesthetically pleasing", salary: "$60K–$110K", growth: "3%", education: "Master's degree" },
      { title: "Content Creator", description: "Produce engaging content for social media, blogs, and video platforms", salary: "$35K–$85K", growth: "12%", education: "Self-directed" },
      { title: "Graphic Designer", description: "Create visual concepts for branding, marketing, and communication", salary: "$40K–$75K", growth: "3%", education: "Bachelor's degree" },
    ],
    pathways: [
      { name: "Fine Arts Degree", duration: "4 years", description: "University program in visual arts, design, or performing arts", type: "university" },
      { name: "Design Diploma", duration: "2 years", description: "Vocational program in graphic design, animation, or multimedia", type: "vocational" },
      { name: "Portfolio Building", duration: "Ongoing", description: "Self-directed learning through online courses, freelancing, and personal projects", type: "self-directed" },
    ],
  },
  {
    id: "social",
    name: "Helpers & Educators",
    code: "S",
    emoji: "🤝",
    tagline: "Helping, teaching, counseling",
    description: "You care deeply about others and want to make a positive difference. You enjoy teaching, coaching, healing, and supporting people.",
    color: "hsl(var(--amber-500))",
    surfaceClass: "surface-amber",
    badgeClass: "badge-amber",
    subjects: ["Psychology", "Sociology", "Health Sciences", "Physical Education"],
    professions: [
      { title: "School Counselor", description: "Guide students through academic, social, and career challenges", salary: "$50K–$85K", growth: "10%", education: "Master's degree" },
      { title: "Nurse", description: "Provide patient care and support in hospitals and clinics", salary: "$55K–$95K", growth: "6%", education: "Bachelor's degree" },
      { title: "Social Worker", description: "Help individuals and families cope with challenges and access services", salary: "$45K–$70K", growth: "9%", education: "Master's degree" },
      { title: "Physical Therapist", description: "Help patients recover from injuries and improve mobility", salary: "$70K–$100K", growth: "17%", education: "Doctoral degree" },
    ],
    pathways: [
      { name: "Healthcare Degree", duration: "4 years", description: "University program in nursing, therapy, or public health", type: "university" },
      { name: "Education Degree", duration: "4 years", description: "Teaching qualification with classroom placement", type: "university" },
      { name: "Care Apprenticeship", duration: "1–2 years", description: "Entry-level training in health and social care", type: "apprenticeship" },
    ],
  },
  {
    id: "enterprising",
    name: "Leaders & Persuaders",
    code: "E",
    emoji: "🚀",
    tagline: "Leading, persuading, managing",
    description: "You're energetic, ambitious, and love taking charge. You enjoy leading teams, starting ventures, and influencing outcomes.",
    color: "hsl(var(--amber-400))",
    surfaceClass: "surface-amber",
    badgeClass: "badge-amber",
    subjects: ["Business Studies", "Economics", "Law", "Marketing"],
    professions: [
      { title: "Marketing Manager", description: "Develop strategies to promote products and grow brand awareness", salary: "$65K–$130K", growth: "10%", education: "Bachelor's degree" },
      { title: "Entrepreneur", description: "Start and manage your own business venture", salary: "Variable", growth: "N/A", education: "Self-directed" },
      { title: "Lawyer", description: "Advise and represent clients in legal matters", salary: "$70K–$160K", growth: "10%", education: "Doctoral degree" },
      { title: "Project Manager", description: "Plan and oversee projects from start to finish", salary: "$60K–$110K", growth: "7%", education: "Bachelor's degree" },
    ],
    pathways: [
      { name: "Business Degree", duration: "4 years", description: "University program in business, management, or economics", type: "university" },
      { name: "Law Degree", duration: "7 years", description: "Undergraduate + law school for legal careers", type: "university" },
      { name: "Business Apprenticeship", duration: "2 years", description: "Work-based training in sales, management, or finance", type: "apprenticeship" },
    ],
  },
  {
    id: "conventional",
    name: "Organizers & Planners",
    code: "C",
    emoji: "📊",
    tagline: "Organizing, detail-oriented, structured",
    description: "You like order, structure, and working with data. You enjoy organizing information, following procedures, and ensuring accuracy.",
    color: "hsl(var(--sage-600))",
    surfaceClass: "surface-sage",
    badgeClass: "badge-sage",
    subjects: ["Mathematics", "Accounting", "ICT", "Business Studies"],
    professions: [
      { title: "Accountant", description: "Manage financial records and help businesses make financial decisions", salary: "$55K–$95K", growth: "6%", education: "Bachelor's degree" },
      { title: "Database Administrator", description: "Manage and secure an organization's data systems", salary: "$60K–$100K", growth: "8%", education: "Bachelor's degree" },
      { title: "Financial Analyst", description: "Evaluate investments and help businesses make financial plans", salary: "$65K–$110K", growth: "9%", education: "Bachelor's degree" },
      { title: "Logistics Coordinator", description: "Organize supply chains and ensure efficient delivery of goods", salary: "$45K–$75K", growth: "4%", education: "Associate degree" },
    ],
    pathways: [
      { name: "Finance/Accounting Degree", duration: "4 years", description: "University program in accounting, finance, or information systems", type: "university" },
      { name: "IT Certification", duration: "6–12 months", description: "Professional certifications in database management or IT", type: "self-directed" },
      { name: "Business Admin Apprenticeship", duration: "2 years", description: "Work-based training in administration, finance, or logistics", type: "apprenticeship" },
    ],
  },
];
