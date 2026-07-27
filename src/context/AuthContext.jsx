import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth, db } from "../services/firebase.js";

const AuthContext = createContext(null);

async function findUserProfile(uid) {
  const snapshot = await getDoc(doc(db, "users", uid));
  if (snapshot.exists()) {
    const userData = snapshot.data();
    const roleCollectionName = userData.role === "business" ? "businesses" : "students";
    const roleSnapshot = await getDoc(doc(db, roleCollectionName, uid));
    const roleData = roleSnapshot.exists() ? roleSnapshot.data() : {};

    return {
      id: snapshot.id,
      collectionName: "users",
      roleCollectionName,
      ...userData,
      ...roleData,
      role: userData.role,
      phone: userData.phone || roleData.mobile || ""
    };
  }

  return null;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        let profileData = null;
        for (let i = 0; i < 4; i++) {
          try {
            profileData = await findUserProfile(user.uid);
            break;
          } catch (err) {
            if ((err.code === "permission-denied" || err.message?.includes("permission")) && i < 3) {
              console.warn(`Firestore read permission-denied in AuthStateChange, retrying in 250ms... (Attempt ${i + 1}/4)`);
              await new Promise((resolve) => setTimeout(resolve, 250));
            } else {
              console.error("Failed to load profile in AuthStateChange:", err);
              break;
            }
          }
        }
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      profile,
      loading,
      logout: () => signOut(auth),
      refreshProfile: async () => currentUser && setProfile(await findUserProfile(currentUser.uid))
    }),
    [currentUser, loading, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
