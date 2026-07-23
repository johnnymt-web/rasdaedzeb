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

const STATIC_CAREERS: Record<string, OnetCareer[]> = {
  R: [
    {
      code: "17-2199.08",
      title: "Robotics Engineer",
      job_zone: 4,
      salary_range: "$108,000",
      outlook: "Bright Outlook",
      description: "Research, design, develop, or test robotic applications.",
      tasks: ["Design software to control robots", "Conduct research on robotic technology", "Provide technical support for robotic systems", "Integrate robotics with other systems", "Build prototypes of robotic devices"],
      skills: ["Programming", "Critical Thinking", "Systems Analysis", "Complex Problem Solving", "Mathematics"],
      education: ["Bachelor's Degree (82%)", "Master's Degree (15%)", "Associate's Degree (3%)"]
    },
    {
      code: "17-2141.00",
      title: "Mechanical Engineer",
      job_zone: 4,
      salary_range: "$95,000",
      outlook: "Average",
      description: "Perform engineering duties in planning and designing tools, engines, and other physically functioning machinery.",
      tasks: ["Design mechanical devices", "Analyze equipment specs", "Oversee fabrication of prototypes", "Test mechanical systems", "Coordinate with manufacturing teams"],
      skills: ["Mathematics", "Science", "Complex Problem Solving", "Critical Thinking", "Operations Analysis"],
      education: ["Bachelor's Degree (85%)", "Master's Degree (10%)", "Doctoral Degree (5%)"]
    },
    {
      code: "15-1231.00",
      title: "Computer Network Support Specialist",
      job_zone: 3,
      salary_range: "$68,000",
      outlook: "Bright Outlook",
      description: "Analyze, test, troubleshoot, and evaluate existing network systems.",
      tasks: ["Back up network data", "Install network software", "Diagnose network hardware problems", "Document network configuration", "Assist users with network issues"],
      skills: ["Troubleshooting", "Active Listening", "Reading Comprehension", "Complex Problem Solving", "Systems Analysis"],
      education: ["Associate's Degree (40%)", "Bachelor's Degree (35%)", "High School Diploma (25%)"]
    }
  ],
  I: [
    {
      code: "15-2051.00",
      title: "Data Scientist",
      job_zone: 4,
      salary_range: "$115,000",
      outlook: "Bright Outlook",
      description: "Develop and implement algorithmic models to extract insights from large data sets.",
      tasks: ["Identify business insights using machine learning", "Clean and analyze large datasets", "Develop analytical models", "Collaborate with product teams", "Present visual data reports"],
      skills: ["Mathematics", "Programming", "Critical Thinking", "Complex Problem Solving", "Active Learning"],
      education: ["Master's Degree (50%)", "Doctoral Degree (30%)", "Bachelor's Degree (20%)"]
    },
    {
      code: "15-1252.00",
      title: "Software Developer",
      job_zone: 4,
      salary_range: "$124,000",
      outlook: "Bright Outlook",
      description: "Research, design, and develop computer applications software or specialized utility programs.",
      tasks: ["Write clean application code", "Analyze user software requirements", "Collaborate on system architecture", "Test and debug software platforms", "Maintain technical software docs"],
      skills: ["Programming", "Complex Problem Solving", "Active Learning", "Critical Thinking", "Reading Comprehension"],
      education: ["Bachelor's Degree (75%)", "Master's Degree (18%)", "Associate's Degree (7%)"]
    },
    {
      code: "19-1021.00",
      title: "Biochemist",
      job_zone: 5,
      salary_range: "$103,000",
      outlook: "Average",
      description: "Study the chemical composition or physical principles of living cells and organisms.",
      tasks: ["Analyze chemical reactions in cells", "Manage laboratory technicians", "Design research experiments", "Synthesize chemical compounds", "Publish scientific research papers"],
      skills: ["Science", "Writing", "Quality Control Analysis", "Active Learning", "Mathematics"],
      education: ["Doctoral Degree (65%)", "Master's Degree (25%)", "Bachelor's Degree (10%)"]
    }
  ],
  A: [
    {
      code: "15-1255.00",
      title: "UX/UI Designer",
      job_zone: 4,
      salary_range: "$98,000",
      outlook: "Bright Outlook",
      description: "Design graphical user interfaces and digital experiences to make software easy and enjoyable to use.",
      tasks: ["Create wireframes and prototypes", "Conduct user testing sessions", "Collaborate with developers on visual designs", "Analyze user workflow requirements", "Design visual interfaces"],
      skills: ["Technology Design", "Operations Analysis", "Social Perceptiveness", "Active Listening", "Critical Thinking"],
      education: ["Bachelor's Degree (70%)", "Associate's Degree (15%)", "Master's Degree (15%)"]
    },
    {
      code: "27-1024.00",
      title: "Graphic Designer",
      job_zone: 4,
      salary_range: "$58,000",
      outlook: "Average",
      description: "Create visual concepts, using computer software or by hand, to communicate ideas that inspire, inform, and captivate consumers.",
      tasks: ["Design marketing collateral", "Review visual materials for alignment", "Present design concepts to clients", "Develop visual branding guides", "Produce mockups of web layouts"],
      skills: ["Active Listening", "Critical Thinking", "Operations Analysis", "Speaking", "Time Management"],
      education: ["Bachelor's Degree (78%)", "Associate's Degree (12%)", "High School Diploma (10%)"]
    },
    {
      code: "27-3043.00",
      title: "Writer & Content Creator",
      job_zone: 4,
      salary_range: "$73,000",
      outlook: "Average",
      description: "Develop and write written content for digital media, books, advertisements, or informational journals.",
      tasks: ["Conduct research on content topics", "Write copy for digital publications", "Proofread and edit draft publications", "Collaborate with creative design editors", "Develop editorial themes and outlines"],
      skills: ["Writing", "Reading Comprehension", "Time Management", "Active Learning", "Critical Thinking"],
      education: ["Bachelor's Degree (82%)", "High School Diploma (10%)", "Master's Degree (8%)"]
    }
  ],
  S: [
    {
      code: "19-3031.02",
      title: "Clinical Psychologist",
      job_zone: 5,
      salary_range: "$90,000",
      outlook: "Bright Outlook",
      description: "Diagnose or evaluate mental and emotional disorders of individuals, and provide therapy.",
      tasks: ["Conduct psychological assessments", "Formulate personalized treatment plans", "Provide counseling and support", "Conduct research on therapeutic techniques", "Document student counselor records"],
      skills: ["Social Perceptiveness", "Active Listening", "Speaking", "Service Orientation", "Critical Thinking"],
      education: ["Doctoral Degree (88%)", "Master's Degree (12%)"]
    },
    {
      code: "25-2031.00",
      title: "High School Teacher",
      job_zone: 4,
      salary_range: "$65,000",
      outlook: "Average",
      description: "Teach students in one or more subjects in public or private secondary schools.",
      tasks: ["Prepare lesson plans", "Instruct classroom students", "Evaluate student performance and grading", "Maintain classroom student records", "Collaborate with school counselors"],
      skills: ["Instructing", "Learning Strategies", "Social Perceptiveness", "Speaking", "Active Listening"],
      education: ["Bachelor's Degree (60%)", "Master's Degree (38%)", "Doctoral Degree (2%)"]
    },
    {
      code: "29-1127.00",
      title: "Speech-Language Pathologist",
      job_zone: 5,
      salary_range: "$84,000",
      outlook: "Bright Outlook",
      description: "Assess and treat persons with speech, language, voice, and fluency disorders.",
      tasks: ["Diagnose speech disorders", "Provide therapeutic treatments", "Document student progress", "Consult with educational therapists", "Counsel families on speech exercises"],
      skills: ["Active Listening", "Social Perceptiveness", "Critical Thinking", "Speaking", "Reading Comprehension"],
      education: ["Master's Degree (90%)", "Doctoral Degree (10%)"]
    }
  ],
  E: [
    {
      code: "11-9199.00",
      title: "Product Manager",
      job_zone: 4,
      salary_range: "$118,000",
      outlook: "Bright Outlook",
      description: "Lead product development teams from conception to launch, aligning business objectives with customer needs.",
      tasks: ["Define product development roadmaps", "Coordinate cross-functional project teams", "Conduct market research and forecasting", "Draft clear feature user requirements", "Monitor visual design specifications"],
      skills: ["Coordination", "Decision Making", "Negotiation", "Critical Thinking", "Social Perceptiveness"],
      education: ["Bachelor's Degree (75%)", "Master's Degree (20%)", "Associate's Degree (5%)"]
    },
    {
      code: "11-2021.00",
      title: "Marketing Manager",
      job_zone: 4,
      salary_range: "$140,000",
      outlook: "Bright Outlook",
      description: "Plan, direct, or coordinate marketing policies and programs, such as determining the demand for products and services.",
      tasks: ["Develop comprehensive marketing plans", "Manage campaign budgets", "Coordinate creative agency partners", "Analyze customer market insights", "Monitor competitor marketing campaigns"],
      skills: ["Speaking", "Critical Thinking", "Social Perceptiveness", "Active Listening", "Writing"],
      education: ["Bachelor's Degree (72%)", "Master's Degree (22%)", "Associate's Degree (6%)"]
    },
    {
      code: "27-3031.00",
      title: "Public Relations Specialist",
      job_zone: 4,
      salary_range: "$67,000",
      outlook: "Bright Outlook",
      description: "Engage in promoting or creating an intended public image for individuals, groups, or organizations.",
      tasks: ["Write press releases", "Manage media interview requests", "Coordinate public speaking events", "Draft copy for promotional campaigns", "Monitor public social media branding"],
      skills: ["Writing", "Speaking", "Active Listening", "Social Perceptiveness", "Reading Comprehension"],
      education: ["Bachelor's Degree (85%)", "Master's Degree (10%)", "Associate's Degree (5%)"]
    }
  ],
  C: [
    {
      code: "15-2051.01",
      title: "Data Analyst",
      job_zone: 4,
      salary_range: "$82,000",
      outlook: "Bright Outlook",
      description: "Collect, process, and perform statistical analyses on structured data to optimize operational efficiency.",
      tasks: ["Write SQL queries to extract data", "Create visual dashboards for business metrics", "Generate analytical performance reports", "Clean database records for consistency", "Analyze business operations datasets"],
      skills: ["Systems Analysis", "Critical Thinking", "Programming", "Mathematics", "Active Learning"],
      education: ["Bachelor's Degree (80%)", "Master's Degree (15%)", "Associate's Degree (5%)"]
    },
    {
      code: "13-2011.00",
      title: "Financial Accountant",
      job_zone: 4,
      salary_range: "$78,000",
      outlook: "Average",
      description: "Analyze financial information and prepare financial reports to determine or maintain record of assets, liabilities, profit and loss.",
      tasks: ["Audit financial records for accuracy", "Prepare tax returns and statements", "Advise on budget optimizations", "Review company accounting systems", "Draft monthly profit and loss docs"],
      skills: ["Mathematics", "Critical Thinking", "Monitoring", "Active Listening", "Reading Comprehension"],
      education: ["Bachelor's Degree (82%)", "Master's Degree (15%)", "Associate's Degree (3%)"]
    },
    {
      code: "15-1242.00",
      title: "Database Administrator",
      job_zone: 4,
      salary_range: "$98,000",
      outlook: "Average",
      description: "Administer, test, and implement computer databases, applying knowledge of database management systems.",
      tasks: ["Perform database security audits", "Configure database servers", "Coordinate system backups", "Fix database connection errors", "Install database storage drivers"],
      skills: ["Programming", "Reading Comprehension", "Quality Control Analysis", "Systems Analysis", "Troubleshooting"],
      education: ["Bachelor's Degree (70%)", "Associate's Degree (20%)", "Master's Degree (10%)"]
    }
  ]
};

