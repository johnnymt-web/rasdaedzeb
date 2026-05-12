import { Link, useLocation } from "react-router-dom";
import { Compass, Menu, X, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

interface AppHeaderProps {
  role?: "student" | "parent" | "counselor" | "admin" | "superadmin";
  minimal?: boolean;
}

const getRoleNav = (t: any): Record<string, { label: string; path: string }[]> => ({
  student: [
    { label: t("nav.student.journey"), path: "/student" },
    { label: t("nav.student.discovery_hub", "Discovery Hub"), path: "/student/assessment" },
    { label: t("nav.student.report"), path: "/student/report" },
    { label: t("nav.student.skills"), path: "/student/skills" },
    { label: t("nav.student.coach"), path: "/student/coach" },
    { label: t("nav.explore"), path: "/student/explore" },
  ],
  parent: [
    { label: t("nav.parent.child"), path: "/parent" },
    { label: t("nav.parent.support"), path: "/parent/support" },
    { label: t("nav.parent.resources"), path: "/parent/resources" },
    { label: t("nav.parent.assistant"), path: "/parent/coach" },
    { label: t("nav.parent.hub"), path: "/explore/resources" },
  ],
  counselor: [
    { label: t("nav.counselor.attention"), path: "/counselor" },
    { label: t("nav.counselor.insights"), path: "/counselor/insights" },
    { label: t("nav.counselor.notes"), path: "/counselor/notes" },
    { label: t("nav.counselor.gatsby"), path: "/counselor/gatsby" },
  ],
  admin: [
    { label: t("nav.admin.overview"), path: "/admin" },
    { label: t("nav.admin.insights"), path: "/admin/insights" },
    { label: t("nav.admin.users"), path: "/admin/users" },
    { label: t("nav.admin.setup"), path: "/admin/setup" },
    { label: t("nav.admin.bulk"), path: "/admin/bulk" },
    { label: t("nav.admin.settings"), path: "/admin/settings" },
  ],
  superadmin: [
    { label: t("nav.superadmin.overview", "Super Overview"), path: "/superadmin" },
    { label: t("nav.admin.insights"), path: "/admin/insights" },
    { label: t("nav.admin.users"), path: "/admin/users" },
  ],
});

const AppHeader = ({ role, minimal }: AppHeaderProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navItems = role ? getRoleNav(t)[role] : [];

  return (
    <header className={`${minimal ? 'bg-transparent border-none' : 'sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border'}`}>
      <div className={`container mx-auto px-6 h-16 flex items-center justify-between ${minimal ? 'p-0 h-auto' : ''}`}>
        {!minimal && (
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Compass className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg text-foreground">{t("common.pathfinder")}</span>
          </Link>
        )}

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {!minimal && (
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {role && user && !minimal && (
            <Link
              to="/explore"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === "/explore"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {t("nav.explore")}
            </Link>
          )}

          <div className="flex items-center gap-2 ml-2">
            {user ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <User className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">{t("common.profile")}</span>
                  </Button>
                </Link>
                {!minimal && (
                  <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground">
                    <LogOut className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">{t("common.signOut")}</span>
                  </Button>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth">
                  <Button variant="ghost" size="sm">{t("common.signIn")}</Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button variant="default" size="sm">{t("common.signUp")}</Button>
                </Link>
              </div>
            )}
          </div>
          
          <div className="ml-4 pl-4 border-l border-border">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {!role && (
            <>
              <Link
                to="/explore"
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === "/explore" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("nav.explore")}
              </Link>
              {user ? (
                <div className="pt-2">
                  <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { signOut(); setMobileOpen(false); }}>
                    <LogOut className="w-4 h-4" />
                    {t("common.signOut")}
                  </Button>
                </div>
              ) : (
                <div className="pt-2 flex flex-col gap-2">
                  <Link to="/auth" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">{t("common.signIn")}</Button>
                  </Link>
                  <Link to="/auth?mode=signup" onClick={() => setMobileOpen(false)}>
                    <Button variant="default" className="w-full justify-start">{t("common.signUp")}</Button>
                  </Link>
                </div>
              )}
            </>
          )}
          
          {role && user && (
            <div className="pt-2 flex flex-col gap-2 border-t border-border mt-2">
              <Link to="/profile" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <User className="w-4 h-4" />
                  {t("common.profile")}
                </Button>
              </Link>
              <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { signOut(); setMobileOpen(false); }}>
                <LogOut className="w-4 h-4" />
                {t("common.signOut")}
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default AppHeader;
