import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Calendar, CheckSquare, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

export default function CounselorFollowUps() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [newTaskText, setNewTaskText] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  // Fetch all students within counselor's workload/schools
  const { data: students = [] } = useQuery({
    queryKey: ["all-students-counselor", user?.id],
    queryFn: async () => {
      // 1. Get Assigned Schools
      const { data: schoolLinks } = await supabase.from("counselor_schools").select("school_id").eq("counselor_id", user!.id);
      const schoolIds = (schoolLinks || []).map((s) => s.school_id);

      // 2. Get Directly Assigned Students
      const { data: directLinks } = await supabase.from("counselor_students").select("student_id").eq("counselor_id", user!.id);
      const directIds = (directLinks || []).map((s) => s.student_id);

      // 3. Fetch Students (Student Role + Workload Match)
      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          user_id,
          profiles:user_id!inner(full_name, grade, school_id, is_archived)
        `)
        .eq("role", "student")
        .eq("profiles.is_archived", false);
      
      if (error) throw error;

      // 4. Client-side filter for multi-school/workload logic (easier to maintain than complex OR/AND in Supabase filters without RPC)
      return ((data || []) as any[]).filter((s) =>
        schoolIds.includes(s.profiles.school_id) ||
        directIds.includes(s.user_id)
      );
    },
    enabled: !!user?.id,
  });

  // Fetch follow up tasks
  const { data: followUps = [], isLoading, error } = useQuery({
    queryKey: ["counselor-follow-ups", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("counselor_follow_ups")
        .select(`
          id, title, status, due_date, student_id,
          student:student_id(full_name)
        `)
        .eq("counselor_id", user!.id)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!user?.id,
  });

  // Fetch scheduled meetings
  const { data: meetings = [] } = useQuery({
    queryKey: ["counselor-meetings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("counselor_meetings")
        .select(`
          id, scheduled_at, duration_mins, status, student_id,
          student:student_id(full_name)
        `)
        .eq("counselor_id", user!.id)
        .order("scheduled_at", { ascending: true });
        
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!user?.id,
  });

  const addTask = useMutation({
    mutationFn: async () => {
      if (!selectedStudentId || !newTaskText.trim()) return;
      const { error } = await supabase.from("counselor_follow_ups").insert({
        counselor_id: user!.id,
        student_id: selectedStudentId,
        title: newTaskText.trim(),
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewTaskText("");
      queryClient.invalidateQueries({ queryKey: ["counselor-follow-ups"] });
      toast.success(t("counselor.followups.added_toast"));
    },
    onError: () => toast.error(t("counselor.followups.error_toast")),
  });

  const toggleTaskStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "pending" | "completed" }) => {
      const newStatus = status === "completed" ? "pending" : "completed";
      const { error } = await supabase.from("counselor_follow_ups").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counselor-follow-ups"] });
    }
  });

  const pendingTasks = followUps.filter(t => t.status === "pending");
  const completedTasks = followUps.filter(t => t.status === "completed");
  const upcomingMeetings = meetings.filter(m => m.status === "scheduled");

  return (
    <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
              {t("counselor.followups.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("counselor.followups.subtitle")}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Column 1: Pending Interventions */}
            <div className="card-warm p-5 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-amber-600">
                <Clock className="w-5 h-5" />
                <h2 className="font-heading font-semibold text-lg text-foreground">{t("counselor.followups.pending_title")}</h2>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-xl mb-4 border border-border">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{t("counselor.followups.assign_title")}</h3>
                <div className="space-y-3">
                  <select 
                    className="w-full p-2 text-sm rounded-lg border border-border bg-background"
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                  >
                    <option value="" disabled>{t("counselor.followups.select_student")}</option>
                    {students.map((s) => (
                      <option key={s.user_id} value={s.user_id}>{s.profiles.full_name} ({s.profiles.grade})</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Input 
                      placeholder={t("counselor.followups.task_placeholder")}
                      value={newTaskText}
                      onChange={e => setNewTaskText(e.target.value)}
                      className="h-9"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => addTask.mutate()} 
                      disabled={addTask.isPending || !selectedStudentId || !newTaskText.trim()}
                    >
                      {addTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
              ) : pendingTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center py-6">{t("counselor.followups.no_pending")}</p>
              ) : (
                <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                  {pendingTasks.map(task => (
                    <div key={task.id} className="p-3 bg-background rounded-lg border shadow-sm flex items-start gap-3">
                      <button onClick={() => toggleTaskStatus.mutate({ id: task.id, status: task.status })} className="mt-0.5">
                        <CheckSquare className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                      </button>
                      <div>
                        <p className="text-sm font-medium text-foreground">{task.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t("counselor.followups.for_label", { name: task.student?.full_name ?? t("counselor.unnamed_student") })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column 2: Scheduled Meetings */}
            <div className="card-warm p-5 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <Calendar className="w-5 h-5" />
                <h2 className="font-heading font-semibold text-lg text-foreground">{t("counselor.followups.meetings_title")}</h2>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
              ) : upcomingMeetings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground italic mb-4">{t("counselor.followups.no_meetings")}</p>
                </div>
              ) : (
                <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                  {upcomingMeetings.map(meeting => (
                    <div key={meeting.id} className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                      <p className="text-sm font-medium text-foreground">{meeting.student?.full_name ?? t("counselor.unnamed_student")}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(meeting.scheduled_at).toLocaleString()} ({meeting.duration_mins}m)
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column 3: Recently Completed */}
            <div className="card-warm p-5 h-full flex flex-col opacity-60 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2 mb-4 text-sage-600">
                <CheckSquare className="w-5 h-5" />
                <h2 className="font-heading font-semibold text-lg text-foreground">{t("counselor.followups.recently_completed")}</h2>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
              ) : completedTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center py-6">{t("counselor.followups.no_completed")}</p>
              ) : (
                <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                  {completedTasks.slice(0, 10).map(task => (
                    <div key={task.id} className="p-3 bg-muted/40 rounded-lg flex items-start gap-3 line-through">
                      <button onClick={() => toggleTaskStatus.mutate({ id: task.id, status: task.status })} className="mt-0.5">
                        <CheckSquare className="w-5 h-5 text-primary" />
                      </button>
                      <div>
                        <p className="text-sm text-muted-foreground">{task.title}</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">{t("counselor.followups.for_label", { name: task.student?.full_name ?? t("counselor.unnamed_student") })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </motion.div>
    </div>
  );
}
