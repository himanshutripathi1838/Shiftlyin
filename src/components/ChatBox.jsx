import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { isDateTimePast } from "../utils/dateTime.js";
import { useEffect, useState } from "react";
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
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  UserRound,
  Video,
} from "lucide-react";

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

  return (
    <div className="chat-box-container" style={{ display: "flex", width: "100%", height: "100%", gap: "16px", alignItems: "stretch" }}>
      <section className="chat-box flex flex-col h-full flex-1 border rounded-xl overflow-hidden bg-background">
        {/* Chat Header */}
        <div className="h-16 border-b flex items-center justify-between px-4 bg-muted/30">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button onClick={onBack} variant="ghost" size="icon" className="md:hidden">
                ←
              </Button>
            )}
            <Avatar className="size-10">
              <AvatarImage src={counterparty?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${counterparty?.name}`} />
              <AvatarFallback>{counterparty?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base font-semibold">{counterparty?.name || "Loading..."}</CardTitle>
              <CardDescription className="text-xs">
                {counterparty?.role === "business" ? "Business Owner" : "Verified Student"}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {counterparty?.phone && (
              <a href={`tel:${counterparty.phone}`}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs text-emerald-600 border-emerald-600/30 hover:bg-emerald-50">
                  <Phone className="w-3.5 h-3.5" /> Call
                </Button>
              </a>
            )}
            <Button variant="ghost" size="icon" title="Video call">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" title="Search message">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages Feed */}
        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col gap-3 min-h-[300px]">
            {messages.map((message) => {
              const isMine = message.senderId === currentUser.uid;
              const isLastSent = message.id === lastSentMessageId;
              return (
                <div key={message.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"} w-full`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMine 
                      ? "bg-primary color-white text-primary-foreground rounded-br-xs" 
                      : "bg-secondary text-secondary-foreground rounded-bl-xs"
                  }`}>
                    {message.message}
                  </div>
                  {isMine && isLastSent && message.isRead && (
                    <span className="text-[10px] text-muted-foreground mt-1 mr-1">
                      Seen
                    </span>
                  )}
                </div>
              );
            })}
            {messages.length === 0 && (
              <p className="empty-state text-center my-auto text-sm text-muted-foreground">
                No messages yet. Say hello to get started!
              </p>
            )}
          </div>
        </ScrollArea>

        {/* Chat Input Bar */}
        <form onSubmit={sendMessage} className="flex h-14 border-t px-3 items-center gap-1.5 bg-background">
          <Button type="button" variant="ghost" size="icon">
            <Smile className="w-5 h-5 text-muted-foreground" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon">
                <Paperclip className="w-5 h-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start">
              <DropdownMenuItem>
                <Image className="w-4 h-4 mr-2" /> Photos & Videos
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Camera className="w-4 h-4 mr-2" /> Camera
              </DropdownMenuItem>
              <DropdownMenuItem>
                <File className="w-4 h-4 mr-2" /> Document
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserRound className="w-4 h-4 mr-2" /> Contact
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ChartBarIncreasing className="w-4 h-4 mr-2" /> Poll
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Brush className="w-4 h-4 mr-2" /> Drawing
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={isExpired ? "Session expired. Chat is disabled." : "Type a message..."}
            disabled={isExpired}
            className="flex-1 border-0 focus-visible:ring-0 text-sm shadow-none"
          />

          <Button type="submit" disabled={isExpired || !text.trim()} size="icon" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <Send className="w-4 h-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon">
            <Mic className="w-5 h-5 text-muted-foreground" />
          </Button>
        </form>
      </section>

      {jobDetails && (
        <aside className="chat-job-sidebar hidden lg:flex w-[280px] bg-card border rounded-xl p-4 flex-col gap-4">
          <div className="border-b pb-3">
            <span className="text-[10px] tracking-wider uppercase text-muted-foreground font-semibold">Job Profile</span>
            <h3 className="text-base font-bold text-primary mt-1">{jobDetails.title}</h3>
            <p className="text-xs font-semibold text-foreground">{jobDetails.businessName}</p>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[10px] font-semibold uppercase mb-0.5">Salary</span>
              <strong className="text-sm text-foreground">₹{jobDetails.salaryAmount} ({jobDetails.salaryType})</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] font-semibold uppercase mb-0.5">Shift Start</span>
              <span className="text-foreground">{new Date(jobDetails.shiftStartsAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] font-semibold uppercase mb-0.5">Shift End</span>
              <span className="text-foreground">{new Date(jobDetails.shiftEndsAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] font-semibold uppercase mb-0.5">Location</span>
              <strong className="text-foreground">{jobDetails.location}</strong>
            </div>
          </div>

          {jobDetails.description && (
            <div className="mt-auto border-t pt-3">
              <span className="text-muted-foreground block text-[10px] font-semibold uppercase mb-1">Shift Description</span>
              <p className="text-xs leading-relaxed max-h-[100px] overflow-y-auto text-muted-foreground">
                {jobDetails.description}
              </p>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
