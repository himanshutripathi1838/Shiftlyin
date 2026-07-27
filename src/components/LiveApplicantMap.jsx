import { useState } from "react";
import { calculateDistanceKm, formatDistance } from "../utils/distance.js";
import { Map, MapMarker, MarkerContent, MapRoute, MapControls } from "@/components/ui/map";
import { collection, doc, getDocs, query, runTransaction, serverTimestamp, where } from "firebase/firestore";
import { db } from "../services/firebase.js";

function formatLastUpdate(value) {
  const date = value?.toDate?.();
  if (!date) return "Waiting for live location";

  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return `Updated ${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  return `Updated ${minutes}m ago`;
}

function embedMapUrl(application) {
  const studentLat = application.studentLiveLatitude;
  const studentLng = application.studentLiveLongitude;
  const jobLat = application.jobLatitude;
  const jobLng = application.jobLongitude;

  if ([studentLat, studentLng, jobLat, jobLng].some((item) => item === undefined || item === "")) return "";

  return `https://maps.google.com/maps?saddr=${studentLat},${studentLng}&daddr=${jobLat},${jobLng}&output=embed`;
}

export default function LiveApplicantMap({ applications, role = "business" }) {
  const [openMapId, setOpenMapId] = useState("");
  const [error, setError] = useState("");
  const [mapTheme, setMapTheme] = useState("dark");
  const acceptedApplications = applications.filter((application) => application.status === "accepted");

  async function handleCancel(application) {
    if (!window.confirm(`Are you sure you want to cancel selection for ${application.studentName || "Student"}?`)) {
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
        if (!appSnapshot.exists()) throw new Error("This application no longer exists.");

        const appData = appSnapshot.data();
        if (appData.status !== "accepted") throw new Error("This application is not currently accepted.");

        const jobSnapshot = await transaction.get(jobRef);
        if (!jobSnapshot.exists()) throw new Error("This job no longer exists.");
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
          message: `${application.businessName || "Restaurant"} ne aapka selection cancel kar diya hai for ${application.jobTitle}.`,
          isRead: false,
          createdAt: serverTimestamp()
        });
      });
    } catch (err) {
      setError(err.message);
    }
  }

  if (!acceptedApplications.length) {
    return (
      <section className="panel live-location-panel">
        <div className="section-heading compact-heading">
          <span className="eyebrow">Live location</span>
          <h2>{role === "business" ? "Accepted students" : "Active workplace"}</h2>
        </div>
        <p className="empty-state">
          {role === "business"
            ? "Accept a student application to see live distance from student to restaurant."
            : "No active accepted jobs to track yet."}
        </p>
      </section>
    );
  }

  return (
    <section className="panel live-location-panel">
      <div className="section-heading compact-heading">
        <span className="eyebrow">Live location</span>
        <h2>{role === "business" ? "Student to restaurant distance" : "Distance to workplace"}</h2>
      </div>
      {error && <p className="form-error" style={{ margin: "10px 0" }}>{error}</p>}
      <div className="live-location-list">
        {acceptedApplications.map((application) => {
          const distance = calculateDistanceKm(
            application.studentLiveLatitude,
            application.studentLiveLongitude,
            application.jobLatitude,
            application.jobLongitude
          );
          const isMapOpen = openMapId === application.id;

          const studentLat = Number(application.studentLiveLatitude);
          const studentLng = Number(application.studentLiveLongitude);
          const jobLat = Number(application.jobLatitude);
          const jobLng = Number(application.jobLongitude);

          const hasCoordinates = [studentLat, studentLng, jobLat, jobLng].every(
            (item) => !isNaN(item) && item !== 0
          );
          const center = hasCoordinates ? [(studentLng + jobLng) / 2, (studentLat + jobLat) / 2] : [0, 0];

          return (
            <article className="live-location-card" key={application.id}>
              <div className="live-location-summary">
                <div className="live-map-visual" aria-hidden="true">
                  <span className="map-pin student-pin" />
                  <span className="map-route-line" />
                  <span className="map-pin restaurant-pin" />
                </div>
                <div className="live-location-copy">
                  <span className="status-pill">Live tracking</span>
                  <h3>
                    {role === "business"
                      ? `${application.studentName || "Student"} - ${application.jobTitle}`
                      : `${application.businessName || "Business"} - ${application.jobTitle}`}
                  </h3>
                  <p>
                    {formatDistance(distance)} {role === "business" ? "from restaurant" : "from workplace"}
                  </p>
                  <small>{formatLastUpdate(application.studentLiveUpdatedAt)}</small>
                </div>
                <div className="live-location-actions">
                  <span>{application.studentLiveAccuracyMeters ? `Accuracy ${Math.round(application.studentLiveAccuracyMeters)} m` : "GPS permission needed"}</span>
                  <button
                    type="button"
                    className="ghost-button"
                    disabled={!hasCoordinates}
                    onClick={() => setOpenMapId(isMapOpen ? "" : application.id)}
                  >
                    {isMapOpen ? "Hide map" : "Show map"}
                  </button>
                  {role === "business" && (
                    <button
                      type="button"
                      className="ghost-button danger-btn-outline"
                      onClick={() => handleCancel(application)}
                      style={{ color: "#ea4335", borderColor: "#ea4335", marginLeft: "10px" }}
                    >
                      Cancel Acceptance
                    </button>
                  )}
                </div>
              </div>
              {isMapOpen && hasCoordinates && (
                <div className="inline-map-frame" style={{ height: "320px", width: "100%", borderRadius: "8px", overflow: "hidden", position: "relative", border: "1px solid var(--border)", marginTop: "15px" }}>
                  <button
                    type="button"
                    onClick={() => setMapTheme(mapTheme === "dark" ? "light" : "dark")}
                    style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      zIndex: 10,
                      background: mapTheme === "dark" ? "rgba(17, 27, 33, 0.85)" : "rgba(255, 255, 255, 0.9)",
                      border: "1px solid " + (mapTheme === "dark" ? "#1f2c33" : "#ccc"),
                      borderRadius: "6px",
                      padding: "6px 12px",
                      color: mapTheme === "dark" ? "#e9edef" : "#111b21",
                      fontSize: "12px",
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
                    }}
                  >
                    {mapTheme === "dark" ? "☀️ Light Map" : "🌙 Dark Map"}
                  </button>
                  <Map viewport={{ center, zoom: 12 }} theme={mapTheme} attributionControl={false}>
                    <MapMarker longitude={studentLng} latitude={studentLat}>
                      <MarkerContent>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#10b981", color: "white", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", boxShadow: "0 2px 5px rgba(0,0,0,0.3)" }}>
                          🎓
                        </div>
                      </MarkerContent>
                    </MapMarker>
                    <MapMarker longitude={jobLng} latitude={jobLat}>
                      <MarkerContent>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f43f5e", color: "white", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", boxShadow: "0 2px 5px rgba(0,0,0,0.3)" }}>
                          🏪
                        </div>
                      </MarkerContent>
                    </MapMarker>
                    <MapRoute
                      coordinates={[
                        [studentLng, studentLat],
                        [jobLng, jobLat]
                      ]}
                      color="#0f766e"
                      width={4}
                    />
                    <MapControls showLocate />
                  </Map>
                </div>
              )}{!hasCoordinates && (
                <p className="live-location-help">
                  {role === "business"
                    ? "The map will show here once the student's live GPS location is received."
                    : "The map will show here once your live GPS location is received."}
                </p>
              )}
            </article>
          );
        })}
      </div>
      <p className="live-location-help">
        Help: Location permissions must be enabled in the {role === "business" ? "student's" : "your"} browser. Distance will auto-refresh via Firebase realtime updates.
      </p>
    </section>
  );
}
