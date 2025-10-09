import { useEffect, useRef, useState } from "react";
import type { Message } from "../types";

type Props = {
  messages: Message[];
  meId?: string;
  onLoadOlder: () => Promise<void>;
  hasMoreOlder?: boolean; // optional for now; defaults to true
};

export function MessageList({ messages, meId, onLoadOlder, hasMoreOlder = true }: Props) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [atTop, setAtTop] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const isAtBottom = (el: HTMLDivElement) =>
    el.scrollHeight - el.scrollTop - el.clientHeight <= 1;   // show Newest immediately after any scroll up
  const isAtTop = (el: HTMLDivElement) => el.scrollTop <= 1;

  // Initial: go to bottom (newest)
  useEffect(() => {
    if (initialized) return;
    const el = boxRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    setInitialized(true);
  }, [initialized]);

  // When messages change: if user is at bottom, stick to bottom
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    if (isAtBottom(el)) {
      requestAnimationFrame(() => (el.scrollTop = el.scrollHeight));
    }
  }, [messages]);

  function onScroll() {
    const el = boxRef.current!;
    setAtTop(isAtTop(el));
    setAtBottom(isAtBottom(el));
  }

  // Load older: keep viewport anchored (no jump)
  async function handleLoadOlder() {
    if (loadingOlder || !hasMoreOlder) return;
    const el = boxRef.current!;
    setLoadingOlder(true);
    const prevHeight = el.scrollHeight;
    const prevTop = el.scrollTop;

    await onLoadOlder();

    requestAnimationFrame(() => {
      const newHeight = el.scrollHeight;
      el.scrollTop = prevTop + (newHeight - prevHeight);
      setLoadingOlder(false);
    });
  }

  function jumpToLatest() {
    const el = boxRef.current!;
    el.scrollTop = el.scrollHeight;
  }

  const showTopBar = loadingOlder || atTop; 

  return (
    <div className="messages" ref={boxRef} onScroll={onScroll}>
      {showTopBar && (
        <div className="messages-topbar">
          {hasMoreOlder ? (
            <button
              className="btn small"
              disabled={loadingOlder}
              onClick={handleLoadOlder}
              title="Load 50 older messages"
            >
              {loadingOlder ? "Loading..." : "Load older"}
            </button>
          ) : (
            <span className="top-note">No older messages</span>
          )}
        </div>
      )}

      {messages.map((m) => {
        const mine = m.senderId === meId;
        return (
          <div key={m.id} className={`msg ${mine ? "mine" : "other"}`}>
            <div className="meta">
              <span className="username">{m.username}</span>
              <span> • </span>
              <time dateTime={m.createdAt}>
                {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </time>
            </div>
            <div className="bubble">{m.body}</div>
          </div>
        );
      })}

      {!atBottom && (
        <button className="jump-latest" onClick={jumpToLatest} title="Go to newest">
          ↓ Newest
        </button>
      )}
    </div>
  );
}
