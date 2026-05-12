import { Link, useLocation } from "react-router-dom";
import { 
  Compass, 
  Sparkles, 
  FileText, 
  Award, 
  MessageSquare, 
  Search, 
  LayoutDashboard, 
  Users, 
  Settings, 
  BookOpen, 
  Briefcase,
  Target,
  BarChart3,
  LogOut,
  ChevronRight
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  role: "student" | "parent" | "counselor" | "admin" | "superadmin";
}

const getRoleNav = (t: any) => ({
  student: [
    { label: t("nav.student.journey"), path: "/student", icon: Compass },
    { label: t("nav.student.discovery_hub", "Discovery Hub"), path: "/student/assessment", icon: Sparkles },
    { label: t("nav.student.report"), path: "/student/report", icon: FileText },
    { label: t("nav.student.skills"), path: "/student/skills", icon: Award },
    { label: t("nav.student.coach"), path: "/student/coach", icon: MessageSquare },
    { label: t("nav.explore"), path: "/student/explore", icon: Search },
  ],
  parent: [
    { label: t("nav.parent.child"), path: "/parent", icon: Users },
    { label: t("nav.parent.support"), path: "/parent/support", icon: Heart },
    { label: t("nav.parent.resources"), path: "/parent/resources", icon: BookOpen },
    { label: t("nav.parent.assistant"), path: "/parent/coach", icon: MessageSquare },
  ],
  counselor: [
    { label: t("nav.counselor.attention"), path: "/counselor", icon: LayoutDashboard },
    { label: t("nav.counselor.insights"), path: "/counselor/insights", icon: BarChart3 },
    { label: t("nav.counselor.notes"), path: "/counselor/notes", icon: FileText },
    { label: t("nav.counselor.gatsby"), path: "/counselor/gatsby", icon: Target },
  ],
  admin: [
    { label: t("nav.admin.overview"), path: "/admin", icon: LayoutDashboard },
    { label: t("nav.admin.insights"), path: "/admin/insights", icon: BarChart3 },
    { label: t("nav.admin.users"), path: "/admin/users", icon: Users },
    { label: t("nav.admin.bulk"), path: "/admin/bulk", icon: Settings },
  ],
  superadmin: [
    { label: t("nav.superadmin.overview", "Super Overview"), path: "/superadmin", icon: LayoutDashboard },
    { label: t("nav.admin.insights"), path: "/admin/insights", icon: BarChart3 },
    { label: t("nav.admin.users"), path: "/admin/users", icon: Users },
  ],
});

// Helper for Parent support icon which isn't in my initial list
const Heart = ({className}: {className?: string}) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;

const AppSidebar = ({ role }: AppSidebarProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { signOut } = useAuth();
  const navItems = getRoleNav(t)[role] || [];

  return (
    <aside className="w-72 bg-background border-r border-border h-screen sticky top-0 flex flex-col group transition-all duration-300">
      <div className="p-8 pb-4">
        <Link to="/" className="flex items-center gap-3 group/logo">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover/logo:scale-110 transition-transform">
            <Compass className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-black text-lg text-foreground tracking-tight">Pathfinder</span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] -mt-1">Super Riasec</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group/item ${
                active 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/10" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 transition-transform group-hover/item:scale-110 ${active ? "text-primary-foreground" : "text-muted-foreground group-hover/item:text-primary"}`} />
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
              </div>
              {active && <ChevronRight className="w-4 h-4 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="p-4 rounded-3xl bg-muted/50 border border-border/50">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-2xl py-6"
            onClick={signOut}
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-bold tracking-tight">{t("common.signOut")}</span>
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
