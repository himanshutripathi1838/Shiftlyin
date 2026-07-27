import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import useCurrentTime from "../../hooks/useCurrentTime.js";
import { db } from "../../services/firebase.js";
import { formatDateTime, isDateTimePast } from "../../utils/dateTime.js";

export default function JobDetails() {
  const { jobId } = useParams();
  const { currentUser, profile } = useAuth();
  const [job, setJob] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [existingAppId, setExistingAppId] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const now = useCurrentTime();

  const [businessVerified, setBusinessVerified] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "jobs", jobId)).then(async (snapshot) => {
      if (snapshot.exists()) {
        const jobData = { id: snapshot.id, ...snapshot.data() };
        setJob(jobData);
        if (jobData.createdBy) {
          try {
            const bizSnapshot = await getDoc(doc(db, "businesses", jobData.createdBy));
            if (bizSnapshot.exists()) {
              setBusinessVerified(bizSnapshot.data().verificationStatus === "verified");
            }
          } catch (err) {
            console.error("Failed to fetch business verification:", err);
          }
        }
      }
    });

    if (currentUser?.uid && profile?.role === "student") {
      const q = query(
        collection(db, "applications"),
        where("jobId", "==", jobId),
        where("studentId", "==", currentUser.uid)
      );
      getDocs(q).then((snap) => {
        if (!snap.empty) {
          const appDoc = snap.docs[0];
          setApplicationStatus(appDoc.data().status);
          setExistingAppId(appDoc.id);
        } else {
          setApplicationStatus(null);
          setExistingAppId(null);
        }
      }).catch((err) => console.error("Failed to check application status:", err));
    }
  }, [jobId, currentUser, profile]);

  async function apply() {
    if (isDateTimePast(job.shiftEndsAt)) {
      setNotice("This job session has expired and applications are closed.");
      return;
    }
    if (profile?.role !== "student") {
      setNotice("Only students can apply.");
      return;
    }
    if (applicationStatus === "pending" || applicationStatus === "accepted") {
      setNotice("You have already applied for this job.");
      return;
    }
    setError("");
    try {
      if (applicationStatus === "rejected" && existingAppId) {
        await updateDoc(doc(db, "applications", existingAppId), {
          status: "pending",
          createdAt: serverTimestamp()
        });
        setApplicationStatus("pending");
      } else {
        const docRef = await addDoc(collection(db, "applications"), {
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
        setExistingAppId(docRef.id);
        setApplicationStatus("pending");
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

  if (!job) return <main className="page-shell"><div className="loading-card">Loading job...</div></main>;

  if (profile?.role === "business" && job.createdBy !== currentUser?.uid) {
    return <Navigate to="/unauthorized" replace />;
  }

  const isExpired = isDateTimePast(job.shiftEndsAt, now);

  return (
    <main className="page-shell">
      {notice && (
        <div className="floating-notice" role="status" aria-live="polite">
          <strong>Application sent</strong>
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} aria-label="Close application message">Close</button>
        </div>
      )}
      <section className="panel detail-panel">
        <span className={`status-pill ${isExpired ? "expired" : job.urgency === "urgent" ? "urgent" : ""}`}>
          {isExpired ? "Session expired" : job.urgency === "urgent" ? "Urgent" : job.status}
        </span>
        <h1>{job.title}</h1>
        <p>{job.description}</p>
        <div className="metric-grid">
          <div className="metric-card"><span>Salary</span><strong>{job.salary}</strong></div>
          <div className="metric-card">
            <span>Business</span>
            <strong>
              {job.businessName}
              {businessVerified && (
                <span className="verified-badge-checkmark inline" title="Verified Business">✓</span>
              )}
            </strong>
          </div>
          <div className="metric-card"><span>Location</span><strong>{job.location}</strong></div>
          <div className="metric-card"><span>Vacancies</span><strong>{job.vacancies}</strong></div>
          <div className="metric-card"><span>Starts</span><strong>{formatDateTime(job.shiftStartsAt) || "-"}</strong></div>
          <div className="metric-card"><span>Ends</span><strong>{formatDateTime(job.shiftEndsAt) || "-"}</strong></div>
        </div>
        {error && <p className="form-error">{error}</p>}
        {profile?.role === "student" && !isExpired && (
          <button className="primary-button" onClick={apply} disabled={applicationStatus === "pending" || applicationStatus === "accepted"}>
            {applicationStatus === "pending" || applicationStatus === "accepted" ? "Applied" : "Apply now"}
          </button>
        )}
      </section>
    </main>
  );
}
