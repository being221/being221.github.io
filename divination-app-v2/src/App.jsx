import { useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { useLocalStorage } from "./useLocalStorage";
import Home from "./pages/Home";
import Result from "./pages/Result";
import History from "./pages/History";

export default function App() {
  const [theme, setTheme] = useLocalStorage("theme", "dark");

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <HashRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home theme={theme} onToggleTheme={toggleTheme} />} />
          <Route path="/result" element={<Result />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
