// @ts-ignore  Deno remote import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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

// Re-fetch a single RIASEC career list (mirrors onetService.getCareersByRiasec
// enrichment) so cached lists stay current with O*NET outlook/salary data.
async function refreshRiasecList(admin: any, riasecCode: string) {
  const proxy = async (endpoint: string, params: Record<string, string> = {}) => {
    const { data, error } = await admin.functions.invoke('onet-proxy', { body: { endpoint, params } })
    if (error || data?.error) throw new Error(error?.message || data?.error || 'onet-proxy error')
    return data
  }

  const data = await proxy('/mnm/interestprofiler/careers', { riasec: riasecCode })
  const careers = data.career || []
  const top5 = careers.slice(0, 5)

  const enriched = await Promise.allSettled(top5.map(async (c: any) => {
    const outlook = await proxy(`/mnm/careers/${c.code}/job_outlook`)
    const isBright = outlook.outlook?.category === 'Bright' ||
      (Array.isArray(outlook.bright_outlook) && outlook.bright_outlook.length > 0)
    let salary: string | undefined = undefined
    if (outlook.salary) {
      const median = outlook.salary.annual_median || outlook.salary.annual_median_over
      if (median) salary = `$${median.toLocaleString()}${outlook.salary.annual_median_over ? '+' : ''}`
    }
    return {
      code: c.code,
      title: c.title,
      job_zone: outlook.job_zone || c.job_zone,
      salary_range: salary,
      outlook: isBright ? 'Bright Outlook' : (outlook.outlook?.category || undefined),
    }
  }))

  return enriched.map((r, i) => r.status === 'fulfilled' ? r.value : { code: top5[i].code, title: top5[i].title })
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    // Refresh RIASEC list caches that are approaching the 30-day staleness window.
    const staleBefore = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    const { data: rows, error } = await admin
      .from('onet_cache')
      .select('cache_key, fetched_at')
      .like('cache_key', 'riasec:%')
      .lt('fetched_at', staleBefore)
      .order('fetched_at', { ascending: true })
      .limit(40) // bound runtime / O*NET call volume per run

    if (error) throw error

    let refreshed = 0
    const failures: string[] = []

    for (const row of rows ?? []) {
      const code = (row.cache_key as string).replace('riasec:', '')
      try {
        const careers = await refreshRiasecList(admin, code)
        if (Array.isArray(careers) && careers.length > 0) {
          await admin.from('onet_cache').upsert({
            cache_key: row.cache_key,
            data_json: careers,
            fetched_at: new Date().toISOString(),
          }, { onConflict: 'cache_key' })
          refreshed++
        }
      } catch (e: any) {
        console.error(`refresh failed for ${code}:`, e?.message)
        failures.push(code)
      }
    }

    return json({ scanned: rows?.length ?? 0, refreshed, failures })
  } catch (error: any) {
    console.error('refresh-onet-cache error:', error?.message)
    return json({ error: error.message }, 500)
  }
})
