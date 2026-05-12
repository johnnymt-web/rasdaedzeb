import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, UserPlus, Shield, ShieldAlert, 
  Search, Loader2, X, Check, UserMinus, Trash2
} from "lucide-react";
import { toast } from "sonner";

import { useTranslation } from "react-i18next";

export default function CounselorManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // 1. Fetch existing counselors
  const { data: counselors = [], isLoading: loadingCounselors } = useQuery({
    queryKey: ["admin-counselors"],
    queryFn: async () => {
      try {
        const { data: rolesData, error: rolesErr } = await supabase
          .from("user_roles")
          .select("user_id, role")
          .eq("role", "counselor");
        
        if (rolesErr) throw rolesErr;
        const ids = rolesData.map(r => r.user_id);
        
        if (ids.length === 0) return [];

        const { data: profiles, error: profErr } = await supabase
          .from("profiles")
          .select("id, full_name, grade, school_id")
          .in("id", ids);
        
        if (profErr) throw profErr;

        // Get all schools for mapping
        const { data: schoolsData, error: schoolsErr } = await supabase.from("schools").select("id, name");
        if (schoolsErr) throw schoolsErr;
        
        const schoolMap = new Map((schoolsData || []).map(s => [s.id, s.name]));

        return (profiles || []).map(p => ({
          ...p,
          school_name: p.school_id ? schoolMap.get(p.school_id) : t("users.unassigned")
        }));
      } catch (err) {
        throw err;
      }
    }
  });

  // 2. Search all profiles for potential promotion
  const { data: searchResults = [], isLoading: searchingUsers } = useQuery({
    queryKey: ["admin-user-search", searchQuery],
    queryFn: async () => {
      try {
        if (!searchQuery || searchQuery.length < 2) return [];
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, grade")
          .ilike("full_name", `%${searchQuery}%`)
          .limit(5);
        
        if (error) throw error;
        return data || [];
      } catch (err) {
        throw err;
      }
    },
    enabled: searchQuery.length >= 2
  });

  // 3. Mutation to update role
  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: "counselor" | "student" }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role })
        .eq("user_id", userId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-counselors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-search"] });
      toast.success(variables.role === "counselor" ? t("settings.counselor.promote_success") : t("settings.counselor.revoke_success"));
      if (variables.role === "counselor") {
        setSearchQuery("");
        setIsSearching(false);
      }
    },
    onError: (err) => {
      toast.error(t("settings.counselor.update_error"));
    }
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await (supabase as any).rpc('delete_user', { target_user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-counselors"] });
      toast.success(t("settings.counselor.delete_success"));
    },
    onError: (err) => {
      toast.error(t("settings.counselor.delete_error"));
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {t("settings.counselor.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("settings.counselor.desc")}
          </p>
        </div>
        {!isSearching && (
          <Button onClick={() => setIsSearching(true)} size="sm" className="gap-2">
            <UserPlus className="w-4 h-4" />
            {t("settings.counselor.add")}
          </Button>
        )}
      </div>

      {isSearching && (
        <div className="card-warm p-4 border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">{t("settings.counselor.promote_title")}</h3>
            <Button variant="ghost" size="sm" onClick={() => { setIsSearching(false); setSearchQuery(""); }}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={t("settings.counselor.search_placeholder")} 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            {searchingUsers ? (
              <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
            ) : searchResults.length > 0 ? (
              searchResults.map(u => (
                <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-background hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {u.full_name?.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{u.full_name}</div>
                      <div className="text-[10px] text-muted-foreground capitalize">{u.grade || t("users.unassigned")}</div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 text-[10px] font-bold text-primary hover:bg-primary/10"
                    onClick={() => updateRole.mutate({ userId: u.id, role: "counselor" })}
                    disabled={updateRole.isPending}
                  >
                    {t("settings.counselor.promote_btn")}
                  </Button>
                </div>
              ))
            ) : searchQuery.length >= 2 ? (
              <p className="text-center text-[10px] text-muted-foreground py-4">{t("settings.counselor.no_match", { query: searchQuery })}</p>
            ) : null}
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {loadingCounselors ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : counselors.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed rounded-2xl border-muted">
            <ShieldAlert className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-medium">{t("settings.counselor.no_counselors")}</p>
          </div>
        ) : (
          counselors.map(c => (
            <div key={c.id} className="card-warm p-4 flex items-center justify-between border-transparent hover:border-border transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-heading font-bold text-primary">
                  {c.full_name?.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-heading font-bold text-foreground leading-none">{c.full_name}</h4>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase font-semibold tracking-wider">
                    {t("settings.counselor.certified")} {(c as any).school_name && `· ${(c as any).school_name}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-primary hover:bg-primary/5 gap-2"
                  onClick={() => {
                    if (confirm(t("settings.counselor.revoke_confirm", { name: c.full_name }))) {
                      updateRole.mutate({ userId: c.id, role: "student" });
                    }
                  }}
                >
                  <UserMinus className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("settings.counselor.revoke")}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                  onClick={() => {
                    if (confirm(t("settings.counselor.delete_confirm", { name: c.full_name }))) {
                      deleteUser.mutate(c.id);
                    }
                  }}
                  disabled={deleteUser.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
