import { useState } from "react";

export function ChatInput({ disabled, onSend }: { disabled: boolean; onSend: (t: string) => void; }) {
  const [text, setText] = useState("");

  function submit() {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  }

  return (
    <div className="input-wrap">
      <input
        className="input"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
        disabled={disabled}
      />
      <button className="send-btn" onClick={submit} disabled={disabled} title="Send">➤</button>
    </div>
  );
}
