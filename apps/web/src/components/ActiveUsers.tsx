// apps/web/src/components/ActiveUsers.tsx
import type { User } from "../types";

type Props = {
  users: User[];
  meId?: string;
};

const EMOJIS = ["🐧","🦊","🐼","🦁","🐢","🐰","🦄","🐨","🐙","🦉","🐝","🐳","🐯","🐶","🐱"];
function avatarFor(seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return EMOJIS[h % EMOJIS.length];
}

export function ActiveUsers({ users, meId }: Props) {
  return (
    <ul className="list">
      {users.map((u) => {
        const isMe = u.id === meId;
        return (
          <li key={u.id} className={`user ${isMe ? "me" : ""}`}>
            <span className="avatar">{avatarFor(u.id)}</span>
            <span className="name">{u.username}</span>
          </li>
        );
      })}
    </ul>
  );
}
