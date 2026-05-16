import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { 
  Target, Plus, Calendar, CheckCircle2, Circle, 
  Clock, AlertCircle, Trash2, ArrowRight, 
  BookOpen, Compass, Briefcase, Users, MessageSquare
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
import { format, isPast, isToday } from "date-fns";

const CATEGORIES = [
  { value: "exploration", label: "Exploration", icon: Compass, color: "text-blue-500", border: "border-blue-200", bg: "bg-blue-50" },
  { value: "reflection", label: "Reflection", icon: MessageSquare, color: "text-purple-500", border: "border-purple-200", bg: "bg-purple-50" },
  { value: "skill_building", label: "Skill Building", icon: Target, color: "text-amber-500", border: "border-amber-200", bg: "bg-amber-50" },
  { value: "subject_choice", label: "Subject Choice", icon: BookOpen, color: "text-emerald-500", border: "border-emerald-200", bg: "bg-emerald-50" },
  { value: "pathway_planning", label: "Pathway Planning", icon: ArrowRight, color: "text-rose-500", border: "border-rose-200", bg: "bg-rose-50" },
  { value: "portfolio", label: "Portfolio", icon: Briefcase, color: "text-indigo-500", border: "border-indigo-200", bg: "bg-indigo-50" },
  { value: "application", label: "Application", icon: CheckCircle2, color: "text-cyan-500", border: "border-cyan-200", bg: "bg-cyan-50" },
  { value: "networking", label: "Networking", icon: Users, color: "text-orange-500", border: "border-orange-200", bg: "bg-orange-50" },
  { value: "other", label: "Other", icon: Plus, color: "text-slate-500", border: "border-slate-200", bg: "bg-slate-50" },
];

const ActionPlan = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    due_date: "",
  });

  const { data: actions, isLoading } = useQuery({
    queryKey: ["student-action-plans", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_action_plans")
        .select("*")
        .eq("student_id", user?.id)
        .order("due_date", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (newData: typeof formData) => {
      const { error } = await supabase
        .from("student_action_plans")
        .insert([{ 
          ...newData, 
          student_id: user?.id, 
          status: "pending",
          assigned_by: user?.id,
          assigned_by_role: "student"
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-action-plans"] });
      setIsOpen(false);
      setFormData({ title: "", category: "", due_date: "" });
      toast.success("Action item added!");
    },
    onError: (error) => toast.error(error.message),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, reflection }: { id: string, status: string, reflection?: string }) => {
      const { error } = await supabase
        .from("student_action_plans")
        .update({ status, completion_reflection: reflection, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-action-plans"] });
      toast.success("Action updated!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("student_action_plans")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-action-plans"] });
      toast.success("Item removed");
    },
  });

  const filteredActions = actions?.filter(a => 
    activeTab === "pending" ? a.status !== "completed" : a.status === "completed"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.title) {
      toast.error("Please fill in the required fields.");
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2 flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            My Action Plan
          </h1>
          <p className="text-muted-foreground">
            Set goals, track tasks, and stay on top of your career development journey.
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm bg-primary text-white">
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Action Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">What is the task? *</label>
                <Input 
                  placeholder="e.g., Research three graphic design universities" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category *</label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            <cat.icon className={`w-4 h-4 ${cat.color}`} />
                            {cat.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date (optional)</label>
                  <Input 
                    type="date" 
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Adding..." : "Add to Plan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 p-1 bg-muted/30 rounded-xl w-fit">
        <Button 
          variant={activeTab === "pending" ? "warm" : "ghost"} 
          size="sm" 
          onClick={() => setActiveTab("pending")}
          className="rounded-lg"
        >
          Pending
          {actions?.filter(a => a.status !== "completed").length ? (
            <span className="ml-2 bg-primary/20 text-primary-700 px-1.5 py-0.5 rounded-md text-[10px] font-bold">
              {actions.filter(a => a.status !== "completed").length}
            </span>
          ) : null}
        </Button>
        <Button 
          variant={activeTab === "completed" ? "warm" : "ghost"} 
          size="sm" 
          onClick={() => setActiveTab("completed")}
          className="rounded-lg"
        >
          Completed
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted/20 animate-pulse rounded-xl" />)}
          </div>
        ) : filteredActions?.length === 0 ? (
          <div className="text-center py-16 bg-muted/5 rounded-3xl border border-dashed">
            <CheckCircle2 className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">No tasks in this section.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredActions?.map((action) => {
              const catInfo = CATEGORIES.find(c => c.value === action.category) || CATEGORIES[CATEGORIES.length - 1];
              const isOverdue = action.due_date && isPast(new Date(action.due_date)) && !isToday(new Date(action.due_date)) && action.status !== "completed";
              
              return (
                <motion.div
                  key={action.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group relative flex items-center gap-4 p-4 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all ${isOverdue ? "border-rose-200 bg-rose-50/10" : "border-border"}`}
                >
                  <button 
                    onClick={() => updateStatusMutation.mutate({ 
                      id: action.id, 
                      status: action.status === "completed" ? "pending" : "completed" 
                    })}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      action.status === "completed" 
                        ? "bg-primary border-primary text-white" 
                        : isOverdue 
                          ? "border-rose-400" 
                          : "border-muted-foreground/30 hover:border-primary"
                    }`}
                  >
                    {action.status === "completed" && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${catInfo.bg} ${catInfo.color}`}>
                        {catInfo.label}
                      </span>
                      {action.assigned_by_role === "counselor" && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 flex items-center gap-1">
                          <Users className="w-3 h-3" /> Assigned by Counselor
                        </span>
                      )}
                    </div>
                    <h3 className={`font-medium ${action.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {action.title}
                    </h3>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2">
                    {action.due_date && (
                      <div className={`text-xs flex items-center gap-1 font-medium ${isOverdue ? "text-rose-600" : "text-muted-foreground"}`}>
                        {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                        {format(new Date(action.due_date), "MMM d")}
                      </div>
                    )}
                    <button 
                      onClick={() => deleteMutation.mutate(action.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground/40 hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-primary-900 mb-1">Why Action Plans matter</h3>
            <p className="text-sm text-primary-800 leading-relaxed">
              Setting small, manageable goals is the key to career readiness. Your counselor can see your plan and add suggestions to help you explore the right pathways.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionPlan;
