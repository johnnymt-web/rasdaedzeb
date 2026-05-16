import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { 
  Video, Users, MapPin, Search, Plus, Calendar, 
  MessageSquare, ExternalLink, CheckCircle2, Clock,
  Trophy, BookOpen, UserCheck, Star, Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";

const ACTIVITY_TYPES = [
  { value: "career_video", label: "Career Video", icon: Video, color: "text-blue-500", bg: "bg-blue-50" },
  { value: "professional_interview", label: "Professional Interview", icon: UserCheck, color: "text-purple-500", bg: "bg-purple-50" },
  { value: "guest_speaker", label: "Guest Speaker", icon: Users, color: "text-amber-500", bg: "bg-amber-50" },
  { value: "career_fair", label: "Career Fair", icon: Search, color: "text-emerald-500", bg: "bg-emerald-50" },
  { value: "workplace_visit", label: "Workplace Visit", icon: MapPin, color: "text-rose-500", bg: "bg-rose-50" },
  { value: "job_shadowing", label: "Job Shadowing", icon: Star, color: "text-indigo-500", bg: "bg-indigo-50" },
  { value: "university_visit", label: "University Visit", icon: BookOpen, color: "text-cyan-500", bg: "bg-cyan-50" },
  { value: "project_completed", label: "Project Completed", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
  { value: "volunteering", label: "Volunteering", icon: HeartIcon, color: "text-red-500", bg: "bg-red-50" },
  { value: "competition", label: "Competition", icon: Trophy, color: "text-orange-500", bg: "bg-orange-50" },
  { value: "other", label: "Other", icon: Plus, color: "text-slate-500", bg: "bg-slate-50" },
];

function HeartIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

const CareerExposure = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    activity_type: "",
    title: "",
    description: "",
    activity_date: new Date().toISOString().split("T")[0],
    reflection: "",
    evidence_url: "",
  });

  const { data: activities, isLoading } = useQuery({
    queryKey: ["career-exposure-activities", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase.from("career_exposure_activities" as any) as any)
        .select("*")
        .eq("student_id", user?.id)
        .order("activity_date", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (newData: typeof formData) => {
      const { error } = await (supabase.from("career_exposure_activities" as any) as any)
        .insert([{ ...newData, student_id: user?.id }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["career-exposure-activities"] });
      setIsOpen(false);
      setFormData({
        activity_type: "",
        title: "",
        description: "",
        activity_date: new Date().toISOString().split("T")[0],
        reflection: "",
        evidence_url: "",
      });
      toast.success("Activity logged successfully!");
    },
    onError: (error) => {
      toast.error("Failed to log activity: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.activity_type || !formData.title) {
      toast.error("Please fill in the required fields.");
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2 flex items-center gap-3">
            <Compass className="w-8 h-8 text-primary" />
            Career Exposure Tracker
          </h1>
          <p className="text-muted-foreground">
            Log and reflect on your career exploration activities to build your professional profile.
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm bg-primary hover:bg-primary/90 text-white">
              <Plus className="w-4 h-4" />
              Log New Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Log Career Activity</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Activity Type *</label>
                <Select 
                  value={formData.activity_type} 
                  onValueChange={(v) => setFormData({ ...formData, activity_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className={`w-4 h-4 ${type.color}`} />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input 
                  placeholder="e.g., Software Engineering Video, Career Fair 2024" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input 
                    type="date" 
                    value={formData.activity_date}
                    onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Evidence URL (optional)</label>
                  <Input 
                    placeholder="Link to video or certificate" 
                    value={formData.evidence_url}
                    onChange={(e) => setFormData({ ...formData, evidence_url: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea 
                  placeholder="What was the activity about?" 
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-primary font-bold">Your Reflection</label>
                <Textarea 
                  placeholder="What did you learn? Did this spark any new interests?" 
                  rows={3}
                  value={formData.reflection}
                  onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
                  className="border-primary/30 focus:border-primary"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Logging..." : "Save Activity"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-muted/20 animate-pulse rounded-2xl border border-dashed" />
          ))}
        </div>
      ) : activities?.length === 0 ? (
        <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed border-primary/20">
          <Compass className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No activities logged yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Start logging your career exploration journey. Every video watched or person interviewed counts!
          </p>
          <Button onClick={() => setIsOpen(true)} variant="outline">Log your first activity</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activities?.map((activity: any) => {
            const typeInfo = ACTIVITY_TYPES.find(t => t.value === activity.activity_type) || ACTIVITY_TYPES[ACTIVITY_TYPES.length - 1];
            return (
              <motion.div 
                key={activity.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card-warm overflow-hidden flex flex-col group"
              >
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${typeInfo.bg} ${typeInfo.color}`}>
                      <typeInfo.icon className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-muted-foreground flex items-center gap-1 justify-end">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(activity.activity_date), "MMM d, yyyy")}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/40 mt-1">
                        {typeInfo.label}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {activity.title}
                  </h3>
                  
                  {activity.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                      {activity.description}
                    </p>
                  )}

                  {activity.reflection && (
                    <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 italic text-sm text-primary-800 relative">
                      <MessageSquare className="w-4 h-4 text-primary/30 absolute top-2 right-2" />
                      "{activity.reflection}"
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 bg-muted/30 border-t flex items-center justify-between">
                  {activity.evidence_url ? (
                    <a 
                      href={activity.evidence_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Evidence
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No evidence attached</span>
                  )}

                  {activity.counselor_comment ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      <UserCheck className="w-3 h-3" />
                      Counselor Reviewed
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      Pending Review
                    </div>
                  )}
                </div>

                {activity.counselor_comment && (
                  <div className="px-6 pb-4 pt-0">
                    <div className="text-[10px] uppercase font-bold text-emerald-700/50 mb-1">Counselor Feedback:</div>
                    <p className="text-xs text-emerald-800 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                      {activity.counselor_comment}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CareerExposure;
