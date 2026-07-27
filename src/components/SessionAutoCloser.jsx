import { collection, doc, onSnapshot, query, runTransaction, serverTimestamp, where } from "firebase/firestore";
import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { db } from "../services/firebase.js";
import { calculatePaymentAmount } from "../utils/payments.js";

function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function closeSession(record) {
  const attendanceRef = doc(db, "attendance", record.id);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(attendanceRef);
    if (!snapshot.exists()) return;

    const attendance = snapshot.data();
    if (attendance.status !== "checked-in" || attendance.sessionClosedAt) return;

    const shiftEnd = toDate(attendance.shiftEndAt);
    if (!shiftEnd || shiftEnd.getTime() > Date.now()) return;

    const checkInDate = toDate(attendance.checkInTime);
    const workingHours = checkInDate
      ? Number(Math.max(0, (shiftEnd.getTime() - checkInDate.getTime()) / 36e5).toFixed(2))
      : 0;
    const amount = calculatePaymentAmount({
      salary: attendance.salary,
      salaryAmount: attendance.salaryAmount,
      salaryType: attendance.salaryType,
      workingHours
    });

    transaction.update(attendanceRef, {
      checkOutTime: attendance.shiftEndAt,
      workingHours,
      status: "completed",
      autoClosed: true,
      closeReason: "shift-time-completed",
      sessionClosedAt: serverTimestamp()
    });

    const message = `${attendance.jobTitle || "Restaurant shift"} ka time complete ho gaya. Attendance session automatically close kar diya gaya hai.`;

    transaction.set(doc(db, "payments", record.id), {
      attendanceId: record.id,
      jobId: attendance.jobId,
      jobTitle: attendance.jobTitle || "",
      studentId: attendance.studentId,
      studentName: attendance.studentName || "",
      businessId: attendance.businessId,
      businessName: attendance.businessName || "",
      salary: attendance.salary || "",
      salaryType: attendance.salaryType || "fixed",
      salaryAmount: Number(attendance.salaryAmount || 0),
      workingHours,
      amount,
      status: "pending",
      autoCreated: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    if (attendance.studentId) {
      transaction.set(doc(db, "notifications", `session-close-${record.id}-student`), {
        userId: attendance.studentId,
        title: "Session closed",
        message,
        type: "session-closed",
        attendanceId: record.id,
        jobId: attendance.jobId,
        isRead: false,
        createdAt: serverTimestamp()
      });
    }

    if (attendance.businessId) {
      transaction.set(doc(db, "notifications", `session-close-${record.id}-business`), {
        userId: attendance.businessId,
        title: "Shift session completed",
        message,
        type: "session-closed",
        attendanceId: record.id,
        jobId: attendance.jobId,
        isRead: false,
        createdAt: serverTimestamp()
      });
    }
  });
}

export default function SessionAutoCloser() {
  const { currentUser, profile } = useAuth();
  const dueRecordsRef = useRef([]);

  useEffect(() => {
    if (!currentUser || !profile || !["student", "business"].includes(profile.role)) {
      dueRecordsRef.current = [];
      return undefined;
    }

    const ownerField = profile.role === "student" ? "studentId" : "businessId";
    const attendanceQuery = query(
      collection(db, "attendance"),
      where(ownerField, "==", currentUser.uid)
    );

    return onSnapshot(attendanceQuery, (snapshot) => {
      dueRecordsRef.current = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .filter((record) => record.status === "checked-in");
    });
  }, [currentUser, profile]);

  useEffect(() => {
    if (!currentUser || !profile) return undefined;

    async function closeDueSessions() {
      const dueRecords = dueRecordsRef.current.filter((record) => {
        const shiftEnd = toDate(record.shiftEndAt);
        return shiftEnd && shiftEnd.getTime() <= Date.now();
      });

      await Promise.allSettled(dueRecords.map(closeSession));
    }

    closeDueSessions();
    const intervalId = window.setInterval(closeDueSessions, 30_000);
    return () => window.clearInterval(intervalId);
  }, [currentUser, profile]);

  return null;
}
