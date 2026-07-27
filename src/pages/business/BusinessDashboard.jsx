import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar.jsx";
import JobCardDeck from "../../components/JobCardDeck.jsx";
import LiveApplicantMap from "../../components/LiveApplicantMap.jsx";
import NotificationsPanel from "../../components/NotificationsPanel.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import useCurrentTime from "../../hooks/useCurrentTime.js";
import { db } from "../../services/firebase.js";
import { getJobDisplayStatus } from "../../utils/dateTime.js";
import { formatCurrency } from "../../utils/payments.js";

export default function BusinessDashboard() {
  const { currentUser, profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const seenPendingAppsRef = useRef(new Set());
  const hasLoadedAppsRef = useRef(false);
  const now = useCurrentTime();
  const displayJobs = jobs.map((job) => ({ ...job, displayStatus: getJobDisplayStatus(job, now) }));
  const activeJobs = displayJobs.filter((job) => job.displayStatus === "active");
  const expiredJobs = displayJobs.filter((job) => job.displayStatus === "expired");
  const closedJobs = displayJobs.filter((job) => ["filled", "removed"].includes(job.displayStatus));
  const totalVacancies = activeJobs.reduce((sum, job) => sum + Number(job.vacancies || 0), 0);

  useEffect(() => {
    const unsubJobs = onSnapshot(
      query(collection(db, "jobs"), where("createdBy", "==", currentUser.uid)),
      (snapshot) => setJobs(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
      (err) => setError(err.message)
    );
    const unsubApps = onSnapshot(query(collection(db, "applications"), where("businessId", "==", currentUser.uid)), (snapshot) => {
      const nextApplications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const pendingApplications = nextApplications.filter((application) => application.status === "pending");

      if (hasLoadedAppsRef.current) {
        const newApplication = pendingApplications.find((application) => !seenPendingAppsRef.current.has(application.id));
        if (newApplication) {
          setNotice(`${newApplication.studentName || "Student"} applied for ${newApplication.jobTitle}. Confirm or reject in the Applications tab.`);
        }
      }

      seenPendingAppsRef.current = new Set(pendingApplications.map((application) => application.id));
      hasLoadedAppsRef.current = true;
      setApplications(nextApplications);
    }, (err) => setError(err.message));
    const unsubPayments = onSnapshot(query(collection(db, "payments"), where("businessId", "==", currentUser.uid)), (snapshot) => {
      setPayments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }, (err) => setError(err.message));
    return () => {
      unsubJobs();
      unsubApps();
      unsubPayments();
    };
  }, [currentUser.uid]);

  return (
    <main className="dashboard-layout owner-view">
      <Sidebar role="business" />
      <section className="dashboard-content" style={{ paddingBottom: "40px" }}>
        {notice && (
          <div className="floating-notice owner-floating-notice" role="status" aria-live="polite">
            <strong>New Application</strong>
            <span>{notice}</span>
            <Link className="ghost-button" to="/applications">Review</Link>
            <button type="button" onClick={() => setNotice("")} aria-label="Close owner message">Close</button>
          </div>
        )}

        {/* Premium Business Banner Header */}
        <div 
          className="dashboard-header role-header owner-header"
          style={{
            background: "linear-gradient(135deg, #0f172a, #1e293b)",
            borderRadius: "20px",
            color: "#ffffff",
            padding: "28px clamp(20px, 4vw, 36px)",
            boxShadow: "0 20px 25px -5px rgba(15, 23, 42, 0.3)",
            marginBottom: "28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px"
          }}
        >
          <div className="dashboard-identity" style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <div 
              className="profile-avatar owner-avatar"
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "16px",
                border: "2px solid rgba(255,255,255,0.2)",
                overflow: "hidden",
                background: "rgba(255,255,255,0.1)",
                display: "grid",
                placeItems: "center",
                fontWeight: "900",
                fontSize: "24px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
              }}
            >
              {profile?.shopPhotoUrl ? <img src={profile.shopPhotoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>{profile?.name?.charAt(0) || "B"}</span>}
            </div>
            <div>
              <span className="eyebrow" style={{ background: "rgba(255,255,255,0.15)", color: "#10b981", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "800", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Restaurant Owner Desk
              </span>
              <h1 style={{ fontSize: "26px", fontWeight: "900", margin: "6px 0 2px", color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
                {profile?.name || "Hiring Counter"}
                {profile?.verificationStatus === "verified" && (
                  <span className="verified-badge-checkmark" style={{ background: "#10b981", color: "white", borderRadius: "50%", width: "20px", height: "20px", display: "inline-grid", placeItems: "center", fontSize: "12px", fontWeight: "bold" }} title="Verified Profile">✓</span>
                )}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", margin: 0 }}>
                Post shifts, review student applicants, and manage cash wallet settlements.
              </p>
            </div>
          </div>
          <Link className="primary-button" to="/post-job" style={{ background: "var(--accent)", borderColor: "var(--accent)", color: "white", padding: "12px 24px", borderRadius: "12px", fontWeight: "800", fontSize: "14px", boxShadow: "0 4px 14px rgba(16,185,129,0.3)" }}>
            + Post New Shift
          </Link>
        </div>

        {error && <p className="form-error" style={{ marginBottom: "20px" }}>{error}</p>}

        {/* Vibrant Owner Stat Metric Cards */}
        <div className="metric-grid role-metrics" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "16px", marginBottom: "28px" }}>
          <div className="metric-card owner-metric" style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "1px solid #bfdbfe", borderRadius: "16px", padding: "18px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)" }}>
            <span style={{ fontSize: "12px", color: "#1e40af", fontWeight: "800", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Total Jobs Posted</span>
            <strong style={{ fontSize: "26px", fontWeight: "900", color: "#1e3a8a" }}>{displayJobs.length}</strong>
          </div>
          <div className="metric-card owner-metric" style={{ background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", border: "1px solid #a7f3d0", borderRadius: "16px", padding: "18px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)" }}>
            <span style={{ fontSize: "12px", color: "#065f46", fontWeight: "800", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Active Jobs</span>
            <strong style={{ fontSize: "26px", fontWeight: "900", color: "#064e3b" }}>{activeJobs.length}</strong>
          </div>
          <div className="metric-card owner-metric" style={{ background: "linear-gradient(135deg, #fffbeb, #fef3c7)", border: "1px solid #fde68a", borderRadius: "16px", padding: "18px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)" }}>
            <span style={{ fontSize: "12px", color: "#92400e", fontWeight: "800", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Expired Jobs</span>
            <strong style={{ fontSize: "26px", fontWeight: "900", color: "#78350f" }}>{expiredJobs.length}</strong>
          </div>
          <div className="metric-card owner-metric" style={{ background: "linear-gradient(135deg, #f8fafc, #e2e8f0)", border: "1px solid #cbd5e1", borderRadius: "16px", padding: "18px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)" }}>
            <span style={{ fontSize: "12px", color: "#334155", fontWeight: "800", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Closed Jobs</span>
            <strong style={{ fontSize: "26px", fontWeight: "900", color: "#0f172a" }}>{closedJobs.length}</strong>
          </div>
          <div className="metric-card owner-metric" style={{ background: "linear-gradient(135deg, #fef2f2, #fecaca)", border: "1px solid #fca5a5", borderRadius: "16px", padding: "18px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)" }}>
            <span style={{ fontSize: "12px", color: "#991b1b", fontWeight: "800", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Pending Applicants</span>
            <strong style={{ fontSize: "26px", fontWeight: "900", color: "#7f1d1d" }}>{applications.filter((app) => app.status === "pending").length}</strong>
          </div>
          <div className="metric-card owner-metric" style={{ background: "linear-gradient(135deg, #f0fdf4, #bbf7d0)", border: "1px solid #86efac", borderRadius: "16px", padding: "18px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)" }}>
            <span style={{ fontSize: "12px", color: "#166534", fontWeight: "800", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Pending Payments</span>
            <strong style={{ fontSize: "22px", fontWeight: "900", color: "#14532d" }}>{formatCurrency(payments.filter((payment) => payment.status === "pending").reduce((sum, payment) => sum + Number(payment.amount || 0), 0))}</strong>
          </div>
          <div className="metric-card owner-metric" style={{ background: "linear-gradient(135deg, #f5f3ff, #ede9fe)", border: "1px solid #ddd6fe", borderRadius: "16px", padding: "18px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)" }}>
            <span style={{ fontSize: "12px", color: "#5b21b6", fontWeight: "800", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Open Vacancies</span>
            <strong style={{ fontSize: "26px", fontWeight: "900", color: "#4c1d95" }}>{totalVacancies}</strong>
          </div>
          <div className="metric-card owner-metric" style={{ background: "linear-gradient(135deg, #ecfeff, #cffafe)", border: "1px solid #a5f3fc", borderRadius: "16px", padding: "18px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)" }}>
            <span style={{ fontSize: "12px", color: "#155e75", fontWeight: "800", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Owner Rating</span>
            <strong style={{ fontSize: "26px", fontWeight: "900", color: "#164e63" }}>{profile?.rating || 0}/5</strong>
          </div>
        </div>

        <NotificationsPanel userId={currentUser.uid} />

        <div style={{ margin: "24px 0" }}>
          <LiveApplicantMap applications={applications} role="business" />
        </div>

        <div className="section-heading" style={{ margin: "32px 0 16px" }}>
          <span className="eyebrow" style={{ color: "var(--accent)" }}>Management Desk</span>
          <h2 style={{ fontSize: "22px", fontWeight: "900" }}>Your Active Shifts & Vacancies</h2>
        </div>
        <JobCardDeck jobs={activeJobs} emptyMessage="No active shift posts right now." isOwnerView />

        <div className="section-heading" style={{ margin: "32px 0 16px" }}>
          <span className="eyebrow">Expired Board</span>
          <h2 style={{ fontSize: "22px", fontWeight: "900" }}>Expired Shift Posts</h2>
        </div>
        <JobCardDeck jobs={expiredJobs} emptyMessage="No expired shifts yet." isOwnerView />
      </section>
    </main>
  );
}
