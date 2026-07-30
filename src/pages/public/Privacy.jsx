import React from "react";
import SeoHead from "../../components/seo/SeoHead.jsx";

export default function Privacy() {
  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", paddingTop: "90px", paddingBottom: "60px" }}>
      <SeoHead
        title="Privacy Policy | Shiftlyin Technologies"
        description="Shiftlyin Privacy Policy detailing how we collect, store, encrypt, and process student and employer data, identity credentials, and GPS locations."
        keywords="shiftlyin privacy policy, data security, student identity privacy, gps location privacy"
        canonical="/privacy"
      />
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "0 20px" }}>
        <header style={{ marginBottom: "32px", textAlign: "center" }}>
          <h1 style={{ fontSize: "2.4rem", fontWeight: "900", color: "var(--text)" }}>Privacy Policy</h1>
          <p style={{ color: "var(--muted)", fontSize: "14px" }}>Last updated: July 30, 2026</p>
        </header>

        <article style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "20px", padding: "36px", lineHeight: "1.7", color: "var(--text)" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "800", marginBottom: "12px", color: "var(--primary)" }}>1. Information We Collect</h2>
          <p style={{ color: "var(--muted)", marginBottom: "20px" }}>
            Shiftlyin collects necessary personal details to operate our verified shift job matching platform. This includes full name, date of birth, contact email, phone number, government identity proof (Aadhaar, PAN, Driving License, Voter ID), college ID credentials, and workplace GPS check-in coordinates.
          </p>

          <h2 style={{ fontSize: "1.4rem", fontWeight: "800", marginBottom: "12px", color: "var(--primary)" }}>2. Use of GPS Location Data</h2>
          <p style={{ color: "var(--muted)", marginBottom: "20px" }}>
            GPS location is used exclusively during shift check-in and check-out to verify physical presence within the employer's workplace geofence radius. We do not continuously track users outside of active shift verification windows.
          </p>

          <h2 style={{ fontSize: "1.4rem", fontWeight: "800", marginBottom: "12px", color: "var(--primary)" }}>3. Data Protection & Encryption</h2>
          <p style={{ color: "var(--muted)", marginBottom: "20px" }}>
            All identity credentials and documents are stored securely using industry-standard encryption protocols. Document uploads are restricted solely to compliance administration personnel for age and identity verification.
          </p>

          <h2 style={{ fontSize: "1.4rem", fontWeight: "800", marginBottom: "12px", color: "var(--primary)" }}>4. Contact Us</h2>
          <p style={{ color: "var(--muted)" }}>
            If you have questions regarding this Privacy Policy, please contact our privacy compliance officer at <strong>privacy@shiftlyin.com</strong>.
          </p>
        </article>
      </main>
    </div>
  );
}
