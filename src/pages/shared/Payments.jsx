import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { db } from "../../services/firebase.js";
import { formatDateTime } from "../../utils/dateTime.js";
import { formatCurrency } from "../../utils/payments.js";

function sumPayments(payments, status) {
  return payments
    .filter((payment) => !status || payment.status === status)
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);
}

export default function Payments() {
  const { currentUser, profile } = useAuth();
  const [payments, setPayments] = useState([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const isBusiness = profile.role === "business";

  useEffect(() => {
    const field = isBusiness ? "businessId" : "studentId";
    return onSnapshot(
      query(collection(db, "payments"), where(field, "==", currentUser.uid)),
      (snapshot) => {
        setPayments(
          snapshot.docs
            .map((item) => ({ id: item.id, ...item.data() }))
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        );
      },
      (err) => setError(err.message)
    );
  }, [currentUser.uid, isBusiness]);

  const totals = useMemo(() => ({
    pending: sumPayments(payments, "pending"),
    completed: sumPayments(payments, "completed"),
    failed: sumPayments(payments, "failed"),
    total: sumPayments(payments)
  }), [payments]);

  async function markPaid(payment) {
    setError("");
    setNotice("");
    try {
      await updateDoc(doc(db, "payments", payment.id), {
        status: "completed",
        paidAt: serverTimestamp(),
        paidBy: currentUser.uid,
        updatedAt: serverTimestamp()
      });
      await addDoc(collection(db, "notifications"), {
        userId: payment.studentId,
        title: "Payment received",
        message: `${payment.businessName || "Business"} marked payment of ${formatCurrency(payment.amount)} as paid for ${payment.jobTitle || "shift"}.`,
        type: "payment-completed",
        paymentId: payment.id,
        attendanceId: payment.attendanceId,
        jobId: payment.jobId,
        isRead: false,
        createdAt: serverTimestamp()
      });
      setNotice(`Payment of ${formatCurrency(payment.amount)} for ${payment.studentName || "Student"} has been marked as completed.`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className={`dashboard-layout ${isBusiness ? "owner-view" : "student-view"}`}>
      <Sidebar role={profile.role} />
      <section className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <span className="eyebrow">{isBusiness ? "Payment approvals" : "Earnings"}</span>
            <h1>{isBusiness ? "Student payments" : "My earnings dashboard"}</h1>
            <p>{isBusiness ? "Mark completed shift payments as paid after cash or UPI transfer." : "Track pending and paid earnings from completed shifts."}</p>
          </div>
        </div>

        {notice && <p className="notice">{notice}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="metric-grid role-metrics">
          <div className="metric-card"><span>{isBusiness ? "Pending to pay" : "Pending earnings"}</span><strong>{formatCurrency(totals.pending)}</strong></div>
          <div className="metric-card"><span>{isBusiness ? "Paid amount" : "Paid earnings"}</span><strong>{formatCurrency(totals.completed)}</strong></div>
          <div className="metric-card"><span>Total records</span><strong>{payments.length}</strong></div>
          <div className="metric-card"><span>Failed amount</span><strong>{formatCurrency(totals.failed)}</strong></div>
        </div>

        <div className="section-heading">
          <span className="eyebrow">Payment records</span>
          <h2>{isBusiness ? "Owner payment queue" : "Student earning history"}</h2>
        </div>

        <div className="list-stack">
          {payments.map((payment) => (
            <article className="application-card payment-card" key={payment.id}>
              <div>
                <span className={`status-pill ${payment.status === "completed" ? "success" : payment.status === "failed" ? "expired" : ""}`}>
                  {payment.status || "pending"}
                </span>
                <h3>{payment.jobTitle || "Completed shift"}</h3>
                <p>
                  {isBusiness ? payment.studentName : payment.businessName} · {payment.workingHours || 0} hours · {formatDateTime(payment.createdAt) || "-"}
                </p>
              </div>
              <div className="payment-actions">
                <strong>{formatCurrency(payment.amount)}</strong>
                {isBusiness && payment.status === "pending" && (
                  <button className="primary-button" type="button" onClick={() => markPaid(payment)}>
                    Mark Paid
                  </button>
                )}
              </div>
            </article>
          ))}
          {payments.length === 0 && <p className="empty-state">No payment records yet. Completed check-outs will appear here.</p>}
        </div>
      </section>
    </main>
  );
}
