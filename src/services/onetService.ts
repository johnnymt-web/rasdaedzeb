import { supabase } from "@/integrations/supabase/client";



export interface OnetCareer {
  code: string;
  title: string;
  job_zone?: number;
  salary_range?: string;
  outlook?: string;
  description?: string;
  tasks?: string[];
  skills?: string[];
  education?: string[];
  personality?: string;
}

export const fetchOnetData = async (endpoint: string, params: Record<string, string> = {}) => {
  const { data, error } = await supabase.functions.invoke('smart-action', {
    body: { endpoint, params }
  });

  if (error || data?.error) {
    throw new Error(`O*NET API error: ${error?.message || data?.error}`);
  }

  return data;
};

export const getCachedOnetData = async (cacheKey: string) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("onet_cache")
    .select("*")
    .eq("cache_key", cacheKey)
    .gte("fetched_at", thirtyDaysAgo)
    .maybeSingle();

  if (error || !data) return null;

  return data.data_json;
};

export const cacheOnetData = async (data: any, cacheKey: string) => {
  await supabase.from("onet_cache").upsert({
    cache_key: cacheKey,
    data_json: data,
    fetched_at: new Date().toISOString()
  }, { onConflict: "cache_key" });
};

export const getCareersByRiasec = async (riasecCode: string): Promise<OnetCareer[]> => {
  const cacheKey = `riasec:${riasecCode}`;
  try {
    const cached = await getCachedOnetData(cacheKey);
    if (cached) return (cached as unknown) as OnetCareer[];

    const data = await fetchOnetData("/mnm/interestprofiler/careers", { riasec: riasecCode });
    const careers = data.career || [];
    
    // Fetch enriched data for top 5
    const top5 = careers.slice(0, 5);
    const results = await Promise.allSettled(top5.map(async (c: any) => {
      // Fetch outlook and salary from specialized endpoint
      const outlookData = await fetchOnetData(`/mnm/careers/${c.code}/job_outlook`);
      
      // v2.0 outlook category detection
      const isBrightOutlook = outlookData.outlook?.category === 'Bright' || 
                            (Array.isArray(outlookData.bright_outlook) && outlookData.bright_outlook.length > 0);

      // Handle v2.0 salary structure including '_over' values
      let salary = undefined;
      if (outlookData.salary) {
        const median = outlookData.salary.annual_median || outlookData.salary.annual_median_over;
        if (median) {
          salary = `$${median.toLocaleString()}${outlookData.salary.annual_median_over ? '+' : ''}`;
        }
      }

      return {
        code: c.code,
        title: c.title,
        job_zone: outlookData.job_zone || c.job_zone,
        salary_range: salary,
        outlook: isBrightOutlook ? "Bright Outlook" : (outlookData.outlook?.category || undefined)
      };
    }));

    const enriched = results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        console.warn(`Failed to enrich career ${top5[index].code}:`, result.reason);
        return { code: top5[index].code, title: top5[index].title };
      }
    });

    await cacheOnetData(enriched, cacheKey);
    return enriched;
  } catch (error) {
    console.error("Error fetching RIASEC careers:", error);
    const fallback = await supabase
      .from("onet_cache")
      .select("data_json")
      .eq("cache_key", cacheKey)
      .maybeSingle();
      
    if (fallback?.data?.data_json) {
      return (fallback.data.data_json as unknown) as OnetCareer[];
    }
    
    throw new Error("O*NET service unavailable and no cache exists.");
  }
};

export const getCareerDetail = async (onetCode: string): Promise<OnetCareer> => {
  const cacheKey = `career:${onetCode}`;
  try {
    const cached = await getCachedOnetData(cacheKey);
    if (cached) return (cached as unknown) as OnetCareer;

    // Fetch multiple endpoints for a full profile
    const [summary, outlook, skillsData, personalityData] = await Promise.all([
      fetchOnetData(`/mnm/careers/${onetCode}/`),
      fetchOnetData(`/mnm/careers/${onetCode}/job_outlook`),
      fetchOnetData(`/mnm/careers/${onetCode}/skills`),
      fetchOnetData(`/mnm/careers/${onetCode}/personality`).catch(() => null)
    ]);
    
    // v2.0 outlook category detection
    const isBrightOutlook = outlook.outlook?.category === 'Bright' || 
                          (Array.isArray(outlook.bright_outlook) && outlook.bright_outlook.length > 0);

    const skills = Array.isArray(skillsData.skill) 
      ? skillsData.skill.map((s: any) => s.name)
      : (Array.isArray(skillsData) ? skillsData.map((s: any) => s.name) : []);

    // Handle v2.0 salary structure including '_over' values
    let salary = undefined;
    if (outlook.salary) {
      const median = outlook.salary.annual_median || outlook.salary.annual_median_over;
      if (median) {
        salary = `$${median.toLocaleString()}${outlook.salary.annual_median_over ? '+' : ''}`;
      }
    }

    const detail: OnetCareer = {
      code: onetCode,
      title: summary.title,
      description: summary.what_they_do,
      tasks: (summary.on_the_job || summary.tasks)?.slice(0, 5) || [],
      skills: skills.slice(0, 5),
      education: outlook.education_required || summary.education_required || [],
      personality: personalityData?.top_interest?.description || personalityData?.work_styles?.[0]?.description || undefined,
      salary_range: salary,
      outlook: isBrightOutlook ? "Bright Outlook" : (outlook.outlook?.category || undefined)
    };

    await cacheOnetData(detail, cacheKey);
    return detail;
  } catch (error) {
    console.error("Error fetching career detail:", error);
    const fallback = await supabase
      .from("onet_cache")
      .select("data_json")
      .eq("cache_key", cacheKey)
      .maybeSingle();
      
    if (fallback?.data?.data_json) {
      return (fallback.data.data_json as unknown) as OnetCareer;
    }
    
    throw new Error("O*NET service unavailable and no cache exists.");
  }
};
