import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, getDocs, deleteDoc, runTransaction, collection, query, where, serverTimestamp } from "firebase/firestore";
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

console.log("🚀 Starting HUSTLR Part 4: Cancel Acceptance & Rollback Firestore Integration Tests...");

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const testJobId = `test_job_rollback_${Date.now()}`;
  const testAppId = `test_app_rollback_${Date.now()}`;
  const testChatId = `test_chat_rollback_${Date.now()}`;

  const jobDocRef = doc(db, "jobs", testJobId);
  const appDocRef = doc(db, "applications", testAppId);
  const chatDocRef = doc(db, "chats", testChatId);

  try {
    // 1. Setup mock data
    console.log("⚙️ Setting up: Creating mock Job, Application, and Chat docs...");
    
    // Create mock job that is currently "filled" (0 vacancies, 1 worker)
    await setDoc(jobDocRef, {
      title: "Test Gig",
      vacancies: 0,
      filledWorkers: 1,
      status: "filled",
      createdBy: "test_business_owner_123"
    });

    // Create mock accepted application
    await setDoc(appDocRef, {
      jobId: testJobId,
      studentId: "test_student_123",
      studentName: "Aman Sharma",
      businessId: "test_business_owner_123",
      status: "accepted"
    });

    // Create mock chat document
    await setDoc(chatDocRef, {
      jobId: testJobId,
      studentId: "test_student_123",
      businessId: "test_business_owner_123"
    });

    console.log("  - Mock documents created successfully.");

    // Verify initial state
    let jobSnap = await getDoc(jobDocRef);
    let appSnap = await getDoc(appDocRef);
    let chatSnap = await getDoc(chatDocRef);
    console.log(`  - Initial job status: "${jobSnap.data().status}" (vacancies: ${jobSnap.data().vacancies})`);
    console.log(`  - Initial application status: "${appSnap.data().status}"`);
    console.log(`  - Initial chat exists: ${chatSnap.exists()}`);

    // 2. Execution step: Cancel acceptance & Rollback transaction
    console.log("⚙️ Executing Cancel Acceptance Rollback transaction...");
    
    // Find the associated chat thread using queries (as done in Applications.jsx)
    const chatQuery = query(
      collection(db, "chats"),
      where("jobId", "==", testJobId),
      where("studentId", "==", "test_student_123")
    );
    const chatSnapshot = await getDocs(chatQuery);

    await runTransaction(db, async (transaction) => {
      const liveAppSnap = await transaction.get(appDocRef);
      const liveJobSnap = await transaction.get(jobDocRef);

      const jobData = liveJobSnap.data();
      const currentVacancies = Number(jobData?.vacancies || 0);
      const currentFilled = Number(jobData?.filledWorkers || 0);

      // Rollback vacancy/filled parameters
      const nextVacancies = currentVacancies + 1;
      const nextFilled = Math.max(0, currentFilled - 1);

      // Update app status back to rejected
      transaction.update(appDocRef, {
        status: "rejected",
        updatedAt: serverTimestamp()
      });

      // Update job parameters and reactivate
      transaction.update(jobDocRef, {
        vacancies: nextVacancies,
        filledWorkers: nextFilled,
        status: nextVacancies > 0 ? "active" : "filled",
        updatedAt: serverTimestamp()
      });

      // Delete the mock chat thread
      chatSnapshot.docs.forEach((docSnap) => {
        transaction.delete(docSnap.ref);
      });
    });

    await delay(1000); // Wait for transaction reflection

    // 3. Verification step: Assert rollback status updates
    console.log("⚙️ Verification: Querying database state after rollback transaction...");
    jobSnap = await getDoc(jobDocRef);
    appSnap = await getDoc(appDocRef);
    chatSnap = await getDoc(chatDocRef);

    const finalJobStatus = jobSnap.data().status;
    const finalVacancies = jobSnap.data().vacancies;
    const finalFilled = jobSnap.data().filledWorkers;
    const finalAppStatus = appSnap.data().status;

    console.log(`  - Final job status: "${finalJobStatus}" (vacancies: ${finalVacancies}, filled: ${finalFilled})`);
    console.log(`  - Final application status: "${finalAppStatus}"`);
    console.log(`  - Final chat exists: ${chatSnap.exists()}`);

    if (
      finalJobStatus === "active" &&
      finalVacancies === 1 &&
      finalFilled === 0 &&
      finalAppStatus === "rejected" &&
      !chatSnap.exists()
    ) {
      console.log("✅ Rollback successful! Vacancies incremented, chat deleted, and application set to rejected.");
    } else {
      console.error("❌ Rollback assertion failed.");
    }

  } catch (error) {
    console.error("❌ Part 4 rollback test failed:", error);
  } finally {
    // 4. Cleanup
    console.log("⚙️ Cleaning up: Deleting temporary test documents...");
    await deleteDoc(jobDocRef);
    await deleteDoc(appDocRef);
    await deleteDoc(chatDocRef);
    console.log("✅ Cleanup complete.");
    console.log("🎉 Part 4 tests completed!");
    process.exit(0);
  }
})();
