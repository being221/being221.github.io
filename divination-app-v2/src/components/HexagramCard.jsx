import "./HexagramCard.css";

export default function HexagramCard({ hexagram }) {
  return (
    <div className="hexagram-card">
      <div className="hexagram-symbol">{hexagram.image}</div>
      <h1 className="hexagram-name">{hexagram.fullName}</h1>
      <p className="hexagram-code">{hexagram.code}</p>
      <p className="hexagram-desc">{hexagram.desc}</p>
      {hexagram.overall && <p className="hexagram-overall">{hexagram.overall}</p>}
    </div>
  );
}
