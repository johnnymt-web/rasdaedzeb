import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  User as UserIcon, Mail, BookOpen, GraduationCap, 
  Users, Building2, Shield, Loader2, Edit2, Check, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, role, profile: authProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch full profile data including role-specific connections
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["user-full-profile", user?.id],
    queryFn: async () => {
      try {
        if (!user?.id) return null;

        // 1. Fetch full profile
        const { data: profileData, error: pErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (pErr) throw pErr;

        // 2. Fetch school if applicable
        let schoolName = "Unassigned";
        if (profileData?.school_id) {
          const { data: school, error: sErr } = await supabase
            .from("schools")
            .select("name")
            .eq("id", profileData.school_id)
            .maybeSingle();
          if (sErr) throw sErr;
          if (school) schoolName = school.name;
        }

        // 3. Fetch role-specific details
        let details: any = { schoolName };

        if (role === "student") {
          // Fetch counselor
          const { data: cLinks, error: clErr } = await supabase.from("counselor_students").select("counselor_id").eq("student_id", user.id).limit(1);
          if (clErr) throw clErr;
          
          if (cLinks && cLinks.length > 0) {
            const { data: cProfile, error: cpErr } = await supabase.from("profiles").select("full_name").eq("id", cLinks[0].counselor_id).maybeSingle();
            if (cpErr) throw cpErr;
            details.counselorName = cProfile?.full_name || "Unknown";
          } else {
            details.counselorName = "Unassigned";
          }

          // Fetch parents
          const { data: pLinks, error: plErr } = await supabase.from("parent_students").select("parent_id").eq("student_id", user.id);
          if (plErr) throw plErr;
          
          if (pLinks && pLinks.length > 0) {
            const parentIds = pLinks.map(l => l.parent_id);
            const { data: pProfiles, error: ppErr } = await supabase.from("profiles").select("full_name").in("id", parentIds);
            if (ppErr) throw ppErr;
            details.parentNames = pProfiles?.map(p => p.full_name || "Unnamed").join(", ") || "None";
          } else {
            details.parentNames = "None linked";
          }
        } 
        else if (role === "counselor") {
          // Fetch number of students
          if (profileData?.school_id) {
            const { count, error: countErr } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("school_id", profileData.school_id);
            if (countErr) throw countErr;
            details.studentCount = count || 0;
          } else {
            details.studentCount = 0;
          }
        }
        else if (role === "parent") {
          // Fetch linked children
          const { data: sLinks, error: slErr } = await supabase.from("parent_students").select("student_id").eq("parent_id", user.id);
          if (slErr) throw slErr;
          
          if (sLinks && sLinks.length > 0) {
            const studentIds = sLinks.map(l => l.student_id);
            const { data: sProfiles, error: spErr } = await supabase.from("profiles").select("full_name, grade").in("id", studentIds);
            if (spErr) throw spErr;
            details.children = sProfiles || [];
          } else {
            details.children = [];
          }
        }

        return { profile: profileData, details };
      } catch (err) {
        throw err;
      }
    },
    enabled: !!user?.id,
  });

  const handleSaveName = async () => {
    if (!user?.id || !editName.trim()) return;
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: editName.trim() })
        .eq("id", user.id);
        
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your name has been updated successfully.",
      });
      
      setIsEditing(false);
      refetch();
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: "There was a problem saving your changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = () => {
    setEditName(data?.profile?.full_name || "");
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    student: "Student",
    counselor: "Counselor",
    parent: "Parent",
    admin: "Administrator",
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold mb-2">My Profile</h1>
            <p className="text-muted-foreground">Manage your personal information and account settings.</p>
          </div>

          <div className="space-y-6">
            {/* Personal Information Card */}
            <div className="card-warm p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10" />
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-heading font-semibold">Personal Information</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Full Name
                  </label>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)}
                        className="max-w-md"
                        placeholder="Your full name"
                        disabled={isSaving}
                      />
                      <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>
                        <X className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button size="sm" onClick={handleSaveName} disabled={isSaving || !editName.trim()}>
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-medium">{data?.profile?.full_name || "Not set"}</span>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={startEditing}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                  </label>
                  <p className="text-base">{user?.email}</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Account Type
                  </label>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-muted text-foreground border border-border">
                    {role ? roleLabels[role] : "Unknown"}
                  </span>
                </div>
              </div>
            </div>

            {/* Role Specific Connections Card */}
            {role && role !== "admin" && (
              <div className="card-warm p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="text-xl font-heading font-semibold">Account Connections</h2>
                </div>

                <div className="space-y-6">
                  {role === "student" && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5" /> School
                          </label>
                          <p className="text-base font-medium">{data?.details?.schoolName}</p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5" /> Grade
                          </label>
                          <p className="text-base font-medium">{data?.profile?.grade || "Not specified"}</p>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Assigned Counselor
                          </label>
                          <p className="text-base">{data?.details?.counselorName}</p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Linked Parents/Guardians
                          </label>
                          <p className="text-base">{data?.details?.parentNames}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {role === "counselor" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" /> Assigned School
                        </label>
                        <p className="text-base font-medium">{data?.details?.schoolName}</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                          Students in Cohort
                        </label>
                        <p className="text-base font-medium">{data?.details?.studentCount} students</p>
                      </div>
                    </div>
                  )}

                  {role === "parent" && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5" /> Linked Children
                      </label>
                      {data?.details?.children && data.details.children.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {data.details.children.map((child: any, i: number) => (
                            <div key={i} className="bg-background border border-border rounded-lg p-3 flex items-center justify-between">
                              <span className="font-medium">{child.full_name || "Unnamed Child"}</span>
                              {child.grade && (
                                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">
                                  Grade {child.grade}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm italic">No children currently linked to your account.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>
        </motion.div>
    </div>
  );
}
