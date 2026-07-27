export default function ApplicationCard({ application, onAccept, onReject, onCancel }) {
  const isPending = application.status === "pending";
  const isAccepted = application.status === "accepted";
  const isRejected = application.status === "rejected";

  const statusBg = isAccepted ? "#ecfdf5" : isPending ? "#fffbeb" : "#fef2f2";
  const statusColor = isAccepted ? "#059669" : isPending ? "#d97706" : "#dc2626";
  const statusBorder = isAccepted ? "#a7f3d0" : isPending ? "#fde68a" : "#fca5a5";

  return (
    <article 
      className="application-card" 
      style={{ 
        background: "var(--surface)", 
        border: "1px solid var(--border)", 
        borderRadius: "16px", 
        padding: "20px 24px", 
        marginBottom: "14px", 
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px"
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span 
            className="status-pill"
            style={{
              background: statusBg,
              color: statusColor,
              border: `1px solid ${statusBorder}`,
              borderRadius: "20px",
              padding: "3px 12px",
              fontSize: "11px",
              fontWeight: "800",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}
          >
            {application.status}
          </span>
          {application.salary && (
            <span style={{ fontSize: "12px", background: "var(--surface-soft)", color: "var(--primary)", fontWeight: "800", padding: "3px 10px", borderRadius: "14px" }}>
              💰 {application.salary}
            </span>
          )}
        </div>
        <h3 style={{ fontSize: "18px", fontWeight: "900", color: "var(--text)", margin: "4px 0" }}>{application.jobTitle || "Job Application"}</h3>
        <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>
          👤 Candidate: <strong style={{ color: "var(--text)" }}>{application.studentName || "Student"}</strong> | Store: <strong style={{ color: "var(--text)" }}>{application.businessName || "Business"}</strong>
        </p>
      </div>

      {(onAccept || onReject) && isPending && (
        <div className="card-actions" style={{ display: "flex", gap: "10px" }}>
          <button className="ghost-button danger" onClick={() => onReject(application)} style={{ borderRadius: "10px", padding: "8px 16px", fontWeight: "700" }}>Reject</button>
          <button className="primary-button" onClick={() => onAccept(application)} style={{ borderRadius: "10px", padding: "8px 18px", fontWeight: "800", background: "var(--accent)", borderColor: "var(--accent)" }}>Accept Applicant</button>
        </div>
      )}
      {onCancel && isAccepted && (
        <div className="card-actions">
          <button className="ghost-button danger" onClick={() => onCancel(application)} style={{ borderRadius: "10px", padding: "8px 16px", fontWeight: "700" }}>Cancel Acceptance</button>
        </div>
      )}
    </article>
  );
}
