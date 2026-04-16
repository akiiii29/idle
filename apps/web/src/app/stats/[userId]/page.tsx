"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function StatsPage() {
  const { userId } = useParams();
  const [stats, setStats] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/stats/${userId}`).then((r) => r.json()),
      fetch(`/api/user/${userId}`).then((r) => r.json()),
    ]).then(([statsData, userData]) => {
      setStats(statsData);
      setUser(userData);
    }).finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>📊 Combat Stats</h1>
      <p style={{ color: "#888", marginBottom: "2rem" }}>{user?.username} — Level {user?.level}</p>

      {stats && (
        <>
          <div className="card">
            <h3 style={{ marginBottom: "1rem" }}>Base Stats</h3>
            <div className="stat-grid">
              <div className="stat-item">
                <div className="stat-value">{stats.final?.str ?? user?.str}</div>
                <div className="stat-label">Strength</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.final?.agi ?? user?.agi}</div>
                <div className="stat-label">Agility</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.final?.luck ?? user?.luck}</div>
                <div className="stat-label">Luck</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.final?.maxHp ?? user?.maxHp}</div>
                <div className="stat-label">Max HP</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.final?.defense ?? 0}</div>
                <div className="stat-label">Defense</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: "1rem" }}>Combat Ratings</h3>
            <div className="stat-grid">
              <div className="stat-item">
                <div className="stat-value">{((stats.critChance ?? 0) * 100).toFixed(1)}%</div>
                <div className="stat-label">Crit Chance</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{((stats.critMultiplier ?? 1) * 100).toFixed(0)}%</div>
                <div className="stat-label">Crit Damage</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{((stats.dodgeChance ?? 0) * 100).toFixed(1)}%</div>
                <div className="stat-label">Dodge</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{((stats.blockChance ?? 0) * 100).toFixed(1)}%</div>
                <div className="stat-label">Block</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{((stats.speed ?? 100))}</div>
                <div className="stat-label">Speed</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.damage ?? 0}</div>
                <div className="stat-label">Avg Damage</div>
              </div>
            </div>
          </div>

          {stats.talentBonuses && (
            <div className="card">
              <h3 style={{ marginBottom: "1rem" }}>Talent Bonuses</h3>
              <div className="stat-grid">
                <div className="stat-item">
                  <div className="stat-value">{stats.talentBonuses.dps ?? 0}</div>
                  <div className="stat-label">DPS Talents</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stats.talentBonuses.tank ?? 0}</div>
                  <div className="stat-label">Tank Talents</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stats.talentBonuses.support ?? 0}</div>
                  <div className="stat-label">Support Talents</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
