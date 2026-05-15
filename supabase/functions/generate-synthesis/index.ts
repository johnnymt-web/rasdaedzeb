// @ts-ignore - Deno imports will show as errors in a Node/React TS project
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { profileData } = await req.json()
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    const { primaryInterest, traits, adapt, values, eqResults } = profileData;

    // Construct the prompt context
    const systemPrompt = `You are an experienced school career guidance specialist. 
You will be provided with a student's self-reflection and career exploration data spanning RIASEC interests, learning styles, Work Values, Emotional Skills reflection (EQ), and Career Adaptability (CAAS).
Your goal is to synthesize these domains into a highly actionable, cohesive, and supportive brief for the student and counselor.

CRITICAL INSTRUCTIONS:
- Do not tell the student what career they should choose. Suggest exploration areas and next actions.
- Use non-deterministic, student-friendly language (e.g., "Your responses suggest...", "You may enjoy exploring...").
- Do not use diagnostic, clinical, or overly psychological language.
- Ensure the tone is encouraging, age-appropriate, and growth-oriented.

Provide your response strictly as a JSON object with two keys:
1. "summary": A short, empathetic paragraph (max 4 sentences) synthesizing their profile. Focus on how their interests and strengths work together.
2. "recommendations": An array of exactly 3 actionable strings (max 1 sentence each) tailored to their specific needs, focusing on exploration, reflection, and skill-building.

Example JSON output format:
{
  "summary": "Your responses suggest a strong interest in working with people and leading teams, paired with a preference for dynamic environments. Your exploration profile indicates you may enjoy taking initiative on projects while maintaining a focus on cooperation and empathy. Given your growing career adaptability, it's a great time to explore various fields to see what aligns best with your values.",
  "recommendations": [
    "Consider joining a school club or community group where you can practice your leadership skills.",
    "Schedule a meeting with your counselor to discuss subjects that involve communication and teamwork.",
    "Research two or three career areas related to social support and leadership to see what daily tasks appeal to you."
  ]
}`

    const userPrompt = `
Student Data:
- Primary RIASEC Interest: ${primaryInterest || 'Unknown'}
- Big Five Traits: ${traits ? JSON.stringify(traits) : 'Unknown'}
- Work Values: ${values ? JSON.stringify(values) : 'Unknown'}
- Emotional Intelligence: ${eqResults ? JSON.stringify(eqResults) : 'Unknown'}
- Career Adaptability (CAAS) Score: ${adapt?.total_score || 'Unknown'} / 5.0
`

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('OpenAI API error:', data)
      throw new Error('Failed to generate AI synthesis')
    }

    const resultText = data.choices[0].message.content
    const parsedResult = JSON.parse(resultText)

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error('Error in generate-synthesis function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
