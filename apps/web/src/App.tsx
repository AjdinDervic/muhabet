import { useEffect, useMemo, useState } from "react";
import "./App.css";
import type { Message, User } from "./types";
import { fetchActiveUsers, fetchMessages } from "./services/api";
import { useSocket } from "./hooks/useSocket";
import { ActiveUsers } from "./components/ActiveUsers";
import { MessageList } from "./components/MessageList";
import { ChatInput } from "./components/ChatInput";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { Welcome } from "./components/Welcome";

function App() {
  const [me, setMe] = useState<User | null>(null);

  // Option A: no persistence — always show Welcome on a fresh tab/load
  const [joined, setJoined] = useState<boolean>(false);

  const [users, setUsers] = useState<Array<{ id: string; username: string }>>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  // layout states
  const isDesktop = useMediaQuery("(min-width: 921px)");
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // initial data
  useEffect(() => {
    fetchActiveUsers().then(setUsers).catch(() => setUsers([]));
    fetchMessages(50).then(setMessages).catch(() => {});
  }, []);

  const { sendMessage } = useSocket({
    onMessage: (m: Message) => setMessages((prev) => [...prev, m]),
    onSystem: (sys: Message) => setMessages((prev) => [...prev, sys]),
    onJoin: (u) =>
      setUsers((prev) => (prev.some((p) => p.id === u.id) ? prev : [...prev, u])),
    onLeave: (u) => setUsers((prev) => prev.filter((p) => p.id !== u.id)),
    onHello: (u) => setMe(u), // random username from server
  });

  // normalize layout when breakpoint changes
  useEffect(() => {
    if (isDesktop) {
      setSidebarOpen(false);
      setDesktopCollapsed(false);
    } else {
      setSidebarOpen(false);
    }
  }, [isDesktop]);

  async function loadOlder() {
    if (!messages.length) return;
    const oldest = messages[0];
    const older = await fetchMessages(50, oldest.createdAt);
    if (older.length) setMessages((prev) => [...older, ...prev]);
  }

  const containerClass = useMemo(() => {
    if (isDesktop) {
      return `grid desktop ${desktopCollapsed ? "sidebar-collapsed" : "sidebar-expanded"}`;
    }
    return `grid mobile ${sidebarOpen ? "sidebar-open" : ""}`;
  }, [isDesktop, desktopCollapsed, sidebarOpen]);

  // Gate with Welcome (client-only)
  if (!joined) {
    return (
      <Welcome
        username={me?.username ?? undefined}
        onJoin={() => {
          setJoined(true); // no localStorage/sessionStorage writes
        }}
      />
    );
  }

  // Chat UI
  return (
    <div className={containerClass}>
      <aside className="sidebar card" aria-label="Active users">
        <div className="sidebar-head">
          <strong>Active users:</strong>
          {isDesktop ? (
            <button
              className="close-side"
              onClick={() => setDesktopCollapsed(true)}
              aria-label="Collapse sidebar"
            >
              ×
            </button>
          ) : (
            <button
              className="close-side"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              ×
            </button>
          )}
        </div>
        <ActiveUsers users={users} meId={me?.id ?? undefined} />
      </aside>

      <div className="main-col">
        <header className="header-row">
          <button
            className="burger"
            onClick={() => {
              if (isDesktop) setDesktopCollapsed((v) => !v);
              else setSidebarOpen((v) => !v);
            }}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <h1 className="h1 brand">Muhabet</h1>
        </header>

        <main>
          <div className="card chat">
            <strong className="chat-header">Global chat:</strong>
            <MessageList
              messages={messages}
              meId={me?.id ?? undefined}
              onLoadOlder={loadOlder}
              hasMoreOlder={true}
            />
            <ChatInput disabled={false} onSend={sendMessage} />
          </div>
        </main>
      </div>

      {!isDesktop && <div className="backdrop" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}

export default App;
