import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { isDateTimePast } from "../utils/dateTime.js";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { db } from "../services/firebase.js";

export default function ChatBox({ chat, onBack }) {
  const { currentUser, profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [jobDetails, setJobDetails] = useState(null);
  const [counterparty, setCounterparty] = useState(null);

  useEffect(() => {
    if (!chat?.id) return undefined;
    const q = query(collection(db, "chats", chat.id, "messages"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      setMessages(msgs);

      // Mark received messages as read
      const unreadMsgs = snapshot.docs.filter((docSnap) => {
        const data = docSnap.data();
        return data.senderId !== currentUser.uid && !data.isRead;
      });
      unreadMsgs.forEach((docSnap) => {
        updateDoc(docSnap.ref, { isRead: true });
      });
    });
  }, [chat?.id, currentUser.uid]);

  useEffect(() => {
    if (!chat?.id) {
      setJobDetails(null);
      setCounterparty(null);
      return;
    }

    getDoc(doc(db, "jobs", chat.jobId)).then((snap) => {
      if (snap.exists()) {
        setJobDetails({ id: snap.id, ...snap.data() });
      }
    });

    const counterpartyId = currentUser.uid === chat.studentId ? chat.businessId : chat.studentId;
    getDoc(doc(db, "users", counterpartyId)).then((snap) => {
      if (snap.exists()) {
        setCounterparty({ id: snap.id, ...snap.data() });
      }
    });
  }, [chat?.id, chat?.jobId, chat?.studentId, chat?.businessId, currentUser.uid]);

  async function sendMessage(event) {
    event.preventDefault();
    if (!text.trim() || !chat?.id) return;

    const messageText = text.trim();
    const receiverId = currentUser.uid === chat.studentId ? chat.businessId : chat.studentId;
    await addDoc(collection(db, "chats", chat.id, "messages"), {
      senderId: currentUser.uid,
      receiverId,
      message: messageText,
      createdAt: serverTimestamp(),
      isRead: false
    });

    const senderName = profile?.name || "User";
    const shortMessage = messageText.length > 40 ? messageText.substring(0, 40) + "..." : messageText;

    await addDoc(collection(db, "notifications"), {
      userId: receiverId,
      title: "New chat message",
      message: `${senderName} ne chat me likha: "${shortMessage}"`,
      type: "chat_message",
      relatedChatId: chat.id,
      isRead: false,
      createdAt: serverTimestamp()
    });

    setText("");
  }

  if (!chat) return <div className="empty-state">Chat unlocks after an application is accepted.</div>;

  const isExpired = jobDetails && isDateTimePast(jobDetails.shiftEndsAt);
  const lastSentMessageIndex = [...messages].reverse().findIndex((m) => m.senderId === currentUser.uid);
  const lastSentMessageId = lastSentMessageIndex !== -1 ? messages[messages.length - 1 - lastSentMessageIndex].id : null;

  return (
    <div className="chat-box-container" style={{ display: "flex", width: "100%", height: "100%", gap: "20px", alignItems: "stretch" }}>
      <section className="chat-box" style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        <div className="chat-header" style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface-soft)", borderRadius: "8px 8px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {onBack && (
              <button 
                onClick={onBack} 
                className="chat-back-btn" 
                style={{ 
                  background: "none", 
                  border: "none", 
                  cursor: "pointer", 
                  fontSize: "18px", 
                  padding: "0 8px 0 0", 
                  color: "var(--primary)", 
                  fontWeight: "900"
                }}
                aria-label="Back to chat list"
              >
                ←
              </button>
            )}
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>{counterparty?.name || "Loading..."}</h3>
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                {counterparty?.role === "business" ? "Business Owner" : "Student"}
              </span>
            </div>
          </div>
          {counterparty?.phone && (
            <a 
              href={`tel:${counterparty.phone}`} 
              className="primary-button" 
              style={{ 
                padding: "8px 14px", 
                fontSize: "12px", 
                background: "#10b981", 
                borderColor: "#10b981", 
                textDecoration: "none", 
                color: "white", 
                borderRadius: "6px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontWeight: "600",
                boxShadow: "0 2px 4px rgba(16,185,129,0.15)"
              }}
            >
              📞 Call {counterparty.phone}
            </a>
          )}
        </div>

        <div className="messages" style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {messages.map((message) => {
            const isMine = message.senderId === currentUser.uid;
            const isLastSent = message.id === lastSentMessageId;
            return (
              <div key={message.id} style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start", width: "100%", margin: "2px 0" }}>
                <p className={isMine ? "mine" : ""} style={{ margin: 0 }}>
                  {message.message}
                </p>
                {isMine && isLastSent && message.isRead && (
                  <span className="seen-receipt" style={{ display: "block", fontSize: "10px", color: "var(--muted)", marginTop: "2px", marginRight: "4px" }}>
                    Seen
                  </span>
                )}
              </div>
            );
          })}
          {messages.length === 0 && <p className="empty-state" style={{ margin: "auto" }}>No messages yet. Say hello!</p>}
        </div>
        <form onSubmit={sendMessage} className="chat-form" style={{ padding: "16px", borderTop: "1px solid var(--border)" }}>
          <input 
            value={text} 
            onChange={(event) => setText(event.target.value)} 
            placeholder={isExpired ? "Session expired. Chat is disabled." : "Type a message"} 
            disabled={isExpired}
          />
          <button className="primary-button" disabled={isExpired}>Send</button>
        </form>
      </section>

      {jobDetails && (
        <aside className="chat-job-sidebar" style={{ width: "300px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", alignSelf: "stretch" }}>
          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
            <span className="eyebrow" style={{ fontSize: "10px", letterSpacing: "0.05em", textTransform: "uppercase" }}>Job Profile</span>
            <h3 style={{ margin: "4px 0", fontSize: "18px", color: "var(--primary)", fontWeight: "700" }}>{jobDetails.title}</h3>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "var(--text)" }}>{jobDetails.businessName}</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
            <div>
              <span style={{ color: "var(--muted)", display: "block", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", marginBottom: "2px" }}>Salary</span>
              <strong style={{ fontSize: "14px", color: "var(--text)" }}>₹{jobDetails.salaryAmount} ({jobDetails.salaryType})</strong>
            </div>
            <div>
              <span style={{ color: "var(--muted)", display: "block", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", marginBottom: "2px" }}>Shift Start</span>
              <span style={{ color: "var(--text)" }}>{new Date(jobDetails.shiftStartsAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
            </div>
            <div>
              <span style={{ color: "var(--muted)", display: "block", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", marginBottom: "2px" }}>Shift End</span>
              <span style={{ color: "var(--text)" }}>{new Date(jobDetails.shiftEndsAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
            </div>
            <div>
              <span style={{ color: "var(--muted)", display: "block", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", marginBottom: "2px" }}>Location</span>
              <strong style={{ color: "var(--text)" }}>{jobDetails.location}</strong>
            </div>
          </div>

          {jobDetails.description && (
            <div style={{ marginTop: "auto", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
              <span style={{ color: "var(--muted)", display: "block", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", marginBottom: "4px" }}>Shift Description</span>
              <p style={{ margin: 0, fontSize: "12px", lineHeight: "1.5", maxHeight: "120px", overflowY: "auto", color: "var(--muted)" }}>
                {jobDetails.description}
              </p>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
