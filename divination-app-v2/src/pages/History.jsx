import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../useLocalStorage";
import "./History.css";

function formatDate(timestamp) {
  const d = new Date(timestamp);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return `今天 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) {
    return `昨天 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function groupByMonth(records) {
  const groups = {};
  records.forEach((r) => {
    const d = new Date(r.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!groups[key]) {
      groups[key] = { label: `${d.getFullYear()}年${d.getMonth() + 1}月`, records: [] };
    }
    groups[key].records.push(r);
  });
  return Object.values(groups).sort((a, b) => b.records[0].timestamp - a.records[0].timestamp);
}

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useLocalStorage("divination_history", []);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayRecords = history.filter((r) => new Date(r.timestamp).toDateString() === today);
    const freq = {};
    history.forEach((r) => {
      const name = r.hexagram?.fullName || "未知";
      freq[name] = (freq[name] || 0) + 1;
    });
    let favorite = "-";
    let max = 0;
    Object.entries(freq).forEach(([name, count]) => {
      if (count > max) { max = count; favorite = name; }
    });
    return { total: history.length, today: todayRecords.length, favorite };
  }, [history]);

  const grouped = useMemo(() => groupByMonth(history), [history]);

  const deleteRecord = (id) => {
    setHistory(history.filter((r) => r.id !== id));
  };

  const viewRecord = (record) => {
    navigate("/result", {
      state: {
        hexagram: record.hexagram,
        question: record.question || "",
        code: record.code || "",
      },
    });
  };

  if (history.length === 0) {
    return (
      <div className="history-empty">
        <p className="history-empty-icon">📜</p>
        <h2>还没有起卦记录</h2>
        <p>去首页起一卦吧</p>
        <button className="history-back-btn" onClick={() => navigate("/")}>
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="history">
      <header className="history-header">
        <button className="history-back-btn" onClick={() => navigate("/")}>
          ← 返回
        </button>
        <h1>历史记录</h1>
      </header>

      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-num">{stats.total}</span>
          <span className="stat-label">总计</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">{stats.today}</span>
          <span className="stat-label">今日</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">{stats.favorite}</span>
          <span className="stat-label">最常见</span>
        </div>
      </div>

      {grouped.map((group) => (
        <div key={group.label} className="month-group">
          <h3 className="month-label">{group.label}</h3>
          {group.records.map((record) => (
            <div key={record.id} className="record-card" onClick={() => viewRecord(record)}>
              <div className="record-top">
                <span className="record-name">{record.hexagram?.fullName || "未知卦"}</span>
                <button
                  className="record-del"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRecord(record.id);
                  }}
                >
                  删除
                </button>
              </div>
              <p className="record-question">{record.question || "今日运势"}</p>
              <span className="record-time">{formatDate(record.timestamp)}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
