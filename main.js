// ===== 实时时钟 =====
let clock = document.getElementById("clock");

let updateTime = () => {
  let now = new Date();
  let h = String(now.getHours()).padStart(2, "0");
  let m = String(now.getMinutes()).padStart(2, "0");
  let s = String(now.getSeconds()).padStart(2, "0");
  clock.textContent = `${h}:${m}:${s}`;
};
updateTime();
setInterval(updateTime, 1000);

// ===== localStorage：随笔自动保存 =====
let note = document.getElementById("note");

let savedNote = localStorage.getItem("savedNote");
if (savedNote) {
  note.textContent = savedNote;
}

note.addEventListener("input", () => {
  localStorage.setItem("savedNote", note.textContent);
});

// ===== 随机名言 =====
let btn = document.getElementById("myBtn");
let msg = document.getElementById("msg");

// 备用名言（API 挂了也不慌）
let fallbackQuotes = [
  "人不能两次踏入同一条河流。——赫拉克利特",
  "我思故我在。——笛卡尔",
  "知之为知之，不知为不知，是知也。——《论语》",
  "存在先于本质。——萨特",
  "凡是过往，皆为序章。——莎士比亚"
];

btn.onclick = async () => {
  msg.textContent = "加载中...";

  try {
    let response = await fetch("https://api.quotable.io/random");
    let data = await response.json();
    msg.textContent = `${data.content} ——${data.author}`;
  } catch {
    let n = Math.floor(Math.random() * fallbackQuotes.length);
    msg.textContent = fallbackQuotes[n];
  }
};

// ===== 留言板 =====
let guestForm = document.getElementById("guestForm");
let msgBoard = document.getElementById("msgBoard");

// 从 localStorage 加载留言（JSON.parse 把字符串还原成数组）
let messages = JSON.parse(localStorage.getItem("messages")) || [];

// 渲染留言：清空容器 → 逐条创建 DOM → 塞进去
let renderMessages = () => {
  msgBoard.innerHTML = "";
  messages.forEach((m, i) => {
    let card = document.createElement("div");
    card.className = "msg-card";

    let timeStr = new Date(m.time).toLocaleString("zh-CN");

    card.innerHTML = `
      <strong>${m.name}</strong>
      <small>${timeStr}</small>
      <button class="delBtn" data-index="${i}">删除</button>
      <p>${m.text}</p>
    `;

    msgBoard.appendChild(card);
  });

  // 用 map + filter 统计留言
  let names = messages.map((m) => m.name);               // 提取名字
  let unique = names.filter((n, i) => names.indexOf(n) === i); // 去重
  let stats = document.getElementById("msgStats");
  stats.textContent = `共 ${messages.length} 条留言，来自 ${unique.length} 位朋友`;
};

renderMessages();

guestForm.addEventListener("submit", (e) => {
  e.preventDefault();

  let name = document.getElementById("guestName").value.trim();
  let text = document.getElementById("guestMsg").value.trim();
  if (!name || !text) return;

  messages.push({ name, text, time: Date.now() });
  localStorage.setItem("messages", JSON.stringify(messages));

  renderMessages();
  guestForm.reset();
});

// 事件委托：父容器监听 → 判断谁被点了
msgBoard.addEventListener("click", (e) => {
  if (e.target.classList.contains("delBtn")) {
    let i = Number(e.target.dataset.index);
    messages.splice(i, 1);  // 从数组删除
    localStorage.setItem("messages", JSON.stringify(messages));
    renderMessages();
  }
});

// ===== 主题管理：localStorage > OS 偏好 > 默认深色 =====
let themeBtn = document.getElementById("themeBtn");

// 判断当前是否浅色模式
let isLight = () => document.body.classList.contains("light");

// 应用主题并更新按钮文案
let applyTheme = (light) => {
  if (light) {
    document.body.classList.add("light");
    themeBtn.textContent = "切换深色模式";
  } else {
    document.body.classList.remove("light");
    themeBtn.textContent = "切换浅色模式";
  }
};

