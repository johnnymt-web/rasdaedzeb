export interface Pathway {
  id: string;
  title: string;
  type: "University" | "Vocational" | "Apprenticeship" | "Employment";
  description: string;
  duration: string;
  riasecCodes: string[];
}

export const pathways: Pathway[] = [
  {
    id: "path_cs_degree",
    title: "Bachelor of Computer Science",
    type: "University",
    description: "A 3-4 year degree program focusing on software engineering, algorithms, and computing theory.",
    duration: "3-4 years",
    riasecCodes: ["Investigative", "Conventional"]
  },
  {
    id: "path_nursing_degree",
    title: "Bachelor of Nursing",
    type: "University",
    description: "A degree program preparing you for registered nursing with clinical placements.",
    duration: "3-4 years",
    riasecCodes: ["Social", "Investigative"]
  },
  {
    id: "path_electrician",
    title: "Electrical Apprenticeship",
    type: "Apprenticeship",
    description: "Learn on the job while studying to become a qualified electrician.",
    duration: "4 years",
    riasecCodes: ["Realistic", "Investigative"]
  },
  {
    id: "path_graphic_design",
    title: "Diploma of Graphic Design",
    type: "Vocational",
    description: "Practical training in digital design, typography, and visual communication.",
    duration: "1-2 years",
    riasecCodes: ["Artistic"]
  },
  {
    id: "path_business_admin",
    title: "Certificate IV in Business Administration",
    type: "Vocational",
    description: "Develop practical skills for office management and administrative roles.",
    duration: "6-12 months",
    riasecCodes: ["Conventional", "Enterprising"]
  },
  {
    id: "path_police",
    title: "Police Academy Training",
    type: "Employment",
    description: "Paid training program to become a sworn police officer.",
    duration: "6-8 months",
    riasecCodes: ["Realistic", "Social"]
  },
  {
    id: "path_teaching",
    title: "Bachelor of Education",
    type: "University",
    description: "Qualify to teach in primary or secondary schools with hands-on practicums.",
    duration: "4 years",
    riasecCodes: ["Social", "Artistic"]
  },
  {
    id: "path_carpentry",
    title: "Carpentry Apprenticeship",
    type: "Apprenticeship",
    description: "Build structures and frameworks as an apprentice carpenter.",
    duration: "3-4 years",
    riasecCodes: ["Realistic"]
  }
];
