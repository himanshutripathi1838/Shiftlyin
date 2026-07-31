import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { isDateTimePast } from "../utils/dateTime.js";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { db } from "../services/firebase.js";

// ** UI & Lucide Icons **
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Brush,
  Camera,
  ChartBarIncreasing,
  File,
  Image,
  Mic,
  MicOff,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  UserRound,
  Video,
  X,
} from "lucide-react";

const EMOJIS = [
  "😊", "👍", "❤️", "🔥", "🎉", "💼",
  "👏", "😂", "🙌", "🚀", "💬", "🙏",
  "✨", "💯", "🤝", "🌟", "📍", "⏰",
  "💪", "😍", "🤩", "😎", "🥳", "✅"
];

export default function ChatBox({ chat, onBack }) {
  const { currentUser, profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [jobDetails, setJobDetails] = useState(null);
  const [counterparty, setCounterparty] = useState(null);

  // Search & Dictation States
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!chat?.id) return undefined;
    const q = query(collection(db, "chats", chat.id, "messages"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      setMessages(msgs);

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

  // Voice Dictation (Speech Recognition)
  function toggleSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = "hi-IN"; // Supports Hindi & English dictation
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    }
  }

  async function sendMessage(event) {
    if (event) event.preventDefault();
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

  // Filtered messages for search
  const filteredMessages = searchQuery.trim()
    ? messages.filter((m) => m.message.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    : messages;

  return (
    <div className="chat-box-container" style={{ display: "flex", width: "100%", height: "100%", gap: "16px", alignItems: "stretch" }}>
      <section
        className="chat-box"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          overflow: "hidden"
        }}
      >
        {/* Chat Header */}
        <div
          style={{
            height: "64px",
            padding: "0 16px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--surface-soft)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {onBack && (
              <Button onClick={onBack} variant="ghost" size="icon" style={{ padding: 0, width: "32px", height: "32px" }}>
                ←
              </Button>
            )}
            <Avatar className="size-10">
              <AvatarImage src={counterparty?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${counterparty?.name}`} />
              <AvatarFallback>{counterparty?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--text)" }}>
                {counterparty?.name || "Loading..."}
              </CardTitle>
              <CardDescription style={{ margin: 0, fontSize: "0.76rem", color: "var(--muted)" }}>
                {counterparty?.role === "business" ? "Business Owner" : "Verified Student"}
              </CardDescription>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {counterparty?.phone && (
              <a href={`tel:${counterparty.phone}`} style={{ textDecoration: "none" }}>
                <Button
                  variant="outline"
                  size="sm"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "#10b981",
                    borderColor: "rgba(16, 185, 129, 0.3)",
                    background: "rgba(16, 185, 129, 0.08)"
                  }}
                >
                  <Phone style={{ width: "14px", height: "14px" }} /> Call
                </Button>
              </a>
            )}
            <Button variant="ghost" size="icon" title="Video call" style={{ color: "var(--muted)" }}>
              <Video style={{ width: "18px", height: "18px" }} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Search messages in chat"
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) setSearchQuery("");
              }}
              style={{ color: showSearch ? "#2563eb" : "var(--muted)" }}
            >
              <Search style={{ width: "18px", height: "18px" }} />
            </Button>
          </div>
        </div>

        {/* Search Bar Overlay */}
        {showSearch && (
          <div
            style={{
              padding: "8px 16px",
              background: "var(--surface-soft)",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Search style={{ width: "16px", height: "16px", color: "var(--muted)" }} />
            <Input
              autoFocus
              placeholder="Search chat messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, fontSize: "0.84rem", height: "34px", borderRadius: "8px" }}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowSearch(false);
                setSearchQuery("");
              }}
              style={{ width: "28px", height: "28px" }}
            >
              <X style={{ width: "14px", height: "14px" }} />
            </Button>
          </div>
        )}

        {/* Messages Feed */}
        <ScrollArea style={{ flex: 1, padding: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", minHeight: "260px" }}>
            {filteredMessages.map((message) => {
              const isMine = message.senderId === currentUser.uid;
              const isLastSent = message.id === lastSentMessageId;
              return (
                <div key={message.id} style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start", width: "100%" }}>
                  <div
                    style={{
                      maxWidth: "75%",
                      padding: "10px 16px",
                      borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      fontSize: "0.88rem",
                      lineHeight: "1.45",
                      background: isMine ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" : "var(--surface-soft)",
                      color: isMine ? "#ffffff" : "var(--text)",
                      border: isMine ? "none" : "1px solid var(--border)",
                      boxShadow: isMine ? "0 4px 12px rgba(37, 99, 235, 0.2)" : "var(--shadow-sm)"
                    }}
                  >
                    {message.message}
                  </div>
                  {isMine && isLastSent && message.isRead && (
                    <span style={{ fontSize: "10px", color: "var(--muted)", marginTop: "3px", marginRight: "4px" }}>
                      Seen ✓✓
                    </span>
                  )}
                </div>
              );
            })}
            {filteredMessages.length === 0 && (
              <p className="empty-state" style={{ margin: "auto", textAlign: "center", color: "var(--muted)", fontSize: "0.88rem" }}>
                {searchQuery ? `No messages found matching "${searchQuery}"` : "No messages yet. Say hello to get started!"}
              </p>
            )}
          </div>
        </ScrollArea>

        {/* Chat Input Bar */}
        <form
          onSubmit={sendMessage}
          style={{
            height: "60px",
            padding: "0 12px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--surface)",
            position: "relative"
          }}
        >
          {/* Emoji Picker Dropdown */}
          <DropdownMenu open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" style={{ color: "var(--muted)" }}>
                <Smile style={{ width: "20px", height: "20px" }} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" style={{ zIndex: 99999, background: "var(--surface)", border: "1px solid var(--border)", padding: "10px", borderRadius: "14px", width: "260px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "6px" }}>
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setText((prev) => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    style={{ fontSize: "1.2rem", padding: "6px", background: "none", border: "none", cursor: "pointer", borderRadius: "6px" }}
                    onMouseEnter={(e) => (e.target.style.background = "var(--surface-soft)")}
                    onMouseLeave={(e) => (e.target.style.background = "transparent")}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Attachment Paperclip Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" style={{ color: "var(--muted)" }}>
                <Paperclip style={{ width: "20px", height: "20px" }} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" style={{ zIndex: 99999 }}>
              <DropdownMenuItem>
                <Image style={{ width: "16px", height: "16px", marginRight: "8px" }} /> Photos & Videos
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Camera style={{ width: "16px", height: "16px", marginRight: "8px" }} /> Camera
              </DropdownMenuItem>
              <DropdownMenuItem>
                <File style={{ width: "16px", height: "16px", marginRight: "8px" }} /> Document
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserRound style={{ width: "16px", height: "16px", marginRight: "8px" }} /> Contact
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ChartBarIncreasing style={{ width: "16px", height: "16px", marginRight: "8px" }} /> Poll
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Brush style={{ width: "16px", height: "16px", marginRight: "8px" }} /> Drawing
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={isListening ? "Listening to your voice..." : isExpired ? "Session expired. Chat is disabled." : "Type a message..."}
            disabled={isExpired}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              outline: "none",
              boxShadow: "none",
              fontSize: "0.88rem",
              color: "var(--text)"
            }}
          />

          {/* Voice Dictation Speaker/Mic Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleSpeechRecognition}
            title={isListening ? "Listening... Click to stop" : "Speak to type"}
            style={{
              color: isListening ? "#ef4444" : "var(--muted)",
              background: isListening ? "rgba(239, 68, 68, 0.15)" : "transparent",
              borderRadius: "50%"
            }}
          >
            {isListening ? <MicOff style={{ width: "20px", height: "20px", color: "#ef4444" }} /> : <Mic style={{ width: "20px", height: "20px" }} />}
          </Button>

          {/* Send Button */}
          <Button
            type="submit"
            disabled={isExpired || !text.trim()}
            size="icon"
            style={{
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              background: "#2563eb",
              color: "#ffffff",
              display: "grid",
              placeItems: "center",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
            }}
          >
            <Send style={{ width: "16px", height: "16px" }} />
          </Button>
        </form>
      </section>

      {/* Right Shift Profile Sidebar */}
      {jobDetails && (
        <aside
          className="chat-job-sidebar"
          style={{
            width: "280px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "14px"
          }}
        >
          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", fontWeight: 700 }}>
              Shift Profile
            </span>
            <h3 style={{ margin: "4px 0 2px", fontSize: "1.05rem", color: "var(--primary)", fontWeight: 800 }}>
              {jobDetails.title}
            </h3>
            <p style={{ margin: 0, fontSize: "0.84rem", fontWeight: 700, color: "var(--text)" }}>
              {jobDetails.businessName}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.82rem" }}>
            <div>
              <span style={{ color: "var(--muted)", display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", marginBottom: "2px" }}>
                Salary
              </span>
              <strong style={{ fontSize: "0.92rem", color: "#16a34a" }}>
                ₹{jobDetails.salaryAmount} ({jobDetails.salaryType})
              </strong>
            </div>

            <div>
              <span style={{ color: "var(--muted)", display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", marginBottom: "2px" }}>
                Shift Start
              </span>
              <span style={{ color: "var(--text)", fontWeight: 600 }}>
                {new Date(jobDetails.shiftStartsAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </div>

            <div>
              <span style={{ color: "var(--muted)", display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", marginBottom: "2px" }}>
                Shift End
              </span>
              <span style={{ color: "var(--text)", fontWeight: 600 }}>
                {new Date(jobDetails.shiftEndsAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </div>

            <div>
              <span style={{ color: "var(--muted)", display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", marginBottom: "2px" }}>
                Location
              </span>
              <strong style={{ color: "var(--text)" }}>
                📍 {jobDetails.location}
              </strong>
            </div>
          </div>

          {jobDetails.description && (
            <div style={{ marginTop: "auto", borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
              <span style={{ color: "var(--muted)", display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>
                Shift Description
              </span>
              <p style={{ margin: 0, fontSize: "0.78rem", lineHeight: "1.45", maxHeight: "100px", overflowY: "auto", color: "var(--muted)" }}>
                {jobDetails.description}
              </p>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
