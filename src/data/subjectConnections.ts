export interface Subject {
  id: string;
  name: string;
  riasecCodes: string[];
  description: string;
  category: "Sciences" | "Arts & Humanities" | "Mathematics" | "Technology" | "Business & Social";
}

export const schoolSubjects: Subject[] = [
  {
    id: "sub_maths",
    name: "Mathematics",
    riasecCodes: ["Investigative", "Conventional"],
    description: "Focus on logic, problem-solving, and structures.",
    category: "Mathematics"
  },
  {
    id: "sub_physics",
    name: "Physics",
    riasecCodes: ["Investigative", "Realistic"],
    description: "Explore the fundamental principles of the universe through math and theory.",
    category: "Sciences"
  },
  {
    id: "sub_biology",
    name: "Biology",
    riasecCodes: ["Investigative", "Social"],
    description: "Study living organisms, human health, and ecosystems.",
    category: "Sciences"
  },
  {
    id: "sub_chemistry",
    name: "Chemistry",
    riasecCodes: ["Investigative", "Realistic"],
    description: "Learn about the composition of matter and chemical reactions.",
    category: "Sciences"
  },
  {
    id: "sub_computer_science",
    name: "Computer Science",
    riasecCodes: ["Investigative", "Conventional"],
    description: "Programming, algorithms, and logical problem solving.",
    category: "Technology"
  },
  {
    id: "sub_art",
    name: "Visual Arts",
    riasecCodes: ["Artistic"],
    description: "Express creativity through painting, digital media, and sculpture.",
    category: "Arts & Humanities"
  },
  {
    id: "sub_literature",
    name: "Literature / English",
    riasecCodes: ["Artistic"],
    description: "Analyze texts, write creatively, and communicate complex ideas.",
    category: "Arts & Humanities"
  },
  {
    id: "sub_history",
    name: "History",
    riasecCodes: ["Investigative", "Artistic"],
    description: "Study past events, analyze sources, and understand human societies.",
    category: "Arts & Humanities"
  },
  {
    id: "sub_business",
    name: "Business Studies",
    riasecCodes: ["Enterprising", "Conventional"],
    description: "Learn about economics, management, and organizational structures.",
    category: "Business & Social"
  },
  {
    id: "sub_psychology",
    name: "Psychology",
    riasecCodes: ["Social", "Investigative"],
    description: "Understand human behavior and mental processes.",
    category: "Business & Social"
  },
  {
    id: "sub_pe",
    name: "Physical Education",
    riasecCodes: ["Realistic", "Social"],
    description: "Focus on sports, teamwork, and human physiology.",
    category: "Arts & Humanities"
  },
  {
    id: "sub_design_tech",
    name: "Design & Technology",
    riasecCodes: ["Realistic", "Artistic"],
    description: "Create functional products using engineering and design principles.",
    category: "Technology"
  }
];

export const getSubjectsByInterests = (interests: string[]): Subject[] => {
  return schoolSubjects.filter(subject => 
    subject.riasecCodes.some(code => interests.includes(code))
  );
};
