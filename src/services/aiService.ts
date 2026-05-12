import { supabase } from "@/integrations/supabase/client";

export interface StudentProfileData {
  primaryInterest: string;
  traits: any;
  adapt: any;
  values: any;
  eqResults: Record<string, number>;
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
  let summary = "Local Synthesis Active: ";
  let recommendations = [];
  
  if (primaryInterest === "Social") {
    summary += "Student is highly people-oriented and collaborative. ";
    if (traits?.extraversion > 70) summary += "Their high extraversion suggests they thrive in group settings. ";
  } else if (primaryInterest === "Investigative") {
    summary += "Student shows a strong analytical and problem-solving mindset. ";
    if (traits?.openness > 70) summary += "Their curiosity makes them ideal for research-heavy roles. ";
  }

  if (values?.independence > 4) {
    summary += "They have a high need for autonomy and self-direction. ";
  }
  if (values?.relationships > 4) {
    summary += "Service to others and a supportive social environment are critical motivators. ";
  }

  if (traits?.conscientiousness < 40) {
    summary += "They may struggle with organization or long-term planning. ";
    recommendations.push("Set up recurring check-ins for deadline management.");
  }

  if (adapt?.total_score < 3) {
    summary += "Career adaptability is currently emerging, suggesting a need for more exploration. ";
    recommendations.push("Schedule a shadowing experience to build career confidence.");
  }

  if (values?.achievement > 4 && traits?.conscientiousness < 40) {
    recommendations.push("Focus on short-term 'win' milestones to sustain achievement motivation.");
  }

  if (eqResults["Self-Awareness"] && eqResults["Self-Awareness"] < 3) {
    summary += "Emotional self-awareness is currently an area for growth. ";
    recommendations.push("Introduce journaling or mindfulness exercises to build emotional vocabulary.");
  }
  
  if (eqResults["Relationship Management"] && eqResults["Relationship Management"] > 4) {
    summary += "They demonstrate excellent interpersonal leadership potential. ";
    recommendations.push("Encourage peer mentoring or leadership roles in group projects.");
  }

  return { summary, recommendations };
};
