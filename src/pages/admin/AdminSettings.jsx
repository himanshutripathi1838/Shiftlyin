import { collection, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar.jsx";
import AdminTopbar from "../../components/admin/AdminTopbar.jsx";
import { auth, db } from "../../services/firebase.js";

const defaults = {
  minimumAge: 18,
  gpsCheckInRadiusMeters: 100,
  urgentHiringRadiusKm: 5,
  minimumRatingForPremiumJobs: 4.5,
  platformCommissionPercent: 0
};

export default function AdminSettings() {
  const [settings, setSettings] = useState(defaults);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    getDoc(doc(db, "systemSettings", "global")).then((snapshot) => {
      if (snapshot.exists()) setSettings({ ...defaults, ...snapshot.data() });
    });
  }, []);

  function updateField(key, value) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function save(event) {
    event.preventDefault();
    const parsedSettings = {
      minimumAge: Number(settings.minimumAge),
      gpsCheckInRadiusMeters: Number(settings.gpsCheckInRadiusMeters),
      urgentHiringRadiusKm: Number(settings.urgentHiringRadiusKm),
      minimumRatingForPremiumJobs: Number(settings.minimumRatingForPremiumJobs),
      platformCommissionPercent: Number(settings.platformCommissionPercent),
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser?.uid
    };

    await setDoc(doc(db, "systemSettings", "global"), parsedSettings, { merge: true });
    await setDoc(doc(collection(db, "auditLogs")), {
      adminId: auth.currentUser?.uid,
      actionType: "UPDATE_SETTINGS",
      targetCollection: "systemSettings",
      targetId: "global",
      message: "Updated global system settings",
      createdAt: serverTimestamp()
    });
    setNotice("Settings updated.");
  }

  return (
    <main className="admin-layout">
      <AdminSidebar />
      <section className="admin-main">
        <AdminTopbar title="Settings" subtitle="Control platform limits and operational thresholds." />
        <form className="admin-panel admin-settings-form" onSubmit={save}>
          {notice && <p className="admin-notice">{notice}</p>}
          {Object.keys(defaults).map((key) => (
            <label key={key}>
              <span>{labelFor(key)}</span>
              <input type="number" step="0.1" value={settings[key]} onChange={(event) => updateField(key, event.target.value)} />
            </label>
          ))}
          <button className="admin-button">Save Settings</button>
        </form>
      </section>
    </main>
  );
}

function labelFor(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}
