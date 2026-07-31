import React, { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AdminRoute from "./components/AdminRoute.jsx";
import LiveLocationTracker from "./components/LiveLocationTracker.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import SessionAutoCloser from "./components/SessionAutoCloser.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import Home from "./pages/public/Home.jsx";
import Help from "./pages/public/Help.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/public/Register.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";
import { initAnalytics, trackPageView } from "./utils/analytics.js";

// Lazy Loaded Routes for Performance & Code Splitting
const ServicePage = lazy(() => import("./pages/public/ServicePage.jsx"));
const Privacy = lazy(() => import("./pages/public/Privacy.jsx"));
const Terms = lazy(() => import("./pages/public/Terms.jsx"));
const Contact = lazy(() => import("./pages/public/Contact.jsx"));
const JobDetails = lazy(() => import("./pages/public/JobDetails.jsx"));
const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard.jsx"));
const BusinessDashboard = lazy(() => import("./pages/business/BusinessDashboard.jsx"));
const BusinessWallet = lazy(() => import("./pages/business/BusinessWallet.jsx"));
const PostJob = lazy(() => import("./pages/business/PostJob.jsx"));
const Applications = lazy(() => import("./pages/shared/Applications.jsx"));
const Attendance = lazy(() => import("./pages/shared/Attendance.jsx"));
const Chat = lazy(() => import("./pages/shared/Chat.jsx"));
const Payments = lazy(() => import("./pages/shared/Payments.jsx"));
const Profile = lazy(() => import("./pages/shared/Profile.jsx"));

// Admin Routes Lazy Loading
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));
const AdminStudents = lazy(() => import("./pages/admin/AdminStudents.jsx"));
const AdminBusinesses = lazy(() => import("./pages/admin/AdminBusinesses.jsx"));
const AdminJobs = lazy(() => import("./pages/admin/AdminJobs.jsx"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports.jsx"));
const AdminSettlements = lazy(() => import("./pages/admin/AdminSettlements.jsx"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments.jsx"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings.jsx"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AdminAuditLogs.jsx"));

function LoadingFallback() {
  return (
    <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", padding: "40px" }}>
      <div style={{ color: "var(--primary)", fontWeight: "800", fontSize: "1.1rem" }}>
        Loading Shiftlyin...
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location.pathname]);

  return (
    <AuthProvider>
      <SessionAutoCloser />
      <LiveLocationTracker />
      {!isAdminRoute && <Navbar />}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Core Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/help" element={<Help />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services/:slug" element={<ServicePage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Student & Business Workspace Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/business"
            element={
              <ProtectedRoute allowedRoles={["business"]}>
                <BusinessDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/business/wallet"
            element={
              <ProtectedRoute allowedRoles={["business"]}>
                <BusinessWallet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute allowedRoles={["business"]}>
                <BusinessWallet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post-job"
            element={
              <ProtectedRoute allowedRoles={["business"]}>
                <PostJob />
              </ProtectedRoute>
            }
          />
          <Route path="/jobs/:jobId" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
          <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute allowedRoles={["student", "business"]}><Attendance /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute allowedRoles={["student", "business"]}><Payments /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/students" element={<AdminRoute><AdminStudents /></AdminRoute>} />
          <Route path="/admin/businesses" element={<AdminRoute><AdminBusinesses /></AdminRoute>} />
          <Route path="/admin/jobs" element={<AdminRoute><AdminJobs /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
          <Route path="/admin/settlements" element={<AdminRoute><AdminSettlements /></AdminRoute>} />
          <Route path="/admin/payments" element={<AdminRoute><AdminPayments /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
          <Route path="/admin/audit-logs" element={<AdminRoute><AdminAuditLogs /></AdminRoute>} />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
