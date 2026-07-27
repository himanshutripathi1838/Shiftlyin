import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { checkIfAdmin } from "../services/admin.js";
import { auth } from "../services/firebase.js";

export default function AdminRoute({ children }) {
  const location = useLocation();
  const [state, setState] = useState({
    loading: true,
    authenticated: false,
    allowed: false
  });

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (active) {
          setState({ loading: false, authenticated: false, allowed: false });
        }
        return;
      }

      const allowed = await checkIfAdmin(user.uid);
      if (active) {
        setState({ loading: false, authenticated: true, allowed });
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  if (state.loading) {
    return (
      <main className="admin-loading" aria-live="polite">
        <div>Checking admin access...</div>
      </main>
    );
  }

  if (!state.authenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!state.allowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
