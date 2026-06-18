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
    const { studentName, assessments } = await req.json()
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set')

    const completedTypes = assessments
      .map((a: any) => a.assessment_type || a.type)
      .filter(Boolean)
      .join(', ')

    const systemPrompt = `You are a warm, supportive school career guidance specialist writing a brief insight report for a parent about their child's career exploration progress.

Your goal is to help parents understand their child's assessment results in plain, non-technical language, and give them practical ways to support their child at home.

CRITICAL INSTRUCTIONS:
- Write as if speaking directly to a caring parent, not an educator.
- Never use psychological jargon or diagnostic language.
- Be encouraging and growth-oriented.
- Focus on what the parent can DO, not just what the child scored.
- Keep it concise and warm.

Respond strictly as a JSON object:
{
  "summary": "2-3 sentence overview of the child's exploration progress in plain language",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "suggestions": ["actionable suggestion for parent 1", "actionable suggestion 2", "actionable suggestion 3"]
}`

    // PRIVACY (data minimization): do NOT send the student's real name to the
    // third-party AI provider. The insight is for the parent about their own
    // child, so a neutral reference is sufficient and the name adds no value.
    // `studentName` is intentionally not forwarded to OpenAI.
    const userPrompt = `Student: the parent's child (name withheld for privacy)
Completed assessments: ${completedTypes}
Assessment data: ${JSON.stringify(assessments.slice(0, 5))}`

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
    if (!response.ok) throw new Error('OpenAI API error')

    const result = JSON.parse(data.choices[0].message.content)
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error('Error in generate-parent-insight:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
