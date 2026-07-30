import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar.jsx";
import AdminStatsCard from "../../components/admin/AdminStatsCard.jsx";
import AdminTopbar from "../../components/admin/AdminTopbar.jsx";
import { getAdminProfile } from "../../services/admin.js";
import { auth, db } from "../../services/firebase.js";

export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [data, setData] = useState({
    students: [],
    businesses: [],
    jobs: [],
    reports: []
  });

  useEffect(() => {
    const currentAdmin = auth.currentUser;
    if (currentAdmin) {
      getAdminProfile(currentAdmin.uid).then((profile) => {
        setAdmin(profile || { email: currentAdmin.email });
      });
    }

    const unsubStudents = onSnapshot(collection(db, "students"), (snapshot) => {
      setData((current) => ({ ...current, students: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) }));
    });
    const unsubBusinesses = onSnapshot(collection(db, "businesses"), (snapshot) => {
      setData((current) => ({ ...current, businesses: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) }));
    });
    const unsubJobs = onSnapshot(collection(db, "jobs"), (snapshot) => {
      setData((current) => ({ ...current, jobs: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) }));
    });
    const unsubReports = onSnapshot(collection(db, "reports"), (snapshot) => {
      setData((current) => ({ ...current, reports: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) }));
    });

    return () => {
      unsubStudents();
      unsubBusinesses();
      unsubJobs();
      unsubReports();
    };
  }, []);

  return (
    <main className="admin-layout">
      <AdminSidebar />
      <section className="admin-main">
        <AdminTopbar
          title={`Welcome to Admin${admin?.name ? `, ${admin.name}` : ""}`}
          subtitle={admin?.email || "Monitor verification, jobs, reports, and platform health."}
        />
        <div className="admin-stats-grid">
          <AdminStatsCard label="Total Students" value={data.students.length} />
          <AdminStatsCard label="Verified Students" value={data.students.filter((item) => item.verificationStatus === "verified").length} tone="success" />
          <AdminStatsCard label="Pending Students" value={data.students.filter((item) => item.verificationStatus === "pending").length} tone="warning" />
          <AdminStatsCard label="Total Businesses" value={data.businesses.length} />
          <AdminStatsCard label="Pending Businesses" value={data.businesses.filter((item) => item.verificationStatus === "pending").length} tone="warning" />
          <AdminStatsCard label="Active Jobs" value={data.jobs.filter((item) => item.status === "active").length} tone="success" />
          <AdminStatsCard label="Urgent Jobs" value={data.jobs.filter((item) => item.urgentHiring || item.urgency === "urgent").length} tone="danger" />
          <AdminStatsCard label="Reports Pending" value={data.reports.filter((item) => item.status !== "resolved").length} tone="danger" />
        </div>
      </section>
    </main>
  );
}
