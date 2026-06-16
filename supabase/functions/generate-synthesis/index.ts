// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { profileData } = await req.json()
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set')

    const { primaryInterest, traits, adapt, values, eqResults, gradeBand, reportTone } = profileData;

    const gradeBandInstructions: Record<string, string> = {
      "7-8": `This student is in grades 7-8 (age ~12-14). 
- Use simple, encouraging language. Avoid jargon.
- Focus on self-discovery and curiosity, not career decisions.
- Recommendations should involve school activities, hobbies, and exploration games/projects.
- Keep sentences short. Maximum 2 career-adjacent suggestions.`,
      "9-10": `This student is in grades 9-10 (age ~15-16).
- Use clear, motivating language appropriate for a teenager making early academic choices.
- Connect interests to school subjects and extracurricular pathways.
- Recommendations can include volunteer work, electives, and informational conversations with adults in fields of interest.
- Begin introducing the concept of strengths-based career exploration.`,
      "11-12": `This student is in grades 11-12 (age ~17-18).
- Use mature, direct language. The student is approaching real decisions.
- Connect profile data to university majors, vocational pathways, or entry-level opportunities.
- Recommendations should include concrete next steps: applications, shadowing, specific research.
- Be specific about how their traits and values translate to career fit.`
    };

    const gradeBandKeyMap: Record<string, string> = {
      "discovery": "7-8",
      "exploration": "9-10",
      "planning": "11-12",
      "7-8": "7-8",
      "9-10": "9-10",
      "11-12": "11-12",
    };

    const resolvedBand = gradeBandKeyMap[gradeBand || ""] || "9-10";
    const bandInstruction = gradeBandInstructions[resolvedBand];

    const systemPrompt = `You are an experienced school career guidance specialist working with Georgian school students.
You will be provided with a student's self-reflection and career exploration data spanning RIASEC interests, Big Five personality traits, Work Values, Emotional Skills (EQ), and Career Adaptability (CAAS).
Your goal is to synthesize these domains into a highly actionable, cohesive, and supportive brief.

GRADE BAND CONTEXT — apply strictly:
${bandInstruction}

UNIVERSAL INSTRUCTIONS:
- Do not tell the student what career they should choose. Suggest exploration areas and next actions.
- Use non-deterministic, student-friendly language (e.g., "Your responses suggest...", "You may enjoy exploring...").
- Do not use diagnostic, clinical, or overly psychological language.
- Tone must be encouraging, growth-oriented, and appropriate for the grade band above.

Respond with ONLY a valid JSON object, no preamble, no markdown:
{
  "summary": "A short empathetic paragraph (max 4 sentences) synthesizing how their interests and strengths work together.",
  "recommendations": [
    "Actionable string 1 (max 1 sentence, grade-appropriate)",
    "Actionable string 2 (max 1 sentence, grade-appropriate)",
    "Actionable string 3 (max 1 sentence, grade-appropriate)"
  ]
}`;

    const userPrompt = `Student Grade Band: ${gradeBand || 'Unknown'}
Student Data:
- Primary RIASEC Interest: ${primaryInterest || 'Unknown'}
- Big Five Traits: ${traits ? JSON.stringify(traits) : 'Not completed'}
- Work Values: ${values ? JSON.stringify(values) : 'Not completed'}
- Emotional Intelligence: ${eqResults ? JSON.stringify(eqResults) : 'Not completed'}
- Career Adaptability (CAAS) Score: ${adapt?.total_score || 'Not completed'} / 5.0`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('Anthropic API error:', data)
      throw new Error('Failed to generate AI synthesis')
    }

    const resultText = data.content[0].text
    const clean = resultText.replace(/```json|```/g, '').trim()
    const parsedResult = JSON.parse(clean)

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
