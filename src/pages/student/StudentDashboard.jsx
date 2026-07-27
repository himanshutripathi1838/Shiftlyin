import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar.jsx";
import JobCardDeck from "../../components/JobCardDeck.jsx";
import NotificationsPanel from "../../components/NotificationsPanel.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import useCurrentTime from "../../hooks/useCurrentTime.js";
import { db } from "../../services/firebase.js";
import { isDateTimePast } from "../../utils/dateTime.js";
import { formatCurrency } from "../../utils/payments.js";
import LiveApplicantMap from "../../components/LiveApplicantMap.jsx";


export default function StudentDashboard() {
  const { currentUser, profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const now = useCurrentTime();
  const activeJobs = jobs.filter((job) => !isDateTimePast(job.shiftEndsAt, now));

  useEffect(() => {
    const jobsQuery = query(collection(db, "jobs"), where("status", "==", "active"));
    const unsubJobs = onSnapshot(
      jobsQuery,
      (snapshot) => setJobs(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
      (err) => setError(err.message)
    );
    const appsQuery = query(collection(db, "applications"), where("studentId", "==", currentUser.uid));
    const unsubApps = onSnapshot(
      appsQuery,
      (snapshot) => setApplications(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
      (err) => setError(err.message)
    );
    const paymentsQuery = query(collection(db, "payments"), where("studentId", "==", currentUser.uid));
    const unsubPayments = onSnapshot(
      paymentsQuery,
      (snapshot) => setPayments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
      (err) => setError(err.message)
    );
    return () => {
      unsubJobs();
      unsubApps();
      unsubPayments();
    };
  }, [currentUser.uid]);

  async function applyForJob(job) {
    if (isDateTimePast(job.shiftEndsAt)) {
      setNotice("This job session has expired and applications are closed.");
      return;
    }
    const existingApp = applications.find((application) => application.jobId === job.id);
    if (existingApp && (existingApp.status === "pending" || existingApp.status === "accepted")) {
      setNotice("You already applied for this job.");
      return;
    }

    try {
      setError("");
      if (existingApp && existingApp.status === "rejected") {
        await updateDoc(doc(db, "applications", existingApp.id), {
          status: "pending",
          createdAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, "applications"), {
          jobId: job.id,
          jobTitle: job.title,
          studentId: currentUser.uid,
          studentName: profile.name,
          businessId: job.createdBy,
          businessName: job.businessName || "",
          salary: job.salary || "",
          salaryType: job.salaryType || "fixed",
          salaryAmount: Number(job.salaryAmount || 0),
          jobLatitude: job.latitude,
          jobLongitude: job.longitude,
          shiftStartsAt: job.shiftStartsAt,
          shiftEndsAt: job.shiftEndsAt,
          status: "pending",
          createdAt: serverTimestamp()
        });
      }
      setNotice(`You have successfully applied for ${job.title}. Wait for the owner's confirmation.`);
      await Promise.all([
        addDoc(collection(db, "notifications"), {
          userId: job.createdBy,
          title: "New job application",
          message: `${profile.name} has applied for ${job.title}. Confirm or reject in the Applications tab.`,
          type: "job_application",
          relatedJobId: job.id,
          relatedStudentId: currentUser.uid,
          isRead: false,
          createdAt: serverTimestamp()
        }),
        addDoc(collection(db, "notifications"), {
          userId: currentUser.uid,
          title: "Application sent",
          message: `You have successfully applied for ${job.title}. Wait for the owner's confirmation.`,
          type: "application_submitted",
          relatedJobId: job.id,
          relatedBusinessId: job.createdBy,
          isRead: false,
          createdAt: serverTimestamp()
        })
      ]);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="dashboard-layout student-view">
      <Sidebar role="student" />
      <section className="dashboard-content" style={{ paddingBottom: "40px" }}>
        {notice && (
          <div className="floating-notice" role="status" aria-live="polite">
            <strong>Application Status</strong>
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice("")} aria-label="Close application message">Close</button>
          </div>
        )}

        {/* Premium Student Hero Banner */}
        <div 
          className="dashboard-header role-header student-header" 
          style={{ 
            background: "linear-gradient(135deg, #1e3a8a, #2563eb)", 
            borderRadius: "20px", 
            color: "#ffffff", 
            padding: "28px clamp(20px, 4vw, 36px)", 
            boxShadow: "0 20px 25px -5px rgba(37, 99, 235, 0.25)",
            marginBottom: "28px"
          }}
        >
          <div className="dashboard-identity" style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <div 
              className="profile-avatar student-avatar"
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "50%",
                border: "3px solid rgba(255,255,255,0.8)",
                overflow: "hidden",
                background: "rgba(255,255,255,0.15)",
                display: "grid",
                placeItems: "center",
                fontWeight: "900",
                fontSize: "24px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}
            >
              {profile?.profilePhotoUrl ? <img src={profile.profilePhotoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>{profile?.name?.charAt(0) || "S"}</span>}
            </div>
            <div>
              <span className="eyebrow" style={{ background: "rgba(255,255,255,0.18)", color: "#ffffff", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "800", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Student Workspace
              </span>
              <h1 style={{ fontSize: "26px", fontWeight: "900", margin: "6px 0 2px", color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
                Campus Shift Feed
                {profile?.verificationStatus === "verified" && (
                  <span className="verified-badge-checkmark" style={{ background: "#10b981", color: "white", borderRadius: "50%", width: "20px", height: "20px", display: "inline-grid", placeItems: "center", fontSize: "12px", fontWeight: "bold" }} title="Verified Profile">✓</span>
                )}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px", margin: 0 }}>
                Welcome back, <strong>{profile?.name}</strong>. Apply to nearby shifts and track earnings in real-time.
              </p>
            </div>
          </div>
          <div className="score-card" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "14px", padding: "12px 20px", textAlign: "center" }}>
            <strong style={{ fontSize: "24px", fontWeight: "900", color: "#ffffff", display: "block" }}>{applications.length}</strong>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", fontWeight: "700", textTransform: "uppercase" }}>Applications</span>
          </div>
        </div>

        {error && <p className="form-error" style={{ marginBottom: "20px" }}>{error}</p>}

        {/* Vibrant Stat Metric Cards */}
        <div className="metric-grid role-metrics" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "28px" }}>
          <div className="metric-card student-metric" style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "1px solid #bfdbfe", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)" }}>
            <span style={{ fontSize: "12px", color: "#1e40af", fontWeight: "800", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>My Applications</span>
            <strong style={{ fontSize: "28px", fontWeight: "900", color: "#1e3a8a" }}>{applications.length}</strong>
          </div>
          <div className="metric-card student-metric" style={{ background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", border: "1px solid #a7f3d0", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)" }}>
            <span style={{ fontSize: "12px", color: "#065f46", fontWeight: "800", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Accepted Shifts</span>
            <strong style={{ fontSize: "28px", fontWeight: "900", color: "#064e3b" }}>{applications.filter((app) => app.status === "accepted").length}</strong>
          </div>
          <div className="metric-card student-metric" style={{ background: "linear-gradient(135deg, #fffbeb, #fef3c7)", border: "1px solid #fde68a", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)" }}>
            <span style={{ fontSize: "12px", color: "#92400e", fontWeight: "800", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Pending Earnings</span>
            <strong style={{ fontSize: "24px", fontWeight: "900", color: "#78350f" }}>{formatCurrency(payments.filter((payment) => payment.status === "pending").reduce((sum, payment) => sum + Number(payment.amount || 0), 0))}</strong>
          </div>
          <div className="metric-card student-metric" style={{ background: "linear-gradient(135deg, #f0fdf4, #bbf7d0)", border: "1px solid #86efac", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)" }}>
            <span style={{ fontSize: "12px", color: "#166534", fontWeight: "800", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Paid Earnings</span>
            <strong style={{ fontSize: "24px", fontWeight: "900", color: "#14532d" }}>{formatCurrency(payments.filter((payment) => payment.status === "completed").reduce((sum, payment) => sum + Number(payment.amount || 0), 0))}</strong>
          </div>
          <div className="metric-card student-metric" style={{ background: "linear-gradient(135deg, #f5f3ff, #ede9fe)", border: "1px solid #ddd6fe", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)" }}>
            <span style={{ fontSize: "12px", color: "#5b21b6", fontWeight: "800", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Student Rating</span>
            <strong style={{ fontSize: "28px", fontWeight: "900", color: "#4c1d95" }}>{profile?.rating || 0}/5</strong>
          </div>
          <div className="metric-card student-metric" style={{ background: "linear-gradient(135deg, #fef2f2, #fecaca)", border: "1px solid #fca5a5", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)" }}>
            <span style={{ fontSize: "12px", color: "#991b1b", fontWeight: "800", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Urgent Openings</span>
            <strong style={{ fontSize: "28px", fontWeight: "900", color: "#7f1d1d" }}>{activeJobs.filter((job) => job.urgency === "urgent").length}</strong>
          </div>
        </div>

        <NotificationsPanel userId={currentUser.uid} />
        
        <div style={{ margin: "24px 0" }}>
          <LiveApplicantMap applications={applications} role="student" />
        </div>

        <div className="section-heading" style={{ margin: "32px 0 16px" }}>
          <span className="eyebrow" style={{ color: "var(--primary)" }}>Quick Apply</span>
          <h2 style={{ fontSize: "22px", fontWeight: "900" }}>Active Student Jobs</h2>
        </div>
        
        <JobCardDeck
          jobs={activeJobs}
          onApply={applyForJob}
          emptyMessage="No active jobs available right now."
          appliedJobIds={new Set(applications.filter((app) => app.status === "pending" || app.status === "accepted").map((app) => app.jobId))}
        />
      </section>
    </main>
  );
}
