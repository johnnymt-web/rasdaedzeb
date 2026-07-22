import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Search, GraduationCap, School, Calendar, Loader2, User, ArrowRight } from "lucide-react";
import { format } from "date-fns";

/**
 * Global student roster for the superadmin. Reads all profiles (superadmin RLS
 * read path required — see the "Superadmin select all profiles" policy). Lets the
 * superadmin search across every school and open a student's full report.
 *
 * NOTE: this lists every profile row (students + any staff profiles). Precise
 * student-only filtering would need a superadmin read path on user_roles; until
 * then, use the grade column / search to find students.
 */
const StudentRoster = () => {
  const [search, setSearch] = useState("");

  const { data: schools = [] } = useQuery({
    queryKey: ["superadmin-schools-map"],
    queryFn: async () => {
      const { data, error } = await supabase.from("schools").select("id, name");
      if (error) throw error;
      return data || [];
    },
  });

  const schoolName = useMemo(() => {
    const map = new Map<string, string>();
    schools.forEach((s: any) => map.set(s.id, s.name));
    return (id: string | null) => (id ? map.get(id) || "Unknown school" : "—");
  }, [schools]);

  const { data: profiles = [], isLoading, isError } = useQuery({
    queryKey: ["superadmin-student-roster"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, grade, school_id, created_at, is_archived")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((p: any) =>
      [p.full_name, p.email, p.grade].some((v) => (v || "").toString().toLowerCase().includes(q))
    );
  }, [profiles, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-heading font-bold text-foreground">Students</h3>
          <p className="text-sm text-muted-foreground">
            Every registered profile across all schools. Search by name, email, or grade.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="card-warm p-8 text-center text-sm text-red-600">
          Could not load students. If this persists, confirm the superadmin read policy on
          <code className="mx-1">profiles</code> is applied.
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-warm p-12 text-center">
          <User className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {search ? "No students match your search." : "No profiles found."}
          </p>
        </div>
      ) : (
        <div className="card-warm p-2 md:p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold px-3 py-2 hidden md:grid md:grid-cols-12 gap-4">
            <div className="col-span-4">Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-1">Grade</div>
            <div className="col-span-2">School</div>
            <div className="col-span-2">Joined</div>
          </div>
          <div className="divide-y divide-border">
            {filtered.map((p: any) => (
              <Link
                key={p.id}
                to={`/superadmin/student/${p.id}`}
                className="group grid grid-cols-1 md:grid-cols-12 gap-1 md:gap-4 items-center px-3 py-3 hover:bg-muted/40 rounded-lg transition-colors"
              >
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {p.full_name || "Unnamed"}
                    {p.is_archived && (
                      <span className="ml-2 text-[10px] uppercase font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        archived
                      </span>
                    )}
                  </span>
                </div>
                <div className="col-span-3 text-xs text-muted-foreground truncate">{p.email || "—"}</div>
                <div className="col-span-1 text-xs text-muted-foreground flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 md:hidden" />
                  {p.grade || "—"}
                </div>
                <div className="col-span-2 text-xs text-muted-foreground flex items-center gap-1 truncate">
                  <School className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{schoolName(p.school_id)}</span>
                </div>
                <div className="col-span-2 text-xs text-muted-foreground flex items-center justify-between gap-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {p.created_at ? format(new Date(p.created_at), "MMM d, yyyy") : "—"}
                  </span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {profiles.length} profiles.
      </p>
    </div>
  );
};

export default StudentRoster;
