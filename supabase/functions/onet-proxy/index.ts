import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { endpoint, params } = await req.json()
    
    const username = Deno.env.get('ONET_USERNAME')
    const password = Deno.env.get('ONET_PASSWORD')

    if (!username || !password) {
      console.error("Missing O*NET credentials in environment variables")
      return new Response(
        JSON.stringify({ error: "O*NET credentials not configured" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Build URL
    const url = new URL(`https://services.onetcenter.org/ws${endpoint}`)
    Object.entries(params || {}).forEach(([k, v]) => url.searchParams.set(k, v as string))
    url.searchParams.set('fmt', 'json')

    console.log(`Calling O*NET API: ${url.toString()}`)

    const auth = btoa(`${username}:${password}`)
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error("O*NET API returned error:", data)
      return new Response(
        JSON.stringify({ error: data.error || `O*NET API error: ${response.status}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      )
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error("Unexpected proxy error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
