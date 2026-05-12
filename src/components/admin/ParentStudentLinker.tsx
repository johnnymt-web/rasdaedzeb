import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Trash2, Search, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useTranslation } from "react-i18next";

interface UserWithRole {
  user_id: string;
  full_name: string | null;
}

const ParentStudentLinker = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [parentSearch, setParentSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedParent, setSelectedParent] = useState<UserWithRole | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<UserWithRole | null>(null);

  // Fetch all parents
  const { data: parents } = useQuery({
    queryKey: ["admin-parents"],
    queryFn: async () => {
      try {
        const { data: roles, error: rolesErr } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "parent");
        if (rolesErr) throw rolesErr;
        if (!roles?.length) return [];
        const ids = roles.map((r) => r.user_id);
        const { data: profiles, error: profErr } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", ids);
        if (profErr) throw profErr;
        return (profiles ?? []).map((p) => ({ user_id: p.id, full_name: p.full_name }));
      } catch (err) {
        throw err;
      }
    },
  });

  // Fetch all students
  const { data: students } = useQuery({
    queryKey: ["admin-students"],
    queryFn: async () => {
      try {
        const { data: roles, error: rolesErr } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "student");
        if (rolesErr) throw rolesErr;
        if (!roles?.length) return [];
        const ids = roles.map((r) => r.user_id);
        const { data: profiles, error: profErr } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", ids);
        if (profErr) throw profErr;
        return (profiles ?? []).map((p) => ({ user_id: p.id, full_name: p.full_name }));
      } catch (err) {
        throw err;
      }
    },
  });

  // Fetch existing links
  const { data: links, isLoading: loadingLinks } = useQuery({
    queryKey: ["admin-parent-student-links"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("parent_students").select("*");
        if (error) throw error;
        return data ?? [];
      } catch (err) {
        throw err;
      }
    },
  });

  // Enrich links with names
  const enrichedLinks = (links ?? []).map((link) => ({
    ...link,
    parentName: parents?.find((p) => p.user_id === link.parent_id)?.full_name ?? "Unknown",
    studentName: students?.find((s) => s.user_id === link.student_id)?.full_name ?? "Unknown",
  }));

  const createLink = useMutation({
    mutationFn: async () => {
      if (!selectedParent || !selectedStudent) throw new Error(t("setup.linker.select_both"));
      const { error } = await supabase.from("parent_students").insert({
        parent_id: selectedParent.user_id,
        student_id: selectedStudent.user_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("setup.linker.link_success"));
      queryClient.invalidateQueries({ queryKey: ["admin-parent-student-links"] });
      setSelectedParent(null);
      setSelectedStudent(null);
    },
    onError: (e: any) => {
      if (e?.code === "23505") toast.error(t("setup.linker.link_exists"));
      else toast.error(t("setup.linker.link_error"));
    },
  });

  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("parent_students").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("setup.linker.remove_success"));
      queryClient.invalidateQueries({ queryKey: ["admin-parent-student-links"] });
    },
    onError: () => toast.error(t("setup.linker.remove_error")),
  });

  const filteredParents = (parents ?? []).filter((p) =>
    (p.full_name ?? "").toLowerCase().includes(parentSearch.toLowerCase())
  );
  const filteredStudents = (students ?? []).filter((s) =>
    (s.full_name ?? "").toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Create link */}
      <div className="card-warm p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-semibold text-lg text-foreground">{t("setup.linker.title")}</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Parent picker */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{t("setup.linker.parent_label")}</label>
            {selectedParent ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-sm font-medium text-foreground">{selectedParent.full_name || t("users.unnamed")}</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedParent(null)} className="h-7 px-2">
                  {t("setup.linker.change")}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t("setup.linker.search_parents")}
                    value={parentSearch}
                    onChange={(e) => setParentSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1 rounded-lg border border-border p-1">
                  {filteredParents.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-2">{t("setup.linker.no_parents")}</p>
                  ) : (
                    filteredParents.map((p) => (
                      <button
                        key={p.user_id}
                        onClick={() => { setSelectedParent(p); setParentSearch(""); }}
                        className="w-full text-left text-sm px-3 py-2 rounded-md hover:bg-muted transition-colors text-foreground"
                      >
                        {p.full_name || t("users.unnamed")}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Student picker */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{t("setup.linker.student_label")}</label>
            {selectedStudent ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-sm font-medium text-foreground">{selectedStudent.full_name || t("users.unnamed")}</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(null)} className="h-7 px-2">
                  {t("setup.linker.change")}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t("setup.linker.search_students")}
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1 rounded-lg border border-border p-1">
                  {filteredStudents.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-2">{t("setup.linker.no_students")}</p>
                  ) : (
                    filteredStudents.map((s) => (
                      <button
                        key={s.user_id}
                        onClick={() => { setSelectedStudent(s); setStudentSearch(""); }}
                        className="w-full text-left text-sm px-3 py-2 rounded-md hover:bg-muted transition-colors text-foreground"
                      >
                        {s.full_name || t("users.unnamed")}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={() => createLink.mutate()}
          disabled={!selectedParent || !selectedStudent || createLink.isPending}
          className="w-full md:w-auto"
        >
          {createLink.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
          {t("setup.linker.link_btn")}
        </Button>
      </div>

      {/* Existing links */}
      <div className="card-warm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="w-5 h-5 text-secondary" />
          <h2 className="font-heading font-semibold text-lg text-foreground">{t("setup.linker.links_title")}</h2>
          <span className="text-xs text-muted-foreground ml-auto">{enrichedLinks.length} {t("setup.linker.total")}</span>
        </div>

        {loadingLinks ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : enrichedLinks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">{t("setup.linker.no_links")}</p>
        ) : (
          <div className="space-y-2">
            {enrichedLinks.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-foreground">{link.parentName}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-foreground">{link.studentName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteLink.mutate(link.id)}
                  disabled={deleteLink.isPending}
                  className="h-8 px-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentStudentLinker;
