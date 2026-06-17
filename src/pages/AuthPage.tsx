import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Compass, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

type AuthMode = "login" | "signup";
type Role = "student" | "parent" | "counselor" | "admin";

const GRADE_OPTIONS = [
  { value: "Grade 6", label: "Grade 6" },
  { value: "Grade 7", label: "Grade 7" },
  { value: "Grade 8", label: "Grade 8" },
  { value: "Grade 9", label: "Grade 9" },
  { value: "Grade 10", label: "Grade 10" },
  { value: "Grade 11", label: "Grade 11" },
  { value: "Grade 12", label: "Grade 12" },
  { value: "Grade 13", label: "Grade 13" },
];

const getRoleOptions = (t: any): { value: Role; label: string; desc: string }[] => [
  { value: "student", label: t("auth.roles.student.label"), desc: t("auth.roles.student.desc") },
  { value: "parent", label: t("auth.roles.parent.label"), desc: t("auth.roles.parent.desc") },
  { value: "counselor", label: t("auth.roles.counselor.label"), desc: t("auth.roles.counselor.desc") },
  { value: "admin", label: t("auth.roles.admin.label"), desc: t("auth.roles.admin.desc") },
];

export default function AuthPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>((searchParams.get("mode") as AuthMode) || "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setSelectedRole] = useState<Role>("student");
  const [grade, setGrade] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, role: userRole, loading } = useAuth();
  
  const roleOptions = getRoleOptions(t);

  // If already logged in, redirect
  if (!loading && user && userRole) {
    return <Navigate to={`/${userRole}`} replace />;
  }

  // Handle account setup state (Trigger delay or failure)
  if (!loading && user && !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
          <h2 className="text-xl font-heading font-bold">{t("auth.finalizing.title")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("auth.finalizing.desc")}
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            {t("auth.finalizing.refresh")}
          </Button>
          <div className="pt-4">
            <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
              Sign out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (mode === "signup" && password !== confirmPassword) {
      toast({
        title: t("auth.signup.error_passwords_match"),
        description: t("auth.signup.error_passwords_match_desc"),
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            // NOTE: role is intentionally omitted. Post-S1, self-signup always
            // provisions as 'student'; privileged roles come only from
            // admin-managed pre_boarding. The role picker below is informational.
            data: { full_name: fullName, grade: role === "student" ? grade : undefined },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({
          title: t("auth.signup.success_title"),
          description: t("auth.signup.success_desc"),
        });
        setMode("login");
      } else {
        localStorage.removeItem("pathfinder_role_override");
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });
        if (error) throw error;
        // Auth state change will handle redirect via useAuth
      }
    } catch (err: any) {
      toast({
        title: "Something went wrong",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 surface-sage items-center justify-center p-12">
        <div className="max-w-md space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Compass className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-heading font-bold text-foreground">{t("common.pathfinder")}</span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground leading-tight">
            {t("auth.branding.title_discover")}<br />
            {t("auth.branding.title_step")}
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {t("auth.branding.desc")}
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-6"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Compass className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-heading font-bold text-foreground">{t("common.pathfinder")}</span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-heading font-bold text-foreground">
              {mode === "login" ? t("auth.login.title") : t("auth.signup.title")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "login"
                ? t("auth.login.subtitle")
                : t("auth.signup.subtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t("auth.signup.full_name")}</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t("auth.signup.full_name_placeholder")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("auth.signup.i_am_a")}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {roleOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSelectedRole(opt.value)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          role === opt.value
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <div className="text-sm font-medium text-foreground">{opt.label}</div>
                        <div className="text-xs text-muted-foreground">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {role === "student" && (
                  <div className="space-y-2">
                    <Label htmlFor="grade">{t("auth.signup.grade_label")}</Label>
                    <select
                      id="grade"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="" disabled>{t("auth.signup.grade_placeholder")}</option>
                      {GRADE_OPTIONS.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.form.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.form.email_placeholder")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.form.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth.form.password_placeholder")}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("auth.signup.confirm_password")}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("auth.signup.confirm_password_placeholder")}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting
                  ? t("auth.form.submitting")
                  : mode === "login"
                  ? t("auth.login.submit")
                  : t("auth.signup.submit")}
              </Button>
              {mode === "login" && (
                <div className="text-center">
                  <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-primary hover:underline">
                    {t("auth.login.forgot")}
                  </Link>
                </div>
              )}
            </div>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                {t("auth.login.no_account")}{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-primary font-medium hover:underline"
                >
                  {t("auth.login.signup_link")}
                </button>
              </>
            ) : (
              <>
                {t("auth.signup.already_account")}{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-primary font-medium hover:underline"
                >
                  {t("auth.signup.signin_link")}
                </button>
              </>
            )}
          </p>

          <div className="pt-6 border-t border-border flex justify-center">
            <LanguageSwitcher />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
