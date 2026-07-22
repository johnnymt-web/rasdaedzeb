// @ts-ignore  Deno remote imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MODEL = 'claude-sonnet-4-6'
// Ceiling only — the model stops when the JSON is complete, so a high cap does
// NOT increase latency; it just prevents the Georgian (token-heavy) JSON from
// being truncated mid-string (which caused "Unterminated string in JSON").
const MAX_TOKENS = 8000
// Resilience fallback: if Sonnet errors/truncates, retry once with the faster,
// cheaper Haiku before failing (E2/E3). The legacy path already uses this model.
const FALLBACK_MODEL = 'claude-haiku-4-5-20251001'

// --- types kept in sync with src/services/synthesisTypes.ts -----------------
interface Dimension { key: string; label: string; pct?: number; score?: number }
interface OnetCareer { title: string; code?: string; description?: string }
interface SynthesisInputV2 {
  studentId: string
  gradeBand: string
  lang: 'ka' | 'en'
  riasec: Dimension[]
  bigFive: Dimension[]
  caas: Dimension[]
  workValues: Dimension[]
  eq: Dimension[]
  skills: Dimension[]
  onetCareers?: OnetCareer[]
  studentGoals?: string
}

// --- prompt building --------------------------------------------------------
const GRADE_BAND_GUIDANCE: Record<string, string> = {
  discovery: "Grades 6-8. Focus on exploration, curiosity and self-discovery — NOT career decisions. Keep language simple and warm.",
  exploration: "Grades 9-10. Connect interests to school subjects and broad fields. Introduce strengths-based thinking. Early academic choices.",
  planning: "Grades 11-12. The student approaches real decisions. Connect the profile to university majors, vocational pathways, concrete next steps.",
  transition: "Grade 13 / transition. Focus on final pathway confirmation and near-term post-school steps.",
  unknown: "Grade unknown. Use balanced, encouraging, exploration-oriented language.",
}

function dimBlock(title: string, dims: Dimension[]): string {
  if (!dims || dims.length === 0) return `${title}: not completed`
  const lines = dims
    .map((d) => {
      const val = d.pct !== undefined ? `${d.pct}%` : d.score !== undefined ? `${d.score}/5` : 'n/a'
      return `  - ${d.label} (${d.key}): ${val}`
    })
    .join('\n')
  return `${title}:\n${lines}`
}

function buildSystemPrompt(input: SynthesisInputV2): string {
  const isKa = input.lang === 'ka'
  const langNote = isKa
    ? 'Write ALL natural-language field values in Georgian (ქართული). Use warm, encouraging, age-appropriate language. Career titles and Georgian pathways must be in Georgian.'
    : 'Write all natural-language field values in English. Use warm, encouraging, age-appropriate language.'

  return `You are a senior school career-guidance specialist for Georgian students (grades 6–13).
You deeply understand Holland's RIASEC, Big Five, CAAS (career adaptability), work values, and emotional-skill frameworks, the Georgian education system (TSU, GTU, Ilia, etc.), and local labour-market realities.

${langNote}

GRADE BAND: ${input.gradeBand} — ${GRADE_BAND_GUIDANCE[input.gradeBand] ?? GRADE_BAND_GUIDANCE.unknown}

DEVELOPMENTAL LADDER (grades 6→13): discovery (6-8) → exploration (9-10) → planning (11-12) → transition (13).
- developmentalStage.currentNode = the node for THIS student's grade band.
- whereYouAre = 1-2 warm sentences naming where they are on this ladder and why that stage matters.
- nextStep = the SINGLE most important developmental step toward the NEXT node — never skip ahead past the next node.
- Ground whereYouAre and nextStep in the assessments APPROPRIATE TO THIS GRADE BAND: discovery weighs interests (RIASEC) + skills; exploration also weighs Big Five + work values; planning/transition also weigh CAAS career-adaptability + emotional skills (EQ). Treat low CAAS scores (concern/control/curiosity/confidence) as concrete readiness gaps that shape the next step. Do not lean on instruments the student's grade band does not use.

INTERPRETATION RULES:
- Do NOT tell the student which career they "should" choose. Frame everything as exploration ("your responses suggest…", "you may enjoy exploring…").
- Anchor the whole report in the student's developmental stage above; don't give grade-11 advice to a grade-7 student.
- Your unique value is CROSS-INSTRUMENT synthesis — explain how RIASEC + Big Five + CAAS + work values + emotional skills interact. Do NOT just restate single scores.
- careerMatches must connect to the student's actual top patterns and give a concrete Georgian pathway (which university / programme / track).
- actionPlan items must be specific and Georgian-context-relevant (real clubs, olympiads, Georgian universities, realistic activities).
- swot is a GENTLE, growth-oriented self-reflection for the student: "growthAreas" and "considerations" must be framed as developable and encouraging, never as deficits or judgements.
- counselorNotes is clinical and specific (follow-up flags, not generic praise) and is NEVER shown to the student.

OUTPUT: Respond with ONLY a single valid JSON object. No markdown, no backticks, no preamble. Keep each narrative field concise — 40 to 80 words; be substantive but not verbose. Never return null or empty strings. Use this exact shape:
{
  "report": {
    "schemaVersion": 1,
    "profileSummary": "string",
    "developmentalStage": { "currentNode": "string", "whereYouAre": "string", "nextStep": "string" },
    "crossInstrumentInsights": "string",
    "careerMatches": [
      { "title": "string", "onetCode": "string", "matchReason": "string", "georgianPathway": "string" }
    ],
    "actionPlan": {
      "extracurriculars": ["string", "string", "string"],
      "skillsToBuild": ["string", "string", "string"],
      "nextSteps": ["string", "string", "string"]
    },
    "swot": {
      "strengths": ["string", "string"],
      "growthAreas": ["string", "string"],
      "opportunities": ["string", "string"],
      "considerations": ["string", "string"]
    }
  },
  "counselorNotes": {
    "flags": ["string"],
    "recommendedIntervention": "string",
    "parentTalkingPoints": ["string", "string"]
  }
}`
}

