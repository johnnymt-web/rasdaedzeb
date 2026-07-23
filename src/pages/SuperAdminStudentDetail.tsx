import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, GraduationCap, Calendar, School, Loader2, Sparkles } from "lucide-react";
import { format } from "date-fns";
import ComprehensiveReportView, { SuperadminReportBundle } from "@/components/assessment/ComprehensiveReportView";

/**
 * Read-only student detail for the superadmin: profile header + the full
 * Comprehensive Report. PF-007: cross-school reads go through the audited
 * SECURITY DEFINER RPCs (superadmin_get_student_profile /
 * superadmin_get_student_report_bundle) — each write an audit_logs event — not
 * direct reads of the five protected tables. (Generated Supabase RPC types are
 * regenerated post-migration, so the rpc() calls are cast until then.)
 */
const SuperAdminStudentDetail = () => {
  const { studentId } = useParams<{ studentId: string }>();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["superadmin-student-profile", studentId],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("superadmin_get_student_profile", {
        p_student_id: studentId!,
      });
      if (error) throw error;
      return data as
        | { id: string; full_name: string | null; email: string | null; grade: string | null; created_at: string | null; school_id: string | null; school_name: string | null }
        | null;
    },
    enabled: !!studentId,
  });

  const { data: reportBundle } = useQuery({
    queryKey: ["superadmin-student-report-bundle", studentId],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("superadmin_get_student_report_bundle", {
        p_student_id: studentId!,
      });
      if (error) throw error;
      return data as SuperadminReportBundle;
    },
    enabled: !!studentId,
  });

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
          <Link to="/superadmin">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to dashboard
          </Link>
        </Button>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !profile ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Student not found, or you do not have access to this record.</p>
          </div>
        ) : (
          <div>
            <div className="card-warm p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground">
                    {profile.full_name || "Unnamed student"}
                  </h1>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                    {profile.email && <span>{profile.email}</span>}
                    {profile.grade && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        {profile.grade}
                      </span>
                    )}
                    <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-xs">
                      <School className="w-3 h-3" />
                      {/* @ts-ignore school_name injected above */}
                      {profile.school_id ? profile.school_name || "Unknown school" : "No school assigned"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {profile.created_at ? format(new Date(profile.created_at), "MMM d, yyyy") : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-warm p-8">
              <h2 className="text-xl font-heading font-bold text-foreground mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Discovery Profile
              </h2>
              <div className="border-t pt-6">
                {reportBundle ? (
                  <ComprehensiveReportView
                    studentId={studentId!}
                    grade={profile.grade || undefined}
                    isCounselorView={true}
                    preloadedBundle={reportBundle}
                  />
                ) : (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SuperAdminStudentDetail;
