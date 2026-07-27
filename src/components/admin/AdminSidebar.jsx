import logoImg from "../../assets/logo.png";
import { NavLink } from "react-router-dom";

const menu = [
  ["Overview", "/admin"],
  ["Student Verification", "/admin/students"],
  ["Business Verification", "/admin/businesses"],
  ["Job Management", "/admin/jobs"],
  ["Reports", "/admin/reports"],
  ["Settlements", "/admin/settlements"],
  ["Payments", "/admin/payments"],
  ["Settings", "/admin/settings"],
  ["Audit Logs", "/admin/audit-logs"]
];

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <img src={logoImg} alt="Shiftlyin Logo" style={{ width: "32px", height: "32px", objectFit: "contain", borderRadius: "5px" }} />
        <div>
          <strong>Shiftlyin</strong>
          <small>Admin Console</small>
        </div>
      </div>
      <nav>
        {menu.map(([label, to]) => (
          <NavLink key={label} to={to} end={to === "/admin"}>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
