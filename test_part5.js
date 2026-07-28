import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, writeBatch, collection, query, where, serverTimestamp } from "firebase/firestore";
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

console.log("🚀 Starting Shiftlyin Part 5: Chat Badges & Seen Receipts Integration Tests...");

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const testChatId = `test_chat_badge_${Date.now()}`;
  const chatDocRef = doc(db, "chats", testChatId);
  const msgCollRef = collection(db, "chats", testChatId, "messages");

  try {
    // 1. Setup mock chat and unread messages
    console.log("⚙️ Setting up: Creating mock Chat room and message subcollection...");
    
    await setDoc(chatDocRef, {
      studentId: "student_A",
      businessId: "business_B",
      jobId: "test_job_123"
    });

    // Create unread messages sent by Business B to Student A
    const msg1Ref = doc(msgCollRef, "msg_1");
    const msg2Ref = doc(msgCollRef, "msg_2");
    // Create read message sent by Student A to Business B
    const msg3Ref = doc(msgCollRef, "msg_3");

    await setDoc(msg1Ref, {
      senderId: "business_B",
      receiverId: "student_A",
      message: "Hey Aman, are you on your way?",
      isRead: false,
      createdAt: new Date(Date.now() - 5000)
    });

    await setDoc(msg2Ref, {
      senderId: "business_B",
      receiverId: "student_A",
      message: "Please share your location.",
      isRead: false,
      createdAt: new Date(Date.now() - 3000)
    });

    await setDoc(msg3Ref, {
      senderId: "student_A",
      receiverId: "business_B",
      message: "Yes, I am close by.",
      isRead: true,
      createdAt: new Date(Date.now() - 1000)
    });

    console.log("  - Mock Chat room and 3 messages created successfully.");

    // 2. Verification Step 1: Query unread counts for Student A
    console.log("🔍 Checking unread counts for Student A (before opening chat)...");
    const unreadQuery = query(
      msgCollRef,
      where("isRead", "==", false),
      where("senderId", "==", "business_B")
    );
    let unreadSnapshot = await getDocs(unreadQuery);
    const initialUnreadCount = unreadSnapshot.size;
    console.log(`  - Student A's unread badge count: ${initialUnreadCount}`);

    if (initialUnreadCount === 2) {
      console.log("✅ Badge test passed: Correctly calculated 2 unread messages!");
    } else {
      console.error(`❌ Badge test failed: Expected 2, got ${initialUnreadCount}`);
    }

    // 3. Execution Step: Open chat as Student A (marks all received as read)
    console.log("⚙️ Executing Mark-As-Read: Student A opens the chat window...");
    const batch = writeBatch(db);
    unreadSnapshot.docs.forEach((docSnap) => {
      batch.update(docSnap.ref, { isRead: true });
    });
    await batch.commit();
    await delay(1000); // Wait for database updates

    // 4. Verification Step 2: Query unread counts and check "Seen" status
    console.log("🔍 Verifying unread counts and Seen status (after opening chat)...");
    unreadSnapshot = await getDocs(unreadQuery);
    const finalUnreadCount = unreadSnapshot.size;
    console.log(`  - Student A's unread badge count: ${finalUnreadCount}`);

    // Check last message sent by Business B
    const lastMsgSnap = await getDoc(msg2Ref);
    const lastMsgReadStatus = lastMsgSnap.data().isRead;
    console.log(`  - Business B's last message isRead status: ${lastMsgReadStatus}`);

    if (finalUnreadCount === 0 && lastMsgReadStatus === true) {
      console.log("✅ Auto Mark-As-Read passed: Badge cleared and Seen receipt triggered!");
    } else {
      console.error("❌ Auto Mark-As-Read or Seen status check failed.");
    }

  } catch (error) {
    console.error("❌ Part 5 test execution failed with error:", error);
  } finally {
    // 5. Cleanup
    console.log("⚙️ Cleaning up: Deleting mock chat and messages...");
    await deleteDoc(doc(msgCollRef, "msg_1"));
    await deleteDoc(doc(msgCollRef, "msg_2"));
    await deleteDoc(doc(msgCollRef, "msg_3"));
    await deleteDoc(chatDocRef);
    console.log("✅ Cleanup complete.");
    console.log("🎉 Part 5 tests completed!");
    process.exit(0);
  }
})();
