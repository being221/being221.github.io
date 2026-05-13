import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../useLocalStorage";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import "./Settings.css";

const DEFAULTS = {
  divinationMethod: "click",
  sensitivity: 15,
  fontSize: "medium",
  sound: true,
  vibration: true,
};

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useLocalStorage("divination_settings", DEFAULTS);
  const [showClearModal, setShowClearModal] = useState(false);
  const [toast, setToast] = useState(null);

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleFontSize = (size) => {
    update("fontSize", size);
    document.body.className = document.body.className.replace(
      /font-\w+/g, ""
    );
    if (size !== "medium") {
      document.body.classList.add(`font-${size}`);
    }
  };

  const handleClearData = () => {
    localStorage.removeItem("divination_history");
    localStorage.removeItem("divination_settings");
    setSettings({ ...DEFAULTS });
    setShowClearModal(false);
    setToast({ message: "所有数据已清除", type: "success" });
    // Reset font size
    document.body.className = document.body.className.replace(/font-\w+/g, "");
  };

  useEffect(() => {
    if (settings.fontSize && settings.fontSize !== "medium") {
      document.body.className = document.body.className.replace(/font-\w+/g, "");
      document.body.classList.add(`font-${settings.fontSize}`);
    }
  }, []);

  return (
    <div className="settings page-enter">
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      <header className="settings-header">
        <button className="settings-back" onClick={() => navigate("/")}>
          ← 返回
        </button>
        <h1>设置</h1>
      </header>

      {/* 起卦方式 */}
      <section className="setting-section">
        <h3>起卦方式</h3>
        <div className="setting-row">
          <span>默认方式</span>
          <select
            className="setting-select"
            value={settings.divinationMethod || "click"}
            onChange={(e) => update("divinationMethod", e.target.value)}
          >
            <option value="click">点击起卦</option>
            <option value="shake">摇一摇起卦</option>
          </select>
        </div>
      </section>

      {/* 摇动灵敏度 */}
      <section className="setting-section">
        <h3>摇动灵敏度</h3>
        <div className="setting-row">
          <span>灵敏度 ({settings.sensitivity || 15})</span>
          <input
            type="range"
            className="setting-range"
            min="10"
            max="30"
            value={settings.sensitivity || 15}
            onChange={(e) => update("sensitivity", Number(e.target.value))}
          />
        </div>
      </section>

      {/* 字体大小 */}
      <section className="setting-section">
        <h3>字体大小</h3>
        <div className="setting-row">
          <span>文字大小</span>
          <select
            className="setting-select"
            value={settings.fontSize || "medium"}
            onChange={(e) => handleFontSize(e.target.value)}
          >
            <option value="small">小</option>
            <option value="medium">中</option>
            <option value="large">大</option>
          </select>
        </div>
      </section>

      {/* 音效与震动 */}
      <section className="setting-section">
        <h3>反馈</h3>
        <div className="setting-row">
          <span>起卦音效</span>
          <button
            className={`toggle ${settings.sound !== false ? "toggle--on" : ""}`}
            onClick={() => update("sound", settings.sound === false ? true : false)}
          >
            {settings.sound !== false ? "开" : "关"}
          </button>
        </div>
        <div className="setting-row">
          <span>手机震动</span>
          <button
            className={`toggle ${settings.vibration !== false ? "toggle--on" : ""}`}
            onClick={() => update("vibration", settings.vibration === false ? true : false)}
          >
            {settings.vibration !== false ? "开" : "关"}
          </button>
        </div>
      </section>

      {/* 数据管理 */}
      <section className="setting-section">
        <h3>数据管理</h3>
        <div className="setting-row">
          <span>清除所有数据</span>
          <button className="danger-btn" onClick={() => setShowClearModal(true)}>
            清除
          </button>
        </div>
      </section>

      {/* 关于 */}
      <section className="setting-section">
        <h3>关于</h3>
        <p className="about-text">我的起卦 v2.0 · React 重做版</p>
        <p className="about-text">仅供娱乐，请相信科学、拒绝迷信。</p>
      </section>

      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="确认清除"
      >
        <p className="clear-warning">将删除所有起卦历史和设置数据，此操作不可恢复。</p>
        <div className="modal-actions">
          <button className="modal-btn modal-btn--secondary" onClick={() => setShowClearModal(false)}>
            取消
          </button>
          <button className="modal-btn modal-btn--danger" onClick={handleClearData}>
            确认清除
          </button>
        </div>
      </Modal>
    </div>
  );
}
