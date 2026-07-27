import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar.jsx";
import AdminTable from "../../components/admin/AdminTable.jsx";
import AdminTopbar from "../../components/admin/AdminTopbar.jsx";
import { db } from "../../services/firebase.js";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    return onSnapshot(collection(db, "auditLogs"), (snapshot) => {
      setLogs(
        snapshot.docs
          .map((item) => ({ id: item.id, ...item.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      );
    });
  }, []);

  const columns = [
    { key: "adminId", header: "Admin ID" },
    { key: "actionType", header: "Action Type" },
    { key: "targetCollection", header: "Target Collection" },
    { key: "targetId", header: "Target ID" },
    { key: "message", header: "Message" },
    { key: "createdAt", header: "Created At", render: (row) => row.createdAt?.toDate?.().toLocaleString?.() || "-" }
  ];

  return (
    <main className="admin-layout">
      <AdminSidebar />
      <section className="admin-main">
        <AdminTopbar title="Audit Logs" subtitle="Every privileged admin action is recorded here." />
        <AdminTable columns={columns} rows={logs} emptyText="No audit logs yet." />
      </section>
    </main>
  );
}
