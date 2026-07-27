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
    targetCollection: "students",
    targetId,
    message,
    createdAt: serverTimestamp()
  });
}

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    return onSnapshot(collection(db, "students"), (snapshot) => {
      setStudents(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });
  }, []);

  async function approve(student) {
    await updateDoc(doc(db, "students", student.id), {
      verificationStatus: "verified",
      isBlocked: false,
      verifiedAt: serverTimestamp()
    });
    await updateDoc(doc(db, "users", student.id), {
      verificationStatus: "verified",
      isBlocked: false
    });
    await logAction("APPROVE_STUDENT", student.id, `Approved student ${student.name || student.email}`);
    setIsModalOpen(false);
  }

  async function reject(student) {
    const reason = window.prompt("Rejection reason");
    if (!reason) return;
    await updateDoc(doc(db, "students", student.id), {
      verificationStatus: "rejected",
      rejectionReason: reason,
      rejectedAt: serverTimestamp()
    });
    await updateDoc(doc(db, "users", student.id), {
      verificationStatus: "rejected"
    });
    await logAction("REJECT_STUDENT", student.id, `Rejected student: ${reason}`);
    setIsModalOpen(false);
  }

  async function block(student) {
    const confirm = window.confirm("Are you sure you want to block this student?");
    if (!confirm) return;
    await updateDoc(doc(db, "students", student.id), {
      isBlocked: true,
      blockedAt: serverTimestamp()
    });
    await updateDoc(doc(db, "users", student.id), {
      isBlocked: true
    });
    await logAction("BLOCK_STUDENT", student.id, `Blocked student ${student.name || student.email}`);
    setIsModalOpen(false);
  }

  function handleView(student) {
    setSelectedStudent(student);
    setIsModalOpen(true);
  }


  const columns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "mobile", header: "Mobile" },
    { key: "dob", header: "DOB" },
    { key: "collegeName", header: "College Name" },
    { key: "verificationStatus", header: "Verification Status", render: (row) => <StatusBadge status={row.verificationStatus} /> },
    { key: "rating", header: "Rating" },
    { key: "reputationScore", header: "Reputation Score" },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="admin-actions">
          <button onClick={() => handleView(row)}>View</button>
          <button onClick={() => approve(row)}>Approve</button>
          <button onClick={() => reject(row)}>Reject</button>
          <button className="danger" onClick={() => block(row)}>Block</button>
        </div>
      )
    }
  ];

  return (
    <main className="admin-layout">
      <AdminSidebar />
      <section className="admin-main">
        <AdminTopbar title="Student Verification" subtitle="Approve, reject, or block student profiles." />
        <AdminTable columns={columns} rows={students} />
        <AdminReviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={selectedStudent}
          type="student"
          onApprove={approve}
          onReject={reject}
          onBlock={block}
        />
      </section>
    </main>
  );
}

function StatusBadge({ status = "pending" }) {
  return <span className={`admin-status ${status}`}>{status}</span>;
}
