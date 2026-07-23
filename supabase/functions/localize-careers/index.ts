// @ts-ignore  Deno remote import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { parseAiEnabled, AI_DISABLED_BODY, AI_DISABLED_STATUS } from "../_shared/aiFeatureFlag.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

const LANG_NAMES: Record<string, string> = { ka: 'Georgian', en: 'English' }

// Translates an ordered array of short career strings (titles, descriptions,
// tasks) into the target language. Falls back to the originals on any failure,
// so the UI never breaks — it just stays in English.
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // PF-001/PF-002 containment: fail closed before any body parsing or OpenAI
  // call. No external processing until AI_FEATURES_ENABLED=true.
  if (!parseAiEnabled(Deno.env.get('AI_FEATURES_ENABLED'))) {
    return json(AI_DISABLED_BODY, AI_DISABLED_STATUS)
  }

  let texts: string[] = []
  try {
    const body = await req.json()
    texts = Array.isArray(body.texts) ? body.texts : []
    const lang = body.lang as string | undefined

    if (texts.length === 0) return json({ translations: [] })
    if (!lang || lang === 'en') return json({ translations: texts })

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) throw new Error('Missing OPENAI_API_KEY')

    const langName = LANG_NAMES[lang] ?? lang
    const system = `You are a professional translator for a school career-guidance app.
Translate each string in the provided JSON array into ${langName}. The strings are occupation titles, short descriptions, and job tasks.
- Keep translations natural, concise, and appropriate for school students.
- Preserve the order and the exact number of items.
- Do not transliterate brand/technology names that are normally kept in Latin script.
Return ONLY a JSON object: {"translations": ["...", ...]} with the same number of items, same order. No commentary.`

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: JSON.stringify(texts) },
        ],
      }),
    })

    const data = await resp.json()
    if (!resp.ok) { console.error('OpenAI error (localize):', data); throw new Error('translation failed') }

    const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? '{}')
    const translations: string[] = Array.isArray(parsed.translations) ? parsed.translations : []

    // Guard: if the model returned the wrong count, fall back to originals.
    if (translations.length !== texts.length) return json({ translations: texts })

    return json({ translations })
  } catch (error: any) {
    console.error('localize-careers error:', error?.message)
    // Graceful fallback: return the original texts so the UI degrades to English.
    return json({ translations: texts })
  }
})
