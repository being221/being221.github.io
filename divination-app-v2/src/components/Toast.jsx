import { useState, useEffect } from "react";
import "./Toast.css";

export default function Toast({ message, type = "info", onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div className={`toast toast--${type}`} onClick={() => { setVisible(false); onDone?.(); }}>
      {message}
    </div>
  );
}
