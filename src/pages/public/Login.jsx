import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatedSignIn } from "../../components/ui/animated-sign-in.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { checkIfAdmin } from "../../services/admin.js";
import { auth, db } from "../../services/firebase.js";

async function getRole(uid) {
  for (let i = 0; i < 4; i++) {
    try {
      const snapshot = await getDoc(doc(db, "users", uid));
      if (snapshot.exists()) {
        const role = snapshot.data().role;
        if (role === "student" || role === "business") {
          return role;
        }
      }

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

  return (
    <AnimatedSignIn
      title="Welcome to Shiftlyin"
      subtitle="Sign in to your student, business, or admin workspace"
    >
      <form className="asi-login-form" onSubmit={handleSubmit}>
        {error && <p className="form-error" style={{ color: "#ef4444", fontSize: "0.85rem", margin: 0, padding: "8px 12px", background: "rgba(239,68,68,0.1)", borderRadius: "8px" }} role="alert">{error}</p>}

        <div className={`asi-form-field ${form.email ? "active" : ""}`}>
          <input
            type="email"
            id="asi-login-email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value.trim() })}
          />
          <label htmlFor="asi-login-email">Email Address</label>
        </div>

        <div className={`asi-form-field ${form.password ? "active" : ""}`}>
          <input
            type={showPassword ? "text" : "password"}
            id="asi-login-password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <label htmlFor="asi-login-password">Password</label>
          <button
            type="button"
            className="asi-toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <div className="asi-form-options">
          <label className="asi-remember-me">
            <input type="checkbox" defaultChecked />
            Remember me
          </label>
          <a href="#" className="asi-forgot-password">
            Forgot Password?
          </a>
        </div>

        <button type="submit" className="asi-login-button" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="asi-signup-prompt" style={{ marginTop: "1.5rem" }}>
          New to Shiftlyin? <Link to="/register" style={{ color: "#2563eb", fontWeight: "700" }}>Create an account</Link>
        </p>
      </form>
    </AnimatedSignIn>
  );
}
