import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { getApiBase } from "../services/api";
import type { Message, User } from "../types";

type UseSocketArgs = {
  onMessage: (m: Message) => void;
  onSystem?: (m: Message) => void;
  onJoin?: (u: User) => void;
  onLeave?: (u: User) => void;
  onHello?: (me: User) => void;
};

export function useSocket({ onMessage, onSystem, onJoin, onLeave, onHello }: UseSocketArgs) {
  const socketRef = useRef<Socket | null>(null);

  // Keep latest callbacks in refs (so listeners can call them without re-subscribing)
  const onMessageRef = useRef(onMessage);
  const onSystemRef  = useRef(onSystem);
  const onJoinRef    = useRef(onJoin);
  const onLeaveRef   = useRef(onLeave);
  const onHelloRef = useRef(onHello);

  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
  useEffect(() => { onSystemRef.current  = onSystem;  }, [onSystem]);
  useEffect(() => { onJoinRef.current    = onJoin;    }, [onJoin]);
  useEffect(() => { onLeaveRef.current   = onLeave;   }, [onLeave]);

  // Connect ONCE
  useEffect(() => {
    const s = io(getApiBase(), { transports: ["websocket"] });
    socketRef.current = s;

     s.on("hello", (p: { msg: string; me: User }) => {
     console.log("hello", p.msg);
     onHelloRef.current?.(p.me);
     });

    s.on("user_joined", (u: User) => {
      onJoinRef.current?.(u);
      onSystemRef.current?.({
        id: `sys-join-${u.id}-${Date.now()}`,
        body: `${u.username} joined the chat`,
        senderId: "system",
        username: "system",
        createdAt: new Date().toISOString(),
      });

    });

    s.on("user_left", (u: User) => {
      onLeaveRef.current?.(u);
      onSystemRef.current?.({
        id: `sys-leave-${u.id}-${Date.now()}`,
        body: `${u.username} left the chat`,
        senderId: "system",
        username: "system",
        createdAt: new Date().toISOString(),
      });
    });

    s.on("message_created", (msg: Message) => {
      onMessageRef.current?.(msg);
    });

    return () => { s.disconnect(); };
  }, []);

  function sendMessage(body: string) {
    const text = body.trim();
    if (!text) return;
    socketRef.current?.emit("message:send", { body: text });
  }

  return { sendMessage };
}