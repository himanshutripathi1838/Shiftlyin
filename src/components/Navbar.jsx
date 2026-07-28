import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

import logoImg from "../assets/logo.png";

export default function Navbar() {
  const { currentUser, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    // Close mobile menu on route change
    setIsMenuOpen(false);
  }, [location.pathname]);

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

  function handleAnchorClick(event, anchorId) {
    setIsMenuOpen(false);
    if (location.pathname === "/") {
      event.preventDefault();
      const element = document.getElementById(anchorId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  return (
    <header className="navbar" style={{ padding: "0.75rem 2rem" }}>
      <Link className="brand" to="/" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <img src={logoImg} alt="Shiftlyin Logo" style={{ width: "36px", height: "36px", objectFit: "contain", borderRadius: "6px" }} />
        <span>
          <strong style={{ color: "var(--text)" }}>Shiftlyin</strong>
          <small>Find Jobs. Fit Future.</small>
        </span>
      </Link>

      <button 
        type="button"
        className={`hamburger-btn ${isMenuOpen ? "open" : ""}`}
        onClick={() => setIsMenuOpen((prev) => !prev)}
        aria-label="Toggle navigation menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav className={`nav-actions ${isMenuOpen ? "is-active" : ""}`} style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <NavLink to="/help" style={{ color: "var(--muted)", fontWeight: "600", fontSize: "13px" }}>Help</NavLink>
        
        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginLeft: "12px" }}>
          <button 
            type="button" 
            onClick={() => setDarkMode(!darkMode)} 
            className="theme-toggle-btn"
            title="Toggle theme"
            style={{ fontSize: "16px", color: "var(--text)" }}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          {currentUser ? (
            <>
              <NavLink to={`/${profile?.role || "student"}`} className="primary-button" style={{ padding: "6px 12px", fontSize: "13px", minHeight: "36px" }}>Dashboard</NavLink>
              <button className="ghost-button" onClick={handleLogout} style={{ padding: "6px 12px", fontSize: "13px", minHeight: "36px" }}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" style={{ color: "var(--muted)", fontWeight: "600", fontSize: "14px" }}>Login</NavLink>
              <Link className="primary-button" to="/register" style={{ padding: "6px 12px", fontSize: "13px", minHeight: "36px" }}>Get Started</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
