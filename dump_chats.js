import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDxNruO1bqbHI3_cdCcX0mn-W2u8rELjk4",
  authDomain: "hustlr-1a51a.firebaseapp.com",
  projectId: "hustlr-1a51a",
  storageBucket: "hustlr-1a51a.firebasestorage.app",
  messagingSenderId: "777931477588",
  appId: "1:777931477588:web:6529a54f6d0f1e316cd3c1",
  measurementId: "G-Y39MXMG3L5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function dump() {
  try {
    console.log("Fetching chats...");
    const chatsSnap = await getDocs(collection(db, "chats"));
    console.log(`Found ${chatsSnap.size} chats.`);
    
    for (const chatDoc of chatsSnap.docs) {
      const chat = chatDoc.data();
      console.log(`\n--- Chat Document: ${chatDoc.id} ---`);
      console.log("Data:", chat);
      
      if (chat.jobId) {
        const jobSnap = await getDoc(doc(db, "jobs", chat.jobId));
        console.log(`Job (${chat.jobId}) Exists:`, jobSnap.exists());
        if (jobSnap.exists()) console.log("Job Title:", jobSnap.data().title);
      } else {
        console.log("jobId is MISSING!");
      }
      
      if (chat.studentId) {
        const studentSnap = await getDoc(doc(db, "users", chat.studentId));
        console.log(`Student User (${chat.studentId}) Exists:`, studentSnap.exists());
        if (studentSnap.exists()) console.log("Student Name:", studentSnap.data().name);
      } else {
        console.log("studentId is MISSING!");
      }

      if (chat.businessId) {
        const businessSnap = await getDoc(doc(db, "users", chat.businessId));
        console.log(`Business User (${chat.businessId}) Exists:`, businessSnap.exists());
        if (businessSnap.exists()) console.log("Business Name:", businessSnap.data().name);
      } else {
        console.log("businessId is MISSING!");
      }
    }
  } catch (error) {
    console.error("Dump failed:", error);
  }
  process.exit(0);
}

dump();
