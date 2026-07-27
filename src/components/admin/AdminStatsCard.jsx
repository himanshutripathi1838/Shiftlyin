export default function AdminStatsCard({ label, value, tone = "default" }) {
  return (
    <article className={`admin-stats-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
