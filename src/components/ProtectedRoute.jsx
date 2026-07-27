import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser, profile, loading } = useAuth();

  if (loading || (currentUser && profile === null)) {
    return (
      <main className="page-shell" style={{ display: "grid", placeItems: "center", minHeight: "80vh" }}>
        <div className="loading-card" style={{ padding: "40px", textAlign: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", boxShadow: "var(--shadow)" }}>
          <span style={{ fontSize: "24px", display: "block", marginBottom: "8px" }}>⏳</span>
          <strong style={{ fontSize: "16px", color: "var(--text)" }}>Loading Shiftlyin...</strong>
        </div>
      </main>
    );
  }

  if (!currentUser) return <Navigate to="/login" replace />;

  if (allowedRoles?.length && profile?.role && !allowedRoles.includes(profile.role)) {
    return <Navigate to={`/${profile.role}`} replace />;
  }

  return children;
}
