import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../services/firebase.js";

export default function NotificationsPanel({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return undefined;
    return onSnapshot(
      query(collection(db, "notifications"), where("userId", "==", userId)),
      (snapshot) => {
        setNotifications(
          snapshot.docs
            .map((item) => ({ id: item.id, ...item.data() }))
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
            .slice(0, 5)
        );
      },
      (err) => setError(err.message)
    );
  }, [userId]);

  return (
    <section className="panel notifications-panel">
      <div className="section-heading compact-heading">
        <span className="eyebrow">Notifications</span>
        <h2>Latest updates</h2>
      </div>
      {error && <p className="form-error">{error}</p>}
      {notifications.length === 0 && <p className="empty-state">No notifications yet.</p>}
      <div className="list-stack">
        {notifications.map((notification) => (
          <article className="notification-item" key={notification.id}>
            <strong>{notification.title}</strong>
            <span>{notification.message}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
