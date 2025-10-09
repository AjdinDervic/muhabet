import type { Message, User } from "../types";

export function getApiBase() {
  
  if (import.meta.env.DEV && import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }

 
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:4000`;
}
export async function fetchActiveUsers(): Promise<User[]> {
  const r = await fetch(`${getApiBase()}/api/users/active`);
  return r.json();
}

export async function fetchMessages(limit = 50, before?: string): Promise<Message[]> {
  const qs = new URLSearchParams({ limit: String(limit) });
  if (before) qs.set("before", before);
  const r = await fetch(`${getApiBase()}/api/messages?${qs.toString()}`);
  return r.json();
}