function buildUserPrompt(input: SynthesisInputV2): string {
  const onet = (input.onetCareers && input.onetCareers.length)
    ? input.onetCareers.map((c, i) => `  ${i + 1}. ${c.title}${c.code ? ` [${c.code}]` : ''}${c.description ? `: ${c.description}` : ''}`).join('\n')
    : '  (no O*NET matches supplied — derive plausible matches from the profile)'

  return `<student_profile>
  Grade band: ${input.gradeBand}
  ${input.studentGoals ? `Self-stated goals: "${input.studentGoals}"` : 'Self-stated goals: (none provided)'}
</student_profile>

<assessment_scores>
${dimBlock('RIASEC interests', input.riasec)}

${dimBlock('Employability skills', input.skills)}

${dimBlock('Big Five personality', input.bigFive)}

${dimBlock('CAAS career adaptability (1-5)', input.caas)}

${dimBlock('Work values', input.workValues)}

${dimBlock('Emotional skills (1-5)', input.eq)}
</assessment_scores>

<onet_matches>
${onet}
</onet_matches>

Produce the JSON described in the system prompt. Provide 3 careerMatches.`
}

// --- helpers ----------------------------------------------------------------
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Calls Anthropic with a given model and parses the JSON body. Throws on a
// non-2xx response or malformed/truncated JSON so the caller can fall back.
async function callAnthropic(model: string, system: string, userPrompt: string, apiKey: string): Promise<any> {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model, max_tokens: MAX_TOKENS, temperature: 0.4,
      system, messages: [{ role: 'user', content: userPrompt }],
    }),
  })
  const data = await resp.json()
  if (!resp.ok) throw new Error(`Anthropic ${model} error ${resp.status}`)
  const clean = (data.content?.[0]?.text ?? '').replace(/```json|```/g, '').trim()
  return JSON.parse(clean) // throws on truncated/malformed JSON
}

