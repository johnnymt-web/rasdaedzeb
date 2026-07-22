// @ts-ignore: Deno module resolution
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore: Deno module resolution
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { parseAiEnabled, AI_DISABLED_BODY, AI_DISABLED_STATUS } from "../_shared/aiFeatureFlag.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are a friendly school career exploration assistant called the Pathfinder Career Coach. You help students (ages 12–18) reflect on their interests, strengths, values, and next steps.

CRITICAL RULES:
- Do NOT decide the student's future career. Help them explore possibilities.
- Use supportive, age-appropriate language.
- Say "Your responses suggest..." or "You may want to explore..." — never "You should become..." or "Your ideal career is..."
- Encourage the student to discuss ideas with their counselor, teacher, or parent.
- Keep responses concise and always end with a follow-up question.
- Do not use clinical, diagnostic, or psychometric language.
- Focus on curiosity, reflection, and growth.`;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // PF-001/PF-002 containment: fail closed before touching the student payload
  // or any provider call. No external processing until AI_FEATURES_ENABLED=true.
  if (!parseAiEnabled(Deno.env.get('AI_FEATURES_ENABLED'))) {
    return new Response(JSON.stringify(AI_DISABLED_BODY), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: AI_DISABLED_STATUS,
    })
  }

  try {
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) throw new Error("Missing OPENAI_API_KEY")

    const { messages, reportContext, lang } = await req.json()

    // Report-grounded Q&A: when a report is supplied, restrict answers to it.
    let systemContent = SYSTEM_PROMPT
    if (reportContext) {
      const reportText = typeof reportContext === 'string' ? reportContext : JSON.stringify(reportContext)
      systemContent += `

The student is asking about THEIR OWN career exploration report. Ground every answer ONLY in the report data below — never invent scores, careers, or facts that are not present. If the report does not cover the question, say so warmly and suggest discussing it with their counselor.
${lang === 'ka' ? 'Answer in Georgian (ქართული).' : 'Answer in English.'}

STUDENT REPORT (JSON):
${reportText}`
    }

    console.log("Sending request to OpenAI...")

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemContent },
          ...messages
        ],
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("OpenAI error:", errorData)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("Coach error:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
