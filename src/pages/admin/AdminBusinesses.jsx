import { collection, doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar.jsx";
import AdminTable from "../../components/admin/AdminTable.jsx";
import AdminTopbar from "../../components/admin/AdminTopbar.jsx";
import AdminReviewModal from "../../components/admin/AdminReviewModal.jsx";
import { auth, db } from "../../services/firebase.js";


async function logAction(actionType, targetId, message) {
  await setDoc(doc(collection(db, "auditLogs")), {
    adminId: auth.currentUser?.uid,
    actionType,
    targetCollection: "businesses",
    targetId,
    message,
    createdAt: serverTimestamp()
  });
}

export default function AdminBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    return onSnapshot(collection(db, "businesses"), (snapshot) => {
      setBusinesses(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });
  }, []);

  async function approve(business) {
    await updateDoc(doc(db, "businesses", business.id), {
      verificationStatus: "verified",
      isSuspended: false,
      verifiedAt: serverTimestamp()
    });
    await updateDoc(doc(db, "users", business.id), {
      verificationStatus: "verified",
      isBlocked: false
    });
    await logAction("APPROVE_BUSINESS", business.id, `Approved business ${business.businessName || business.email}`);
    setIsModalOpen(false);
  }

  async function reject(business) {
    const reason = window.prompt("Rejection reason");
    if (!reason) return;
    await updateDoc(doc(db, "businesses", business.id), {
      verificationStatus: "rejected",
      rejectionReason: reason,
      rejectedAt: serverTimestamp()
    });
    await updateDoc(doc(db, "users", business.id), {
      verificationStatus: "rejected"
    });
    await logAction("REJECT_BUSINESS", business.id, `Rejected business: ${reason}`);
    setIsModalOpen(false);
  }

  async function suspend(business) {
    const confirm = window.confirm("Are you sure you want to suspend this business?");
    if (!confirm) return;
    await updateDoc(doc(db, "businesses", business.id), {
      isSuspended: true,
      suspendedAt: serverTimestamp()
    });
    await updateDoc(doc(db, "users", business.id), {
      isBlocked: true
    });
    await logAction("SUSPEND_BUSINESS", business.id, `Suspended business ${business.businessName || business.email}`);
    setIsModalOpen(false);
  }

  function handleView(business) {
    setSelectedBusiness(business);
    setIsModalOpen(true);
  }


  const columns = [
    { key: "businessName", header: "Business Name" },
    { key: "ownerName", header: "Owner Name" },
    { key: "email", header: "Email" },
    { key: "mobile", header: "Mobile" },
    { key: "businessType", header: "Business Type" },
    { key: "address", header: "Address" },
    { key: "latitude", header: "Latitude" },
    { key: "longitude", header: "Longitude" },
    { key: "verificationStatus", header: "Verification Status", render: (row) => <span className={`admin-status ${row.verificationStatus || "pending"}`}>{row.verificationStatus || "pending"}</span> },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="admin-actions">
          <button onClick={() => handleView(row)}>View</button>
          <button onClick={() => approve(row)}>Approve</button>
          <button onClick={() => reject(row)}>Reject</button>
          <button className="danger" onClick={() => suspend(row)}>Suspend</button>
        </div>
      )
    }
  ];

  return (
    <main className="admin-layout">
      <AdminSidebar />
      <section className="admin-main">
        <AdminTopbar title="Business Verification" subtitle="Review business documents, locations, and owner details." />
        <AdminTable columns={columns} rows={businesses} />
        <AdminReviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={selectedBusiness}
          type="business"
          onApprove={approve}
          onReject={reject}
          onBlock={suspend}
        />
      </section>
    </main>
  );
}
