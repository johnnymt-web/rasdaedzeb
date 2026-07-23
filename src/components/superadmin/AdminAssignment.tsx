import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  ShieldCheck, Search, Loader2, UserPlus, 
  Trash2, Building2, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const AdminAssignment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [assigningUserId, setAssigningUserId] = useState("");
  const [assigningSchoolId, setAssigningSchoolId] = useState("");

  // Fetch Users (PF-007: cross-school profile list via the audited superadmin RPC,
  // not a direct profiles select). Bounded to 500; sufficient for provisioning at
  // pilot scale. Generated RPC types are regenerated post-migration → cast for now.
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["superadmin-users"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("superadmin_list_students", {
        p_search: null,
        p_limit: 500,
        p_offset: 0,
      });
      if (error) throw error;
      return (data as any[]) || [];
    }
  });

  // Fetch Schools
  const { data: schools = [] } = useQuery({
    queryKey: ["superadmin-schools"],
    queryFn: async () => {
      const { data, error } = await supabase.from("schools").select("id, name");
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch Admins
  const { data: admins = [], isLoading: loadingAdmins } = useQuery({
    queryKey: ["superadmin-admins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("role", ["admin", "superadmin"]);
      if (error) throw error;
      return data || [];
    }
  });

  const assignAdminMutation = useMutation({
    mutationFn: async ({ userId, schoolId, role }: { userId: string, schoolId: string, role: string }) => {
      // 1. Update Profile School ID
      const { error: profErr } = await supabase
        .from("profiles")
        .update({ school_id: schoolId })
        .eq("id", userId);
      if (profErr) throw profErr;

      // 2. Assign Role
      const { error: roleErr } = await supabase
        .from("user_roles")
        .upsert({ user_id: userId, role: role as any }, { onConflict: "user_id, role" });
      if (roleErr) throw roleErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-admins"] });
      queryClient.invalidateQueries({ queryKey: ["superadmin-users"] });
      toast({ title: "Admin assigned successfully" });
      setAssigningUserId("");
      setAssigningSchoolId("");
    },
    onError: (err: any) => {
      toast({ title: "Error assigning admin", description: err.message, variant: "destructive" });
    }
  });

  const removeAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
        const { error } = await supabase
            .from("user_roles")
            .delete()
            .eq("user_id", userId)
            .eq("role", "admin");
        if (error) throw error;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["superadmin-admins"] });
        toast({ title: "Admin role removed" });
    }
  });

  const adminProfiles = users.filter(u => admins.some(a => a.user_id === u.id));

  return (
    <div className="space-y-8">
      {/* Assignment Form */}
      <div className="card-warm p-6">
        <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          Assign New Administrator
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={assigningUserId}
            onChange={(e) => setAssigningUserId(e.target.value)}
          >
            <option value="">Select User...</option>
            {users.filter(u => !admins.some(a => a.user_id === u.id)).map(u => (
              <option key={u.id} value={u.id}>{u.full_name || u.id}</option>
            ))}
          </select>

          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={assigningSchoolId}
            onChange={(e) => setAssigningSchoolId(e.target.value)}
          >
            <option value="">Select School...</option>
            {schools.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <Button 
            disabled={!assigningUserId || !assigningSchoolId || assignAdminMutation.isPending}
            onClick={() => assignAdminMutation.mutate({ userId: assigningUserId, schoolId: assigningSchoolId, role: "admin" })}
          >
            {assignAdminMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Assign Admin
          </Button>
        </div>
      </div>

      {/* Admin List */}
      <div className="space-y-4">
        <h3 className="text-lg font-heading font-bold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-secondary" />
          Active System Administrators
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          {loadingAdmins ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : adminProfiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
              No admins assigned yet.
            </div>
          ) : (
            adminProfiles.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-4 card-warm hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{admin.full_name || "Unknown User"}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3" />
                      {schools.find(s => s.id === admin.school_id)?.name || "No School Assigned"}
                    </div>
                  </div>
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => removeAdminMutation.mutate(admin.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Revoke Access
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAssignment;
