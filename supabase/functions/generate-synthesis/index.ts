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
    const systemPrompt = `You are an expert clinical career counselor. 
You will be provided with a student's psychometric data spanning RIASEC interests, Big Five personality traits, Work Values, Emotional Intelligence (EQ), and Career Adaptability (CAAS).
Your goal is to synthesize these domains into a highly actionable, cohesive clinical brief. 

Provide your response strictly as a JSON object with two keys:
1. "summary": A short, empathetic paragraph (max 4 sentences) synthesizing their profile. Do not restate raw numbers, focus on the psychological interplay.
2. "recommendations": An array of exactly 3 actionable strings (max 1 sentence each) tailored to their specific gaps and strengths.

Example JSON output format:
{
  "summary": "This student exhibits strong leadership potential driven by high extraversion and social interests, but their low conscientiousness indicates they may struggle with follow-through. Their high need for autonomy paired with emerging career adaptability suggests they need structured exploration before committing to a path.",
  "recommendations": [
    "Assign a group leadership role to leverage their extraversion.",
    "Implement weekly milestone check-ins to support their conscientiousness.",
    "Schedule an informational interview to build career adaptability."
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
