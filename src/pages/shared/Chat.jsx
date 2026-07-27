import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import ChatBox from "../../components/ChatBox.jsx";
import Sidebar from "../../components/Sidebar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { db } from "../../services/firebase.js";

function ChatListItem({ chat, isActive, onClick, currentUserRole }) {
  const [title, setTitle] = useState("Loading chat...");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadMeta() {
      try {
        const jobSnap = await getDoc(doc(db, "jobs", chat.jobId));
        const jobData = jobSnap.exists() ? jobSnap.data() : null;

        const counterpartyId = currentUserRole === "business" ? chat.studentId : chat.businessId;
        const userSnap = await getDoc(doc(db, "users", counterpartyId));
        const userData = userSnap.exists() ? userSnap.data() : null;

        if (jobData && userData) {
          setTitle(`${userData.name} - ${jobData.title}`);
        } else if (jobData) {
          setTitle(jobData.title);
        } else if (userData) {
          setTitle(userData.name);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadMeta();
  }, [chat, currentUserRole]);

  useEffect(() => {
    const q = query(
      collection(db, "chats", chat.id, "messages"),
      where("isRead", "==", false)
    );
    return onSnapshot(q, (snapshot) => {
      const counterpartyId = currentUserRole === "business" ? chat.studentId : chat.businessId;
      const count = snapshot.docs.filter((item) => item.data().senderId === counterpartyId).length;
      setUnreadCount(count);
    });
  }, [chat.id, currentUserRole, chat.studentId, chat.businessId]);

  return (
    <button className={isActive ? "active" : ""} onClick={onClick} style={{ textAlign: "left", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
      <div style={{ flex: 1, marginRight: "10px" }}>
        <strong style={{ display: "block", fontSize: "13px", lineHeight: "1.4" }}>{title}</strong>
      </div>
      {unreadCount > 0 && (
        <span style={{ 
          background: "#ef4444", 
          color: "white", 
          fontSize: "11px", 
          fontWeight: "bold", 
          borderRadius: "50%", 
          width: "20px", 
          height: "20px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          flexShrink: 0
        }}>
          {unreadCount}
        </span>
      )}
    </button>
  );
}

export default function Chat() {
  const { currentUser, profile } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState("");

  useEffect(() => {
    const field = profile.role === "business" ? "businessId" : "studentId";
    return onSnapshot(query(collection(db, "chats"), where(field, "==", currentUser.uid)), (snapshot) => {
      const nextChats = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      setChats(nextChats);
      setSelectedChatId((current) => current || nextChats[0]?.id || "");
    });
  }, [currentUser.uid, profile.role]);

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);

  return (
    <main className="dashboard-layout">
      <Sidebar role={profile.role} />
      <section className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <span className="eyebrow">Chat</span>
            <h1>Accepted job conversations</h1>
          </div>
        </div>
        <div className="chat-layout">
          <aside className="chat-list">
            {chats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === selectedChatId}
                onClick={() => setSelectedChatId(chat.id)}
                currentUserRole={profile.role}
              />
            ))}
            {chats.length === 0 && <p className="empty-state">No unlocked chats yet.</p>}
          </aside>
          <ChatBox chat={selectedChat} />
        </div>
      </section>
    </main>
  );
}
