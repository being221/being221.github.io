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

// 备用名言（API 挂了也不慌）—— 20条，中西古今，不太常见
let fallbackQuotes = [
  "一个人的真正价值首先决定于他在什么程度上和在什么意义上从自我解放出来。——爱因斯坦",
  "未经审视的人生不值得过。——苏格拉底",
  "道可道，非常道；名可名，非常名。——老子",
  "知其不可而为之。——《论语》",
  "凡所有相，皆是虚妄。——《金刚经》",
  "只有那些从不仰望星空的人，才不会跌入坑中。——伽利略（误传，但流传很广）",
  "人要诗意地栖居在这片大地上。——荷尔德林",
  "所谓自由，不是随心所欲，而是自我主宰。——康德",
  "重要的不是治愈，而是带着病痛活下去。——加缪",
  "在最深的绝望里，遇见最美的意外。——几米（漫画）",
  "悲剧将人生的有价值的东西毁灭给人看，喜剧将那无价值的撕破给人看。——鲁迅",
  "你能在浪费时间中获得乐趣，就不是浪费时间。——罗素",
  "当你凝视深渊时，深渊也在凝视你。——尼采",
  "爱情太短，遗忘太长。——聂鲁达",
  "一个人知道自己为什么而活，就可以忍受任何一种生活。——尼采",
  "我们读诗写诗，并不是因为它们好玩，而是因为我们是人类的一分子。——《死亡诗社》",
  "海底月是天上月，眼前人是心上人。——张爱玲",
  "未来已经到来，只是分布不均。——威廉·吉布森",
  "万物皆有裂痕，那是光照进来的地方。——莱昂纳德·科恩",
  "善良一点，因为每个人都在打一场硬仗。——柏拉图（误传，但流传很广）"
];

// 洗牌算法：Fisher-Yates
let shuffleArr = (arr) => {
  let a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// 备选队列：每轮把所有 20 条洗乱，然后逐个弹出，弹完再洗一轮
let quoteQueue = [];

let nextFallback = () => {
  if (quoteQueue.length === 0) {
    quoteQueue = shuffleArr(fallbackQuotes);
  }
  return quoteQueue.pop();
};

btn.onclick = () => {
  msg.textContent = nextFallback();
};

// 页面加载时自动显示第一条
msg.textContent = nextFallback();

// ===== 留言板（Supabase 云端存储）=====
(function() {
  let supabase = window.supabase.createClient(
    "https://codndkieecddabbqhdtg.supabase.co",
    "sb_publishable_wgX79e2z2kgcWKkhmDZIuw_Pd3FCj8E"
  );

  let guestForm = document.getElementById("guestForm");
  let msgBoard = document.getElementById("msgBoard");

  // 每台设备一个唯一 ID（存在 localStorage）
  let deviceId = localStorage.getItem("sb_device_id");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("sb_device_id", deviceId);
  }

  // 管理员？（你可以在浏览器控制台运行：localStorage.setItem("sb_admin","true") ）
  let isAdmin = () => localStorage.getItem("sb_admin") === "true";

  // 从 Supabase 拉取留言
  async function loadMessages() {
    try {
      let query = supabase.from("messages").select("*").order("created_at", { ascending: false });
      // 普通人只看到自己的留言，管理员看到全部
      if (!isAdmin()) {
        query = query.eq("device_id", deviceId);
      }
      let { data } = await query;
      renderMessages(data || []);
    } catch (e) {
      msgBoard.innerHTML = '<p style="opacity:0.5">留言加载失败，请刷新页面重试</p>';
    }
  }

  // 渲染留言
  function renderMessages(messages) {
    msgBoard.innerHTML = "";
    if (messages.length === 0) {
      msgBoard.innerHTML = '<p style="opacity:0.5;font-size:14px">还没有留言，来说点什么吧</p>';
      return;
    }

    messages.forEach((m) => {
      let card = document.createElement("div");
      card.className = "msg-card";

      let timeStr = new Date(m.created_at).toLocaleString("zh-CN");

      let replyHTML = "";
      if (m.reply) {
        let replyTime = m.reply_time ? new Date(m.reply_time).toLocaleString("zh-CN") : "";
        replyHTML = `<div style="margin-top:8px;padding:8px 12px;background:var(--bg);border-radius:6px;border-left:3px solid var(--accent)">
          <strong style="color:var(--accent)">此泽 回复：</strong>
          <small style="opacity:0.5">${replyTime}</small>
          <p style="margin:4px 0 0;font-size:14px">${m.reply}</p>
        </div>`;
      }

      // 管理员显示设备标识 + 回复按钮
      let adminHTML = "";
      if (isAdmin()) {
        adminHTML = `<small style="opacity:0.4">｜设备：${m.device_id.slice(0, 8)}</small>
          <button class="replyBtn" data-id="${m.id}" style="float:right;font-size:12px;padding:4px 12px;border:1px solid var(--accent);color:var(--accent);background:none;border-radius:14px;cursor:pointer">回复</button>`;
      }

      card.innerHTML = `
        <strong>${m.nickname}</strong>
        <small>${timeStr}</small>
        ${adminHTML}
        <p>${m.message}</p>
        ${replyHTML}
      `;

      msgBoard.appendChild(card);
    });

    // 统计
    let names = [...new Set(messages.map((m) => m.nickname))];
    let stats = document.getElementById("msgStats");
    stats.textContent = isAdmin()
      ? `🔐 管理员视图 · 共 ${messages.length} 条留言，来自 ${names.length} 位朋友`
      : `共 ${messages.length} 条留言`;
  }

  // 提交留言
  guestForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let name = document.getElementById("guestName").value.trim();
    let text = document.getElementById("guestMsg").value.trim();
    if (!name || !text) return;

    let { error } = await supabase.from("messages").insert({
      nickname: name,
      message: text,
      device_id: deviceId
    });

    if (error) {
      alert("留言提交失败：" + error.message);
      return;
    }

    guestForm.reset();
    loadMessages();
  });

  // 管理员回复
  msgBoard.addEventListener("click", async (e) => {
    if (e.target.classList.contains("replyBtn")) {
      let reply = prompt("输入回复内容：");
      if (!reply) return;
      let id = e.target.dataset.id;
      let { error } = await supabase.from("messages").update({
        reply: reply,
        reply_time: new Date().toISOString()
      }).eq("id", id);

      if (error) {
        alert("回复失败：" + error.message);
        return;
      }
      loadMessages();
    }
  });

  // 初始加载
  loadMessages();
})();

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