export const fetchOnetData = async (endpoint: string, params: Record<string, string> = {}) => {
  const { data, error } = await supabase.functions.invoke('onet-proxy', {
    body: { endpoint, params }
  });

  if (error || data?.error) {
    if (data?.error === "O*NET credentials not configured") {
      throw new Error("Career exploration data is temporarily unavailable because the service is missing credentials. Please contact your school administrator.");
    }
    throw new Error(`O*NET API error: ${error?.message || data?.error || 'Unknown error'}`);
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
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return (cached as unknown) as OnetCareer[];
    }

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

    if (enriched && enriched.length > 0) {
      await cacheOnetData(enriched, cacheKey);
      return enriched;
    }
    
    // Fallback to static catalog if empty
    const primaryCode = riasecCode[0]?.toUpperCase() || "R";
    return STATIC_CAREERS[primaryCode] || STATIC_CAREERS.R;

  } catch (error) {
    console.error("Error fetching RIASEC careers:", error);
    const fallback = await supabase
      .from("onet_cache")
      .select("data_json")
      .eq("cache_key", cacheKey)
      .maybeSingle();
      
    if (fallback?.data?.data_json && Array.isArray(fallback.data.data_json) && fallback.data.data_json.length > 0) {
      return (fallback.data.data_json as unknown) as OnetCareer[];
    }
    
    const primaryCode = riasecCode[0]?.toUpperCase() || "R";
    return STATIC_CAREERS[primaryCode] || STATIC_CAREERS.R;
  }
};

