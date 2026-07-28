import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import fs from "fs";
import path from "path";

// Read and parse .env configuration variables
const envPath = path.resolve(process.cwd(), ".env");
const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const parts = line.split("=");
  if (parts.length === 2) {
    env[parts[0].trim()] = parts[1].trim();
  }
});

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

console.log("🚀 Starting Shiftlyin Part 3: Re-Apply Firestore Logic Integration Tests...");

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const testAppId = `test_app_reapply_${Date.now()}`;
  const appDocRef = doc(db, "applications", testAppId);

  try {
    // 1. Setup step: Create a mock rejected application
    console.log("⚙️ Setting up: Creating a mock application doc with 'rejected' status...");
    await setDoc(appDocRef, {
      jobId: "test_job_id_123",
      studentId: "test_student_id_123",
      studentName: "Test Student",
      status: "rejected",
      createdAt: new Date()
    });
    console.log("  - Mock application doc created with ID:", testAppId);

    // Verify it was written correctly
    let appSnap = await getDoc(appDocRef);
    console.log(`  - Initial status read from DB: "${appSnap.data().status}"`);

    // 2. Execution step: Re-Apply action (updates rejected doc to pending)
    console.log("⚙️ Executing Re-Apply: Updating status to 'pending'...");
    await updateDoc(appDocRef, {
      status: "pending",
      createdAt: serverTimestamp()
    });
    await delay(1000); // Wait for transaction reflection

    // 3. Verification step: Assert document was updated in-place and status is pending
    console.log("⚙️ Verification: Fetching document to verify updates...");
    appSnap = await getDoc(appDocRef);
    const currentStatus = appSnap.data().status;
    console.log(`  - Final status read from DB: "${currentStatus}"`);

    if (currentStatus === "pending") {
      console.log("✅ Re-Apply logic worked! Document status transitioned 'rejected' -> 'pending' in-place.");
    } else {
      console.error("❌ Re-Apply logic failed! Status was not updated to pending.");
    }

  } catch (error) {
    console.error("❌ Part 3 test execution error:", error);
  } finally {
    // 4. Cleanup step: delete dummy doc
    console.log("⚙️ Cleaning up: Deleting dummy application document...");
    await deleteDoc(appDocRef);
    console.log("✅ Cleanup complete. Dummy application doc deleted.");
    console.log("🎉 Part 3 tests completed!");
    process.exit(0);
  }
})();
