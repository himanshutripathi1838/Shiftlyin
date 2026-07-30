import React from "react";
import ContributorsTable from "../../components/ui/ruixen-contributors-table.jsx";

export default function DemoTablePage() {
  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", paddingTop: "100px", paddingBottom: "60px" }}>
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <header style={{ marginBottom: "24px", textAlign: "center" }}>
          <span style={{ background: "rgba(37, 99, 235, 0.1)", color: "var(--primary)", padding: "4px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "800" }}>
            Admin Component Showcase
          </span>
          <h1 style={{ fontSize: "2.2rem", fontWeight: "900", color: "var(--text)", margin: "8px 0" }}>
            Project Repositories & Contributors Table
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "14px" }}>
            Live interactive Shadcn UI table component integrated into Shiftlyin Admin Panel.
          </p>
        </header>

        <ContributorsTable />
      </main>
    </div>
  );
}
