import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import ReflectionPrompt from "@/components/student/ReflectionPrompt";
import { useTranslation } from "react-i18next";
import ComprehensiveReportView from "@/components/assessment/ComprehensiveReportView";

const StudentReport = () => {
  const { user, profile } = useAuth();
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <Link to="/student" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              {t("report.back")}
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
              {t("report.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("report.subtitle")}
            </p>
          </div>

          <ComprehensiveReportView 
            studentId={user.id} 
            grade={profile?.grade || undefined} 
          />

          <div className="mt-12">
            <ReflectionPrompt 
              assessmentId="latest" 
              topInterest="Unknown" 
            />
          </div>

          <div className="mt-8 text-center p-4 rounded-xl bg-muted/50">
            <p className="text-xs text-muted-foreground leading-relaxed max-w-lg mx-auto">
              {t("report.disclaimer")}
            </p>
          </div>
        </motion.div>
    </div>
  );
};

export default StudentReport;
