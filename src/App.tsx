import React, { useEffect } from "react";
import { ToastToaster as Toaster } from "@/components/ui";
import { SonnerToaster as Sonner } from "@/components/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

// Import i18n configuration
import "./i18n";

import { useAuth, AuthProvider } from "./hooks/useAuth";

// Pages
import Index from "./components/shared/Index";
import Assessment from "./teacher/pages/Assessment";
import { resourcesData, ResourceTopic } from './data/resourcesData';
import Resources from './student/pages/Resources';
import StressManagementApp from './student/pages/resources/StressManagementApp';
import SleepRelaxationExperience from './student/pages/resources/SleepRelaxationExperience';
import MindRefresh from './student/pages/resources/MindRefresh';
import StudyFocusSuperpower from './student/pages/resources/StudyFocusSuperpower';
import PeerSupportExperience from './student/pages/resources/peer-support-experience';
import DigitalWellness from './student/pages/resources/digitalwellness';
import GrowthMindset from './student/pages/resources/growth-mindset';
import CitizenshipEducationWellness from './student/pages/resources/citizenship-education-wellness-complete';
import WellnessBodyCareExperience from './student/pages/resources/wellness-body-care-experience';
import WhenToAskForHelp from './student/pages/resources/WhenToAskForHelp';
import WellnessLayout from "@/student/pages/wellness/WellnessLayout";
import DashboardPage from "@/student/pages/wellness/DashboardPage";
import MoodPage from "@/student/pages/wellness/MoodPage";
import JournalPage from "@/student/pages/wellness/JournalPage";
import GoalsPage from "@/student/pages/wellness/GoalsPage";
import BadgesPage from "@/student/pages/wellness/BadgesPage";
import StudentDashboard from "@/student/pages/StudentDashboard";
import AdminDashboard from "@/admin/pages/AdminDashboard";
import OrganizationsPage from "@/admin/pages/OrganizationsPage";
// import OrganizationPaymentsPage from "@/pages/organization/PaymentsPage"; // File not found
import OrganizationDetailPage from "@/admin/pages/OrganizationDetailPage";
import SchoolsPage from "@/admin/pages/SchoolsPage";
import SchoolDetailPage from "@/admin/pages/SchoolDetailPage";
import TeacherLayout from "@/components/teacher-dashboard/TeacherLayout";
import TeacherDashboardRouter from "@/components/teacher-dashboard/TeacherDashboardRouter";
// Import all teacher dashboards
import TeacherDashboard from "@/teacher/pages/TeacherDashboard";
import StudentListRouter from "@/teacher/pages/StudentListRouter";
import { AssessmentsPage } from "@/teacher/pages/AssessmentsPage";
import ResourcesPage from "@/teacher/pages/ResourcesPage.tsx";
import { SupportPage } from "@/teacher/pages/SupportPage";
import { ActivitiesPage } from "@/teacher/pages/ActivitiesPage";
import ReadingMaterialPage from "@/teacher/pages/ReadingMaterialPage";
import Hero from "@/components/Hero";

// Import resource pages
import AnxietyDepressionPage from "@/teacher/pages/resources/AnxietyDepressionPage";
import PBISPage from "@/teacher/pages/resources/PBISPage";
import ParentTeacherCommunicationPage from "@/teacher/pages/resources/ParentTeacherCommunicationPage";
import ProfessionalDevelopmentPage from "@/teacher/pages/resources/ProfessionalDevelopmentPage";
import SELStrategiesPage from "@/teacher/pages/resources/SELStrategiesPage";
import SuicidePreventionPage from "@/teacher/pages/resources/SuicidePreventionPage";
import TeacherFaqPage from "@/teacher/pages/TeacherFaqPage";
import AssessmentManagementPage from "@/school/pages/AssessmentManagementPage";
import UnifiedManagementPage from "@/school/pages/UnifiedManagementPage";
import Auth from "@/components/shared/Auth";
import NotFound from "@/components/shared/NotFound";
import ProgressTracking from "@/student/pages/ProgressTracking";
import MyAssessments from "@/student/pages/MyAssessments";
import ProfileSettings from "@/student/pages/ProfileSettings";
import CareerQuiz from "@/student/pages/career-quiz/CareerQuiz";
// import MasoomPageHI from "@/components/hindi/MasoomPage"; // File not found
import BuddySafe from "@/components/shared/BuddySafe";
import { AcademicPressureSafety, CyberbullyingSafety, SubstanceAbuseViolenceAwareness, SexualHarassmentAwareness } from "@/student/pages/safety";
import CognitiveTasks from "@/student/pages/cognitive-games/CognitiveTasks";
import AlertsPage from "@/alerts";
import ReportsPage from "@/school/pages/ReportsPage";
import ChatPage from "@/student/pages/ChatPage";

