import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Download, Upload, FileSpreadsheet, 
  AlertCircle, CheckCircle2, Loader2,
  Table as TableIcon, Link2, Users, School, Shield, Trash2, UserCog
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function BulkTools() {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isMasterImporting, setIsMasterImporting] = useState(false);
  
  const [importStatus, setImportStatus] = useState<{ total: number, success: number, failed: number } | null>(null);
  const [linkStatus, setLinkStatus] = useState<{ total: number, success: number, failed: number } | null>(null);
  const [assignStatus, setAssignStatus] = useState<{ total: number, success: number, failed: number } | null>(null);
  const [promotionStatus, setPromotionStatus] = useState<{ total: number, success: number, failed: number } | null>(null);
  const [archiveStatus, setArchiveStatus] = useState<{ total: number, success: number, failed: number } | null>(null);
  const [masterStatus, setMasterStatus] = useState<{ total: number, success: number, failed: number } | null>(null);

  // --- CSV UTILITIES ---
  const parseCSV = (text: string) => {
    // Remove BOM and split into lines
    const cleanText = text.replace(/^\uFEFF/, "");
    const lines = cleanText.split(/\r?\n/).filter(l => l.trim());
    if (lines.length === 0) return [];
    
    const splitLine = (line: string) => {
      const result = [];
      let cur = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i+1] === '"') {
            cur += '"'; i++; 
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(cur.trim());
          cur = "";
        } else {
          cur += char;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const headers = splitLine(lines[0]).map(h => h.toLowerCase().trim());
    return lines.slice(1).map(line => {
      const values = splitLine(line);
      const obj: Record<string, string> = {};
      headers.forEach((header, i) => { 
        if (header) obj[header] = values[i]; 
      });
      return obj;
    });
  };

  const downloadCSV = (data: Record<string, any>[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(obj => Object.values(obj).map(v => `"${v}"`).join(","));
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- ACTIONS ---
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { data: roles, error: rolesErr } = await supabase.from("user_roles").select("user_id").eq("role", "student");
      if (rolesErr) throw rolesErr;
      const ids = (roles || []).map(r => r.user_id);
      if (ids.length === 0) { toast.info(t("bulk.toast.no_students")); return; }

      // 1. Fetch profiles
      const { data: profiles, error: profErr } = await supabase.from("profiles")
        .select("id, full_name, email, grade, is_archived, school_id").in("id", ids);
      if (profErr) throw profErr;

      // 2. Fetch schools for mapping
      const { data: allSchools, error: schoolsErr } = await supabase.from("schools").select("id, name");
      if (schoolsErr) throw schoolsErr;
      const schoolMap = new Map((allSchools || []).map(s => [s.id, s.name]));

      // 3. Fetch assessments
      const { data: assessments, error: assErr } = await supabase.from("assessments").select("user_id, results, completed_at, created_at").in("user_id", ids);
      if (assErr) throw assErr;

      const exportData = (profiles || []).map(p => {
        const studentAssessments = (assessments || []).filter(a => a.user_id === p.id);
        const latest = studentAssessments.sort((a,b) => new Date(b.completed_at || b.created_at || "").getTime() - new Date(a.completed_at || a.created_at || "").getTime())[0];
        const results = (latest?.results || []) as unknown as Array<{ category: string; pct: number }>;
        const getP = (cat: string) => results.find((r) => r.category === cat)?.pct || 0;
        
        return {
          Name: p.full_name, 
          Email: p.email || t("users.not_available"), 
          School: p.school_id ? schoolMap.get(p.school_id) : t("users.unassigned"), 
          Grade: p.grade || t("users.not_available"), 
          Status: p.is_archived ? t("bulk.status_archived") : ((latest?.completed_at || latest?.created_at) ? t("bulk.status_completed") : t("bulk.status_pending")),
          Realistic: getP("Realistic"), 
          Investigative: getP("Investigative"), 
          Artistic: getP("Artistic"), 
          Social: getP("Social"), 
          Enterprising: getP("Enterprising"), 
          Conventional: getP("Conventional")
        };
      });

      downloadCSV(exportData, `School_Report_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success(t("bulk.toast.export_success"));
    } catch (err) { 
      toast.error(t("bulk.toast.export_failed")); 
    } finally { 
      setIsExporting(false); 
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    setImportStatus(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const rows = parseCSV(event.target?.result as string);
        if (rows.length === 0) {
          toast.error(t("bulk.toast.csv_empty"));
          setIsImporting(false);
          return;
        }

        // Validate headers
        if (!rows[0] || !('email' in rows[0])) {
          toast.error(t("bulk.toast.email_required"));
          console.error("CSV Headers found:", Object.keys(rows[0] || {}));
          setIsImporting(false);
          return;
        }

        const emails = rows.map(r => r.email?.trim()).filter(Boolean);
        const { data: existingProfiles, error: profErr } = await supabase.from("profiles").select("id, email").in("email", emails);
        
        if (profErr) {
          toast.error(t("bulk.toast.db_error"));
          setIsImporting(false);
          return;
        }

        const updates = [];
        const preboardings = [];
        const roleUpdates = [];

        for (const row of rows) {
          const email = row.email?.trim();
          if (!email) continue;
          
          const rawRole = (row.role || row.assigned_role || "student").toLowerCase().trim();
          const role = VALID_ROLES.includes(rawRole) ? rawRole : "student";
          
          const profile = (existingProfiles as any[] | null)?.find((p: any) => p.email === email);
          if (profile) {
            updates.push({ id: profile.id, grade: row.grade, full_name: row.name });
            roleUpdates.push({ user_id: profile.id, role: role as any });
          } else {
            preboardings.push({ 
              email, 
              assigned_role: role as any, 
              assigned_grade: row.grade, 
              full_name: row.name, 
              target_school_name: row.school,
              temp_password: row.password || row.temp_password 
            });
          }
        }

        // Execute batches
        let successCount = 0;
        let finalError = null;

        if (updates.length > 0) {
          // Partial update-by-id of existing profiles; cast matches the adjacent
          // roleUpdates upsert (profiles Insert type otherwise requires `email`).
          const { error } = await supabase.from("profiles").upsert(updates as any);
          if (!error) successCount += updates.length;
          else finalError = error;
        }
        if (roleUpdates.length > 0) {
          const { error } = await supabase.from("user_roles").upsert(roleUpdates as any);
          if (error) finalError = error;
        }
        if (preboardings.length > 0) {
          const { error } = await supabase.from("pre_boarding").upsert(preboardings as any);
          if (!error) successCount += preboardings.length;
          else finalError = error;
        }

        setImportStatus({ total: rows.length, success: successCount, failed: rows.length - successCount });
        
        // --- EDGE FUNCTION CALL: Create Accounts if passwords provided ---
        const usersWithPasswords = rows.filter(r => r.password || r.temp_password).map(r => ({
          email: r.email?.trim(),
          password: r.password || r.temp_password,
          full_name: r.name,
          role: (r.role || "student").toLowerCase(),
          grade: r.grade,
          school: r.school
        }));

        if (usersWithPasswords.length > 0) {
          toast.info(t("bulk.toast.creating_accounts", { count: usersWithPasswords.length }));
          const { data: edgeData, error: edgeErr } = await supabase.functions.invoke('bulk-onboard-users', {
            body: { users: usersWithPasswords }
          });
          
          if (edgeErr) {
            console.error("Edge Function Error:", edgeErr);
            toast.error(t("bulk.toast.creation_failed"));
          } else {
            const createdCount = edgeData.results.filter((r: any) => r.success).length;
            toast.success(t("bulk.toast.creation_success", { count: createdCount }));
          }
        }
        
        // Log the administrative action
        const adminId = (await supabase.auth.getUser()).data.user?.id || "00000000-0000-0000-0000-000000000000";
        await supabase.from("audit_logs").insert({
          admin_id: adminId,
          action: "BULK_IMPORT_ONBOARDING",
          target_type: "bulk_file",
          details: { 
            count: rows.length, 
            success: successCount, 
            errors: finalError ? String(finalError.message || finalError) : null 
          } as any
        });

        if (successCount === 0 && rows.length > 0) {
          toast.error(t("bulk.toast.import_failed", { total: rows.length }));
        } else {
          toast.success(t("bulk.toast.import_success", { count: successCount }));
          if (successCount < rows.length) {
            toast.warning(t("bulk.toast.import_warning", { count: rows.length - successCount }));
          }
        }
      } catch (err) { 
        console.error("Import error:", err);
        toast.error(t("bulk.toast.unexpected_error")); 
      } finally { 
        setIsImporting(false); 
      }
    };
    reader.readAsText(file);
  };

  const handleAssignmentImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAssigning(true);
    setAssignStatus(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const rows = parseCSV(event.target?.result as string);
        if (rows.length === 0) {
          toast.error(t("bulk.toast.csv_empty"));
          setIsAssigning(false);
          return;
        }

        // Validate headers (flexible)
        const firstRow = rows[0];
        const hasEmail = 'email' in firstRow || 'student_email' in firstRow;
        if (!hasEmail) {
          toast.error(t("bulk.toast.email_required"));
          setIsAssigning(false);
          return;
        }

        const emails = rows.map(r => r.email?.trim() || r.student_email?.trim()).filter(Boolean);
        const schoolNames = [...new Set(rows.map(r => r.school?.trim() || r.school_name?.trim()).filter(Boolean))];
        const counselorEmails = [...new Set(rows.map(r => r.counselor_email?.trim()).filter(Boolean))];

        const [{ data: profiles }, { data: schools }, { data: counselors }] = await Promise.all([
          supabase.from("profiles").select("id, email").in("email", emails),
          supabase.from("schools").select("id, name").in("name", schoolNames),
          supabase.from("profiles").select("id, email").in("email", counselorEmails)
        ]);

        const profileUpdates = [];
        const preboardingUpserts = [];
        const counselorAssignments = [];

        for (const row of rows) {
          const email = row.email?.trim() || row.student_email?.trim();
          const schoolName = row.school?.trim() || row.school_name?.trim();
          const counselorEmail = row.counselor_email?.trim();
          if (!email) continue;

          const profile = (profiles as any[] | null)?.find((p: any) => p.email === email);
          const school = (schools as any[] | null)?.find((s: any) => s.name === schoolName);
          const counselor = (counselors as any[] | null)?.find((c: any) => c.email === counselorEmail);

          if (school) {
            if (profile) profileUpdates.push({ id: profile.id, school_id: school.id });
            else preboardingUpserts.push({ email, target_school_name: schoolName });
          }

          if (counselorEmail) {
            if (counselor && profile) counselorAssignments.push({ counselor_id: counselor.id, student_id: profile.id });
            else preboardingUpserts.push({ email, assigned_counselor_email: counselorEmail });
          }
        }

        let sCount = 0;
        if (profileUpdates.length > 0) await supabase.from("profiles").upsert(profileUpdates as any);
        if (preboardingUpserts.length > 0) await supabase.from("pre_boarding").upsert(preboardingUpserts as any);
        if (counselorAssignments.length > 0) await supabase.from("counselor_students").upsert(counselorAssignments);
        
        sCount = rows.length;
        setAssignStatus({ total: rows.length, success: sCount, failed: 0 });

        const adminId = (await supabase.auth.getUser()).data.user?.id || "00000000-0000-0000-0000-000000000000";
        await supabase.from("audit_logs").insert({
          admin_id: adminId,
          action: "BULK_IMPORT_ASSIGNMENT",
          target_type: "bulk_file",
          details: { count: rows.length, school_names: schoolNames } as any
        });

        toast.success(t("bulk.toast.assignment_success", { count: sCount }));
      } catch (err) { 
        console.error("Assignment error:", err);
        toast.error(t("bulk.toast.assignment_failed")); 
      } finally { 
        setIsAssigning(false); 
      }
    };
    reader.readAsText(file);
  };

  const VALID_ROLES = ['student', 'parent', 'counselor', 'admin'];

  const handlePromotionImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsPromoting(true);
    setPromotionStatus(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const rows = parseCSV(event.target?.result as string);
        if (rows.length === 0) return;

        const emails = rows.map(r => r.email?.trim()).filter(Boolean);
        // Validate headers
        if (!rows[0] || !('email' in rows[0])) {
          toast.error(t("bulk.toast.email_required"));
          setIsPromoting(false);
          return;
        }

        let successCount = 0;
        let failedCount = 0;

        const { data: profiles } = await supabase.from("profiles").select("id, email").in("email", emails);

        for (const row of rows) {
          const email = row.email?.trim();
          const role = row.role?.trim()?.toLowerCase();
          if (!email || !role) { failedCount++; continue; }

          // SEC-6: Validate role against whitelist
          if (!VALID_ROLES.includes(role)) {
            console.warn(`Skipping invalid role "${role}" for ${email}`);
            failedCount++;
            continue;
          }

          const profile = (profiles as any[] | null)?.find((p: any) => p.email === email);
          if (profile) {
            const { error } = await supabase
              .from("user_roles")
              .upsert({ user_id: profile.id, role: role as any }, { onConflict: "user_id,role" });
            if (error) {
              failedCount++;
            } else {
              successCount++;
            }
          } else {
            const { error } = await supabase
              .from("pre_boarding")
              .upsert({ email, assigned_role: role } as any);
            if (error) { failedCount++; } else { successCount++; }
          }
        }

        setPromotionStatus({ total: rows.length, success: successCount, failed: failedCount });

        // Log the administrative action
        const adminId = (await supabase.auth.getUser()).data.user?.id || "00000000-0000-0000-0000-000000000000";
        await supabase.from("audit_logs").insert({
          admin_id: adminId,
          action: "BULK_ROLE_PROMOTION",
          target_type: "bulk_file",
          details: { 
            count: rows.length, 
            success: successCount, 
            failed: failedCount 
          } as any
        });

        if (successCount === 0 && rows.length > 0) {
          toast.error(t("bulk.toast.promotion_failed"));
        } else {
          toast.success(`${t("bulk.toast.promotion_success", { count: successCount })} ${failedCount > 0 ? t("bulk.toast.promotion_failed_count", { count: failedCount }) : ''}`);
        }
      } catch (err) { 
        console.error("Promotion error:", err);
        toast.error(t("bulk.toast.promotion_failed")); 
      } finally { 
        setIsPromoting(false); 
      }
    };
    reader.readAsText(file);
  };

  const handleArchiveImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsArchiving(true);
    setArchiveStatus(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const rows = parseCSV(event.target?.result as string);
        if (rows.length === 0) return;

        const emails = rows.map(r => r.email?.trim()).filter(Boolean);
        const grades = rows.map(r => r.grade?.trim()).filter(Boolean);

        if (emails.length === 0 && grades.length === 0) {
          toast.error(t("bulk.toast.email_required"));
          setIsArchiving(false);
          return;
        }

        let totalAffected = 0;
        if (emails.length > 0) {
          const { count } = await supabase.from("profiles").update({ is_archived: true }).in("email", emails);
          totalAffected += (count || 0);
        }
        if (grades.length > 0) {
          const { count } = await supabase.from("profiles").update({ is_archived: true }).in("grade", grades);
          totalAffected += (count || 0);
        }

        setArchiveStatus({ total: rows.length, success: rows.length, failed: 0 });
        toast.success(t("bulk.toast.archive_success", { count: totalAffected }));
      } catch (err) { 
        console.error("Archiving error:", err);
        toast.error(t("bulk.toast.archive_failed")); 
      } finally { 
        setIsArchiving(false); 
      }
    };
    reader.readAsText(file);
  };

  const handleLinkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLinking(true);
    setLinkStatus(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const rows = parseCSV(event.target?.result as string);
        if (rows.length === 0) {
          toast.error(t("bulk.toast.csv_empty"));
          setIsLinking(false);
          return;
        }

        // Validate headers
        if (!rows[0] || !('parent_email' in rows[0]) || !('student_email' in rows[0])) {
          toast.error(t("bulk.toast.email_required"));
          setIsLinking(false);
          return;
        }

        let sCount = 0; let fCount = 0;
        for (const row of rows) {
          const pEmail = row.parent_email?.trim();
          const sEmail = row.student_email?.trim();
          if (!pEmail || !sEmail) { fCount++; continue; }
          
          try {
            const [{ data: p }, { data: s }] = await Promise.all([
              supabase.from("profiles").select("id").eq("email", pEmail).maybeSingle(),
              supabase.from("profiles").select("id").eq("email", sEmail).maybeSingle()
            ]);

            if (p && s) {
              const { error } = await supabase.from("parent_students").upsert({ parent_id: p.id, student_id: s.id });
              if (error) fCount++; else sCount++;
            } else {
              const { error } = await supabase.from("pre_boarding_links").upsert({ parent_email: pEmail, student_email: sEmail });
              if (error) fCount++; else sCount++;
            }
          } catch (err) { fCount++; }
        }
        setLinkStatus({ total: rows.length, success: sCount, failed: fCount });
        
        if (sCount === 0 && rows.length > 0) {
          toast.error(t("bulk.toast.linking_failed"));
        } else {
          toast.success(t("bulk.toast.linking_success", { count: sCount }));
        }
      } catch (err) { 
        console.error("Linking error:", err);
        toast.error(t("bulk.toast.linking_process_failed")); 
      } finally { 
        setIsLinking(false); 
      }
    };
    reader.readAsText(file);
  };

  const handleMasterImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsMasterImporting(true);
    setMasterStatus(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const rows = parseCSV(event.target?.result as string);
        if (rows.length === 0) {
          toast.error(t("bulk.toast.csv_empty"));
          setIsMasterImporting(false);
          return;
        }

        // Validate headers
        const firstRow = rows[0];
        if (!('student_email' in firstRow) || !('parent_email' in firstRow)) {
          toast.error(t("bulk.toast.email_required"));
          setIsMasterImporting(false);
          return;
        }

        const studentEmails = rows.map(r => r.student_email?.trim()).filter(Boolean);
        const parentEmails = rows.map(r => r.parent_email?.trim()).filter(Boolean);
        const allEmails = [...new Set([...studentEmails, ...parentEmails])];

        const { data: existingProfiles } = await supabase.from("profiles").select("id, email").in("email", allEmails);
        
        const preboardings = [];
        const links = [];
        let sCount = 0;

        for (const row of rows) {
          const sEmail = row.student_email?.trim();
          const pEmail = row.parent_email?.trim();
          if (!sEmail || !pEmail) continue;

          // Student Onboarding
          const studentProfile = (existingProfiles as any[] | null)?.find((p: any) => p.email === sEmail);
          if (!studentProfile) {
            preboardings.push({ 
              email: sEmail, 
              assigned_role: 'student' as any, 
              assigned_grade: row.grade, 
              full_name: row.student_name, 
              target_school_name: row.school,
              temp_password: row.student_password
            });
          }

          // Parent Onboarding
          const parentProfile = (existingProfiles as any[] | null)?.find((p: any) => p.email === pEmail);
          if (!parentProfile) {
            preboardings.push({ 
              email: pEmail, 
              assigned_role: 'parent' as any, 
              full_name: row.parent_name,
              temp_password: row.parent_password
            });
          }

          // Linking
          if (studentProfile && parentProfile) {
            await supabase.from("parent_students").upsert({ parent_id: parentProfile.id, student_id: studentProfile.id });
          } else {
            links.push({ parent_email: pEmail, student_email: sEmail });
          }
          sCount++;
        }

        if (preboardings.length > 0) {
          await supabase.from("pre_boarding").upsert(preboardings as any, { onConflict: 'email' });
        }
        if (links.length > 0) {
          await supabase.from("pre_boarding_links").upsert(links as any, { onConflict: 'parent_email,student_email' });
        }

        setMasterStatus({ total: rows.length, success: sCount, failed: rows.length - sCount });

        // --- EDGE FUNCTION CALL: Create Accounts if passwords provided ---
        const familyUsersWithPasswords = [];
        for (const row of rows) {
          if (row.student_password) {
            familyUsersWithPasswords.push({
              email: row.student_email?.trim(),
              password: row.student_password,
              full_name: row.student_name,
              role: 'student',
              grade: row.grade,
              school: row.school
            });
          }
          if (row.parent_password) {
            familyUsersWithPasswords.push({
              email: row.parent_email?.trim(),
              password: row.parent_password,
              full_name: row.parent_name,
              role: 'parent'
            });
          }
        }

        if (familyUsersWithPasswords.length > 0) {
          toast.info(t("bulk.toast.creating_accounts", { count: familyUsersWithPasswords.length }));
          const { data: edgeData, error: edgeErr } = await supabase.functions.invoke('bulk-onboard-users', {
            body: { users: familyUsersWithPasswords }
          });
          
          if (edgeErr) {
            console.error("Edge Function Error:", edgeErr);
            toast.error(t("bulk.toast.creation_failed"));
          } else {
            const createdCount = edgeData.results.filter((r: any) => r.success).length;
            toast.success(t("bulk.toast.creation_success", { count: createdCount }));
          }
        }

        toast.success(t("bulk.toast.family_success", { count: sCount }));
      } catch (err) {
        console.error("Master import error:", err);
        toast.error(t("bulk.toast.master_failed"));
      } finally {
        setIsMasterImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      {/* 1. Export */}
      <div className="card-warm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-secondary">
            <FileSpreadsheet className="w-6 h-6" />
            <div>
              <h3 className="font-heading font-bold text-lg text-foreground">{t("bulk.export_title")}</h3>
              <p className="text-sm text-muted-foreground">{t("bulk.export_desc")}</p>
            </div>
          </div>
          <Button onClick={handleExport} disabled={isExporting} variant="outline" className="gap-2">
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {t("bulk.export_btn")}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Comprehensive Family Import */}
        <div className="card-warm p-6 border-emerald-200 bg-emerald-50/50 lg:col-span-2">
          <div className="flex items-center gap-4 text-emerald-600 mb-6">
            <Users className="w-6 h-6" />
            <div>
              <h3 className="font-heading font-bold text-lg text-foreground">{t("bulk.family_title")}</h3>
              <p className="text-sm text-muted-foreground">{t("bulk.family_desc")}</p>
            </div>
          </div>
          <div className="relative mb-6">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleMasterImport} 
              disabled={isMasterImporting} 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              aria-label="Upload Family CSV"
            />
            <Button disabled={isMasterImporting} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              {isMasterImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <TableIcon className="w-4 h-4" />}
              {t("bulk.family_btn")}
            </Button>
          </div>
          <div className="flex justify-center">
            <button 
              onClick={() => downloadCSV([{ 
                student_name: 'John Doe', student_email: 'john@example.com', student_password: 'Pass123!', grade: 'Year 10', school: 'Pathfinder High',
                parent_name: 'Jane Doe', parent_email: 'jane@example.com', parent_password: 'Pass456!' 
              }], 'family_onboarding_template.csv')}
              className="text-[10px] text-emerald-600 hover:underline flex items-center gap-1"
            >
              <Download className="w-3 h-3" /> {t("bulk.download_sample")}
            </button>
          </div>
          {masterStatus && <StatusGrid status={masterStatus} />}
        </div>

        {/* Onboarding */}
        <div className="card-warm p-6 border-primary/20 bg-primary/5">
          <div className="flex items-center gap-4 text-primary mb-6">
            <Users className="w-6 h-6" />
            <h3 className="font-heading font-bold text-lg text-foreground">{t("bulk.student_title")}</h3>
          </div>
          <div className="relative mb-6">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleImport} 
              disabled={isImporting} 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              aria-label="Upload Student Onboarding CSV"
            />
            <Button disabled={isImporting} className="w-full gap-2">
              {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {t("bulk.student_btn")}
            </Button>
          </div>
          <div className="flex justify-center">
            <button 
              onClick={() => downloadCSV([{ name: 'John Doe', email: 'john@example.com', password: 'TemporaryPass123', grade: 'Year 10', school: 'Pathfinder High', role: 'student' }], 'onboarding_template.csv')}
              className="text-[10px] text-primary hover:underline flex items-center gap-1"
            >
              <Download className="w-3 h-3" /> {t("bulk.download_sample")}
            </button>
          </div>
          {importStatus && <StatusGrid status={importStatus} />}
        </div>

        {/* Visibility & Workload */}
        <div className="card-warm p-6 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-4 text-amber-600 mb-6">
            <School className="w-6 h-6" />
            <h3 className="font-heading font-bold text-lg text-foreground">{t("bulk.workload_title")}</h3>
          </div>
          <div className="relative mb-6">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleAssignmentImport} 
              disabled={isAssigning} 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              aria-label="Upload Assignment CSV"
            />
            <Button disabled={isAssigning} variant="outline" className="w-full gap-2 border-amber-200 bg-amber-100 text-amber-700">
              {isAssigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              {t("bulk.workload_btn")}
            </Button>
          </div>
          <div className="flex justify-center">
            <button 
              onClick={() => downloadCSV([{ email: 'student@example.com', school: 'Pathfinder High', counselor_email: 'counselor@example.com' }], 'assignment_template.csv')}
              className="text-[10px] text-amber-600 hover:underline flex items-center gap-1"
            >
              <Download className="w-3 h-3" /> {t("bulk.download_sample")}
            </button>
          </div>
          {assignStatus && <StatusGrid status={assignStatus} />}
        </div>

        {/* Parent-Student Linking */}
        <div className="card-warm p-6 border-indigo-200 bg-indigo-50/50">
          <div className="flex items-center gap-4 text-indigo-600 mb-6">
            <Link2 className="w-6 h-6" />
            <h3 className="font-heading font-bold text-lg text-foreground">{t("bulk.linking_title")}</h3>
          </div>
          <div className="relative mb-6">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleLinkImport} 
              disabled={isLinking} 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              aria-label="Upload Parent-Student Linking CSV"
            />
            <Button disabled={isLinking} variant="outline" className="w-full gap-2 border-indigo-200 bg-indigo-100 text-indigo-700">
              {isLinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
              {t("bulk.linking_btn")}
            </Button>
          </div>
          <div className="flex justify-center">
            <button 
              onClick={() => downloadCSV([{ parent_email: 'parent@example.com', student_email: 'student@example.com' }], 'linking_template.csv')}
              className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1"
            >
              <Download className="w-3 h-3" /> {t("bulk.download_sample")}
            </button>
          </div>
          {linkStatus && <StatusGrid status={linkStatus} />}
        </div>
      </div>

      {/* MAINTENANCE SECTION */}
      <div className="border-t border-border pt-10">
        <h2 className="text-xl font-heading font-bold text-foreground mb-6 flex items-center gap-2">
          <UserCog className="w-6 h-6 text-rose-500" />
          {t("bulk.maintenance_title")}
        </h2>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Promotion */}
          <div className="card-warm p-6 border-rose-200 bg-rose-50/50">
            <div className="flex flex-col gap-6 mb-6">
              <div className="flex items-center gap-4 text-rose-600">
                <Shield className="w-6 h-6" />
                <div>
                  <h3 className="font-heading font-bold text-lg text-foreground">{t("bulk.promotion_title")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{t("bulk.promotion_desc")}</p>
                </div>
              </div>
              <div className="relative">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handlePromotionImport} 
                  disabled={isPromoting} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  aria-label="Upload Promotion CSV"
                />
                <Button disabled={isPromoting} variant="warm" className="w-full gap-2 bg-rose-500 text-white hover:bg-rose-600">
                  {isPromoting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  {t("bulk.promotion_btn")}
                </Button>
              </div>
              <div className="flex justify-center">
                <button 
                  onClick={() => downloadCSV([{ email: 'admin@example.com', role: 'admin' }], 'promotion_template.csv')}
                  className="text-[10px] text-rose-600 hover:underline flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> {t("bulk.download_sample")}
                </button>
              </div>
            </div>
            {promotionStatus && <StatusGrid status={promotionStatus} />}
          </div>

          {/* Archiving */}
          <div className="card-warm p-6 border-slate-200 bg-slate-50/50">
            <div className="flex flex-col gap-6 mb-6">
              <div className="flex items-center gap-4 text-slate-600">
                <Trash2 className="w-6 h-6" />
                <div>
                  <h3 className="font-heading font-bold text-lg text-foreground">{t("bulk.archive_title")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{t("bulk.archive_desc")}</p>
                </div>
              </div>
              <div className="relative">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleArchiveImport} 
                  disabled={isArchiving} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  aria-label="Upload Archiving CSV"
                />
                <Button disabled={isArchiving} variant="outline" className="w-full gap-2 border-slate-300 bg-slate-100 text-slate-700">
                  {isArchiving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {t("bulk.archive_btn")}
                </Button>
              </div>
              <div className="flex justify-center">
                <button 
                  onClick={() => downloadCSV([{ email: 'old_student@example.com' }, { grade: 'Year 13' }], 'archiving_template.csv')}
                  className="text-[10px] text-slate-600 hover:underline flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> {t("bulk.download_sample")}
                </button>
              </div>
            </div>
            {archiveStatus && <StatusGrid status={archiveStatus} />}
          </div>
        </div>

        <div className="mt-8 p-4 bg-background/50 rounded-xl border border-border">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="grid md:grid-cols-2 gap-4 w-full">
              <div>
                <p className="font-bold text-foreground mb-1">{t("bulk.csv_role_hint")}</p>
                {t("bulk.csv_role_cols")}
              </div>
              <div>
                <p className="font-bold text-foreground mb-1">{t("bulk.csv_archive_hint")}</p>
                {t("bulk.csv_archive_cols")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusGrid({ status }: { status: { total: number, success: number, failed: number } }) {
  const { t } = useTranslation();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4 border-t border-border grid grid-cols-3 gap-2">
      <div className="text-center"><div className="text-lg font-bold">{status.total}</div><div className="text-[8px] uppercase font-bold text-muted-foreground">{t("bulk.status_total")}</div></div>
      <div className="text-center text-green-600"><div className="text-lg font-bold">{status.success}</div><div className="text-[8px] uppercase font-bold">{t("bulk.status_success")}</div></div>
      <div className="text-center text-rose-500"><div className="text-lg font-bold">{status.failed}</div><div className="text-[8px] uppercase font-bold">{t("bulk.status_failed")}</div></div>
    </motion.div>
  );
}
