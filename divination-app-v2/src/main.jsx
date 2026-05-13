import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const root = document.getElementById("root");

try {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (err) {
  root.innerHTML = `<div style="padding:40px;color:#e94560;font-family:sans-serif">
    <h2>页面加载失败</h2>
    <pre style="font-size:12px;opacity:0.7">${err.message}</pre>
    <p style="font-size:12px;opacity:0.5">请尝试用手机自带浏览器打开</p>
  </div>`;
}
