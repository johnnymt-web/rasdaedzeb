import { motion } from "framer-motion";
import { 
  StickyNote, Search, Clock, ArrowLeft, 
  Loader2, Filter, User, Calendar, AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

export default function CounselorNotes() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const { data: notes = [], isLoading, error: queryError } = useQuery({
    queryKey: ["all-counselor-notes"],
    queryFn: async () => {
      console.log("CounselorNotes: Fetching notes (agnostic)...");
      
      // 1. Fetch the notes first
      const { data: notesData, error: notesError } = await supabase
        .from("counselor_notes")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (notesError) {
        console.error("CounselorNotes: Error fetching notes:", notesError);
        throw notesError;
      }

      if (!notesData || notesData.length === 0) return [];

      // 2. Extract unique student IDs
      const studentIds = [...new Set(notesData.map(n => n.student_id))];

      // 3. Fetch profiles for these students
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, grade, school_id")
        .in("id", studentIds);

      if (profilesError) {
        console.warn("CounselorNotes: Error fetching profiles, proceeding with partial data:", profilesError);
      }

      // 4. Fetch all schools for mapping
      const { data: allSchools } = await supabase.from("schools").select("id, name");
      const schoolMap = new Map((allSchools || []).map(s => [s.id, s.name]));

      // 5. Merge them manually
      const profileMap = new Map((profilesData || []).map(p => [p.id, {
        ...p,
        school_name: p.school_id ? schoolMap.get(p.school_id) : null
      }]));
      
      const mergedData = notesData.map(note => ({
        ...note,
        profiles: profileMap.get(note.student_id) || null
      }));

      console.log(`CounselorNotes: Successfully merged ${mergedData.length} notes`);
      return mergedData;
    }
  });

  const filteredNotes = notes.filter((n: any) => {
    const studentName = n.profiles?.full_name?.toLowerCase() || "";
    const content = n.content.toLowerCase();
    return studentName.includes(search.toLowerCase()) || content.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <Link to="/counselor" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              {t("counselor.back_dashboard")}
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2">
                {t("counselor.notes.title")}
              </h1>
              <p className="text-muted-foreground max-w-xl">
                {t("counselor.notes.subtitle")}
              </p>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder={t("counselor.notes.search_placeholder")}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : queryError ? (
            <div className="card-warm p-10 text-center surface-rose border-destructive/20">
              <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-heading font-bold mb-2 text-destructive">{t("counselor.notes.error_loading")}</h2>
              <p className="text-sm text-muted-foreground">
                {(queryError as any).message || t("counselor.copilot.error")}
              </p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="card-warm p-20 text-center">
              <StickyNote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-heading font-bold mb-2">{t("counselor.notes.no_notes")}</h2>
              <p className="text-sm text-muted-foreground">
                {search ? t("counselor.notes.no_notes_search") : t("counselor.notes.no_notes_desc")}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredNotes.map((note: any) => (
                <div key={note.id} className="card-warm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="border-b border-border bg-muted/20 px-6 py-3 flex items-center justify-between">
                    <Link to={`/counselor/student/${note.student_id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-heading font-semibold text-sm">
                        {note.profiles?.full_name || t("counselor.unnamed_student")}
                      </span>
                      {note.profiles?.grade && (
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-bold">
                          {note.profiles.grade}
                        </span>
                      )}
                      {note.profiles?.school_name && (
                        <span className="text-[10px] bg-primary/10 px-1.5 py-0.5 rounded text-primary font-bold">
                          {note.profiles.school_name}
                        </span>
                      )}
                    </Link>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {note?.created_at ? format(new Date(note.created_at), "MMM d, yyyy") : "—"}
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {note?.content || t("counselor.notes.no_content")}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-semibold font-heading">
                      <span>{t("counselor.notes.label_private")}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {t("counselor.notes.last_edited", { time: note?.updated_at || note?.created_at ? format(new Date(note.updated_at || note.created_at), "h:mm a") : "—" })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
    </div>
  );
}

