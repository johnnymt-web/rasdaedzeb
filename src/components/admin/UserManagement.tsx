import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, Search, Trash2, Loader2, 
  Shield, User, UserCheck, Filter
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

type AppRole = 'student' | 'parent' | 'counselor' | 'admin';

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  grade: string | null;
  school_name?: string | null;
  role: AppRole;
}

export default function UserManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<AppRole | 'all'>('all');

  // 1. Fetch all users with their roles
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-all-users"],
    queryFn: async () => {
      try {
        // 1. Get roles
        const { data: rolesData, error: rolesErr } = await supabase
          .from("user_roles")
          .select("user_id, role");
        
        if (rolesErr) throw rolesErr;
        const ids = (rolesData || []).map(r => r.user_id);
        if (ids.length === 0) return [];

        // 2. Get profiles and schools in parallel
        const [profilesResp, schoolsResp] = await Promise.all([
          supabase.from("profiles").select("id, full_name, email, grade, school_id").in("id", ids.slice(0, 1000)),
          supabase.from("schools").select("id, name")
        ]);

        if (profilesResp.error) throw profilesResp.error;
        if (schoolsResp.error) throw schoolsResp.error;

        const profiles = profilesResp.data || [];
        const schoolMap = new Map((schoolsResp.data || []).map(s => [s.id, s.name]));

        // 3. Map everything back
        const mapped: UserProfile[] = profiles.map(p => {
          const role = rolesData.find(r => r.user_id === p.id)?.role || 'student';
          return {
            id: p.id,
            full_name: p.full_name || t("users.unnamed"),
            email: p.email || t("users.no_email"),
            grade: p.grade,
            role: role as AppRole,
            school_name: p.school_id ? (schoolMap.get(p.school_id) || t("users.unknown_school")) : t("users.unassigned")
          };
        });

        // 4. Catch "orphaned" roles (users with roles but no profiles)
        const profileIds = new Set(profiles.map(p => p.id));
        const orphans = rolesData
          .filter(r => !profileIds.has(r.user_id))
          .map(r => ({
            id: r.user_id,
            full_name: t("users.profile_missing"),
            email: t("users.unassigned"),
            grade: null,
            role: r.role as AppRole,
            school_name: t("users.unassigned")
          }));

        return [...mapped, ...orphans];
      } catch (err) {
        throw err;
      }
    }
  });

  // 2. Mutation to delete user
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await (supabase as any).rpc('delete_user', { target_user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
      toast.success(t("users.delete_success"));
    },
    onError: (err) => {
      toast.error(t("users.delete_error"));
    }
  });

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {t("users.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("users.desc")}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={t("users.search_placeholder")} 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-border">
          <Filter className="w-4 h-4 text-muted-foreground ml-2" />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="bg-transparent text-sm font-medium focus:outline-none px-2 py-1.5"
          >
            <option value="all">{t("users.filter_all")}</option>
            <option value="student">{t("users.filter_student")}</option>
            <option value="parent">{t("users.filter_parent")}</option>
            <option value="counselor">{t("users.filter_counselor")}</option>
            <option value="admin">{t("users.filter_admin")}</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 card-warm border-dashed border-2">
            <User className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-heading font-bold text-foreground">{t("users.no_users")}</h3>
            <p className="text-sm text-muted-foreground">{t("users.no_users_desc")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredUsers.map((u, i) => (
                <motion.div 
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="card-warm p-4 flex items-center justify-between hover:border-border transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-heading font-bold ${
                      u.role === 'admin' ? 'bg-rose-100 text-rose-600' :
                      u.role === 'counselor' ? 'bg-primary/10 text-primary' :
                      u.role === 'parent' ? 'bg-amber-100 text-amber-600' :
                      'bg-sky-100 text-sky-600'
                    }`}>
                      {u.full_name?.substring(0,2).toUpperCase() || <User className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-bold text-foreground leading-none">{u.full_name || t("users.unnamed")}</h4>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          u.role === 'admin' ? 'bg-rose-500 text-white' :
                          u.role === 'counselor' ? 'bg-primary text-white' :
                          u.role === 'parent' ? 'bg-amber-500 text-white' :
                          'bg-sky-500 text-white'
                        }`}>
                          {u.role === 'admin' ? t("users.filter_admin") : 
                           u.role === 'counselor' ? t("users.filter_counselor") :
                           u.role === 'parent' ? t("users.filter_parent") :
                           t("users.filter_student")}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5 truncate max-w-[200px] md:max-w-none">
                        {u.email} {u.grade && `· ${u.grade}`} {u.school_name && `· ${u.school_name}`}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 gap-2 h-9"
                    onClick={() => {
                      if (confirm(t("users.delete_confirm", { name: u.full_name || u.email }))) {
                        deleteUser.mutate(u.id);
                      }
                    }}
                    disabled={deleteUser.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">{t("users.delete")}</span>
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
