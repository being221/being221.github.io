import { useState, useCallback } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useLocalStorage } from "../useLocalStorage";
import HexagramCard from "../components/HexagramCard";
import FortuneGrid from "../components/FortuneGrid";
import LineList from "../components/LineList";
import Toast from "../components/Toast";
import "./Result.css";

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const hexagram = location.state?.hexagram || null;
  const question = location.state?.question || "";
  const code = location.state?.code || "";

  const [history, setHistory] = useLocalStorage("divination_history", []);
  const [toast, setToast] = useState(null);
  const [saved, setSaved] = useState(false);
  const [notes, setNotes] = useState(location.state?.notes || "");

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  if (!hexagram) {
    return (
      <div className="result-empty">
        <p className="empty-icon">🎲</p>
        <h2>暂未起卦</h2>
        <p>请先返回首页开始起卦</p>
        <button className="result-btn result-btn--primary" onClick={() => navigate("/")}>
          返回首页
        </button>
      </div>
    );
  }

  const saveRecord = () => {
    const record = {
      id: Date.now().toString(),
      hexagram,
      question,
      code,
      notes,
      timestamp: Date.now(),
    };
    setHistory([record, ...history].slice(0, 100));
    setSaved(true);
    showToast("已保存到历史记录", "success");
  };

  const shareResult = async () => {
    const text = `【${hexagram.fullName}】${hexagram.desc}\n\n问题：${question || "今日运势"}\n建议：${hexagram.advice || ""}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "起卦结果", text });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast("结果已复制到剪贴板");
    } catch {
      showToast("分享功能暂不可用");
    }
  };

  return (
    <div className="result page-enter">
      {toast && <Toast message={toast.message} type={toast.type} onDone={clearToast} />}

      <div className="result-header">
        <button className="result-back" onClick={() => navigate("/")}>
          ← 返回
        </button>
        <span className="result-question">{question || "今日运势"}</span>
      </div>

      <HexagramCard hexagram={hexagram} />
      <FortuneGrid fortune={hexagram.fortune} />

      {hexagram.advice && (
        <div className="result-advice">
          <h3>建议</h3>
          <p>{hexagram.advice}</p>
        </div>
      )}

      <div className="result-notes">
        <h3>笔记</h3>
        <textarea
          className="notes-input"
          value={notes}
          onChange={(e) => { setNotes(e.target.value); setSaved(false); }}
          placeholder="记录你的想法和感悟..."
          rows={3}
        />
      </div>

      <LineList lines={hexagram.lines} />

      <div className="result-actions">
        {!saved ? (
          <button className="result-btn result-btn--primary" onClick={saveRecord}>
            保存记录
          </button>
        ) : (
          <button className="result-btn result-btn--saved" disabled>
            已保存
          </button>
        )}
        <button className="result-btn result-btn--secondary" onClick={shareResult}>
          分享结果
        </button>
        <button className="result-btn result-btn--secondary" onClick={() => navigate("/")}>
          再起一卦
        </button>
      </div>
    </div>
  );
}
