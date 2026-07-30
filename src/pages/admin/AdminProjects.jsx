import React from "react";
import AdminSidebar from "../../components/admin/AdminSidebar.jsx";
import AdminTopbar from "../../components/admin/AdminTopbar.jsx";
import ContributorsTable from "../../components/ui/ruixen-contributors-table.jsx";

export default function AdminProjects() {
  return (
    <main className="admin-layout">
      <AdminSidebar />
      <section className="admin-main">
        <AdminTopbar
          title="Project Repositories & Contributors"
          subtitle="Manage active repositories, team assignments, tech stack, and contributor metrics."
        />
        <div style={{ marginTop: "24px" }}>
          <ContributorsTable />
        </div>
      </section>
    </main>
  );
}
