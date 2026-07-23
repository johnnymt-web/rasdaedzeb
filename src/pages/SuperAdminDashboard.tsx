import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, Users, ShieldCheck, BarChart3, 
  Settings, Plus, Search, LayoutDashboard,
  ArrowLeft, School, GraduationCap
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import SchoolManagement from "@/components/superadmin/SchoolManagement";
import AdminAssignment from "@/components/superadmin/AdminAssignment";
import StudentRoster from "@/components/superadmin/StudentRoster";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SuperAdminDashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"overview" | "students" | "schools" | "admins" | "settings">("overview");

  // Global Stats Fetch. PF-007: profile/assessment counts require cross-school
  // visibility that the removed superadmin SELECT policies used to grant, so they
  // come from the audited superadmin_platform_counts RPC (returns non-PII
  // aggregate integers only). Generated RPC types are regenerated post-migration.
  const { data: stats, isLoading } = useQuery({
    queryKey: ["superadmin-stats"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("superadmin_platform_counts");
      if (error) throw error;
      return {
        schools: (data?.schools as number) || 0,
        users: (data?.users as number) || 0,
        assessments: (data?.assessments as number) || 0,
      };
    }
  });

  const menuItems = [
    { id: "overview", label: t("superadmin.menu.overview"), icon: LayoutDashboard },
    { id: "students", label: t("superadmin.menu.students", "Students"), icon: GraduationCap },
    { id: "schools", label: t("superadmin.menu.schools"), icon: Building2 },
    { id: "admins", label: t("superadmin.menu.admins"), icon: ShieldCheck },
    { id: "settings", label: t("superadmin.menu.settings"), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              {t("superadmin.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("superadmin.subtitle")}
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-muted/50 p-1 rounded-xl border border-border">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id 
                    ? "bg-background text-primary shadow-sm ring-1 ring-border" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Global Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card-warm p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <School className="w-20 h-20" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-4">{t("superadmin.stats.schools")}</p>
                    <div className="text-4xl font-heading font-bold text-foreground">
                      {isLoading ? "..." : stats?.schools}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 font-medium">
                      <BarChart3 className="w-3 h-3" />
                      <span>{t("superadmin.stats.active_system")}</span>
                    </div>
                  </div>

                  <div className="card-warm p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Users className="w-20 h-20" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-4">{t("superadmin.stats.total_users")}</p>
                    <div className="text-4xl font-heading font-bold text-foreground">
                      {isLoading ? "..." : stats?.users}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-primary font-medium">
                      <GraduationCap className="w-3 h-3" />
                      <span>{t("superadmin.stats.across_schools")}</span>
                    </div>
                  </div>

                  <div className="card-warm p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <ShieldCheck className="w-20 h-20" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-4">{t("superadmin.stats.assessments")}</p>
                    <div className="text-4xl font-heading font-bold text-foreground">
                      {isLoading ? "..." : stats?.assessments}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-secondary font-medium">
                      <BarChart3 className="w-3 h-3" />
                      <span>{t("superadmin.stats.completed_tests")}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions & Recent Activity Placeholder */}
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="card-warm p-6">
                    <h3 className="text-lg font-heading font-bold mb-4">{t("superadmin.overview.system_health")}</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-sm font-medium text-emerald-900">Database Connection</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 uppercase">Operational</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-sm font-medium text-emerald-900">O*NET API Gateway</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 uppercase">Connected</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-warm p-6">
                    <h3 className="text-lg font-heading font-bold mb-4">{t("superadmin.overview.quick_setup")}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button onClick={() => setActiveTab("schools")} variant="outline" className="justify-start gap-2 h-auto py-3">
                        <Building2 className="w-4 h-4 text-primary" />
                        <div className="text-left">
                          <div className="text-sm font-bold">Add School</div>
                          <div className="text-[10px] text-muted-foreground">Register a new institution</div>
                        </div>
                      </Button>
                      <Button onClick={() => setActiveTab("admins")} variant="outline" className="justify-start gap-2 h-auto py-3">
                        <ShieldCheck className="w-4 h-4 text-secondary" />
                        <div className="text-left">
                          <div className="text-sm font-bold">Assign Admin</div>
                          <div className="text-[10px] text-muted-foreground">Grant admin permissions</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "students" && <StudentRoster />}
            {activeTab === "schools" && <SchoolManagement />}
            {activeTab === "admins" && <AdminAssignment />}
            {activeTab === "settings" && (
              <div className="card-warm p-12 text-center">
                <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-heading font-bold mb-2">System Settings</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Global system configurations, theme settings, and API integrations will be managed here.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
