import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <main className="page-shell">
      <section className="panel unauthorized-panel">
        <span className="eyebrow">Access denied</span>
        <h1>Admin access required</h1>
        <p>This account is not registered in the Firestore admins collection.</p>
        <Link className="primary-button" to="/">Return to Shiftlyin</Link>
      </section>
    </main>
  );
}