// --- legacy path (backward compatibility) -----------------------------------
// Older callers send { profileData } and expect { summary, recommendations }.
// This keeps existing screens working while new callers use the V2 { input } path.
async function handleLegacy(profileData: any, anthropicKey: string) {
  const { primaryInterest, traits, adapt, values, eqResults, gradeBand } = profileData

  const gradeBandKeyMap: Record<string, string> = {
    discovery: '7-8', exploration: '9-10', planning: '11-12',
    '7-8': '7-8', '9-10': '9-10', '11-12': '11-12',
  }
  const resolvedBand = gradeBandKeyMap[gradeBand || ''] || '9-10'

  const systemPrompt = `You are an experienced school career guidance specialist working with Georgian school students.
Synthesize the student's RIASEC interests, Big Five traits, Work Values, Emotional Skills (EQ), and Career Adaptability (CAAS) into a supportive, actionable brief for grade band ${resolvedBand}.
- Do not tell the student which career to choose; suggest exploration areas and next actions.
- Use encouraging, student-friendly, non-clinical language.
Respond with ONLY valid JSON, no markdown:
{ "summary": "max 4 sentences", "recommendations": ["rec 1", "rec 2", "rec 3"] }`

  const userPrompt = `Student Grade Band: ${gradeBand || 'Unknown'}
- Primary RIASEC Interest: ${primaryInterest || 'Unknown'}
- Big Five Traits: ${traits ? JSON.stringify(traits) : 'Not completed'}
- Work Values: ${values ? JSON.stringify(values) : 'Not completed'}
- Emotional Intelligence: ${eqResults ? JSON.stringify(eqResults) : 'Not completed'}
- Career Adaptability (CAAS) Score: ${adapt?.total_score || 'Not completed'} / 5.0`

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })
  const data = await resp.json()
  if (!resp.ok) { console.error('Anthropic API error (legacy):', data); throw new Error('Failed to generate AI synthesis') }
  const clean = (data.content?.[0]?.text ?? '').replace(/```json|```/g, '').trim()
  return json(JSON.parse(clean))
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json() as {
      input?: SynthesisInputV2; cacheKey?: string; forceRegenerate?: boolean; profileData?: any
    }

    const ANTHROPIC_API_KEY_EARLY = Deno.env.get('ANTHROPIC_API_KEY')
    if (!ANTHROPIC_API_KEY_EARLY) throw new Error('ANTHROPIC_API_KEY is not set')

    // Backward-compatible legacy path.
    if (body.profileData && !body.input) {
      return await handleLegacy(body.profileData, ANTHROPIC_API_KEY_EARLY)
    }

    const { input, cacheKey, forceRegenerate } = body
    if (!input?.studentId || !cacheKey) {
      return json({ error: 'Missing input.studentId or cacheKey' }, 400)
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set')

    const authHeader = req.headers.get('Authorization') ?? ''

    // Caller-scoped client: enforces RLS + resolves auth.uid() inside the RPCs.
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    // Service client: cache read/write bypassing RLS (writes only ever happen here).
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    // --- access guard -------------------------------------------------------
    const { data: canAccess, error: accessErr } = await userClient.rpc(
      'can_access_student_assessment', { target_student_id: input.studentId },
    )
    if (accessErr) throw accessErr
    if (!canAccess) return json({ error: 'Forbidden' }, 403)

    const { data: isCounselor } = await userClient.rpc(
      'is_assigned_counselor', { target_student_id: input.studentId },
    )

    // --- cache read ---------------------------------------------------------
    if (!forceRegenerate) {
      const { data: cached } = await admin
        .from('ai_reports')
        .select('report_json')
        .eq('student_id', input.studentId)
        .eq('cache_key', cacheKey)
        .maybeSingle()

      if (cached) {
        let counselorNotes: unknown = undefined
        if (isCounselor) {
          const { data: notes } = await admin
            .from('ai_report_counselor_notes')
            .select('notes_json')
            .eq('student_id', input.studentId)
            .eq('cache_key', cacheKey)
            .maybeSingle()
          counselorNotes = notes?.notes_json
        }
        return json({ report: cached.report_json, counselorNotes, cached: true })
      }
    }

    // --- rate limit (only real generations count; cache hits above are free) ---
    const { data: { user: caller } } = await userClient.auth.getUser()
    if (caller) {
      const { data: allowed } = await userClient.rpc('check_and_increment_ai_usage', {
        _user_id: caller.id, _daily_limit: 40,
      })
      if (allowed === false) {
        return json({ error: 'Daily AI report limit reached. Please try again tomorrow.' }, 429)
      }
    }

    // --- generate (primary model, fall back to Haiku on failure) ------------
    const systemPrompt = buildSystemPrompt(input)
    const userPrompt = buildUserPrompt(input)
    let parsed: any
    let usedModel = MODEL
    try {
      parsed = await callAnthropic(MODEL, systemPrompt, userPrompt, ANTHROPIC_API_KEY)
    } catch (primaryErr) {
      console.error(`Primary model ${MODEL} failed (${(primaryErr as Error).message}); falling back to ${FALLBACK_MODEL}`)
      parsed = await callAnthropic(FALLBACK_MODEL, systemPrompt, userPrompt, ANTHROPIC_API_KEY)
      usedModel = FALLBACK_MODEL
    }
    const report = parsed.report ?? parsed
    const counselorNotes = parsed.counselorNotes ?? null

    // --- cache write (service role; always store notes for later counselor use)
    await admin.from('ai_reports').upsert({
      student_id: input.studentId,
      cache_key: cacheKey,
      report_json: report,
      model: usedModel,
      lang: input.lang,
      grade_band: input.gradeBand,
      generated_at: new Date().toISOString(),
    }, { onConflict: 'student_id,cache_key' })

    if (counselorNotes) {
      await admin.from('ai_report_counselor_notes').upsert({
        student_id: input.studentId,
        cache_key: cacheKey,
        notes_json: counselorNotes,
        generated_at: new Date().toISOString(),
      }, { onConflict: 'student_id,cache_key' })
    }

    return json({
      report,
      counselorNotes: isCounselor ? counselorNotes : undefined,
      cached: false,
    })

  } catch (error: any) {
    console.error('Error in generate-synthesis function:', error)
    return json({ error: error.message }, 500)
  }
})
