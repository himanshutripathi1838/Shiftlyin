import { collection, doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar.jsx";
import AdminTable from "../../components/admin/AdminTable.jsx";
import AdminTopbar from "../../components/admin/AdminTopbar.jsx";
import { auth, db } from "../../services/firebase.js";

async function logAction(actionType, targetId, message, targetCollection = "reports") {
  await setDoc(doc(collection(db, "auditLogs")), {
    adminId: auth.currentUser?.uid,
    actionType,
    targetCollection,
    targetId,
    message,
    createdAt: serverTimestamp()
  });
}

export default function AdminReports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    return onSnapshot(collection(db, "reports"), (snapshot) => {
      setReports(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });
  }, []);

  async function resolve(report) {
    await updateDoc(doc(db, "reports", report.id), {
      status: "resolved",
      resolvedAt: serverTimestamp()
    });
    await logAction("RESOLVE_REPORT", report.id, `Resolved report ${report.id}`);
  }

  async function warnUser(report) {
    await setDoc(doc(collection(db, "notifications")), {
      userId: report.againstUserId,
      title: "Admin warning",
      message: `Warning for report: ${report.reason || "Policy issue"}`,
      isRead: false,
      createdAt: serverTimestamp()
    });
    await logAction("WARN_USER", report.againstUserId || report.id, "Warned user from report", "notifications");
  }

  async function blockOrSuspend(report) {
    const collectionName = window.prompt("Target collection to update: students or businesses");
    if (!["students", "businesses"].includes(collectionName)) return;
    const targetId = report.againstUserId || window.prompt("Target user ID");
    if (!targetId) return;
    await updateDoc(doc(db, collectionName, targetId), {
      ...(collectionName === "students" ? { isBlocked: true, blockedAt: serverTimestamp() } : { isSuspended: true, suspendedAt: serverTimestamp() })
    });
    await logAction("BLOCK_OR_SUSPEND_USER", targetId, `Updated ${collectionName} from report`, collectionName);
  }

  const columns = [
    { key: "reportType", header: "Report Type" },
    { key: "reportedBy", header: "Reported By" },
    { key: "againstUserId", header: "Against User" },
    { key: "jobId", header: "Job ID" },
    { key: "reason", header: "Reason" },
    { key: "status", header: "Status", render: (row) => <span className={`admin-status ${row.status || "pending"}`}>{row.status || "pending"}</span> },
    { key: "createdAt", header: "Created At", render: (row) => row.createdAt?.toDate?.().toLocaleString?.() || "-" },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="admin-actions">
          <button onClick={() => window.alert(JSON.stringify(row, null, 2))}>Review</button>
          <button onClick={() => resolve(row)}>Resolve</button>
          <button onClick={() => warnUser(row)}>Warn User</button>
          <button className="danger" onClick={() => blockOrSuspend(row)}>Block/Suspend User</button>
        </div>
      )
    }
  ];

  return (
    <main className="admin-layout">
      <AdminSidebar />
      <section className="admin-main">
        <AdminTopbar title="Reports" subtitle="Review abuse reports, warnings, and moderation actions." />
        <AdminTable columns={columns} rows={reports} />
      </section>
    </main>
  );
}
