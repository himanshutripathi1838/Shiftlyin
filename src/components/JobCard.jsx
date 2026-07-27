import { Link } from "react-router-dom";
import { formatDistance } from "../utils/distance.js";
import { formatDateTime } from "../utils/dateTime.js";

export default function JobCard({ job, distance, onApply, compact = false, applied = false }) {
  const vacancies = Number(job.vacancies ?? job.requiredWorkers ?? 0);
  const remaining = Math.max(vacancies - Number(job.filledWorkers || 0), 0);
  const isUrgent = job.urgency === "urgent" || job.urgentHiring;
  const shiftEnd = formatDateTime(job.shiftEndsAt);
  const status = job.displayStatus || job.status || "active";
  const isExpired = status === "expired";

  return (
    <article className={`job-card ${compact ? "compact" : ""} ${isExpired ? "expired-card" : ""}`}>
      <div className="card-topline">
        <span className={`status-pill ${isExpired ? "expired" : isUrgent ? "urgent" : ""}`}>
          {isExpired ? "Session expired" : isUrgent ? "Urgent" : status}
        </span>
        <span>{job.location || formatDistance(distance)}</span>
      </div>
      <div className="job-card-title">
        <span className="job-business-mark" aria-hidden="true">
          {(job.businessName || job.title || "H").charAt(0).toUpperCase()}
        </span>
        <div>
          <h3>{job.title}</h3>
          <span>{job.businessName || "HUSTLR partner"}</span>
        </div>
      </div>
      <p>{job.description}</p>
      <div className="job-meta">
        <span>{job.salary}</span>
        <span>{remaining || vacancies} vacancies</span>
        {shiftEnd && <span>Ends {shiftEnd}</span>}
      </div>
      <div className="card-actions">
        <Link className="ghost-button" to={`/jobs/${job.id}`}>Details</Link>
        {onApply && !isExpired && (
          <button className="primary-button" onClick={() => onApply(job)} disabled={applied}>
            {applied ? "Applied" : "Apply"}
          </button>
        )}
      </div>
    </article>
  );
}
