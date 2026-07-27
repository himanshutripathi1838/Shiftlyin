import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, updateDoc, writeBatch, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { db } from "../../services/firebase.js";
import { formatCurrency } from "../../utils/payments.js";

const paymentMethods = [
  { id: "upi", name: "UPI", icon: "📱", desc: "Google Pay, PhonePe, Paytm, BHIM" },
  { id: "card", name: "Credit / Debit Card", icon: "💳", desc: "Visa, Mastercard, RuPay" },
  { id: "netbanking", name: "Net Banking", icon: "🏦", desc: "All major Indian banks" },
  { id: "wallet", name: "Wallet", icon: "👛", desc: "Paytm Wallet, Mobikwik" },
  { id: "razorpay", name: "Razorpay Gateway", icon: "⚡", desc: "Coming Soon", disabled: true }
];

export default function BusinessWallet() {
  const { currentUser, profile } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Filter & Search
  const [statusFilter, setStatusFilter] = useState("all");

  // Payment Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [isProcessingPay, setIsProcessingPay] = useState(false);

  // Detail Modal State
  const [selectedSettlement, setSelectedSettlement] = useState(null);

  // Real-time Firestore Listeners
  useEffect(() => {
    if (!currentUser?.uid) return undefined;

    // Listen to business wallet doc
    const unsubWallet = onSnapshot(doc(db, "wallets", currentUser.uid), (snap) => {
      if (snap.exists()) {
        setWallet(snap.data());
      } else {
        setWallet({
          currentOutstanding: 0,
          totalPaid: 0,
          totalCommission: 0,
          lastSettlementDate: null
        });
      }
    });

    // Listen to settlements
    const settlementsQuery = query(
      collection(db, "settlements"),
      where("businessId", "==", currentUser.uid)
    );
    const unsubSettlements = onSnapshot(settlementsQuery, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSettlements(items);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    // Listen to transactions
    const txQuery = query(
      collection(db, "transactions"),
      where("businessId", "==", currentUser.uid)
    );
    const unsubTx = onSnapshot(txQuery, (snap) => {
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubWallet();
      unsubSettlements();
      unsubTx();
    };
  }, [currentUser?.uid]);

  const allSettlements = settlements;
  const filteredSettlements = allSettlements.filter((item) => {
    if (statusFilter === "all") return true;
    return item.status === statusFilter;
  });

  // Calculate real dynamic metrics from Firestore
  const outstandingAmount = wallet?.currentOutstanding ?? allSettlements.filter(s => s.status === "pending").reduce((sum, s) => sum + Number(s.commissionAmount || 0), 0);
  const totalPaidSettlements = wallet?.totalPaid ?? allSettlements.filter(s => s.status === "paid").reduce((sum, s) => sum + Number(s.commissionAmount || 0), 0);
  const totalCommission = wallet?.totalCommission ?? allSettlements.reduce((sum, s) => sum + Number(s.commissionAmount || 0), 0);
  
  const totalJobAmount = allSettlements.reduce((sum, s) => sum + Number(s.jobAmount || 0), 0);
  const cashShiftsAmount = allSettlements.filter(s => s.paymentMode === "cash").reduce((sum, s) => sum + Number(s.jobAmount || 0), 0);
  const onlineShiftsAmount = allSettlements.filter(s => s.paymentMode === "online").reduce((sum, s) => sum + Number(s.jobAmount || 0), 0);
  
  const cashPct = totalJobAmount > 0 ? Math.round((cashShiftsAmount / totalJobAmount) * 100) : 0;
  const onlinePct = totalJobAmount > 0 ? Math.round((onlineShiftsAmount / totalJobAmount) * 100) : 0;

  const totalCashJobs = allSettlements.filter(s => s.paymentMode === "cash").length;
  const totalOnlineJobs = allSettlements.filter(s => s.paymentMode === "online").length;
  const pendingCount = allSettlements.filter(s => s.status === "pending").length;
  const totalCompletedJobs = allSettlements.length;

  const isWarningOver1k = outstandingAmount >= 1000;
  const isLockedOver5k = outstandingAmount >= 5000;

  // Execute Pay Now Checkout
  async function handleCompleteSettlement() {
    setIsProcessingPay(true);
    setError("");
    try {
      const batch = writeBatch(db);

      // Update wallet doc
      const walletRef = doc(db, "wallets", currentUser.uid);
      batch.set(walletRef, {
        businessId: currentUser.uid,
        currentOutstanding: 0,
        totalPaid: (wallet?.totalPaid || 0) + outstandingAmount,
        totalCommission: (wallet?.totalCommission || 0),
        lastSettlementDate: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Update pending settlements
      settlements.filter(s => s.status === "pending").forEach((s) => {
        batch.update(doc(db, "settlements", s.id), {
          status: "paid",
          paidAt: serverTimestamp()
        });
      });

      // Log transaction
      const txRef = doc(collection(db, "transactions"));
      batch.set(txRef, {
        businessId: currentUser.uid,
        amount: outstandingAmount,
        paymentMethod: selectedMethod,
        upiId: selectedMethod === "upi" ? upiId : "",
        status: "success",
        createdAt: serverTimestamp()
      });

      // Log notification
      const notifRef = doc(collection(db, "notifications"));
      batch.set(notifRef, {
        userId: currentUser.uid,
        title: "Settlement Completed",
        message: `₹${outstandingAmount} platform settlement paid successfully via ${selectedMethod.toUpperCase()}.`,
        isRead: false,
        createdAt: serverTimestamp()
      });

      await batch.commit();

      setNotice(`₹${outstandingAmount} settlement completed successfully!`);
      setIsPayModalOpen(false);
      setUpiId("");
    } catch (err) {
      setError(err.message || "Settlement payment failed.");
    } finally {
      setIsProcessingPay(false);
    }
  }

  // Invoice Generator
  function downloadInvoice(item) {
    const invoiceText = `
==================================================
           SHIFTLYIN SETTLEMENT INVOICE           
==================================================
Date: ${item.createdAt ? new Date(item.createdAt.seconds ? item.createdAt.seconds * 1000 : item.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
Settlement ID: ${item.id}
Job ID: ${item.jobId}
Business Name: ${profile?.businessName || profile?.name || "Business Merchant"}
Student Worker: ${item.studentName || "Verified Worker"}

Payment Details:
--------------------------------------------------
Payment Mode: ${item.paymentMode.toUpperCase()}
Job Amount Paid: ₹${item.jobAmount}
Platform Commission (10%): ₹${item.commissionAmount}
Settlement Status: ${item.status.toUpperCase()}
==================================================
Thank you for using Shiftlyin Platform Services.
`;
    const blob = new Blob([invoiceText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Shiftlyin_Invoice_${item.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="dashboard-layout owner-view" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <Sidebar role="business" />
      
      <section className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header" style={{ marginBottom: "24px" }}>
          <div>
            <span className="eyebrow" style={{ color: "var(--primary)" }}>Fintech Console</span>
            <h1 style={{ fontSize: "28px", fontWeight: "900", margin: "4px 0" }}>Business Wallet & Settlement</h1>
            <p style={{ color: "var(--muted)", margin: 0, fontSize: "14px" }}>
              Manage platform commissions, cash payment reconciliations, and instant settlements inspired by Uber & Stripe.
            </p>
          </div>
          <button 
            className="primary-button" 
            onClick={() => setIsPayModalOpen(true)}
            disabled={outstandingAmount === 0}
            style={{ background: outstandingAmount > 0 ? "var(--primary)" : "var(--muted)", minWidth: "140px" }}
          >
            💳 Pay Now (₹{outstandingAmount})
          </button>
        </div>

        {/* Banners & Warning Rules */}
        {notice && <div className="notice" style={{ marginBottom: "20px", background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" }}>{notice}</div>}
        {error && <div className="form-error" style={{ marginBottom: "20px" }}>{error}</div>}

        {isLockedOver5k && (
          <div style={{ background: "#fef2f2", border: "2px solid #ef4444", borderRadius: "12px", padding: "20px", marginBottom: "24px", color: "#991b1b" }}>
            <strong style={{ fontSize: "16px", display: "block", marginBottom: "4px" }}>🚨 Action Required: Job Posting Blocked</strong>
            <p style={{ margin: 0, fontSize: "14px" }}>
              Your outstanding settlement balance (<strong>₹{outstandingAmount}</strong>) exceeds ₹5,000. Job posting is locked until settlement is completed. Please click <strong>Pay Now</strong> to clear your pending balance.
            </p>
          </div>
        )}

        {isWarningOver1k && !isLockedOver5k && (
          <div style={{ background: "#fffbeb", border: "1px solid #f59e0b", borderRadius: "12px", padding: "16px", marginBottom: "24px", color: "#b45309", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "20px" }}>⚠️</span>
            <div>
              <strong style={{ fontSize: "14px", display: "block" }}>Warning: Outstanding Settlement Notice</strong>
              <span style={{ fontSize: "13px" }}>Your pending platform settlement is <strong>₹{outstandingAmount}</strong>. Please settle your balance soon to avoid posting restrictions.</span>
            </div>
          </div>
        )}

        {/* 8 Overview Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "30px" }}>
          <div className="metric-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "18px" }}>
            <span style={{ color: "var(--muted)", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Today's Earnings</span>
            <strong style={{ fontSize: "24px", color: "var(--text)", display: "block", marginTop: "4px" }}>₹3,400</strong>
          </div>
          <div className="metric-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "18px" }}>
            <span style={{ color: "var(--muted)", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Cash Jobs</span>
            <strong style={{ fontSize: "24px", color: "#f59e0b", display: "block", marginTop: "4px" }}>{totalCashJobs} Jobs</strong>
          </div>
          <div className="metric-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "18px" }}>
            <span style={{ color: "var(--muted)", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Online Jobs</span>
            <strong style={{ fontSize: "24px", color: "var(--primary)", display: "block", marginTop: "4px" }}>{totalOnlineJobs} Jobs</strong>
          </div>
          <div className="metric-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "18px" }}>
            <span style={{ color: "var(--muted)", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Pending Settlements</span>
            <strong style={{ fontSize: "24px", color: "#ef4444", display: "block", marginTop: "4px" }}>{pendingCount} Pending</strong>
          </div>
          <div className="metric-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "18px" }}>
            <span style={{ color: "var(--muted)", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Paid Settlements</span>
            <strong style={{ fontSize: "24px", color: "#10b981", display: "block", marginTop: "4px" }}>₹{totalPaidSettlements}</strong>
          </div>
          <div className="metric-card" style={{ background: "var(--surface)", border: "2px solid #ef4444", borderRadius: "12px", padding: "18px" }}>
            <span style={{ color: "#ef4444", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Outstanding Balance</span>
            <strong style={{ fontSize: "24px", color: "#ef4444", display: "block", marginTop: "4px" }}>₹{outstandingAmount}</strong>
          </div>
          <div className="metric-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "18px" }}>
            <span style={{ color: "var(--muted)", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Platform Commission</span>
            <strong style={{ fontSize: "24px", color: "var(--text)", display: "block", marginTop: "4px" }}>₹{totalCommission}</strong>
          </div>
          <div className="metric-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "18px" }}>
            <span style={{ color: "var(--muted)", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Total Completed</span>
            <strong style={{ fontSize: "24px", color: "var(--text)", display: "block", marginTop: "4px" }}>{totalCompletedJobs} Shifts</strong>
          </div>
        </div>

        {/* Uber/Rapido Highlighted Outstanding Settlement Card */}
        <section style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", color: "white", borderRadius: "16px", padding: "30px", marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", boxShadow: "var(--shadow)" }}>
          <div>
            <span style={{ fontSize: "12px", letterSpacing: "0.05em", textTransform: "uppercase", color: "#94a3b8", fontWeight: "700" }}>Cash Settlement Reconciliation (Uber Style)</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px", margin: "8px 0" }}>
              <h2 style={{ fontSize: "42px", fontWeight: "900", margin: 0, color: "white" }}>₹{outstandingAmount}</h2>
              <span style={{ background: outstandingAmount > 0 ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)", color: outstandingAmount > 0 ? "#fca5a5" : "#6ee7b7", border: `1px solid ${outstandingAmount > 0 ? "#ef4444" : "#10b981"}`, padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>
                {outstandingAmount > 0 ? "Pending Action" : "Fully Cleared ✓"}
              </span>
            </div>
            <p style={{ margin: 0, color: "#cbd5e1", fontSize: "14px" }}>
              Calculated 10% platform commission from cash shifts paid directly to student workers.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button 
              className="primary-button" 
              onClick={() => setIsPayModalOpen(true)}
              disabled={outstandingAmount === 0}
              style={{ background: outstandingAmount > 0 ? "var(--primary)" : "#475569", minWidth: "160px", fontSize: "14px", height: "46px" }}
            >
              Pay Now (₹{outstandingAmount})
            </button>
            <button 
              className="ghost-button" 
              onClick={() => document.getElementById("history-table")?.scrollIntoView({ behavior: "smooth" })}
              style={{ color: "white", borderColor: "#475569", height: "46px", fontSize: "14px" }}
            >
              View Settlement History
            </button>
          </div>
        </section>

        {/* Visual Cash Payment Workflow Diagram */}
        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", marginBottom: "30px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "16px", color: "var(--text)" }}>🔄 Cash Payment & Commission Workflow</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px", textAlign: "center" }}>
            {[
              { step: "1", title: "Job Completed", icon: "✅" },
              { step: "2", title: "Business Pays Cash", icon: "💵" },
              { step: "3", title: "Platform Records Commission", icon: "📊" },
              { step: "4", title: "Settlement Created", icon: "📄" },
              { step: "5", title: "Outstanding Updated", icon: "⚖️" },
              { step: "6", title: "Business Pays Platform", icon: "💳" },
              { step: "7", title: "Settlement Completed", icon: "🎉" }
            ].map((wf) => (
              <div key={wf.step} style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", borderRadius: "10px", padding: "12px 8px" }}>
                <span style={{ fontSize: "20px", display: "block", marginBottom: "4px" }}>{wf.icon}</span>
                <strong style={{ fontSize: "11px", color: "var(--muted)", display: "block", textTransform: "uppercase" }}>Step {wf.step}</strong>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text)", lineHeight: "1.2", display: "block", marginTop: "2px" }}>{wf.title}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Wallet Analytics Section */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "30px" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "16px" }}>Earnings & Commission Breakdown</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                  <span>Gross Shift Payments</span>
                  <strong>{formatCurrency(totalJobAmount)}</strong>
                </div>
                <div style={{ height: "8px", background: "var(--surface-soft)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: totalJobAmount > 0 ? "100%" : "0%", height: "100%", background: "var(--primary)" }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                  <span>Platform Commission (10%)</span>
                  <strong>{formatCurrency(totalCommission)}</strong>
                </div>
                <div style={{ height: "8px", background: "var(--surface-soft)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: totalJobAmount > 0 ? `${Math.min(100, Math.round((totalCommission / totalJobAmount) * 100))}%` : "0%", height: "100%", background: "#ef4444" }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "16px" }}>Cash vs Online Payment Split</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                  <span>Cash Shifts ({cashPct}%)</span>
                  <strong>{formatCurrency(cashShiftsAmount)}</strong>
                </div>
                <div style={{ height: "8px", background: "var(--surface-soft)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${cashPct}%`, height: "100%", background: "#f59e0b" }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                  <span>Online Shifts ({onlinePct}%)</span>
                  <strong>{formatCurrency(onlineShiftsAmount)}</strong>
                </div>
                <div style={{ height: "8px", background: "var(--surface-soft)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${onlinePct}%`, height: "100%", background: "#10b981" }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Settlement History Table */}
        <section id="history-table" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", margin: 0 }}>Settlement History & Invoices</h3>
              <p style={{ color: "var(--muted)", margin: 0, fontSize: "13px" }}>Recorded platform commissions and checkout invoices</p>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {["all", "pending", "paid"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={statusFilter === st ? "primary-button" : "ghost-button"}
                  style={{ textTransform: "capitalize", padding: "6px 12px", fontSize: "12px", minHeight: "32px" }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>
                  <th style={{ padding: "12px" }}>Date</th>
                  <th style={{ padding: "12px" }}>Job ID</th>
                  <th style={{ padding: "12px" }}>Student Name</th>
                  <th style={{ padding: "12px" }}>Payment Mode</th>
                  <th style={{ padding: "12px" }}>Job Amount</th>
                  <th style={{ padding: "12px" }}>Commission (10%)</th>
                  <th style={{ padding: "12px" }}>Status</th>
                  <th style={{ padding: "12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSettlements.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px" }}>
                      {item.createdAt ? new Date(item.createdAt.seconds ? item.createdAt.seconds * 1000 : item.createdAt).toLocaleDateString() : "Today"}
                    </td>
                    <td style={{ padding: "12px", fontWeight: "700" }}>{item.jobId}</td>
                    <td style={{ padding: "12px" }}>{item.studentName || "Verified Worker"}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ 
                        background: item.paymentMode === "cash" ? "#fff7ed" : "#ecfdf5", 
                        color: item.paymentMode === "cash" ? "#c2410c" : "#047857",
                        padding: "3px 8px", 
                        borderRadius: "6px", 
                        fontWeight: "700", 
                        fontSize: "11px" 
                      }}>
                        {item.paymentMode === "cash" ? "💵 Cash" : "💳 Online"}
                      </span>
                    </td>
                    <td style={{ padding: "12px", fontWeight: "700" }}>{formatCurrency(item.jobAmount)}</td>
                    <td style={{ padding: "12px", color: "var(--primary)", fontWeight: "700" }}>{formatCurrency(item.commissionAmount)}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ 
                        background: item.status === "paid" ? "#ecfdf5" : "#fef2f2", 
                        color: item.status === "paid" ? "#047857" : "#b91c1c",
                        padding: "3px 8px", 
                        borderRadius: "6px", 
                        fontWeight: "700", 
                        fontSize: "11px" 
                      }}>
                        {item.status === "paid" ? "Paid ✅" : "Pending ⏳"}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button 
                          className="ghost-button" 
                          onClick={() => downloadInvoice(item)}
                          style={{ padding: "4px 8px", fontSize: "11px", minHeight: "28px" }}
                        >
                          📄 Invoice
                        </button>
                        <button 
                          className="ghost-button" 
                          onClick={() => setSelectedSettlement(item)}
                          style={{ padding: "4px 8px", fontSize: "11px", minHeight: "28px" }}
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSettlements.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "36px", color: "var(--muted)", fontWeight: "600" }}>
                      No cash settlement records found. Platform commission records will automatically accumulate here when student cash shifts are completed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      {/* Interactive Checkout Pay Now Modal */}
      {isPayModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsPayModalOpen(false)}>
          <div className="admin-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
            <header className="admin-modal-header">
              <div>
                <span className="eyebrow" style={{ color: "var(--primary)" }}>Platform Settlement</span>
                <h2>Pay Outstanding Commission</h2>
              </div>
              <button className="admin-modal-close" onClick={() => setIsPayModalOpen(false)}>&times;</button>
            </header>

            <div className="admin-modal-body">
              <div style={{ background: "var(--surface-soft)", padding: "16px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "12px", color: "var(--muted)", textTransform: "uppercase", fontWeight: "700" }}>Total Outstanding</span>
                  <h3 style={{ fontSize: "28px", fontWeight: "900", margin: 0, color: "var(--text)" }}>₹{outstandingAmount}</h3>
                </div>
                <span style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" }}>Pending</span>
              </div>

              <span style={{ fontSize: "12px", fontWeight: "800", textTransform: "uppercase", color: "var(--muted)", display: "block", marginTop: "12px", marginBottom: "8px" }}>Select Payment Method</span>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {paymentMethods.map((pm) => (
                  <label 
                    key={pm.id}
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "space-between", 
                      padding: "12px 16px", 
                      border: `1px solid ${selectedMethod === pm.id ? "var(--primary)" : "var(--border)"}`, 
                      borderRadius: "10px", 
                      background: selectedMethod === pm.id ? "var(--surface-soft)" : "var(--surface)",
                      cursor: pm.disabled ? "not-allowed" : "pointer",
                      opacity: pm.disabled ? 0.5 : 1
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <input 
                        type="radio" 
                        name="payMethod" 
                        value={pm.id} 
                        checked={selectedMethod === pm.id} 
                        onChange={() => !pm.disabled && setSelectedMethod(pm.id)}
                        disabled={pm.disabled}
                      />
                      <span style={{ fontSize: "20px" }}>{pm.icon}</span>
                      <div>
                        <strong style={{ fontSize: "14px", display: "block" }}>{pm.name}</strong>
                        <span style={{ fontSize: "11px", color: "var(--muted)" }}>{pm.desc}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {selectedMethod === "upi" && (
                <div style={{ marginTop: "12px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Enter UPI ID (e.g. mobile@upi)</label>
                  <input 
                    type="text" 
                    placeholder="name@upi" 
                    value={upiId} 
                    onChange={(e) => setUpiId(e.target.value)} 
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }}
                  />
                </div>
              )}
            </div>

            <footer className="admin-modal-footer">
              <button className="ghost-button" onClick={() => setIsPayModalOpen(false)}>Cancel</button>
              <button 
                className="primary-button" 
                onClick={handleCompleteSettlement}
                disabled={isProcessingPay}
                style={{ minWidth: "160px" }}
              >
                {isProcessingPay ? "Processing..." : `Complete Payment (₹${outstandingAmount})`}
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedSettlement && (
        <div className="admin-modal-overlay" onClick={() => setSelectedSettlement(null)}>
          <div className="admin-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <header className="admin-modal-header">
              <div>
                <span className="eyebrow">Settlement Details</span>
                <h2>Job ID: {selectedSettlement.jobId}</h2>
              </div>
              <button className="admin-modal-close" onClick={() => setSelectedSettlement(null)}>&times;</button>
            </header>
            <div className="admin-modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                <div><span>Student Worker</span><strong style={{ display: "block" }}>{selectedSettlement.studentName || "Verified Worker"}</strong></div>
                <div><span>Payment Mode</span><strong style={{ display: "block", textTransform: "uppercase" }}>{selectedSettlement.paymentMode}</strong></div>
                <div><span>Job Amount</span><strong style={{ display: "block" }}>₹{selectedSettlement.jobAmount}</strong></div>
                <div><span>Platform Commission</span><strong style={{ display: "block", color: "var(--primary)" }}>₹{selectedSettlement.commissionAmount}</strong></div>
                <div><span>Status</span><strong style={{ display: "block" }}>{selectedSettlement.status}</strong></div>
              </div>
            </div>
            <footer className="admin-modal-footer">
              <button className="primary-button" onClick={() => setSelectedSettlement(null)}>Close</button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}
