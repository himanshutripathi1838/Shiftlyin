import { addDoc, collection, doc, getDocs, onSnapshot, query, runTransaction, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import ApplicationCard from "../../components/ApplicationCard.jsx";
import Sidebar from "../../components/Sidebar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { db } from "../../services/firebase.js";
import { isDateTimePast } from "../../utils/dateTime.js";

export default function Applications() {
  const { currentUser, profile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const field = profile.role === "business" ? "businessId" : "studentId";
    return onSnapshot(
      query(collection(db, "applications"), where(field, "==", currentUser.uid)),
      (snapshot) => setApplications(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
      (err) => setError(err.message)
    );
  }, [currentUser.uid, profile.role]);

  async function accept(application) {
    setError("");
    try {
      await runTransaction(db, async (transaction) => {
        const appRef = doc(db, "applications", application.id);
        const jobRef = doc(db, "jobs", application.jobId);
        const chatRef = doc(collection(db, "chats"));
        const studentNotificationRef = doc(collection(db, "notifications"));
        const businessNotificationRef = doc(collection(db, "notifications"));
        const appSnapshot = await transaction.get(appRef);
        const jobSnapshot = await transaction.get(jobRef);

        if (!appSnapshot.exists()) {
          throw new Error("This application no longer exists.");
        }
        const appData = appSnapshot.data();
        if (appData.status !== "pending") {
          throw new Error(`This application has already been ${appData.status}.`);
        }

        const job = jobSnapshot.data();
        const currentVacancies = Number(job?.vacancies || 0);

        if (
          !jobSnapshot.exists() ||
          job?.status !== "active" ||
          currentVacancies <= 0 ||
          isDateTimePast(job?.shiftEndsAt)
        ) {
          throw new Error("This job is already full or closed.");
        }

        const nextVacancies = currentVacancies - 1;

        transaction.update(appRef, {
          status: "accepted",
          shiftStartsAt: job.shiftStartsAt || application.shiftStartsAt || null,
          shiftEndsAt: job.shiftEndsAt || application.shiftEndsAt || null,
          updatedAt: serverTimestamp()
        });
        transaction.update(jobRef, {
          vacancies: nextVacancies,
          filledWorkers: Number(job?.filledWorkers || 0) + 1,
          status: nextVacancies === 0 ? "filled" : "active",
          updatedAt: serverTimestamp()
        });
        transaction.set(chatRef, {
          jobId: application.jobId,
          studentId: application.studentId,
          businessId: application.businessId,
          createdAt: serverTimestamp()
        });
        transaction.set(studentNotificationRef, {
          userId: application.studentId,
          title: "Application accepted",
          message: `${application.businessName} accepted you for ${application.jobTitle}.`,
          isRead: false,
          createdAt: serverTimestamp()
        });
        transaction.set(businessNotificationRef, {
          userId: application.businessId,
          title: "Vacancy updated",
          message: `${application.jobTitle} now has ${nextVacancies} vacancies left.`,
          isRead: false,
          createdAt: serverTimestamp()
        });
      });
      setNotice(`${application.studentName || "Student"} has been accepted for ${application.jobTitle}. A notification has been sent.`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function reject(application) {
    setError("");
    await updateDoc(doc(db, "applications", application.id), { status: "rejected" });
    await addDoc(collection(db, "notifications"), {
      userId: application.studentId,
      title: "Application update",
      message: `Your application for ${application.jobTitle} was not selected.`,
      isRead: false,
      createdAt: serverTimestamp()
    });
    setNotice(`${application.studentName || "Student"}'s application was rejected. The student has been updated.`);
  }

  async function cancelAcceptance(application) {
    if (!window.confirm(`Are you sure you want to cancel acceptance for ${application.studentName || "Student"}?`)) {
      return;
    }
    setError("");
    try {
      const chatQuery = query(
        collection(db, "chats"),
        where("jobId", "==", application.jobId),
        where("studentId", "==", application.studentId)
      );
      const chatSnapshot = await getDocs(chatQuery);

      await runTransaction(db, async (transaction) => {
        const appRef = doc(db, "applications", application.id);
        const jobRef = doc(db, "jobs", application.jobId);
        const studentNotificationRef = doc(collection(db, "notifications"));

        const appSnapshot = await transaction.get(appRef);
        if (!appSnapshot.exists()) {
          throw new Error("This application no longer exists.");
        }
        const appData = appSnapshot.data();
        if (appData.status !== "accepted") {
          throw new Error("This application is not currently accepted.");
        }

        const jobSnapshot = await transaction.get(jobRef);
        if (!jobSnapshot.exists()) {
          throw new Error("This job no longer exists.");
        }
        const job = jobSnapshot.data();

        const currentVacancies = Number(job?.vacancies || 0);
        const currentFilled = Number(job?.filledWorkers || 0);
        const nextVacancies = currentVacancies + 1;
        const nextFilled = Math.max(0, currentFilled - 1);

        transaction.update(appRef, {
          status: "rejected",
          updatedAt: serverTimestamp()
        });

        transaction.update(jobRef, {
          vacancies: nextVacancies,
          filledWorkers: nextFilled,
          status: "active",
          updatedAt: serverTimestamp()
        });

        chatSnapshot.forEach((chatDoc) => {
          transaction.delete(chatDoc.ref);
        });

        transaction.set(studentNotificationRef, {
          userId: application.studentId,
          title: "Application status changed",
          message: `${application.businessName || "Restaurant"} has cancelled your selection for ${application.jobTitle}.`,
          isRead: false,
          createdAt: serverTimestamp()
        });
      });
      setNotice(`${application.studentName || "Student"}'s selection has been cancelled and vacancies have been updated.`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="dashboard-layout">
      <Sidebar role={profile.role} />
      <section className="dashboard-content" style={{ paddingBottom: "40px" }}>
        {notice && (
          <div className="floating-notice owner-floating-notice" role="status" aria-live="polite">
            <strong>Application Updated</strong>
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice("")} aria-label="Close application update">Close</button>
          </div>
        )}
        
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <div 
            className="dashboard-header"
            style={{
              background: "linear-gradient(135deg, #0f172a, #1e293b)",
              borderRadius: "20px",
              color: "#ffffff",
              padding: "24px clamp(20px, 4vw, 36px)",
              boxShadow: "0 10px 20px -5px rgba(15, 23, 42, 0.2)",
              marginBottom: "28px"
            }}
          >
            <div>
              <span className="eyebrow" style={{ background: "rgba(255,255,255,0.15)", color: "#10b981", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "800", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Shift Applications Desk
              </span>
              <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#ffffff", margin: "6px 0 2px" }}>
                {profile.role === "business" ? "Review Student Candidates" : "Track Shift Applications"}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", margin: 0 }}>
                {profile.role === "business" ? "Review, accept, or reject candidate applications for your posted shifts." : "View application status, accepted shifts, and real-time updates."}
              </p>
            </div>
          </div>

          {error && <div className="form-error" style={{ marginBottom: "20px", padding: "12px 16px", borderRadius: "10px", fontSize: "13px" }}>{error}</div>}

          <div className="list-stack">
            {applications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onAccept={profile.role === "business" ? accept : undefined}
                onReject={profile.role === "business" ? reject : undefined}
                onCancel={profile.role === "business" ? cancelAcceptance : undefined}
              />
            ))}
            {applications.length === 0 && (
              <p className="empty-state" style={{ padding: "40px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", textAlign: "center", color: "var(--muted)", fontWeight: "600" }}>
                No shift applications found right now.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
