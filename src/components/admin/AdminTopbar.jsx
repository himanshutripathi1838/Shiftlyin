import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../services/firebase.js";

export default function AdminTopbar({ title, subtitle }) {
  const navigate = useNavigate();

  async function logout() {
    await signOut(auth);
    navigate("/login");
  }

  return (
    <header className="admin-topbar">
      <div>
        <span className="admin-kicker">Secure admin area</span>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <button className="admin-button secondary" onClick={logout}>Logout</button>
    </header>
  );
}
