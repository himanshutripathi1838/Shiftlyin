import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase.js";

export async function checkIfAdmin(uid) {
  if (!uid) return false;

  try {
    const adminSnapshot = await getDoc(doc(db, "admins", uid));
    return adminSnapshot.exists();
  } catch (error) {
    console.error("Admin access check failed:", error);
    return false;
  }
}

export async function getAdminProfile(uid) {
  if (!uid) return null;

  try {
    const adminSnapshot = await getDoc(doc(db, "admins", uid));
    return adminSnapshot.exists()
      ? { id: adminSnapshot.id, ...adminSnapshot.data() }
      : null;
  } catch (error) {
    console.error("Admin profile check failed:", error);
    return null;
  }
}
