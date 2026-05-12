import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, Outlet } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PostHogProvider } from "@/providers/PostHogProvider";
import StudentLayout from "@/components/layout/StudentLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import StudentDashboard from "./pages/StudentDashboard";
import CounselorDashboard from "./pages/CounselorDashboard";
import CounselorInsights from "./pages/CounselorInsights";
import CounselorNotes from "./pages/CounselorNotes";
import ParentDashboard from "./pages/ParentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminInsights from "./pages/AdminInsights";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AssessmentSelection from "./pages/AssessmentSelection";
import AssessmentPage from "./pages/AssessmentPage";
import StudentReport from "./pages/StudentReport";
import StudentCoach from "./pages/StudentCoach";
import ParentCoach from "./pages/ParentCoach";
import CounselorCoach from "./pages/CounselorCoach";
import CareerExplorer from "./pages/CareerExplorer";
import SubjectChoices from "./pages/SubjectChoices";
import PathwayPlanner from "./pages/PathwayPlanner";
import PathwayExplorer from "./pages/PathwayExplorer";
import StudentPortfolio from "./pages/StudentPortfolio";
import CounselorFollowUps from "./pages/CounselorFollowUps";
import ParentResources from "./pages/ParentResources";
import Opportunities from "./pages/Opportunities";
import KnowledgeHub from "./pages/KnowledgeHub";
import AssessmentHistory from "./pages/AssessmentHistory";
import CounselorStudentDetail from "./pages/CounselorStudentDetail";
import StudentSkills from "./pages/StudentSkills";
import Profile from "./pages/Profile";
import BigFiveAssessment from "./pages/BigFiveAssessment";
import CaasAssessment from "./pages/CaasAssessment";
import GatsbyDashboard from "./pages/GatsbyDashboard";
import OnetAssessment from "./pages/OnetAssessment";
import WorkValuesAssessment from "./pages/WorkValuesAssessment";
import EqAssessment from "./pages/EqAssessment";


function AuthRedirect() {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (user && role) return <Navigate to={`/${role}`} replace />;
  return <Index />;
}

function RoleLayout() {
  const { role, loading } = useAuth();
  if (loading) return null;
  if (!role) return <Outlet />;
  return (
    <DashboardLayout role={role as any}>
      <Outlet />
    </DashboardLayout>
  );
}

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
  <QueryClientProvider client={queryClient}>
    <PostHogProvider>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<AuthRedirect />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<ProtectedRoute allowedRoles={["student", "parent", "counselor", "admin", "superadmin"]}><RoleLayout /></ProtectedRoute>}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/explore" element={<CareerExplorer />} />
              <Route path="/explore/resources" element={<KnowledgeHub />} />
            </Route>

            {/* Student routes */}
            <Route element={<ProtectedRoute allowedRoles={["student"]}><StudentLayout /></ProtectedRoute>}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/assessment" element={<AssessmentSelection />} />
              <Route path="/student/assessment/:type" element={<AssessmentPage />} />
              <Route path="/student/report" element={<StudentReport />} />
              <Route path="/student/assessment/history" element={<AssessmentHistory />} />
              <Route path="/student/explore" element={<CareerExplorer />} />
              <Route path="/student/subjects" element={<SubjectChoices />} />
              <Route path="/student/plan" element={<PathwayPlanner />} />
              <Route path="/student/explore/pathways" element={<PathwayExplorer />} />
              <Route path="/student/opportunities" element={<Opportunities />} />
              <Route path="/student/portfolio" element={<StudentPortfolio />} />
              <Route path="/student/skills" element={<StudentSkills />} />
              <Route path="/student/coach" element={<StudentCoach />} />
              <Route path="/student/assessment/bigfive" element={<BigFiveAssessment />} />
              <Route path="/student/assessment/caas" element={<CaasAssessment />} />
              <Route path="/student/assessment/onet" element={<OnetAssessment />} />
              <Route path="/student/assessment/workvalues" element={<WorkValuesAssessment />} />
              <Route path="/student/assessment/eq" element={<EqAssessment />} />
            </Route>

            {/* Counselor routes */}
            <Route element={<ProtectedRoute allowedRoles={["counselor"]}><DashboardLayout role="counselor"><Outlet /></DashboardLayout></ProtectedRoute>}>
              <Route path="/counselor" element={<CounselorDashboard />} />
              <Route path="/counselor/followups" element={<CounselorFollowUps />} />
              <Route path="/counselor/insights" element={<CounselorInsights />} />
              <Route path="/counselor/notes" element={<CounselorNotes />} />
              <Route path="/counselor/student/:studentId" element={<CounselorStudentDetail />} />
              <Route path="/counselor/coach" element={<CounselorCoach />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={["counselor", "admin"]}><RoleLayout /></ProtectedRoute>}>
              <Route path="/counselor/gatsby" element={<GatsbyDashboard />} />
            </Route>

            {/* Parent routes */}
            <Route element={<ProtectedRoute allowedRoles={["parent"]}><DashboardLayout role="parent"><Outlet /></DashboardLayout></ProtectedRoute>}>
              <Route path="/parent" element={<ParentDashboard />} />
              <Route path="/parent/support" element={<ParentDashboard />} />
              <Route path="/parent/resources" element={<ParentResources />} />
              <Route path="/parent/coach" element={<ParentCoach />} />
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]}><DashboardLayout role="admin"><Outlet /></DashboardLayout></ProtectedRoute>}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/insights" element={<AdminInsights />} />
              <Route path="/admin/participation" element={<AdminDashboard />} />
              <Route path="/admin/setup" element={<AdminDashboard />} />
              <Route path="/admin/content" element={<AdminDashboard />} />
              <Route path="/admin/bulk" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminDashboard />} />
              <Route path="/admin/settings" element={<AdminDashboard />} />
            </Route>

            {/* SuperAdmin routes */}
            <Route element={<ProtectedRoute allowedRoles={["superadmin"]}><DashboardLayout role="superadmin"><Outlet /></DashboardLayout></ProtectedRoute>}>
              <Route path="/superadmin" element={<SuperAdminDashboard />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </PostHogProvider>
  </QueryClientProvider>
  );
};

export default App;
