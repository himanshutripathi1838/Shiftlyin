import React from "react";
import SeoHead from "../../components/seo/SeoHead.jsx";

export default function Terms() {
  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", paddingTop: "90px", paddingBottom: "60px" }}>
      <SeoHead
        title="Terms of Use | Shiftlyin Technologies"
        description="Shiftlyin Terms of Use outlining platform guidelines, student eligibility, business partner commitments, wallet settlements, and code of conduct."
        keywords="shiftlyin terms of use, platform terms, student shift rules, employer terms"
        canonical="/terms"
      />
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "0 20px" }}>
        <header style={{ marginBottom: "32px", textAlign: "center" }}>
          <h1 style={{ fontSize: "2.4rem", fontWeight: "900", color: "var(--text)" }}>Terms of Use</h1>
          <p style={{ color: "var(--muted)", fontSize: "14px" }}>Last updated: July 30, 2026</p>
        </header>

        <article style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "20px", padding: "36px", lineHeight: "1.7", color: "var(--text)" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "800", marginBottom: "12px", color: "var(--primary)" }}>1. Student Eligibility (18+ Mandatory)</h2>
          <p style={{ color: "var(--muted)", marginBottom: "20px" }}>
            All student accounts on Shiftlyin must be at least 18 years of age. Misrepresentation of age or identity credentials results in immediate account termination and reporting to appropriate authorities.
          </p>

          <h2 style={{ fontSize: "1.4rem", fontWeight: "800", marginBottom: "12px", color: "var(--primary)" }}>2. Employer Obligations</h2>
          <p style={{ color: "var(--muted)", marginBottom: "20px" }}>
            Business owners posting shift jobs must provide a safe, respectful working environment and honor pre-agreed hourly wages. Shift funds must be deposited into the Escrow Wallet prior to posting.
          </p>

          <h2 style={{ fontSize: "1.4rem", fontWeight: "800", marginBottom: "12px", color: "var(--primary)" }}>3. Attendance & Conduct</h2>
          <p style={{ color: "var(--muted)", marginBottom: "20px" }}>
            Students agree to arrive on time, perform duties diligently, and check in via GPS geofence. No-shows or fraudulent check-in attempts impact rating scores and may result in platform suspension.
          </p>

          <h2 style={{ fontSize: "1.4rem", fontWeight: "800", marginBottom: "12px", color: "var(--primary)" }}>4. Wallet & Settlements</h2>
          <p style={{ color: "var(--muted)" }}>
            Shift wages are held in escrow during active shift hours and released to the worker's wallet balance upon verified shift completion and employer confirmation.
          </p>
        </article>
      </main>
    </div>
  );
}
