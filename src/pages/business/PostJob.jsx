import { addDoc, collection, doc, onSnapshot, serverTimestamp, Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { db } from "../../services/firebase.js";

const initialJob = {
  title: "",
  description: "",
  location: "",
  salary: "",
  salaryType: "fixed",
  salaryAmount: "",
  vacancies: 1,
  urgency: "normal",
  latitude: "",
  longitude: "",
  startsAt: "", // datetime-local format: YYYY-MM-DDTHH:MM
  endsAt: ""   // datetime-local format: YYYY-MM-DDTHH:MM
};

export default function PostJob() {
  const { currentUser, profile } = useAuth();
  const [job, setJob] = useState(initialJob);
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser?.uid) return undefined;
    return onSnapshot(doc(db, "wallets", currentUser.uid), (snap) => {
      if (snap.exists()) setWallet(snap.data());
    });
  }, [currentUser?.uid]);

  const isPostingBlocked = (wallet?.currentOutstanding || 0) >= 5000 || profile?.isPostingBlocked;

  function updateField(key, value) {
    setJob((current) => ({ ...current, [key]: value }));
  }

  function useCurrentLocation() {
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateField("latitude", position.coords.latitude);
        updateField("longitude", position.coords.longitude);
      },
      () => setError("Allow location access to enable GPS check-in for this job."),
      { enableHighAccuracy: true }
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const shiftStartsAt = new Date(job.startsAt);
    const shiftEndsAt = new Date(job.endsAt);

    if (
      isNaN(shiftStartsAt.getTime()) ||
      isNaN(shiftEndsAt.getTime()) ||
      shiftEndsAt <= shiftStartsAt
    ) {
      setError("Shift end time must be after shift start time.");
      return;
    }

    try {
      await addDoc(collection(db, "jobs"), {
        title: job.title.trim(),
        description: job.description.trim(),
        location: job.location.trim(),
        salary: job.salary.trim(),
        salaryType: job.salaryType,
        salaryAmount: Number(job.salaryAmount || 0),
        vacancies: Number(job.vacancies),
        filledWorkers: 0,
        urgency: job.urgency,
        latitude: Number(job.latitude),
        longitude: Number(job.longitude),
        createdBy: currentUser.uid,
        businessName: profile.name,
        shiftStartsAt: Timestamp.fromDate(shiftStartsAt),
        shiftEndsAt: Timestamp.fromDate(shiftEndsAt),
        status: "active",
        createdAt: serverTimestamp()
      });
      navigate("/business");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="dashboard-layout">
      <Sidebar role="business" />
      <section className="dashboard-content" style={{ paddingBottom: "40px" }}>
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
              Hiring Desk
            </span>
            <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#ffffff", margin: "6px 0 2px" }}>Post a New Shift</h1>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", margin: 0 }}>Publish job details, hourly pay, and GPS location coordinates for student applicants.</p>
          </div>
        </div>

        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <form className="panel form-stack" onSubmit={handleSubmit} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "20px", padding: "32px clamp(20px, 4vw, 36px)", boxShadow: "var(--shadow)" }}>
            {isPostingBlocked && (
              <div style={{ background: "#fef2f2", border: "2px solid #ef4444", borderRadius: "14px", padding: "20px", marginBottom: "20px", color: "#991b1b" }}>
                <strong style={{ fontSize: "16px", display: "block", marginBottom: "4px" }}>🚨 Job Posting Locked</strong>
                <span style={{ fontSize: "13px" }}>Please clear your pending wallet settlement balance of <strong>₹{wallet?.currentOutstanding || 5400}</strong> to continue publishing jobs.</span>
              </div>
            )}
            
            {error && <div className="form-error" style={{ marginBottom: "20px", padding: "12px 16px", borderRadius: "10px", fontSize: "13px" }}>{error}</div>}

            <label style={{ fontWeight: "700" }}>Shift Title
              <input required value={job.title} onChange={(e) => updateField("title", e.target.value)} placeholder="e.g. Weekend Barista / Billing Cashier" />
            </label>

            <label style={{ fontWeight: "700" }}>Description & Duties
              <textarea required value={job.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Describe shift duties, attire requirements, and break timings..." />
            </label>

            <label style={{ fontWeight: "700" }}>Store / Cafe Address Location
              <input required value={job.location} onChange={(e) => updateField("location", e.target.value)} placeholder="e.g. Connaught Place, New Delhi" />
            </label>
            
            <div className="form-grid">
              <label style={{ fontWeight: "700" }}>Display Salary Text
                <input required value={job.salary} onChange={(e) => updateField("salary", e.target.value)} placeholder="e.g. ₹600 / shift" />
              </label>
              <label style={{ fontWeight: "700" }}>Salary Calculation Type
                <select required value={job.salaryType} onChange={(e) => updateField("salaryType", e.target.value)}>
                  <option value="fixed">Fixed per shift</option>
                  <option value="hourly">Hourly rate</option>
                </select>
              </label>
            </div>

            <div className="form-grid">
              <label style={{ fontWeight: "700" }}>Payment Amount (₹)
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={job.salaryAmount}
                  onChange={(e) => updateField("salaryAmount", e.target.value)}
                  placeholder="600"
                />
              </label>
              <label style={{ fontWeight: "700" }}>Number of Vacancies
                <input type="number" min="1" required value={job.vacancies} onChange={(e) => updateField("vacancies", e.target.value)} />
              </label>
            </div>
            
            <fieldset className="shift-schedule" style={{ border: "1px solid var(--border)", borderRadius: "14px", padding: "20px", background: "var(--surface-soft)" }}>
              <legend style={{ fontWeight: "800", fontSize: "13px", color: "var(--primary)", padding: "0 8px" }}>Shift Schedule (Starts & Ends)</legend>
              <div className="form-grid">
                <label style={{ fontWeight: "700" }}>Starts At
                  <input
                    type="datetime-local"
                    required
                    value={job.startsAt}
                    onChange={(e) => updateField("startsAt", e.target.value)}
                  />
                </label>
                <label style={{ fontWeight: "700" }}>Ends At
                  <input
                    type="datetime-local"
                    required
                    value={job.endsAt}
                    onChange={(e) => updateField("endsAt", e.target.value)}
                  />
                </label>
              </div>
            </fieldset>

            <div style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <strong style={{ fontSize: "13px", color: "var(--text)" }}>📍 GPS Location Coordinates (For 100m Check-in)</strong>
                <button type="button" className="ghost-button" onClick={useCurrentLocation} style={{ fontSize: "12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "6px 12px" }}>
                  {job.latitude ? `✓ Saved (${Number(job.latitude).toFixed(3)}, ${Number(job.longitude).toFixed(3)})` : "Use Current Location"}
                </button>
              </div>
              <div className="form-grid">
                <label style={{ fontWeight: "700" }}>Latitude<input required value={job.latitude} onChange={(e) => updateField("latitude", e.target.value)} placeholder="28.6139" /></label>
                <label style={{ fontWeight: "700" }}>Longitude<input required value={job.longitude} onChange={(e) => updateField("longitude", e.target.value)} placeholder="77.2090" /></label>
              </div>
            </div>

            <label style={{ fontWeight: "700" }}>Job Urgency Level
              <select required value={job.urgency} onChange={(e) => updateField("urgency", e.target.value)}>
                <option value="normal">Normal Shift</option>
                <option value="urgent">🔥 Urgent Shift (Highlighted)</option>
              </select>
            </label>

            <button className="primary-button full-width" disabled={isPostingBlocked} style={{ marginTop: "12px", padding: "14px", fontSize: "15px", fontWeight: "800", background: isPostingBlocked ? "#94a3b8" : "var(--accent)", borderColor: isPostingBlocked ? "#94a3b8" : "var(--accent)" }}>
              {isPostingBlocked ? "Posting Locked (Clear Settlement Balance)" : "Publish Job Post"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
