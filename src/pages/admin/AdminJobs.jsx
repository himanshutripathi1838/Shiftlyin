import { collection, doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar.jsx";
import AdminTable from "../../components/admin/AdminTable.jsx";
import AdminTopbar from "../../components/admin/AdminTopbar.jsx";
import { auth, db } from "../../services/firebase.js";

async function logAction(actionType, targetId, message) {
  await setDoc(doc(collection(db, "auditLogs")), {
    adminId: auth.currentUser?.uid,
    actionType,
    targetCollection: "jobs",
    targetId,
    message,
    createdAt: serverTimestamp()
  });
}

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    return onSnapshot(collection(db, "jobs"), (snapshot) => {
      setJobs(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });
  }, []);

  async function markExpired(job) {
    await updateDoc(doc(db, "jobs", job.id), { status: "expired" });
    await logAction("MARK_JOB_EXPIRED", job.id, `Marked job expired: ${job.title}`);
  }

  async function removeFake(job) {
    const reason = window.prompt("Reason for removing fake job");
    if (!reason) return;
    await updateDoc(doc(db, "jobs", job.id), {
      status: "removed",
      removedReason: reason
    });
    await logAction("REMOVE_FAKE_JOB", job.id, `Removed fake job: ${reason}`);
  }

  const columns = [
    { key: "title", header: "Job Title" },
    { key: "businessName", header: "Business Name" },
    { key: "salary", header: "Salary" },
    { key: "requiredWorkers", header: "Required Workers", render: (row) => row.requiredWorkers ?? row.vacancies ?? 0 },
    { key: "filledWorkers", header: "Filled Workers", render: (row) => row.filledWorkers ?? 0 },
    { key: "remainingWorkers", header: "Remaining Workers", render: (row) => Math.max(Number(row.vacancies ?? row.requiredWorkers ?? 0) - Number(row.filledWorkers || 0), 0) },
    { key: "urgentHiring", header: "Urgent Hiring", render: (row) => (row.urgentHiring || row.urgency === "urgent" ? "Yes" : "No") },
    { key: "status", header: "Status", render: (row) => <span className={`admin-status ${row.status || "active"}`}>{row.status || "active"}</span> },
    { key: "location", header: "Location", render: (row) => row.location || row.businessAddress || "-" },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="admin-actions">
          <button onClick={() => window.alert(JSON.stringify(row, null, 2))}>View</button>
          <button onClick={() => markExpired(row)}>Mark Expired</button>
          <button className="danger" onClick={() => removeFake(row)}>Remove Fake Job</button>
        </div>
      )
    }
  ];

  return (
    <main className="admin-layout">
      <AdminSidebar />
      <section className="admin-main">
        <AdminTopbar title="Job Management" subtitle="Inspect jobs, expire old listings, and remove fake posts." />
        <AdminTable columns={columns} rows={jobs} />
      </section>
    </main>
  );
}
