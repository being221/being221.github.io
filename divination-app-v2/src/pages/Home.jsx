import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../useLocalStorage";
import { coinDivination, detectShake } from "../utils/divination";
import CoinGroup from "../components/CoinGroup";
import Modal from "../components/Modal";
import "./Home.css";

function todayKey() {
  return new Date().toDateString();
}

export default function Home({ theme, onToggleTheme }) {
  const navigate = useNavigate();
  const [history] = useLocalStorage("divination_history", []);
  const [todayCount, setTodayCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [question, setQuestion] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [coins, setCoins] = useState([true, true, true]);
  const [shakeGranted, setShakeGranted] = useState(false);
  const animRef = useRef(null);
  const shakePendingRef = useRef(false);

  useEffect(() => {
    setTodayCount(history.filter((r) => {
      const d = new Date(r.timestamp);
      return d.toDateString() === todayKey();
    }).length);
  }, [history]);

  // ===== 起卦动画（3 秒）=====
  const startAnimation = useCallback((q) => {
    setShowModal(false);
    setIsAnimating(true);
    let count = 0;
    animRef.current = setInterval(() => {
      setCoins([Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5]);
      count++;
      if (count >= 30) {
        clearInterval(animRef.current);
        animRef.current = null;
        setIsAnimating(false);
        const result = coinDivination();
        navigate("/result", {
          state: { hexagram: result.hexagram, question: q || "今日运势", code: result.code },
        });
      }
    }, 100);
  }, [navigate]);

  useEffect(() => {
    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, []);

  // ===== 点击起卦 =====
  const handleCardClick = () => {
    if (isAnimating) return;
    if (shakePendingRef.current) {
      // 摇一摇触发了弹窗 → 点卡片直接确认
    }
    setQuestion("");
    setShowModal(true);
  };

  const confirmQuestion = () => {
    shakePendingRef.current = false;
    startAnimation(question);
  };

  // ===== 摇一摇 =====
  const requestShake = async () => {
    if (isAnimating) return;
    if (typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function") {
      try {
        const perm = await DeviceMotionEvent.requestPermission();
        if (perm === "granted") {
          setShakeGranted(true);
          startShakeListen();
        }
      } catch { /* 用户拒绝 */ }
    } else {
      setShakeGranted(true);
      startShakeListen();
    }
  };

  const startShakeListen = () => {
    if (isListening) return;
    setIsListening(true);
    const handler = (e) => {
      detectShake(e, () => {
        stopShakeListen();
        shakePendingRef.current = true;
        setQuestion("");
        setShowModal(true);
      });
    };
    window.addEventListener("devicemotion", handler);
    window._shakeHandler = handler;
  };

  const stopShakeListen = () => {
    setIsListening(false);
    if (window._shakeHandler) {
      window.removeEventListener("devicemotion", window._shakeHandler);
      window._shakeHandler = null;
    }
  };

  useEffect(() => {
    return () => stopShakeListen();
  }, []);

  return (
    <div className="home">
      <header className="home-header">
        <h1>我的起卦</h1>
        <div className="header-actions">
          <span className="today-badge">今日 {todayCount} 次</span>
          <button className="theme-btn" onClick={onToggleTheme}>
            {theme === "dark" ? "浅色" : "深色"}
          </button>
        </div>
      </header>

      <div className="divination-area">
        <div
          className={`divination-card ${isAnimating ? "shaking" : ""}`}
          onClick={handleCardClick}
        >
          <CoinGroup coins={coins} isFlipping={isAnimating} />
          <h3 className="card-label">
            {isAnimating ? "起卦中..." : isListening ? "摇动手机起卦..." : "点击起卦"}
          </h3>
          <p className="card-hint">
            {isListening ? "正在感应摇动..." : "点击铜钱开始 | 摇动手机感应"}
          </p>
        </div>
      </div>

      <div className="quick-actions">
        <button className="quick-btn" onClick={() => navigate("/history")}>
          历史记录
        </button>
        {!shakeGranted && (
          <button className="quick-btn" onClick={requestShake}>
            开启摇一摇
          </button>
        )}
        {shakeGranted && !isListening && (
          <button className="quick-btn" onClick={startShakeListen}>
            摇一摇起卦
          </button>
        )}
        {isListening && (
          <button className="quick-btn quick-btn--active" onClick={stopShakeListen}>
            停止感应
          </button>
        )}
      </div>

      <div className="disclaimer">
        <p>温馨提示：本应用仅供娱乐，请相信科学、拒绝迷信。作者尚在学习前端开发，卦象结果由随机算法生成，切勿当真。</p>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); shakePendingRef.current = false; }} title="你想问什么？">
        <textarea
          className="question-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="输入你的问题（留空默认为「今日运势」）"
          rows={3}
        />
        <div className="modal-actions">
          <button
            className="modal-btn modal-btn--secondary"
            onClick={() => { setShowModal(false); shakePendingRef.current = false; }}
          >
            取消
          </button>
          <button className="modal-btn modal-btn--primary" onClick={confirmQuestion}>
            开始起卦
          </button>
        </div>
      </Modal>
    </div>
  );
}
