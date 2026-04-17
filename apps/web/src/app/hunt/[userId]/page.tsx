"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function HuntPage() {
  const { userId } = useParams();
  const [user, setUser] = useState<any>(null);
  const [computedMaxHp, setComputedMaxHp] = useState<number>(100);
  const [hunting, setHunting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userId) {
      fetch(`/api/user/${userId}`)
        .then((r) => r.json())
        .then(setUser)
        .catch(() => setError("Failed to load user"));
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/stats/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.final?.maxHp) setComputedMaxHp(data.final.maxHp);
      })
      .catch(() => {});
  }, [userId, user?.inventory?.length, user?.beasts?.length, user?.level]);

  async function doHunt(type: "normal" | "boss" = "normal") {
    if (!userId) return;
    setHunting(true);
    setResult(null);
    setError("");
    try {
      const res = await fetch("/api/hunt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, huntType: type }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Hunt failed");
      } else {
        setResult(data);
        // Refresh user
        const userRes = await fetch(`/api/user/${userId}`);
        setUser(await userRes.json());
      }
    } catch {
      setError("Network error");
    } finally {
      setHunting(false);
    }
  }

  if (!user) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>🏹 Hunt</h1>
      <p style={{ color: "#888", marginBottom: "1rem" }}>User: {user.username}</p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button className="btn" onClick={() => doHunt("normal")} disabled={hunting}>
          {hunting ? "Hunting..." : "⚔️ Normal Hunt"}
        </button>
        <button className="btn" onClick={() => doHunt("boss")} disabled={hunting}>
          {hunting ? "Hunting..." : "👹 Boss Hunt"}
        </button>
      </div>

      {error && (
        <div className="card" style={{ borderColor: "#ef4444", color: "#ef4444" }}>
          {error}
        </div>
      )}

      {result && (
        <div className="card">
          <h2 style={{ color: result.isWin ? "#22c55e" : "#ef4444", marginBottom: "1rem" }}>
            {result.isWin ? "✅ Victory!" : "❌ Defeat"}
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <p style={{ color: "#888", fontSize: "0.85rem" }}>Enemy</p>
              <p style={{ fontWeight: "bold" }}>{result.enemyName}</p>
              <p style={{ color: "#888", fontSize: "0.85rem" }}>
                HP: {result.finalEnemyHp} / {result.enemyMaxHp}
              </p>
            </div>
            <div>
              <p style={{ color: "#888", fontSize: "0.85rem" }}>You</p>
              <p style={{ color: "#888", fontSize: "0.85rem" }}>
                HP: {result.finalHp} / {result.playerMaxHp}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ background: "#0f0f1a", padding: "0.75rem", borderRadius: "8px", flex: 1, textAlign: "center" }}>
              <div style={{ color: "#fbbf24", fontWeight: "bold" }}>+{result.goldGained} 💰</div>
            </div>
            <div style={{ background: "#0f0f1a", padding: "0.75rem", borderRadius: "8px", flex: 1, textAlign: "center" }}>
              <div style={{ color: "#a78bfa", fontWeight: "bold" }}>+{result.expGained} ✨</div>
            </div>
          </div>

          {result.battleLogs?.length > 0 && (
            <div>
              <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Battle Log</p>
              <div className="battle-log">
                {result.battleLogs.slice(-20).join("\n")}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: "1rem" }}>
        <p style={{ color: "#888", fontSize: "0.85rem" }}>
          HP: {user.currentHp} / {computedMaxHp} | Gold: {user.gold.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
