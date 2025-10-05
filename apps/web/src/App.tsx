import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

function App() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState<{ id: string; username: string }[]>([]);
  const [messages, setMessages] = useState<
    {
      id: string;
      body: string;
      senderId: string;
      username: string;
      createdAt: string;
    }[]
  >([]);
  const [text, setText] = useState("");
  const socketRef = useRef<Socket | null>(null);

  // API health
  useEffect(() => {
    const api =
      (import.meta.env.VITE_API_URL as string) || "http://localhost:4000";
    fetch(`${api}/healthz`)
      .then((r) => r.json())
      .then(() => setStatus("ok"))
      .catch(() => setStatus("error"));
  }, []);

  // Socket wiring
  useEffect(() => {
    const api =
      (import.meta.env.VITE_API_URL as string) || "http://localhost:4000";
    const s = io(api, { transports: ["websocket"] });
    socketRef.current = s;

    s.on("connect", () => setConnected(true));
    //alert for notifiation
    s.on("hello", (payload: { msg: string }) => {
      console.log("Server says:", payload.msg);
      alert(payload.msg); // temp: visible proof
    });
    s.on("disconnect", () => setConnected(false));

    s.on("user_joined", (u: { id: string; username: string }) => {
      setUsers((prev) =>
        prev.some((p) => p.id === u.id) ? prev : [...prev, u]
      );
    });
    s.on("user_left", (u: { id: string; username: string }) => {
      setUsers((prev) => prev.filter((p) => p.id !== u.id));
    });

    s.on(
      "message_created",
      (msg: {
        id: string;
        body: string;
        senderId: string;
        username: string;
        createdAt: string;
      }) => {
        setMessages((prev) => [...prev, msg]);
      }
    );

    return () => {
      s.disconnect();
    };
  }, []);

  // Prefill active users on load
  useEffect(() => {
    const api =
      (import.meta.env.VITE_API_URL as string) || "http://localhost:4000";
    fetch(`${api}/api/users/active`)
      .then((r) => r.json())
      .then((list) => setUsers(list))
      .catch(() => setUsers([]));
  }, []);

  function sendMessage() {
    const body = text.trim();
    if (!body) return;
    socketRef.current?.emit("message:send", { body });
    setText("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: 16, maxWidth: 640 }}>
      <h1>Muhabet</h1>
      <p style={{ marginTop: 4, color: "#555" }}>
        Friendly conversation — a modern take on the Bosnian “muhabet”.
      </p>

      <div
        style={{
          marginTop: 16,
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      >
        <strong>API status:</strong>{" "}
        {status === "loading"
          ? "Checking…"
          : status === "ok"
          ? "✅ OK"
          : "❌ Error"}
      </div>

      <div
        style={{
          marginTop: 8,
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      >
        <strong>Realtime:</strong>{" "}
        {connected ? "🟢 connected" : "🔴 disconnected"}
      </div>

      <div
        style={{
          marginTop: 8,
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      >
        <strong>Active users:</strong>
        <ul style={{ marginTop: 8 }}>
          {users.length === 0 ? (
            <li>None</li>
          ) : (
            users.map((u) => <li key={u.id}>{u.username}</li>)
          )}
        </ul>
      </div>

      <div
        style={{
          marginTop: 8,
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      >
        <strong>Global chat:</strong>
        <div
          style={{
            marginTop: 8,
            maxHeight: 280,
            overflowY: "auto",
            paddingRight: 6,
          }}
        >
          {messages.length === 0 ? (
            <div style={{ opacity: 0.6 }}>No messages yet. Say hi 👋</div>
          ) : (
            messages.map((m) => (
              <div key={m.id} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  <b>{m.username}</b> ·{" "}
                  {new Date(m.createdAt).toLocaleTimeString()}
                </div>
                <div>{m.body}</div>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: 8 }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
            rows={3}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!connected || text.trim() === ""}
            style={{
              marginTop: 8,
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