import OrganizationLayout from "@/components/organization-dashboard/organization/OrganizationLayout";
import OrganizationDashboard from "@/organization/pages/OrganizationDashboard";
import OrganizationSchoolsPage from "@/organization/pages/SchoolsPage";
import OrganizationSchoolDetailPage from "@/organization/pages/SchoolDetailPage";


// Components
import { ProfanityFilterProvider } from "./providers/profanity-filter-provider";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AppLayout } from "./components/AppLayout";
import ScrollToTop from "./components/ScrollToTop";
import usePageTitle from "./hooks/usePageTitle";
import { SessionTracker } from "./tracking/SessionTracker";
import { initializeClarity, trackPageView } from "./utils/analytics";
import { DashboardErrorBoundary } from "./components/admin-dashboard/DashboardErrorBoundary";

// Component to handle page title updates
const PageTitleHandler = () => {
  usePageTitle(); // This will use the current route to set the title
  return null;
};

const queryClient = new QueryClient();

// Create the router configuration
// Configure router with future flags
// ...

// Update the router configuration
const router = createBrowserRouter([{
  path: "/",
  element: (
    <ProfanityFilterProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PageTitleHandler />
          <ScrollToTop />
          <AppLayout />
          <Toaster />
          <Sonner />
        </AuthProvider>
      </QueryClientProvider>
    </ProfanityFilterProvider>
  ),
  children: [
    // Public routes
    { index: true, element: <Index /> },
    { path: "/resources", element: <Resources /> },
    { path: "/resources/:topicId", element: <Resources /> },
    // Resource pages
    { path: "/resources/stress-management", element: <StressManagementApp /> },
    { path: "/resources/sleep-relaxation-experience", element: <SleepRelaxationExperience /> },
    { path: "/resources/mind-refresh", element: <MindRefresh /> },
    { path: "/resources/study-focus-superpower", element: <StudyFocusSuperpower /> },
    { path: "/resources/peer-support-experience", element: <PeerSupportExperience /> },
    { path: "/resources/digital-wellness", element: <DigitalWellness /> },
    { path: "/resources/growth-mindset", element: <GrowthMindset /> },
    { path: "/resources/citizenship-education-wellness", element: <CitizenshipEducationWellness /> },
    { path: "/resources/wellness-body-care", element: <WellnessBodyCareExperience /> },
    { path: "/resources/when-to-ask-for-help", element: <WhenToAskForHelp /> },

    // Redirect legacy routes
    {
      path: "/wellness-dashboard",
      element: <Navigate to="/wellness/dashboard" replace />
    },

    // Safety pages
    { path: "/safety/cyberbullying", element: <CyberbullyingSafety /> },
    { path: "/safety/substance-abuse-violence", element: <SubstanceAbuseViolenceAwareness /> },
    { path: "/safety/academic-pressure", element: <AcademicPressureSafety /> },
    { path: "/safety/sexual-harassment", element: <SexualHarassmentAwareness /> },

    // Auth route - no layout
    { path: "/auth", element: <Auth /> },

    // Protected student routes
    {
      element: <ProtectedRoute allowedRoles={['student']} />,
      children: [
        { path: "/assessment", element: <Assessment /> },
        {
          path: "/wellness",
          element: <WellnessLayout />,
          children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: "dashboard", element: <DashboardPage /> },
            { path: "mood", element: <MoodPage /> },
            { path: "journal", element: <JournalPage /> },
            { path: "goals", element: <GoalsPage /> },
            { path: "badges", element: <BadgesPage /> },

            { path: "*", element: <Navigate to="/404" replace /> }
          ]
        },
        { path: "/student-dashboard", element: <DashboardErrorBoundary dashboardName="Student Dashboard"><StudentDashboard /></DashboardErrorBoundary> },
        { path: "/progress-tracking", element: <ProgressTracking /> },
        { path: "/career-counseling", element: <CareerQuiz /> },
        { path: "/my-assessments", element: <MyAssessments /> },
        { path: "/profile-settings", element: <ProfileSettings /> },
        {
          path: "/cognitive-tasks",
          children: [
            { index: true, element: <CognitiveTasks /> },
            { path: ":taskId", element: <CognitiveTasks /> }
          ]
        },
        { path: "/chat", element: <ChatPage /> },
      ]
    },

    // Shared routes for student, teacher and management
    {
      element: <ProtectedRoute allowedRoles={['student', 'teacher', 'management']} />,
      children: [
        { path: "/buddysafe", element: <BuddySafe /> },
        { path: "/masoom", element: <div>Page not found</div> }, // MasoomPage not found
        { path: "/masoom-hi", element: <div>Page not found</div> } // MasoomPageHI not found
      ]
    },

    // Protected teacher routes
    {
      element: <ProtectedRoute allowedRoles={['teacher']} />,
      children: [
        {
          path: "/teacher",
          element: <TeacherLayout />,
          children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: "dashboard", element: <DashboardErrorBoundary dashboardName="Teacher Dashboard"><TeacherDashboardRouter /></DashboardErrorBoundary> },
            { path: "students", element: <StudentListRouter /> },
            { path: "assessments", element: <AssessmentsPage /> },
            {
              path: "resources",
              children: [
                { index: true, element: <ResourcesPage /> },
                { path: "professional-development", element: <ProfessionalDevelopmentPage /> },
                { path: "parent-teacher-communication", element: <ParentTeacherCommunicationPage /> },
                { path: "suicide-prevention", element: <SuicidePreventionPage /> },
                { path: "sel-strategies", element: <SELStrategiesPage /> },
                { path: "pbis", element: <PBISPage /> },
                { path: "anxiety-depression", element: <AnxietyDepressionPage /> }
              ]
            },
            { path: "support", element: <SupportPage /> },
        
            { path: "activities", element: <ActivitiesPage /> },
            { path: "sessions", element: <SupportPage /> },
            { path: "reading-material", element: <ReadingMaterialPage /> },
            { path: "faq", element: <TeacherFaqPage /> },
          ]
        }
      ]
    },

    // Protected management routes
    {
      element: <ProtectedRoute allowedRoles={['management']} />,
      children: [
        { path: "/management", element: <DashboardErrorBoundary dashboardName="School Dashboard"><UnifiedManagementPage /></DashboardErrorBoundary> },
        { path: "/management/assessments", element: <DashboardErrorBoundary dashboardName="Assessments"><AssessmentManagementPage /></DashboardErrorBoundary> },

        { path: "/school-dashboard", element: <Navigate to="/management" replace /> },
        { path: "/alerts", element: <AlertsPage /> },
        { path: "/alerts/:category", element: <AlertsPage /> },
        { path: "/management/students", element: <Navigate to="/management?tab=students" replace /> },
        { path: "/management/students/add", element: <Navigate to="/management?tab=students" replace /> },
        { path: "/management/teachers", element: <Navigate to="/management?tab=teachers" replace /> },
        { path: "/management/teachers/add", element: <Navigate to="/management?tab=teachers" replace /> },
        { path: "/management/reports", element: <Navigate to="/" replace /> },
        { path: "/reports", element: <Navigate to="/" replace /> },
        { path: "/management/analytics", element: <Navigate to="/" replace /> },
        { path: "/analytics", element: <Navigate to="/" replace /> },
        { path: "/management/settings", element: <Navigate to="/management?tab=academic" replace /> },
        { path: "/management/wellness", element: <Navigate to="/" replace /> },
      ]
    },

    // Protected organization routes
    {
      element: <ProtectedRoute allowedRoles={['organization']} />,
      children: [
        {
          path: "/organization-dashboard",
          element: <OrganizationLayout />,
          children: [
            { index: true, element: <DashboardErrorBoundary dashboardName="Organization Dashboard"><OrganizationDashboard /></DashboardErrorBoundary> }
          ]
        },
        {
          path: "/organization",
          element: <OrganizationLayout />,
          children: [
            { path: "schools", element: <OrganizationSchoolsPage /> },
            { path: "schools/:id", element: <OrganizationSchoolDetailPage /> },
            // { path: "payments", element: <OrganizationPaymentsPage /> } // File not found
          ]
        }
      ]
    },

    // Protected admin routes
    {
      element: <ProtectedRoute allowedRoles={['admin']} />,
      children: [
        {
          path: "/admin",
          children: [
            { index: true, element: <DashboardErrorBoundary dashboardName="Admin Dashboard"><AdminDashboard /></DashboardErrorBoundary> },
            { path: "organizations", element: <OrganizationsPage /> },
            { path: "organizations/:id", element: <OrganizationDetailPage /> },
            { path: "schools", element: <SchoolsPage /> },
            { path: "schools/:id", element: <SchoolDetailPage /> },
            // { path: "payments", element: <PaymentsPage /> } // File not found
          ]
        }
      ]
    },

    // Fallback route - handle 404s
    {
      path: "*",
      element: <NotFound />,
      // Prevent infinite redirects by not replacing the URL
      handle: { preventNavigation: true }
    }
  ]
}], {
  future: {
    // Use only supported future flags
    v7_relativeSplatPath: true
  }
});

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;