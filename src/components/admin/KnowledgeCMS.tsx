import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, Edit2, Trash2, BookOpen, 
  Save, X, Search, FileText,
  BadgeInfo, Users, Globe, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface KnowledgeResource {
  id: string;
  title: string;
  content: string;
  category: string;
  target_role: "student" | "parent" | "counselor" | "all";
  created_at: string;
}

export default function KnowledgeCMS() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const CATEGORIES = [
    t("cms.categories.exploration"),
    t("cms.categories.university"),
    t("cms.categories.trade"),
    t("cms.categories.financial"),
    t("cms.categories.resume"),
    t("cms.categories.soft_skills")
  ];
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingResource, setEditingResource] = useState<Partial<KnowledgeResource> | null>(null);

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["admin-knowledge-resources"],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("knowledge_resources")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data as KnowledgeResource[];
      } catch (err) {
        throw err;
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (resource: Partial<KnowledgeResource>) => {
      if (resource.id) {
        const { error } = await (supabase as any)
          .from("knowledge_resources")
          .update(resource)
          .eq("id", resource.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("knowledge_resources")
          .insert([resource]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-knowledge-resources"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-resources"] });
      toast.success(t("cms.save_success"));
      setIsEditing(false);
      setEditingResource(null);
    },
    onError: (error: any) => {
      toast.error(t("cms.save_error", { error: error.message }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("knowledge_resources")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-knowledge-resources"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-resources"] });
      toast.success(t("cms.delete_success"));
    },
    onError: (error: any) => {
      toast.error(t("cms.delete_error", { error: error.message }));
    },
  });

  const handleEdit = (resource: KnowledgeResource) => {
    setEditingResource(resource);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setEditingResource({
      title: "",
      category: CATEGORIES[0],
      target_role: "all",
      content: "",
    });
    setIsEditing(true);
  };

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">{t("cms.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("cms.desc")}</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="w-4 h-4" />
          {t("cms.add_btn")}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder={t("cms.search_placeholder")} 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="edit-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="card-warm p-6 border-2 border-primary/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-lg">
                {editingResource?.id ? t("cms.edit_title") : t("cms.create_title")}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("cms.field_title")}</label>
                  <Input 
                    value={editingResource?.title || ""}
                    onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })}
                    placeholder={t("cms.field_title_placeholder")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("cms.field_category")}</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={editingResource?.category || ""}
                    onChange={(e) => setEditingResource({ ...editingResource, category: e.target.value })}
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("cms.field_audience")}</label>
                <div className="flex gap-2">
                  {["all", "student", "parent", "counselor"].map((role) => (
                    <button
                      key={role}
                      onClick={() => setEditingResource({ ...editingResource, target_role: role as any })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        editingResource?.target_role === role 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "bg-background text-muted-foreground border-border hover:border-primary/40"
                      }`}
                    >
                      {role === 'all' ? t("admin.global_view") : 
                       role === 'student' ? t("users.filter_student") :
                       role === 'parent' ? t("users.filter_parent") :
                       t("users.filter_counselor")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("cms.field_content")}</label>
                <textarea 
                  className="flex min-h-[250px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editingResource?.content || ""}
                  onChange={(e) => setEditingResource({ ...editingResource, content: e.target.value })}
                  placeholder={t("cms.field_content_placeholder")}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="ghost" onClick={() => setIsEditing(false)}>{t("cms.cancel_btn")}</Button>
                <Button 
                  onClick={() => saveMutation.mutate(editingResource!)}
                  className="gap-2"
                  disabled={!editingResource?.title || !editingResource?.content || saveMutation.isPending}
                >
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {t("cms.save_btn")}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-20" />
                <p className="text-sm text-muted-foreground">{t("cms.no_resources")}</p>
              </div>
            ) : (
              filteredResources.map((resource) => (
                <div key={resource.id} className="card-warm p-4 flex items-center justify-between gap-4 group hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-lg shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">{resource.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold uppercase py-0.5 px-2 bg-muted rounded border border-border text-muted-foreground">
                          {resource.category}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                          {resource.target_role === 'all' ? <Globe className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                          {resource.target_role === 'all' ? t("admin.global_view") : 
                           resource.target_role === 'student' ? t("users.filter_student") :
                           resource.target_role === 'parent' ? t("users.filter_parent") :
                           t("users.filter_counselor")}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(resource)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        if (window.confirm(t("cms.delete_confirm"))) {
                          deleteMutation.mutate(resource.id);
                        }
                      }} 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
