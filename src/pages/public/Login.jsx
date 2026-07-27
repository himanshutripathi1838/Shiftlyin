import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroImage from "../../assets/hustlr-cafe-hero.png";
import { useAuth } from "../../context/AuthContext.jsx";
import { checkIfAdmin } from "../../services/admin.js";
import { auth, db } from "../../services/firebase.js";

async function getRole(uid) {
  for (let i = 0; i < 4; i++) {
    try {
      // 1. Try to read from the users collection first (covers 99.9% of user logins)
      const snapshot = await getDoc(doc(db, "users", uid));
      if (snapshot.exists()) {
        const role = snapshot.data().role;
        if (role === "student" || role === "business") {
          return role;
        }
      }

      // 2. If user document does not exist, check if they are in the admins collection
      const isAdmin = await checkIfAdmin(uid);
      if (isAdmin) return "admin";

      return null;
    } catch (err) {
      if ((err.code === "permission-denied" || err.message?.includes("permission")) && i < 3) {
        console.warn(`Firestore read permission-denied in getRole, retrying in 250ms... (Attempt ${i + 1}/4)`);
        await new Promise((resolve) => setTimeout(resolve, 250));
      } else {
        throw err;
      }
    }
  }
  return null;
}

function getLoginErrorMessage(error) {
  if (!error) return "Login failed. Please check your email, password, and Firebase configuration.";
  
  const details = ` (Error: ${error.code || error.message || "Unknown"})`;
  
  if (error.code && !error.code.startsWith("auth/")) {
    return `Database/Firestore Error: ${error.message || "Permission Denied"}${details}`;
  }

  switch (error.code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password. Verify the user exists in Firebase Authentication and the password is correct.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many failed login attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network request failed. Please check your internet connection.";
    default:
      return `Login failed. Check email, password, and Firebase configuration.${details}`;
  }
}

export default function Login() {
  const { currentUser, profile, loading: authLoading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || !currentUser) return;
    if (profile?.role) navigate(`/${profile.role}`, { replace: true });
  }, [authLoading, currentUser, navigate, profile?.role]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, form.email, form.password);
      const role = await getRole(credential.user.uid);
      if (!role) {
        setError("User profile was not found in Firestore.");
        return;
      }
      navigate(`/${role}`);
    } catch (err) {
      setError(getLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function handlePointerMove(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    setSpotlight({
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100
    });
  }

  return (
    <main
      className="auth-page login-page"
      onPointerMove={handlePointerMove}
      style={{
        backgroundImage: `url(${heroImage})`,
        "--spotlight-x": `${spotlight.x}%`,
        "--spotlight-y": `${spotlight.y}%`
      }}
    >
      <section className="login-shell">
        <div className="login-form-panel">
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-heading">
              <span className="eyebrow">Welcome back</span>
              <h1>Sign in to Shiftlyin</h1>
              <p>Continue to your student, restaurant owner, or admin workspace.</p>
            </div>

            {error && <p className="form-error" role="alert">{error}</p>}

            <div className="login-fields">
              <label>
                Email address
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value.trim() })}
                />
              </label>
              <label>
                Password
                <span className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    required
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </span>
              </label>
            </div>

            <button className="primary-button full-width login-submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <p className="auth-footer">
              New to Shiftlyin? <Link to="/register">Create an account</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