// 确定初始主题：localStorage → OS 偏好 → 默认深色
let savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  // 用户主动选过 → 尊重用户
  applyTheme(savedTheme === "light");
} else {
  // 首次访问 → 跟随系统
  let prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  applyTheme(prefersLight);
}

// 手动切换
themeBtn.onclick = () => {
  let next = !isLight();
  applyTheme(next);
  localStorage.setItem("theme", next ? "light" : "dark");
};

// 当系统主题变化时自动跟随（仅在没有手动设置过的情况下）
window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", (e) => {
  if (!localStorage.getItem("theme")) {
    applyTheme(e.matches);
  }
});

// ===== 回到顶部按钮 =====
let backTop = document.getElementById("backTop");

window.addEventListener("scroll", () => {
  if (window.scrollY > 400) {
    backTop.classList.add("show");
  } else {
    backTop.classList.remove("show");
  }
});

backTop.onclick = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// ===== 2048 游戏 =====
let gGrid = Array(16).fill(0);
let gScore = 0;
let gBest = parseInt(localStorage.getItem("best2048")) || 0;
let gOver = false;
let gWon = false;
let gHistory = [];

let gScoreEl = document.getElementById("g2048-score");
let gBestEl = document.getElementById("g2048-best");
let gTiles = [].slice.call(document.querySelectorAll("#g2048-grid .tile"));
let gUndoBtn = document.getElementById("g2048-undo");
let gOverlay = document.getElementById("g2048-overlay");
let gOverlayMsg = document.getElementById("g2048-overlay-msg");

gBestEl.textContent = gBest;

let gNewTileIdx = -1;
let gMergedValues = [];
let gPrevScore = 0;

let renderGrid = () => {
  gTiles.forEach((el, i) => {
    let v = gGrid[i];
    el.textContent = v || "";
    let cls = "tile";
    if (v) cls += " n" + v;
    if (i === gNewTileIdx) {
      cls += " new-tile";
    }
    if (v > 0 && gMergedValues.indexOf(v) !== -1) {
      cls += " merged-tile";
      gMergedValues.splice(gMergedValues.indexOf(v), 1);
    }
    el.className = cls;
    if (v === 0) el.style.color = "";
  });
  if (gScore > gPrevScore) {
    gScoreEl.classList.remove("g2048-score-pop");
    void gScoreEl.offsetWidth;
    gScoreEl.classList.add("g2048-score-pop");
  }
  gPrevScore = gScore;
  gScoreEl.textContent = gScore;
  if (gScore > gBest) {
    gBest = gScore;
    gBestEl.textContent = gBest;
    localStorage.setItem("best2048", gBest);
  }
};

let addTile = () => {
  let empty = gGrid.reduce((a, v, i) => { if (v === 0) a.push(i); return a; }, []);
  if (empty.length === 0) return;
  let i = empty[Math.floor(Math.random() * empty.length)];
  gGrid[i] = Math.random() < 0.9 ? 2 : 4;
  gNewTileIdx = i;
};

let initGame = () => {
  gGrid = Array(16).fill(0);
  gScore = 0;
  gOver = false;
  gWon = false;
  gNewTileIdx = -1;
  gMergedValues = [];
  gPrevScore = 0;
  gHistory = [];
  gUndoBtn.disabled = true;
  addTile();
  addTile();
  renderGrid();
};

let slideRow = (row) => {
  let arr = row.filter(v => v);
  let mergedVals = [];
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      gScore += arr[i];
      mergedVals.push(arr[i]);
      if (arr[i] === 2048 && !gWon) {
        gWon = true;
        setTimeout(() => showOverlay("恭喜！你达到了 2048！可以继续玩。"), 100);
      }
      arr[i + 1] = 0;
    }
  }
  arr = arr.filter(v => v);
  while (arr.length < 4) arr.push(0);
  return { row: arr, merged: mergedVals };
};

