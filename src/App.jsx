// TEST-EDIT-123
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AdminRoute from "./components/AdminRoute.jsx";
import LiveLocationTracker from "./components/LiveLocationTracker.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import SessionAutoCloser from "./components/SessionAutoCloser.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs.jsx";
import AdminBusinesses from "./pages/admin/AdminBusinesses.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminJobs from "./pages/admin/AdminJobs.jsx";
import AdminPayments from "./pages/admin/AdminPayments.jsx";
import AdminReports from "./pages/admin/AdminReports.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";
import AdminStudents from "./pages/admin/AdminStudents.jsx";
import AdminSettlements from "./pages/admin/AdminSettlements.jsx";
import BusinessDashboard from "./pages/business/BusinessDashboard.jsx";
import BusinessWallet from "./pages/business/BusinessWallet.jsx";
import PostJob from "./pages/business/PostJob.jsx";
import Home from "./pages/public/Home.jsx";
import Help from "./pages/public/Help.jsx";
import JobDetails from "./pages/public/JobDetails.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/public/Register.jsx";
import Applications from "./pages/shared/Applications.jsx";
import Attendance from "./pages/shared/Attendance.jsx";
import Chat from "./pages/shared/Chat.jsx";
import Payments from "./pages/shared/Payments.jsx";
import Profile from "./pages/shared/Profile.jsx";
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";


export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <AuthProvider>
      <SessionAutoCloser />
      <LiveLocationTracker />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/help" element={<Help />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
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
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="/admin/students" element={<AdminRoute><AdminStudents /></AdminRoute>} />
        <Route path="/admin/businesses" element={<AdminRoute><AdminBusinesses /></AdminRoute>} />
        <Route path="/admin/jobs" element={<AdminRoute><AdminJobs /></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
        <Route path="/admin/settlements" element={<AdminRoute><AdminSettlements /></AdminRoute>} />
        <Route path="/admin/payments" element={<AdminRoute><AdminPayments /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
        <Route path="/admin/audit-logs" element={<AdminRoute><AdminAuditLogs /></AdminRoute>} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

    </AuthProvider>
  );
}
