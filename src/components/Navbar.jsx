import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import sLogoImg from "../assets/shiftlyin-s-logo.png";

export default function Navbar() {
  const { currentUser, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => { setIsMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  function scrollTo(e, id) {
    setIsMenuOpen(false);
    if (location.pathname === "/") {
      e.preventDefault();
      if (id === "top") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }

  const NAV_LINKS = [
    { label: "Home", id: "top", href: "/" },
    { label: "Jobs", id: "jobs", href: "/#jobs" },
    { label: "Businesses", id: "trusted", href: "/#trusted" },
    { label: "About Us", id: "why-choose", href: "/#why-choose" },
    { label: "How It Works", id: "how-it-works", href: "/#how-it-works" },
    { label: "Contact", id: "contact", href: "/#contact" },
    { label: "FAQ", id: "faq", href: "/#faq" },
  ];

  return (
    <header className="navbar">
      <Link className="brand" to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
        <img
          src={sLogoImg}
          alt="Shiftlyin S Logo"
          style={{ width: "36px", height: "36px", objectFit: "contain", borderRadius: "8px", flexShrink: 0 }}
        />
        <strong style={{ color: "var(--text)", fontSize: "1.05rem", letterSpacing: "0.04em" }}>SHIFTLYIN</strong>
      </Link>

      <button
        type="button"
        className={`hamburger-btn ${isMenuOpen ? "open" : ""}`}
        onClick={() => setIsMenuOpen(p => !p)}
        aria-label="Toggle navigation menu"
      >
        <span></span><span></span><span></span>
      </button>

      <nav className={`nav-actions ${isMenuOpen ? "is-active" : ""}`}>
        <div className="nav-links-wrap" style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "nowrap" }}>
          {NAV_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              onClick={e => scrollTo(e, link.id)}
              style={{ color: "var(--muted)", fontWeight: 600, fontSize: "0.84rem", textDecoration: "none", whiteSpace: "nowrap" }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="nav-buttons-wrap" style={{ display: "flex", gap: "10px", alignItems: "center", marginLeft: "12px", flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="theme-toggle-btn"
            title="Toggle theme"
            style={{ fontSize: "16px", color: "var(--text)", background: "none", border: "none", cursor: "pointer" }}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          {currentUser ? (
            <>
              <NavLink
                to={`/${profile?.role || "student"}`}
                style={{
                  padding: "7px 16px", fontSize: "0.82rem", fontWeight: 700,
                  borderRadius: "8px", background: "var(--primary)", color: "#fff",
                  textDecoration: "none", minHeight: "36px", display: "inline-flex", alignItems: "center", whiteSpace: "nowrap"
                }}
              >Dashboard</NavLink>
              <button
                onClick={handleLogout}
                style={{
                  padding: "7px 16px", fontSize: "0.82rem", fontWeight: 700,
                  borderRadius: "8px", background: "transparent", color: "var(--text)",
                  border: "1.5px solid var(--border)", cursor: "pointer", minHeight: "36px", whiteSpace: "nowrap"
                }}
              >Logout</button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                style={{
                  padding: "7px 16px", fontSize: "0.82rem", fontWeight: 700,
                  borderRadius: "8px", color: "var(--text)", textDecoration: "none",
                  border: "1.5px solid var(--border)", minHeight: "36px",
                  display: "inline-flex", alignItems: "center", whiteSpace: "nowrap"
                }}
              >Login</NavLink>
              <Link
                to="/register"
                style={{
                  padding: "7px 16px", fontSize: "0.82rem", fontWeight: 700,
                  borderRadius: "8px", background: "#2563eb", color: "#fff",
                  textDecoration: "none", minHeight: "36px",
                  display: "inline-flex", alignItems: "center", whiteSpace: "nowrap"
                }}
              >Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
