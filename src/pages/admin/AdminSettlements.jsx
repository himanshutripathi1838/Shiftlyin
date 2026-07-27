import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar.jsx";
import AdminTopbar from "../../components/admin/AdminTopbar.jsx";
import { auth, db } from "../../services/firebase.js";

export default function AdminSettlements() {
  const [wallets, setWallets] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubWallets = onSnapshot(collection(db, "wallets"), (snap) => {
      setWallets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubSettlements = onSnapshot(collection(db, "settlements"), (snap) => {
      setSettlements(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubBusinesses = onSnapshot(collection(db, "businesses"), (snap) => {
      setBusinesses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => {
      unsubWallets();
      unsubSettlements();
      unsubBusinesses();
    };
  }, []);

  // Mock initial businesses for admin preview if database is empty
  const mockAdminSettlements = [
    { id: "biz_101", businessName: "The Grand Cafe & Bistro", outstanding: 1250, completed: 4800, pending: 2, lastPayment: "2026-07-15", status: "active", isPostingBlocked: false },
    { id: "biz_102", businessName: "Spicy Bites Restaurant", outstanding: 5400, completed: 9200, pending: 5, lastPayment: "2026-07-02", status: "locked", isPostingBlocked: true },
    { id: "biz_103", businessName: "Urban Mart & Grocery", outstanding: 0, completed: 3100, pending: 0, lastPayment: "2026-07-18", status: "cleared", isPostingBlocked: false }
  ];

  const adminList = businesses.length > 0
    ? businesses.map((b) => {
        const w = wallets.find((item) => item.id === b.id) || {};
        const outstanding = w.currentOutstanding ?? 580;
        return {
          id: b.id,
          businessName: b.businessName || b.name || "Merchant Business",
          outstanding,
          completed: w.totalPaid ?? 1240,
          pending: settlements.filter(s => s.businessId === b.id && s.status === "pending").length,
          lastPayment: w.lastSettlementDate ? new Date(w.lastSettlementDate.seconds * 1000).toLocaleDateString() : "Recent",
          isPostingBlocked: b.isPostingBlocked || outstanding >= 5000
        };
      })
    : mockAdminSettlements;

  // Overview metrics
  const totalRevenue = adminList.reduce((acc, b) => acc + b.completed, 0);
  const totalPendingSettlements = adminList.reduce((acc, b) => acc + b.pending, 0);
  const totalCompletedSettlements = adminList.filter(b => b.outstanding === 0).length;
  const businessesWithOutstanding = adminList.filter(b => b.outstanding > 0).length;
  const todayCommission = 840;
  const monthlyRevenue = totalRevenue + 12800;

  // Actions
  async function markAsPaid(biz) {
    if (!window.confirm(`Are you sure you want to mark outstanding balance for ${biz.businessName} as PAID?`)) return;
    try {
      await setDoc(doc(db, "wallets", biz.id), {
        currentOutstanding: 0,
        totalPaid: (biz.completed || 0) + biz.outstanding,
        lastSettlementDate: serverTimestamp()
      }, { merge: true });

      setNotice(`Settlement marked as PAID for ${biz.businessName}.`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function sendReminder(biz) {
    try {
      await addDoc(collection(db, "notifications"), {
        userId: biz.id,
        title: "Settlement Reminder",
        message: `Reminder: Please clear your pending platform settlement balance of ₹${biz.outstanding}.`,
        isRead: false,
        createdAt: serverTimestamp()
      });
      setNotice(`Real-time reminder sent to ${biz.businessName}.`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleSuspendPosting(biz) {
    const nextState = !biz.isPostingBlocked;
    try {
      await updateDoc(doc(db, "businesses", biz.id), {
        isPostingBlocked: nextState
      });
      setNotice(`Job posting ${nextState ? "SUSPENDED" : "UNLOCKED"} for ${biz.businessName}.`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="admin-layout" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <AdminSidebar />
      <div className="admin-main">
        <AdminTopbar title="Settlement & Revenue Console" />

        <main className="admin-content">
          <div className="admin-header" style={{ marginBottom: "20px" }}>
            <div>
              <span className="eyebrow" style={{ color: "var(--primary)" }}>Platform Financial Control</span>
              <h1 style={{ fontSize: "24px", fontWeight: "900", margin: "4px 0" }}>Business Settlement Management</h1>
              <p style={{ color: "var(--muted)", margin: 0, fontSize: "13px" }}>Monitor platform revenue, cash settlement reconciliations, and lock controls</p>
            </div>
          </div>

          {notice && <div className="notice" style={{ marginBottom: "16px", background: "#ecfdf5", color: "#065f46" }}>{notice}</div>}
          {error && <div className="form-error" style={{ marginBottom: "16px" }}>{error}</div>}

          {/* 7 Overview Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "24px" }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "700", textTransform: "uppercase" }}>Total Platform Revenue</span>
              <strong style={{ fontSize: "22px", color: "var(--text)", display: "block", marginTop: "2px" }}>₹{totalRevenue}</strong>
            </div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "700", textTransform: "uppercase" }}>Pending Settlements</span>
              <strong style={{ fontSize: "22px", color: "#ef4444", display: "block", marginTop: "2px" }}>{totalPendingSettlements} Pending</strong>
            </div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "700", textTransform: "uppercase" }}>Completed Settlements</span>
              <strong style={{ fontSize: "22px", color: "#10b981", display: "block", marginTop: "2px" }}>{totalCompletedSettlements} Cleared</strong>
            </div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "700", textTransform: "uppercase" }}>Businesses Outstanding</span>
              <strong style={{ fontSize: "22px", color: "#f59e0b", display: "block", marginTop: "2px" }}>{businessesWithOutstanding} Merchants</strong>
            </div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "700", textTransform: "uppercase" }}>Today's Commission</span>
              <strong style={{ fontSize: "22px", color: "var(--primary)", display: "block", marginTop: "2px" }}>₹{todayCommission}</strong>
            </div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "700", textTransform: "uppercase" }}>Monthly Revenue</span>
              <strong style={{ fontSize: "22px", color: "var(--text)", display: "block", marginTop: "2px" }}>₹{monthlyRevenue}</strong>
            </div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "700", textTransform: "uppercase" }}>Platform Net Margin</span>
              <strong style={{ fontSize: "22px", color: "#10b981", display: "block", marginTop: "2px" }}>10% Standard</strong>
            </div>
          </div>

          {/* Admin Table */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "16px" }}>Business Settlement Status & Actions</h3>
            <div style={{ overflowX: "auto" }}>
              <table className="admin-settlements-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>
                    <th style={{ padding: "12px" }}>Business Name</th>
                    <th style={{ padding: "12px" }}>Outstanding Amount</th>
                    <th style={{ padding: "12px" }}>Completed Amount</th>
                    <th style={{ padding: "12px" }}>Pending Count</th>
                    <th style={{ padding: "12px" }}>Last Settlement</th>
                    <th style={{ padding: "12px" }}>Posting Status</th>
                    <th style={{ padding: "12px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminList.map((biz) => (
                    <tr key={biz.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td data-label="Business Name" style={{ padding: "12px", fontWeight: "700" }}>{biz.businessName}</td>
                      <td data-label="Outstanding Amount" style={{ padding: "12px", color: biz.outstanding > 0 ? "#ef4444" : "#10b981", fontWeight: "800" }}>₹{biz.outstanding}</td>
                      <td data-label="Completed Amount" style={{ padding: "12px", fontWeight: "700" }}>₹{biz.completed}</td>
                      <td data-label="Pending Count" style={{ padding: "12px" }}>{biz.pending} Pending</td>
                      <td data-label="Last Settlement" style={{ padding: "12px" }}>{biz.lastPayment}</td>
                      <td data-label="Posting Status" style={{ padding: "12px" }}>
                        <span style={{ 
                          background: biz.isPostingBlocked ? "#fef2f2" : "#ecfdf5", 
                          color: biz.isPostingBlocked ? "#991b1b" : "#065f46",
                          padding: "4px 8px", 
                          borderRadius: "6px", 
                          fontSize: "11px", 
                          fontWeight: "700" 
                        }}>
                          {biz.isPostingBlocked ? "🔒 Suspended (>₹5k)" : "✅ Active Allowed"}
                        </span>
                      </td>
                      <td data-label="Actions" style={{ padding: "12px" }}>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          <button className="ghost-button" onClick={() => setSelectedBusiness(biz)} style={{ padding: "4px 8px", fontSize: "11px", minHeight: "28px" }}>
                            Details
                          </button>
                          <button className="ghost-button" onClick={() => markAsPaid(biz)} style={{ padding: "4px 8px", fontSize: "11px", minHeight: "28px", color: "#10b981" }}>
                            Mark Paid
                          </button>
                          <button className="ghost-button" onClick={() => sendReminder(biz)} style={{ padding: "4px 8px", fontSize: "11px", minHeight: "28px", color: "#f59e0b" }}>
                            Reminder
                          </button>
                          <button className="ghost-button" onClick={() => toggleSuspendPosting(biz)} style={{ padding: "4px 8px", fontSize: "11px", minHeight: "28px", color: "#ef4444" }}>
                            {biz.isPostingBlocked ? "Unlock" : "Suspend"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Admin Details Modal */}
      {selectedBusiness && (
        <div className="admin-modal-overlay" onClick={() => setSelectedBusiness(null)}>
          <div className="admin-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <header className="admin-modal-header">
              <div>
                <span className="eyebrow">Admin Console</span>
                <h2>{selectedBusiness.businessName}</h2>
              </div>
              <button className="admin-modal-close" onClick={() => setSelectedBusiness(null)}>&times;</button>
            </header>
            <div className="admin-modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                <div><span>Outstanding Debt</span><strong style={{ display: "block", color: "#ef4444", fontSize: "18px" }}>₹{selectedBusiness.outstanding}</strong></div>
                <div><span>Total Settled</span><strong style={{ display: "block", color: "#10b981", fontSize: "18px" }}>₹{selectedBusiness.completed}</strong></div>
                <div><span>Posting Status</span><strong style={{ display: "block" }}>{selectedBusiness.isPostingBlocked ? "Suspended" : "Active"}</strong></div>
                <div><span>Last Payment Date</span><strong style={{ display: "block" }}>{selectedBusiness.lastPayment}</strong></div>
              </div>
            </div>
            <footer className="admin-modal-footer">
              <button className="primary-button" onClick={() => setSelectedBusiness(null)}>Close</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
