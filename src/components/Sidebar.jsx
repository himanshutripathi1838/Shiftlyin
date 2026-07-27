import { NavLink } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { db } from "../services/firebase.js";

const items = {
  student: [
    ["Dashboard", "/student"],
    ["Applications", "/applications"],
    ["Attendance", "/attendance"],
    ["Earnings", "/payments"],
    ["Chat", "/chat"],
    ["Profile", "/profile"]
  ],
  business: [
    ["Dashboard", "/business"],
    ["Post Job", "/post-job"],
    ["Applications", "/applications"],
    ["Attendance", "/attendance"],
    ["Wallet & Settlement", "/business/wallet"],
    ["Chat", "/chat"],
    ["Profile", "/profile"]
  ],
  admin: [
    ["Dashboard", "/admin"],
    ["Reports", "/admin"],
    ["Users", "/admin"]
  ]
};

import logoImg from "../assets/logo.png";

export default function Sidebar({ role = "student" }) {
  const { currentUser } = useAuth();
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (!currentUser?.uid) return undefined;

    const field = role === "business" ? "businessId" : "studentId";
    const chatsQuery = query(collection(db, "chats"), where(field, "==", currentUser.uid));

    const unsubscribes = [];
    const chatUnreadCounts = {};

    const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
      // Clean up previous listeners
      unsubscribes.forEach((unsub) => unsub());
      unsubscribes.length = 0;

      snapshot.docs.forEach((chatDoc) => {
        const chatId = chatDoc.id;
        const chatData = chatDoc.data();
        const counterpartyId = role === "business" ? chatData.studentId : chatData.businessId;

        const messagesQuery = query(
          collection(db, "chats", chatId, "messages"),
          where("isRead", "==", false),
          where("senderId", "==", counterpartyId)
        );

        const unsubMessages = onSnapshot(messagesQuery, (msgSnapshot) => {
          chatUnreadCounts[chatId] = msgSnapshot.size;
          const sum = Object.values(chatUnreadCounts).reduce((a, b) => a + b, 0);
          setTotalUnread(sum);
        });
        unsubscribes.push(unsubMessages);
      });

      if (snapshot.empty) {
        setTotalUnread(0);
      }
    });

    return () => {
      unsubscribeChats();
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [currentUser?.uid, role]);

  return (
    <aside className="sidebar">
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px 20px 14px", borderBottom: "1px solid var(--border)", marginBottom: "15px" }}>
        <img src={logoImg} alt="Shiftlyin Logo" style={{ width: "32px", height: "32px", objectFit: "contain", borderRadius: "5px" }} />
        <div>
          <strong style={{ display: "block", fontSize: "14px", color: "var(--text)" }}>Shiftlyin</strong>
          <small style={{ fontSize: "10px", color: "var(--muted)", textTransform: "capitalize" }}>
            {role === "business" ? "Owner Console" : `${role} Console`}
          </small>
        </div>
      </div>
      <p className="sidebar-label">{role === "business" ? "owner menu" : `${role} menu`}</p>
      {items[role]?.map(([label, to]) => (
        <NavLink key={label} to={to} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <span>{label}</span>
          {label === "Chat" && totalUnread > 0 && (
            <span style={{ 
              background: "#ef4444", 
              color: "white", 
              fontSize: "10px", 
              fontWeight: "bold", 
              borderRadius: "50%", 
              minWidth: "18px", 
              height: "18px", 
              padding: "0 5px",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              marginLeft: "8px"
            }}>
              {totalUnread}
            </span>
          )}
        </NavLink>
      ))}
    </aside>
  );
}