export const getCareerDetail = async (onetCode: string): Promise<OnetCareer> => {
  const cacheKey = `career:${onetCode}`;
  try {
    const cached = await getCachedOnetData(cacheKey);
    if (cached && typeof cached === 'object' && Object.keys(cached).length > 0) {
      return (cached as unknown) as OnetCareer;
    }

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
      
    if (fallback?.data?.data_json && typeof fallback.data.data_json === 'object' && Object.keys(fallback.data.data_json).length > 0) {
      return (fallback.data.data_json as unknown) as OnetCareer;
    }
    
    // Look in static catalog
    for (const list of Object.values(STATIC_CAREERS)) {
      const found = list.find(c => c.code === onetCode);
      if (found) return found;
    }
    
    throw new Error("O*NET service unavailable and no cache exists.");
  }
};

// ===========================================================================
// AI-localized career titles (ESCO has no Georgian; we translate O*NET instead)
// ===========================================================================

const stableHash = (s: string): string => {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
  return Math.abs(h).toString(36);
};

// Session-scoped memoization for localizeTexts. The Edge Function call below
// only ever gets written to the durable onet_cache table when a translation
// actually succeeds - while AI is disabled (fail-closed), it always falls
// back to the originals and nothing gets persisted, so without this in-memory
// layer every single language toggle re-issues the same network round trip
// forever. Keyed identically to the DB cache key; storing the settled Promise
// (never rejects - see below) also coalesces concurrent callers.
const localizeTextsMemo = new Map<string, Promise<string[]>>();

