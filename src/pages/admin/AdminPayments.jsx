import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar.jsx";
import AdminStatsCard from "../../components/admin/AdminStatsCard.jsx";
import AdminTable from "../../components/admin/AdminTable.jsx";
import AdminTopbar from "../../components/admin/AdminTopbar.jsx";
import { db } from "../../services/firebase.js";
import { formatCurrency } from "../../utils/payments.js";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    return onSnapshot(collection(db, "payments"), (snapshot) => {
      setPayments(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });
  }, []);

  const columns = [
    { key: "id", header: "Payment ID" },
    { key: "jobTitle", header: "Job" },
    { key: "studentName", header: "Student" },
    { key: "businessName", header: "Business" },
    { key: "amount", header: "Amount", render: (row) => formatCurrency(row.amount) },
    { key: "status", header: "Status", render: (row) => <span className={`admin-status ${row.status || "pending"}`}>{row.status || "pending"}</span> },
    { key: "createdAt", header: "Created At", render: (row) => row.createdAt?.toDate?.().toLocaleString?.() || "-" }
  ];

  return (
    <main className="admin-layout">
      <AdminSidebar />
      <section className="admin-main">
        <AdminTopbar title="Payments" subtitle="MVP payment monitoring placeholders and payment records." />
        <div className="admin-stats-grid">
          <AdminStatsCard label="Total Payments" value={payments.length} />
          <AdminStatsCard label="Pending Payments" value={payments.filter((item) => item.status === "pending").length} tone="warning" />
          <AdminStatsCard label="Completed Payments" value={payments.filter((item) => item.status === "completed").length} tone="success" />
          <AdminStatsCard label="Failed Payments" value={payments.filter((item) => item.status === "failed").length} tone="danger" />
          <AdminStatsCard label="Total Amount" value={formatCurrency(payments.reduce((sum, item) => sum + Number(item.amount || 0), 0))} />
        </div>
        <AdminTable columns={columns} rows={payments} emptyText="No payment records yet." />
      </section>
    </main>
  );
}
