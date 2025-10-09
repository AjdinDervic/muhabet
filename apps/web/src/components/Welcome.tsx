

type Props = {
  username?: string;  // whatever you received in onHello
  onJoin: () => void;
};

export function Welcome({ username, onJoin }: Props) {
  return (
    <div className="page center">
      <div className="card join-card">
        <h1 className="h1 brand">
          Bujrum da{" "}
          <span className="word-pro">pro</span>
          <span className="word-muhabet">Muhabet</span>
          <span className="word-imo">imo</span>
        </h1>

        <p className="sub" style={{ marginTop: 8 }}>
          Your username is <strong>{username ?? "…"}</strong>
        </p>

        <button className="btn join-btn" onClick={onJoin}>
  Join
</button>

      </div>
    </div>
  );
}
