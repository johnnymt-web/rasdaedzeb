import { supabase } from "@/integrations/supabase/client";

export interface StudentProfileData {
  primaryInterest: string;
  traits: any;
  adapt: any;
  values: any;
  eqResults: Record<string, number> | null;
  gradeBand?: string;
  reportTone?: string;
}

export interface SynthesisResponse {
  summary: string;
  recommendations: string[];
}

/**
 * Service to connect to the Supabase Edge Function that powers
 * the generative AI counselor brief using OpenAI/Claude.
 */
export const generateAiSynthesis = async (
  profileData: StudentProfileData
): Promise<SynthesisResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-synthesis', {
      body: { profileData }
    });

    if (error) throw error;
    if (data) return data as SynthesisResponse;
    
    throw new Error("No data returned from AI service");

  } catch (error) {
    console.warn("AI Synthesis failed, falling back to local logic.", error);
    return generateLocalSynthesis(profileData);
  }
};

/**
 * Fallback local logic used if the Edge Function is not yet deployed 
 * or if there is an error hitting the OpenAI API.
 */
const generateLocalSynthesis = (data: StudentProfileData): SynthesisResponse => {
  const { primaryInterest, traits, adapt, values, eqResults } = data;
  let summary = "Discovery Guidance Brief: ";
  let recommendations = [];
  
  if (primaryInterest === "Social") {
    summary += "You show a strong interest in working with people and collaborative environments. ";
    if (traits?.extraversion > 70) summary += "Your energetic approach to social settings suggests you might enjoy group projects or leadership roles. ";
  } else if (primaryInterest === "Investigative") {
    summary += "You show a strong analytical and problem-solving mindset. ";
    if (traits?.openness > 70) summary += "Your curiosity makes you a great fit for research or exploration-focused activities. ";
  } else {
    summary += `Your primary interest in ${primaryInterest} areas suggests unique strengths to explore. `;
  }

  if (values?.independence > 4) {
    summary += "You seem to value independence and making your own choices. ";
  }
  if (values?.relationships > 4) {
    summary += "Working in a supportive environment with good people is important to you. ";
  }

  if (traits?.conscientiousness && traits.conscientiousness < 40) {
    summary += "You might sometimes find highly structured or strict environments challenging. ";
    recommendations.push("Try breaking large assignments into smaller, manageable steps.");
  }

  if (adapt && adapt.total_score < 3) {
    summary += "You are just starting to map out your future career ideas, which is completely normal. ";
    recommendations.push("Schedule a brief chat with your school counselor to explore what subjects interest you most.");
  }

  if (values?.achievement > 4 && traits?.conscientiousness && traits.conscientiousness < 40) {
    recommendations.push("Focus on celebrating small, short-term wins to keep your motivation high.");
  }

  if (eqResults && eqResults["Self-Awareness"] && eqResults["Self-Awareness"] < 3) {
    summary += "Building your emotional self-awareness could be a great next step. ";
    recommendations.push("Try a simple weekly reflection journal to notice how different tasks make you feel.");
  }
  
  if (eqResults && eqResults["Relationship Management"] && eqResults["Relationship Management"] > 4) {
    summary += "You show great potential for teamwork and helping others succeed. ";
    recommendations.push("Consider joining a peer mentoring program or a club leadership team.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Keep exploring different subjects and extracurriculars to see what sparks your interest.");
    recommendations.push("Discuss your Discovery Profile with your family or counselor.");
  }

  return { summary, recommendations };
};
