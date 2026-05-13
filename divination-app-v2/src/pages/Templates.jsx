import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { coinDivination } from "../utils/divination";
import templatesData from "../data/templates.json";
import "./Templates.css";

const CATEGORIES = Object.entries(templatesData).map(([key, val]) => ({
  key,
  name: val.name,
  icon: val.icon,
}));

export default function Templates() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].key);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const items = templatesData[activeCategory]?.templates || [];
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (t) =>
        t.text.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.toLowerCase().includes(q)) ||
        t.category.toLowerCase().includes(q)
    );
  }, [activeCategory, search]);

  const handleSelect = (text) => {
    const result = coinDivination();
    navigate("/result", {
      state: { hexagram: result.hexagram, question: text, code: result.code },
    });
  };

  return (
    <div className="templates page-enter">
      <header className="templates-header">
        <button className="templates-back" onClick={() => navigate("/")}>
          ← 返回
        </button>
        <h1>问题模板</h1>
      </header>

      <div className="category-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className={`cat-tab ${cat.key === activeCategory ? "cat-tab--active" : ""}`}
            onClick={() => setActiveCategory(cat.key)}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      <input
        className="templates-search"
        type="text"
        placeholder="搜索模板..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="templates-list">
        {filtered.length === 0 ? (
          <p className="templates-empty">没有匹配的模板</p>
        ) : (
          filtered.map((t) => (
            <button
              key={t.id}
              className="template-card"
              onClick={() => handleSelect(t.text)}
            >
              <span className="template-text">{t.text}</span>
              <span className="template-category">{t.category}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
