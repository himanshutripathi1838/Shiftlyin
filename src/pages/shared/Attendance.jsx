import { addDoc, collection, doc, onSnapshot, query, runTransaction, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { db } from "../../services/firebase.js";
import { isWithinMeters } from "../../utils/distance.js";
import { calculatePaymentAmount, formatCurrency } from "../../utils/payments.js";

export default function Attendance() {
  const { currentUser, profile } = useAuth();
  const [acceptedApps, setAcceptedApps] = useState([]);
  const [records, setRecords] = useState([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [ratings, setRatings] = useState({});
  const [loadingGps, setLoadingGps] = useState(false);


  useEffect(() => {
    if (profile.role === "student") {
      const appsQuery = query(collection(db, "applications"), where("studentId", "==", currentUser.uid), where("status", "==", "accepted"));
      const unsubApps = onSnapshot(appsQuery, (snapshot) => setAcceptedApps(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))), (err) => setError(err.message));
      const recordsQuery = query(collection(db, "attendance"), where("studentId", "==", currentUser.uid));
      const unsubRecords = onSnapshot(recordsQuery, (snapshot) => setRecords(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))), (err) => setError(err.message));
      return () => {
        unsubApps();
        unsubRecords();
      };
    }

    return onSnapshot(query(collection(db, "attendance"), where("businessId", "==", currentUser.uid)), (snapshot) => {
      setRecords(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    }, (err) => setError(err.message));
  }, [currentUser.uid, profile.role]);

  function getPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 4000,
        maximumAge: 10000
      });
    }).catch(() => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 4000,
          maximumAge: 30000
        });
      });
    });
  }


  async function checkIn(application) {
    setError("");
    setLoadingGps(true);
    try {
      const shiftEnd = application.shiftEndsAt?.toDate?.();
      if (shiftEnd && shiftEnd.getTime() <= Date.now()) {
        setNotice("This restaurant shift has ended. The session is closed.");
        return;
      }

      const alreadyCheckedIn = records.some(
        (record) => record.jobId === application.jobId && (record.status === "checked-in" || record.status === "completed")
      );
      if (alreadyCheckedIn) {
        setNotice("You have already checked in or completed this shift. Single check-in limit enforced.");
        return;
      }

      if (application.jobLatitude === undefined || application.jobLongitude === undefined) {
        setError("This job does not have GPS coordinates. Ask the business to repost it with location access.");
        return;
      }

      const position = await getPosition();
      const withinRange = isWithinMeters(
        position.coords.latitude,
        position.coords.longitude,
        application.jobLatitude,
        application.jobLongitude,
        100
      );

      if (!withinRange) {
        setNotice("You must be within 100 meters of the job location to check in.");
        return;
      }

      await addDoc(collection(db, "attendance"), {
        jobId: application.jobId,
        jobTitle: application.jobTitle,
        applicationId: application.id,
        studentId: currentUser.uid,
        studentName: profile.name,
        businessId: application.businessId,
        businessName: application.businessName,
        salary: application.salary || "",
        salaryType: application.salaryType || "fixed",
        salaryAmount: Number(application.salaryAmount || 0),
        shiftStartsAt: application.shiftStartsAt || null,
        shiftEndAt: application.shiftEndsAt || null,
        checkInTime: serverTimestamp(),
        checkInLat: position.coords.latitude,
        checkInLng: position.coords.longitude,
        status: "checked-in"
      });
      setNotice("Checked in successfully.");
    } catch {
      setNotice("Location permission is needed for attendance.");
    } finally {
      setLoadingGps(false);
    }
  }

  async function checkOut(record) {
    setError("");
    setLoadingGps(true);
    try {
      const position = await getPosition();
      const checkInDate = record.checkInTime?.toDate?.() || new Date();
      const workingHours = Number(((Date.now() - checkInDate.getTime()) / 36e5).toFixed(2));
      const amount = calculatePaymentAmount({
        salary: record.salary,
        salaryAmount: record.salaryAmount,
        salaryType: record.salaryType,
        workingHours
      });

      await updateDoc(doc(db, "attendance", record.id), {
        checkOutTime: serverTimestamp(),
        checkOutLat: position.coords.latitude,
        checkOutLng: position.coords.longitude,
        workingHours,
        status: "completed"
      });
      await setDoc(doc(db, "payments", record.id), {
        attendanceId: record.id,
        jobId: record.jobId,
        jobTitle: record.jobTitle || "",
        studentId: record.studentId,
        studentName: record.studentName || "",
        businessId: record.businessId,
        businessName: record.businessName || "",
        salary: record.salary || "",
        salaryType: record.salaryType || "fixed",
        salaryAmount: Number(record.salaryAmount || 0),
        workingHours,
        amount,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      await addDoc(collection(db, "notifications"), {
        userId: record.businessId,
        title: "Payment pending",
        message: `${record.studentName || "Student"} completed ${record.jobTitle || "shift"}. Mark payment of ${formatCurrency(amount)} as paid.`,
        type: "payment-pending",
        attendanceId: record.id,
        jobId: record.jobId,
        isRead: false,
        createdAt: serverTimestamp()
      });
      setNotice(`Checked out successfully. Payment ${formatCurrency(amount)} pending hai.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingGps(false);
    }
  }

  async function submitRating(record) {
    const rating = Number(ratings[record.id] || 0);
    if (rating < 1 || rating > 5) {
      setError("Select a rating between 1 and 5.");
      return;
    }

    const targetUserId = profile.role === "business" ? record.studentId : record.businessId;
    const attendanceFlag = profile.role === "business" ? "studentRatedByBusiness" : "businessRatedByStudent";
    const reviewType = profile.role === "business" ? "student" : "business";

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", targetUserId);
        const attendanceRef = doc(db, "attendance", record.id);
        const reviewRef = doc(collection(db, "reviews"));
        const notificationRef = doc(collection(db, "notifications"));
        const userSnapshot = await transaction.get(userRef);
        const user = userSnapshot.data() || {};
        const oldCount = Number(user.ratingCount || 0);
        const oldAverage = Number(user.rating || 0);
        const nextCount = oldCount + 1;
        const nextAverage = Number(((oldAverage * oldCount + rating) / nextCount).toFixed(1));

        transaction.update(userRef, { rating: nextAverage, ratingCount: nextCount });
        transaction.update(attendanceRef, { [attendanceFlag]: true });
        transaction.set(reviewRef, {
          jobId: record.jobId,
          attendanceId: record.id,
          fromUserId: currentUser.uid,
          toUserId: targetUserId,
          type: reviewType,
          rating,
          createdAt: serverTimestamp()
        });
        transaction.set(notificationRef, {
          userId: targetUserId,
          title: "New rating received",
          message: `${profile.name} rated you ${rating}/5 for ${record.jobTitle}.`,
          isRead: false,
          createdAt: serverTimestamp()
        });
      });
      setNotice("Rating submitted.");
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
            <strong>Attendance Update</strong>
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice("")} aria-label="Close attendance notice">Close</button>
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
                Geofenced Shifts
              </span>
              <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#ffffff", margin: "6px 0 2px" }}>GPS Attendance & Shift Console</h1>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", margin: 0 }}>Check-in on site within 100 meters of the store geofence. Payouts calculation trigger automatically on checkout.</p>
            </div>
          </div>

          {error && <div className="form-error" style={{ marginBottom: "20px", padding: "12px 16px", borderRadius: "10px", fontSize: "13px" }}>{error}</div>}

          {profile.role === "student" && (
            <div style={{ marginBottom: "32px" }}>
              <div className="section-heading" style={{ marginBottom: "16px" }}>
                <span className="eyebrow" style={{ color: "var(--primary)" }}>On-Site Shifts</span>
                <h2 style={{ fontSize: "20px", fontWeight: "900" }}>Accepted Shifts (Ready for Check-In)</h2>
              </div>
              {acceptedApps.length === 0 ? (
                <p className="empty-state" style={{ padding: "30px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", textAlign: "center", color: "var(--muted)" }}>No accepted shifts ready for check-in right now.</p>
              ) : (
                <div className="list-stack">
                  {acceptedApps.map((application) => (
                    <article className="application-card" key={application.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                      <div>
                        <span className="status-pill" style={{ background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0", padding: "3px 10px", borderRadius: "14px", fontSize: "11px", fontWeight: "800" }}>Accepted Shift</span>
                        <h3 style={{ fontSize: "18px", fontWeight: "900", color: "var(--text)", margin: "6px 0 4px" }}>{application.jobTitle}</h3>
                        <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>🏪 Business: <strong style={{ color: "var(--text)" }}>{application.businessName}</strong></p>
                      </div>
                      <button className="primary-button" onClick={() => checkIn(application)} disabled={loadingGps} style={{ borderRadius: "12px", padding: "10px 24px", fontWeight: "800", background: "var(--primary)" }}>
                        {loadingGps ? "Verifying GPS..." : "📍 Check In (100m Range)"}
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="section-heading" style={{ marginBottom: "16px" }}>
            <span className="eyebrow" style={{ color: "var(--accent)" }}>Shift Records</span>
            <h2 style={{ fontSize: "20px", fontWeight: "900" }}>Attendance Log & Ratings</h2>
          </div>

          <div className="list-stack">
            {records.map((record) => (
              <article className="application-card" key={record.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <span className="status-pill" style={{ background: record.status === "completed" ? "#ecfdf5" : "#fffbeb", color: record.status === "completed" ? "#059669" : "#d97706", border: `1px solid ${record.status === "completed" ? "#a7f3d0" : "#fde68a"}`, padding: "3px 10px", borderRadius: "14px", fontSize: "11px", fontWeight: "800" }}>{record.status}</span>
                  <h3 style={{ fontSize: "18px", fontWeight: "900", color: "var(--text)", margin: "6px 0 4px" }}>{record.jobTitle || record.jobId}</h3>
                  <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>
                    {record.autoClosed
                      ? `Automatically closed after shift time · ${record.workingHours || 0} hours`
                      : record.workingHours
                        ? `Duration: ${record.workingHours} hours`
                        : "Shift In Progress"}
                  </p>
                </div>
                {profile.role === "student" && record.status === "checked-in" && (
                  <button className="primary-button" onClick={() => checkOut(record)} disabled={loadingGps} style={{ borderRadius: "12px", padding: "10px 24px", fontWeight: "800", background: "#ef4444", borderColor: "#ef4444" }}>
                    {loadingGps ? "Verifying GPS..." : "🚪 Check Out Shift"}
                  </button>
                )}
                {record.status === "completed" && (
                  ((profile.role === "business" && record.studentRatedByBusiness) || (profile.role === "student" && record.businessRatedByStudent)) ? (
                    <span style={{ background: "#f0fdf4", color: "#16a34a", padding: "6px 14px", borderRadius: "10px", fontWeight: "800", fontSize: "12px", border: "1px solid #86efac", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      ⭐ Rating Submitted (Single Rating Limit)
                    </span>
                  ) : (
                    <div className="rating-inline" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <select
                        value={ratings[record.id] || ""}
                        onChange={(event) => setRatings((current) => ({ ...current, [record.id]: event.target.value }))}
                        style={{ padding: "6px 10px", borderRadius: "8px", fontSize: "13px" }}
                      >
                        <option value="">Select Rating</option>
                        <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
                        <option value="4">⭐⭐⭐⭐ 4 - Good</option>
                        <option value="3">⭐⭐⭐ 3 - Average</option>
                        <option value="2">⭐⭐ 2 - Poor</option>
                        <option value="1">⭐ 1 - Bad</option>
                      </select>
                      <button className="primary-button" onClick={() => submitRating(record)} style={{ borderRadius: "8px", padding: "6px 14px", fontSize: "13px" }}>
                        Submit Rating
                      </button>
                    </div>
                  )
                )}
              </article>
            ))}
            {records.length === 0 && <p className="empty-state" style={{ padding: "30px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", textAlign: "center", color: "var(--muted)" }}>No attendance records logged yet.</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