let getRow = (g, r) => [g[r*4], g[r*4+1], g[r*4+2], g[r*4+3]];
let setRow = (g, r, row) => { g[r*4]=row[0]; g[r*4+1]=row[1]; g[r*4+2]=row[2]; g[r*4+3]=row[3]; };
let getCol = (g, c) => [g[c], g[c+4], g[c+8], g[c+12]];
let setCol = (g, c, col) => { g[c]=col[0]; g[c+4]=col[1]; g[c+8]=col[2]; g[c+12]=col[3]; };

let arraysEqual = (a, b) => {
  for (let i = 0; i < 16; i++) { if (a[i] !== b[i]) return false; }
  return true;
};

let move = (dir) => {
  if (gOver) return;
  let before = gGrid.slice();
  let scoreBefore = gScore;
  gNewTileIdx = -1;
  gMergedValues = [];

  if (dir === 0) {
    for (let r = 0; r < 4; r++) {
      let result = slideRow(getRow(gGrid, r));
      setRow(gGrid, r, result.row);
      gMergedValues.push(...result.merged);
    }
  } else if (dir === 1) {
    for (let r = 0; r < 4; r++) {
      let result = slideRow(getRow(gGrid, r).reverse());
      setRow(gGrid, r, result.row.reverse());
      gMergedValues.push(...result.merged);
    }
  } else if (dir === 2) {
    for (let c = 0; c < 4; c++) {
      let result = slideRow(getCol(gGrid, c));
      setCol(gGrid, c, result.row);
      gMergedValues.push(...result.merged);
    }
  } else if (dir === 3) {
    for (let c = 0; c < 4; c++) {
      let result = slideRow(getCol(gGrid, c).reverse());
      setCol(gGrid, c, result.row.reverse());
      gMergedValues.push(...result.merged);
    }
  }

  if (!arraysEqual(before, gGrid)) {
    gHistory.push({ grid: before, score: scoreBefore });
    gUndoBtn.disabled = false;
    addTile();
    renderGrid();
    checkGameOver();
  }
};

let checkGameOver = () => {
  if (gGrid.indexOf(0) !== -1) return;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      if (gGrid[r * 4 + c] === gGrid[r * 4 + c + 1]) return;
    }
  }
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 3; r++) {
      if (gGrid[r * 4 + c] === gGrid[(r + 1) * 4 + c]) return;
    }
  }
  gOver = true;
  if (!gWon) {
    setTimeout(() => showOverlay("游戏结束！得分：" + gScore), 100);
  }
};

document.addEventListener("keydown", (e) => {
  let map = { ArrowLeft: 0, ArrowRight: 1, ArrowUp: 2, ArrowDown: 3 };
  if (e.key in map) {
    e.preventDefault();
    move(map[e.key]);
  }
});

// 2048 触屏支持
let gGridEl = document.getElementById("g2048-grid");
let touchStartX = 0, touchStartY = 0;
gGridEl.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

gGridEl.addEventListener("touchend", (e) => {
  let dx = e.changedTouches[0].clientX - touchStartX;
  let dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;

  e.preventDefault();
  if (Math.abs(dx) > Math.abs(dy)) {
    move(dx > 0 ? 1 : 0);
  } else {
    move(dy > 0 ? 3 : 2);
  }
});

let showOverlay = (msg) => {
  if (!gOverlayMsg || !gOverlay) return;
  gOverlayMsg.textContent = msg;
  gOverlay.classList.add("show");
};
document.getElementById("g2048-overlay-btn").onclick = () => {
  if (gOverlay) gOverlay.classList.remove("show");
};

let undoMove = () => {
  if (gHistory.length === 0) return;
  let prev = gHistory.pop();
  gGrid = prev.grid;
  gScore = prev.score;
  gOver = false;
  gNewTileIdx = -1;
  gMergedValues = [];
  gPrevScore = gScore;
  renderGrid();
  if (gHistory.length === 0) gUndoBtn.disabled = true;
};

document.getElementById("g2048-restart").onclick = initGame;
gUndoBtn.onclick = undoMove;
gUndoBtn.disabled = true;

initGame();
