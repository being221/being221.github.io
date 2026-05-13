import "./FortuneGrid.css";

const LABELS = { career: "事业", love: "感情", wealth: "财富", health: "健康" };
const ICONS = { career: "💼", love: "💕", wealth: "💰", health: "🏥" };

export default function FortuneGrid({ fortune }) {
  if (!fortune) return null;
  return (
    <div className="fortune-grid">
      {Object.entries(LABELS).map(([key, label]) => (
        <div key={key} className="fortune-item">
          <span className="fortune-icon">{ICONS[key]}</span>
          <span className="fortune-label">{label}</span>
          <p className="fortune-text">{fortune[key] || "-"}</p>
        </div>
      ))}
    </div>
  );
}
