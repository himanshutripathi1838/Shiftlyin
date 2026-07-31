import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import ChatBox from "../../components/ChatBox.jsx";
import Sidebar from "../../components/Sidebar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { db } from "../../services/firebase.js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

function ChatListItem({ chat, isActive, onClick, currentUserRole }) {
  const [userData, setUserData] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadMeta() {
      try {
        const jobSnap = await getDoc(doc(db, "jobs", chat.jobId));
        if (jobSnap.exists()) setJobData(jobSnap.data());

        const counterpartyId = currentUserRole === "business" ? chat.studentId : chat.businessId;
        const userSnap = await getDoc(doc(db, "users", counterpartyId));
        if (userSnap.exists()) setUserData(userSnap.data());
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

  const displayName = userData?.name || "Loading user...";
  const displayJob = jobData?.title || "Job conversation";
  const avatarSrc = userData?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`;

  return (
    <button
      className={`chat-item-btn ${isActive ? "active" : ""}`}
      onClick={onClick}
      style={{
        textAlign: "left",
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        borderRadius: "12px",
        border: isActive ? "1.5px solid var(--primary)" : "1px solid var(--border)",
        background: isActive ? "rgba(37, 99, 235, 0.08)" : "var(--surface)",
        cursor: "pointer",
        transition: "all 0.2s ease"
      }}
    >
      <div style={{ position: "relative" }}>
        <Avatar className="size-10">
          <AvatarImage src={avatarSrc} />
          <AvatarFallback>{displayName[0]}</AvatarFallback>
        </Avatar>
        <span
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: "#10b981",
            border: "2px solid var(--surface)"
          }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ display: "block", fontSize: "0.88rem", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {displayName}
        </strong>
        <span style={{ display: "block", fontSize: "0.76rem", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "2px" }}>
          💼 {displayJob}
        </span>
      </div>

      {unreadCount > 0 && (
        <span style={{
          background: "#2563eb",
          color: "#ffffff",
          fontSize: "11px",
          fontWeight: 800,
          borderRadius: "999px",
          padding: "2px 8px",
          minWidth: "20px",
          textAlign: "center",
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
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const field = profile.role === "business" ? "businessId" : "studentId";
    return onSnapshot(query(collection(db, "chats"), where(field, "==", currentUser.uid)), (snapshot) => {
      const nextChats = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      setChats(nextChats);
      if (window.innerWidth > 768) {
        setSelectedChatId((current) => current || nextChats[0]?.id || "");
      }
    });
  }, [currentUser.uid, profile.role]);

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);

  return (
    <main className="dashboard-layout">
      <Sidebar role={profile.role} />
      <section className="dashboard-content" style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 40px)" }}>
        <div className="dashboard-header" style={{ marginBottom: "1rem" }}>
          <div>
            <span className="eyebrow">Messages</span>
            <h1>Accepted Shift Conversations</h1>
          </div>
        </div>

        <div
          className="chat-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: "1rem",
            flex: 1,
            alignItems: "stretch"
          }}
        >
          <aside
            className={`chat-list ${selectedChatId ? "hidden-mobile" : ""}`}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}
          >
            <div style={{ position: "relative" }}>
              <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "var(--muted)" }} />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: "36px", fontSize: "0.84rem", borderRadius: "10px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto", flex: 1 }}>
              {chats.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  isActive={chat.id === selectedChatId}
                  onClick={() => setSelectedChatId(chat.id)}
                  currentUserRole={profile.role}
                />
              ))}
              {chats.length === 0 && <p className="empty-state" style={{ padding: "2rem 1rem", textAlign: "center" }}>No unlocked chats yet.</p>}
            </div>
          </aside>

          <div className={`chat-box-wrapper ${!selectedChatId ? "hidden-mobile" : ""}`} style={{ width: "100%", height: "100%" }}>
            <ChatBox chat={selectedChat} onBack={() => setSelectedChatId("")} />
          </div>
        </div>
      </section>
    </main>
  );
}
