import "./LineList.css";

const LINE_NAMES = ["初", "二", "三", "四", "五", "上"];

export default function LineList({ lines }) {
  if (!lines || lines.length === 0) return null;
  return (
    <div className="line-list">
      <h3 className="line-list-title">六爻详解</h3>
      {lines.map((line, i) => (
        <div key={i} className="line-item">
          <div className="line-header">
            <span className="line-badge">{LINE_NAMES[i]}</span>
            <strong>{line.text}</strong>
          </div>
          <p className="line-meaning">{line.meaning}</p>
          {line.interpretation && (
            <p className="line-interpretation">{line.interpretation}</p>
          )}
        </div>
      ))}
    </div>
  );
}