/**
 * Translate an ordered list of short career strings into `lang`, cached in
 * onet_cache. Falls back to the originals (English) on any failure.
 */
export const localizeTexts = async (texts: string[], lang: string): Promise<string[]> => {
  if (texts.length === 0 || lang === "en") return texts;
  const cacheKey = `i18n:${lang}:${stableHash(texts.join(""))}`;

  const memoized = localizeTextsMemo.get(cacheKey);
  if (memoized) return memoized;

  const request = (async () => {
    try {
      const cached = await getCachedOnetData(cacheKey);
      if (cached && Array.isArray(cached) && cached.length === texts.length) {
        return cached as string[];
      }
      const { data, error } = await supabase.functions.invoke("localize-careers", {
        body: { texts, lang },
      });
      if (error || !data) return texts;
      const translations = (data as any).translations;
      if (Array.isArray(translations) && translations.length === texts.length) {
        await cacheOnetData(translations, cacheKey);
        return translations as string[];
      }
      return texts;
    } catch {
      return texts;
    }
  })();

  localizeTextsMemo.set(cacheKey, request);
  return request;
};

export const getLocalizedCareersByRiasec = async (riasecCode: string, lang: string): Promise<OnetCareer[]> => {
  const careers = await getCareersByRiasec(riasecCode);
  if (lang === "en" || careers.length === 0) return careers;
  const localizedTitles = await localizeTexts(careers.map((c) => c.title), lang);
  return careers.map((c, i) => ({ ...c, title: localizedTitles[i] ?? c.title }));
};

export const getLocalizedCareerDetail = async (onetCode: string, lang: string): Promise<OnetCareer> => {
  const detail = await getCareerDetail(onetCode);
  if (lang === "en") return detail;
  const parts: string[] = [detail.title || "", detail.description || "", ...(detail.tasks || [])];
  const localized = await localizeTexts(parts, lang);
  let idx = 0;
  const title = localized[idx++] || detail.title;
  const description = localized[idx++] || detail.description;
  const localizedTasks = (detail.tasks || []).map(() => localized[idx++] || "");
  return { ...detail, title, description, tasks: localizedTasks.length ? localizedTasks : detail.tasks };
};
