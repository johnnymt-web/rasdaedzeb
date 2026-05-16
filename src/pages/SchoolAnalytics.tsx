import { useState } from "react";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts";
import { 
  TrendingUp, Users, BookOpen, Map, ArrowLeft, 
  Download, Filter, Calendar, Sparkles, LayoutDashboard,
  GraduationCap, Briefcase, Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

export default function SchoolAnalytics() {
  const { t } = useTranslation();
  const [selectedGrade, setSelectedGrade] = useState<string>("all");

  // Fetch Subject Demand
  const { data: subjectDemand = [] } = useQuery({
    queryKey: ["admin-analytics-subjects", selectedGrade],
    queryFn: async () => {
      let query = (supabase.from("student_subject_plans" as any) as any).select("subjects, student_id");
      
      // If grade filtering is needed, we'd join with profiles, but for now we aggregate
      const { data, error } = await query;
      if (error) throw error;

      const counts: Record<string, number> = {};
      data.forEach(plan => {
        const subjects = (plan.subjects as any[]) || [];
        subjects.forEach(s => {
          const name = s.name || s;
          counts[name] = (counts[name] || 0) + 1;
        });
      });

      return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
    }
  });

  // Fetch Career Destinations
  const { data: careerPathways = [] } = useQuery({
    queryKey: ["admin-analytics-pathways"],
    queryFn: async () => {
      const { data, error } = await supabase.from("student_career_pathways" as any).select("title");
      if (error) throw error;

      const counts: Record<string, number> = {};
      data.forEach(p => {
        counts[p.title] = (counts[p.title] || 0) + 1;
      });

      return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    }
  });

  // Fetch Activity Timeline (Engagement)
  const { data: engagementData = [] } = useQuery({
    queryKey: ["admin-analytics-engagement"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("career_exposure_activities" as any) as any)
        .select("created_at");
      if (error) throw error;

      // Group by month
      const months: Record<string, number> = {};
      data.forEach(d => {
        const date = new Date(d.created_at);
        const key = date.toLocaleString('default', { month: 'short' });
        months[key] = (months[key] || 0) + 1;
      });

      return Object.entries(months).map(([name, value]) => ({ name, value }));
    }
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-2">
              <TrendingUp className="w-4 h-4" />
              Strategic Oversight
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3">School-Wide Guidance Analytics</h1>
            <p className="text-muted-foreground max-w-2xl leading-relaxed">
              Analyze academic demand, career aspirations, and engagement trends across your student population.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 rounded-xl">
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
            <Button className="gap-2 rounded-xl">
              <Sparkles className="w-4 h-4" />
              AI Summary
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="card-warm p-6 surface-indigo">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Cohort Size</span>
            </div>
            <div className="text-3xl font-heading font-bold text-indigo-900">1,240</div>
            <p className="text-xs text-indigo-800/60 mt-1">Active Students (Grade 9-12)</p>
          </div>
          
          <div className="card-warm p-6 surface-amber">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Engagement</span>
            </div>
            <div className="text-3xl font-heading font-bold text-amber-900">84%</div>
            <p className="text-xs text-amber-800/60 mt-1">Active in Guidance Tools</p>
          </div>

          <div className="card-warm p-6 surface-sage">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center text-sage-600">
                <Map className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-sage-600 uppercase tracking-wider">Pathways</span>
            </div>
            <div className="text-3xl font-heading font-bold text-sage-900">412</div>
            <p className="text-xs text-sage-800/60 mt-1">Strategic Journeys Architected</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Subject Demand Chart */}
          <div className="card-warm p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-foreground">Academic Subject Demand</h3>
                <p className="text-xs text-muted-foreground">Most requested subjects for next year</p>
              </div>
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectDemand} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} fontSize={12} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Career Destinations Pie */}
          <div className="card-warm p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-foreground">Top Career Destinations</h3>
                <p className="text-xs text-muted-foreground">Student pathway aspirations</p>
              </div>
              <Briefcase className="w-5 h-5 text-amber-500" />
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={careerPathways}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {careerPathways.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {careerPathways.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Engagement Timeline */}
          <div className="card-warm p-8 lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-foreground">Guidance Activity Over Time</h3>
                <p className="text-xs text-muted-foreground">Volume of career exposure logs and actions</p>
              </div>
              <Activity className="w-5 h-5 text-sage-600" />
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={engagementData}>
                  <defs>
                    <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} dy={10} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorEngage)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Insight Card */}
        <div className="mt-12 card-warm p-8 surface-sky relative overflow-hidden group">
          <Sparkles className="absolute -right-4 -top-4 w-32 h-32 text-sky-200/40 rotate-12" />
          <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 flex items-center justify-center text-sky-700 flex-shrink-0">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-sky-900 mb-2">Principal's AI Briefing</h3>
              <p className="text-sm text-sky-800/80 leading-relaxed max-w-4xl mb-6">
                Guidance participation is up **14%** this term. A significant cohort of Grade 10 students are gravitating towards **STEM pathways**, which may necessitate additional laboratory resources or elective sections in Mathematics. **Engagement spikes** occur during school holiday periods, suggesting students are exploring careers independently outside of class time.
              </p>
              <div className="flex gap-4">
                <Button className="bg-sky-700 hover:bg-sky-800 text-white rounded-xl px-6">Generate Full Report</Button>
                <Button variant="outline" className="border-sky-300 text-sky-900 hover:bg-sky-100/50 rounded-xl">View Cohort Comparison</Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
