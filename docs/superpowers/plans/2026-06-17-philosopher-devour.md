# 诸子吞噬 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个 Phaser.js 俯视角吞噬进化游戏，玩家操控种子在战国地图上吞噬思想碎片，通过答题吸收知识并成长。

**Architecture:** 单目录 Web 游戏，Phaser 3.x 渲染主游戏场景（Canvas），DOM 层处理答题弹窗 UI。`GameScene` 负责地图/玩家/碎片/碰撞，答题时暂停游戏并通过事件桥接到 DOM 层。题库独立文件，按学派和难度层级组织。

**Tech Stack:** Phaser.js 3.x (CDN), JavaScript ES6, HTML5 Canvas, GitHub Pages 部署

## Global Constraints

- 单文件或少量 JS 文件，Phaser 从 CDN 加载
- 所有素材用代码绘制（Canvas 图形），不依赖外部图片
- 答题 UI 用 DOM 层（更好的中文渲染和交互）
- 部署到 GitHub Pages，子目录 `philosopher-devour/`
- 题库独立文件 `data/questions.js`，便于扩充
- 5 家学派各 6 题，共 30 题

---

### Task 1: 项目脚手架

**Files:**
- Create: `philosopher-devour/index.html`
- Create: `philosopher-devour/js/main.js`

**Interfaces:**
- Produces: `main.js` 导出 Phaser 配置对象，注册场景

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p philosopher-devour/js philosopher-devour/data philosopher-devour/assets
```

- [ ] **Step 2: 编写 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>诸子吞噬</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #1a1a2e;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: 'KaiTi', 'STKaiti', '楷体', serif;
      overflow: hidden;
    }
    #game-container {
      position: relative;
      width: 800px;
      height: 600px;
    }
    #game-container canvas {
      display: block;
    }
    /* 答题弹窗 */
    #question-overlay {
      display: none;
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      z-index: 10;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    #question-overlay.active {
      display: flex;
    }
    #question-panel {
      background: linear-gradient(135deg, #f5e6c8, #e8d5a3);
      border: 3px solid #8b6914;
      border-radius: 12px;
      padding: 30px;
      max-width: 550px;
      width: 90%;
      box-shadow: 0 8px 32px rgba(139, 105, 20, 0.4);
    }
    #question-text {
      font-size: 22px;
      color: #3d2b0a;
      margin-bottom: 20px;
      line-height: 1.6;
      text-align: center;
    }
    #question-options {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .q-option {
      background: #faf3e0;
      border: 2px solid #c9a96e;
      border-radius: 8px;
      padding: 14px 20px;
      font-size: 18px;
      color: #4a3520;
      cursor: pointer;
      transition: all 0.15s;
      text-align: left;
      font-family: inherit;
    }
    .q-option:hover {
      background: #d4a853;
      color: #fff;
      border-color: #8b6914;
      transform: scale(1.02);
    }
    .q-option.correct-flash {
      background: #4caf50;
      color: #fff;
      border-color: #2e7d32;
    }
    .q-option.wrong-flash {
      background: #e53935;
      color: #fff;
      border-color: #b71c1c;
    }
    #question-result {
      display: none;
      font-size: 16px;
      color: #5d4037;
      margin-top: 15px;
      text-align: center;
      line-height: 1.5;
    }
    #daolian-buttons {
      display: none;
      flex-direction: row;
      gap: 15px;
      margin-top: 20px;
      justify-content: center;
    }
    .daolian-btn {
      padding: 12px 28px;
      font-size: 18px;
      border-radius: 8px;
      cursor: pointer;
      font-family: inherit;
      font-weight: bold;
      transition: all 0.15s;
    }
    .daolian-continue {
      background: #ff6f00;
      color: #fff;
      border: 2px solid #e65100;
    }
    .daolian-continue:hover {
      background: #ff8f00;
      transform: scale(1.05);
    }
    .daolian-stop {
      background: #66bb6a;
      color: #fff;
      border: 2px solid #388e3c;
    }
    .daolian-stop:hover {
      background: #81c784;
      transform: scale(1.05);
    }
    #daolian-info {
      display: none;
      text-align: center;
      margin-top: 12px;
      color: #e65100;
      font-weight: bold;
      font-size: 15px;
    }
    /* 图鉴按钮 */
    #btn-collection {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 5;
      background: rgba(0, 0, 0, 0.5);
      color: #ffd54f;
      border: 1px solid #8b6914;
      border-radius: 6px;
      padding: 6px 14px;
      cursor: pointer;
      font-family: inherit;
      font-size: 15px;
      transition: background 0.15s;
    }
    #btn-collection:hover {
      background: rgba(0, 0, 0, 0.75);
    }
    /* 图鉴面板 */
    #collection-panel {
      display: none;
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      z-index: 15;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      overflow-y: auto;
    }
    #collection-panel.active {
      display: flex;
    }
    #collection-panel h2 {
      color: #ffd54f;
      font-size: 28px;
      margin-bottom: 20px;
    }
    #collection-panel .school-row {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      align-items: center;
      color: #e0d5b0;
    }
    #collection-panel .badge {
      font-size: 28px;
    }
    #collection-panel .badge.locked {
      filter: grayscale(1);
      opacity: 0.3;
    }
    #collection-panel .close-btn {
      margin-top: 20px;
      padding: 10px 30px;
      background: #8b6914;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-family: inherit;
      font-size: 18px;
    }
  </style>
</head>
<body>
  <div id="game-container">
    <!-- Phaser Canvas 在这里插入 -->
    <button id="btn-collection" onclick="window.toggleCollection()">📜 图鉴</button>

    <!-- 答题弹窗 -->
    <div id="question-overlay">
      <div id="question-panel">
        <div id="question-text"></div>
        <div id="question-options"></div>
        <div id="daolian-info"></div>
        <div id="daolian-buttons">
          <button class="daolian-btn daolian-continue" id="btn-continue">🔥 继续深入 (x<span id="next-multiplier">2</span>)</button>
          <button class="daolian-btn daolian-stop" id="btn-stop">🛑 收手落袋</button>
        </div>
        <div id="question-result"></div>
      </div>
    </div>

    <!-- 图鉴面板 -->
    <div id="collection-panel">
      <h2>📜 知识脉络</h2>
      <div id="collection-content"></div>
      <button class="close-btn" onclick="window.toggleCollection()">关闭</button>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
  <script src="data/questions.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 3: 编写 main.js（Phaser 配置）**

```js
// Phaser 游戏配置
const config = {
  type: Phaser.CANVAS,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#d4c5a0',
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

// 游戏状态（全局）
const GameState = {
  player: {
    x: 400, y: 300,
    size: 12,              // 5 ~ 100
    speed: 200,
    combo: 0,
    daolian: 0,            // 当前问道链层数
    multiplier: 1,
    totalFragments: 0,
    schoolProgress: {
      rujia: [],
      daojia: [],
      mojia: [],
      fajia: [],
      bingjia: [],
    },
  },
  fragments: [],           // 地图上的碎片
  paused: false,           // 答题时暂停
  daolianActive: false,    // 问道链是否激活
  daolianStake: 1,         // 问道链当前累积倍率
  cursors: null,
  keys: null,
};

// 玩家图形引用
let playerGraphic = null;
let fragmentGraphics = [];
let comboText = null;
let sizeText = null;

function preload() {
  // 无需加载外部资源，全部用 Canvas 绘制
}

function create() {
  // 占位 — 后续任务填充
}

function update(time, delta) {
  // 占位 — 后续任务填充
}
```

- [ ] **Step 4: 验证 — 打开 index.html，确认 Phaser 加载无报错，显示空画布**

- [ ] **Step 5: 提交**

```bash
git add philosopher-devour/ && git commit -m "feat: Phaser 脚手架 + DOM 答题弹窗布局"
```

---

### Task 2: 题库数据

**Files:**
- Create: `philosopher-devour/data/questions.js`

**Interfaces:**
- Produces: 全局对象 `QUESTION_BANK`，包含方法 `getQuestionsBySchool(schoolKey)`、`getQuestionById(id)`、`getAvailableFragments(player)` — 根据玩家已解锁题目返回可刷新的碎片

- [ ] **Step 1: 编写题库文件**

```js
// 诸子吞噬 — 题库
// 结构：{ id, school, tier(1-4), prerequisite(id|null), question, options[4], correct(0-3), explanation }
const QUESTION_BANK = {
  schools: {
    rujia:   { name: '儒家', color: 0xe74c3c, icon: '📖' },
    daojia:  { name: '道家', color: 0x2ecc71, icon: '🌿' },
    mojia:   { name: '墨家', color: 0x3498db, icon: '⚙️' },
    fajia:   { name: '法家', color: 0x9b59b6, icon: '⚖️' },
    bingjia: { name: '兵家', color: 0xe67e22, icon: '⚔️' },
  },

  questions: [
    // ==================== 儒家 ====================
    { id: 'r1', school: 'rujia', tier: 1, prerequisite: null,
      question: '"己所不欲，勿施于人"出自哪位思想家？',
      options: ['孔子', '孟子', '荀子', '老子'],
      correct: 0,
      explanation: '出自《论语·卫灵公》，是孔子"恕"道的核心表达。' },

    { id: 'r2', school: 'rujia', tier: 1, prerequisite: null,
      question: '儒家思想的核心概念是什么？',
      options: ['道', '仁', '法', '兼爱'],
      correct: 1,
      explanation: '"仁"是孔子学说的核心，指爱人、关怀他人的道德情感。' },

    { id: 'r3', school: 'rujia', tier: 2, prerequisite: 'r1',
      question: '孟子主张"性善论"，他认为人天生具有哪"四端"？',
      options: ['仁义礼智', '忠孝节义', '礼义廉耻', '仁义道德'],
      correct: 0,
      explanation: '孟子提出恻隐之心（仁之端）、羞恶之心（义之端）、辞让之心（礼之端）、是非之心（智之端）。' },

    { id: 'r4', school: 'rujia', tier: 2, prerequisite: 'r2',
      question: '荀子与孟子的根本分歧在于？',
      options: ['治国方略', '人性善恶', '礼乐制度', '经济政策'],
      correct: 1,
      explanation: '孟子主性善（人天生向善），荀子主性恶（人需后天教化）。这一分歧深刻影响了后世儒学发展。' },

    { id: 'r5', school: 'rujia', tier: 3, prerequisite: 'r3',
      question: '孟子见齐宣王，用"以羊易牛"的故事劝说齐宣王推行仁政。这体现了孟子的什么策略？',
      options: ['以利诱之', '推己及人，启发恻隐之心', '以武力威胁', '强调法制约束'],
      correct: 1,
      explanation: '孟子善于从君王已有的善念出发，引导其"推恩"——将对牛的恻隐之心推广到百姓身上。这是"仁政"思想的具体实践路径。' },

    { id: 'r6', school: 'rujia', tier: 4, prerequisite: 'r5',
      question: '韩非和李斯都师从荀子，却成为法家代表人物。这说明了什么？',
      options: [
        '荀子的教育方法是失败的',
        '性恶论与法家"以法治国"之间存在逻辑通道',
        '韩非背叛了老师',
        '儒家内部自然分裂'
      ],
      correct: 1,
      explanation: '荀子认为人性本恶、需外在规范约束，这为法家"以法治国"提供了逻辑起点。战国后期儒法之交融，正是思想史最精彩的篇章之一。' },

    // ==================== 道家 ====================
    { id: 'd1', school: 'daojia', tier: 1, prerequisite: null,
      question: '道家学派的创始人是？',
      options: ['庄子', '列子', '老子', '淮南子'],
      correct: 2,
      explanation: '老子（李耳），著有《道德经》，奠定了道家哲学的核心框架。' },

    { id: 'd2', school: 'daojia', tier: 1, prerequisite: null,
      question: '道家思想的核心概念是什么？',
      options: ['仁', '礼', '法', '道'],
      correct: 3,
      explanation: '"道"是道家最核心的概念，指宇宙万物的本源和运行规律。"道法自然"是道家根本精神。' },

    { id: 'd3', school: 'daojia', tier: 2, prerequisite: 'd1',
      question: '"无为而治"的真正含义是什么？',
      options: [
        '什么都不做',
        '不违背自然规律而妄为',
        '放弃所有制度',
        '让人民自行其是'
      ],
      correct: 1,
      explanation: '"无为"不是不作为，而是不妄为——顺应事物自身的规律，不做违背自然的干预。' },

    { id: 'd4', school: 'daojia', tier: 2, prerequisite: 'd2',
      question: '庄子与老子的思想有何不同侧重？',
      options: [
        '老子讲治国，庄子讲养生',
        '老子讲"道"的本体论，庄子更重精神逍遥与个体超越',
        '没有本质区别',
        '老子更消极'
      ],
      correct: 1,
      explanation: '老子偏向政治哲学（治道），庄子则发展了精神自由的维度，提出了"逍遥游"的人生境界。' },

    { id: 'd5', school: 'daojia', tier: 3, prerequisite: 'd4',
      question: '庄子在《逍遥游》中写大鹏"水击三千里，抟扶摇而上者九万里"，意在表达什么？',
      options: [
        '鸟的力量很重要',
        '人应当突破自身局限，追求精神的绝对自由',
        '大鸟比小鸟更优越',
        '自然界很壮观'
      ],
      correct: 1,
      explanation: '庄子以大鹏比喻精神的超越——真正的逍遥不在于外在的"大"，而在于突破认知和世俗的束缚，达到"无待"之境。' },

    { id: 'd6', school: 'daojia', tier: 4, prerequisite: 'd5',
      question: '道家的"无为"与儒家的"有为"在中国历史上形成了怎样的互补关系？',
      options: [
        '完全对立，互不相容',
        '儒道互补："治世用儒，乱世用道"，构成中国士人的双重精神世界',
        '道家取代儒家的功能',
        '只是学术争论，无实际影响'
      ],
      correct: 1,
      explanation: '儒道互补是中国思想史最核心的结构之一。儒家提供"入世"的行动伦理，道家提供"出世"的精神退路——"穷则独善其身，达则兼济天下"本身就是儒道融合的产物。' },

    // ==================== 墨家 ====================
    { id: 'm1', school: 'mojia', tier: 1, prerequisite: null,
      question: '墨家学派的创始人是？',
      options: ['墨翟', '韩非', '孙武', '惠施'],
      correct: 0,
      explanation: '墨子（墨翟），出身工匠阶层，创立了战国时期与儒家并称"显学"的墨家学派。' },

    { id: 'm2', school: 'mojia', tier: 1, prerequisite: null,
      question: '墨家"兼爱"与儒家"仁爱"的根本区别是什么？',
      options: [
        '没有区别',
        '兼爱是无差等的爱，仁爱是有亲疏差等的爱',
        '兼爱只爱自己人',
        '仁爱范围更大'
      ],
      correct: 1,
      explanation: '儒家仁爱以血缘亲疏为基础（"爱有差等"），墨家兼爱主张对所有人一视同仁地爱（"爱无差等"）。这是儒墨之争的核心议题。' },

    { id: 'm3', school: 'mojia', tier: 2, prerequisite: 'm1',
      question: '墨家除了"兼爱"，还有哪些核心主张？',
      options: [
        '仁政、礼治',
        '非攻、尚贤、节用、节葬、非命、天志、明鬼',
        '法治、术治、势治',
        '无为、自然'
      ],
      correct: 1,
      explanation: '墨家有十大主张，其中最核心的是兼爱和非攻（反对不义战争）。尚贤主张任人唯贤，节用节葬反对奢侈浪费。' },

    { id: 'm4', school: 'mojia', tier: 2, prerequisite: 'm2',
      question: '孟子激烈批评墨子的"兼爱"，他的核心论据是什么？',
      options: [
        '兼爱太难做到了',
        '兼爱否定父子之亲，是无父也，是禽兽也',
        '兼爱对国家不利',
        '墨子人品不好'
      ],
      correct: 1,
      explanation: '孟子认为兼爱否定人伦差等（视他人之父如己父），这是"无父"，破坏了人伦秩序的基础。这是儒墨之争最激烈的交锋点。' },

    { id: 'm5', school: 'mojia', tier: 3, prerequisite: 'm3',
      question: '墨家不仅讲理论，还擅长实践。以下哪个最能代表墨家的行动精神？',
      options: [
        '文章辩论',
        '"摩顶放踵以利天下"——为天下利益奔波劳累',
        '隐居修道',
        '游说君王'
      ],
      correct: 1,
      explanation: '墨家弟子过着极端刻苦的生活，奔走各国阻止战争、推行兼爱。这种近乎苦行的实践精神使墨家在战国成为一股强大力量。' },

    { id: 'm6', school: 'mojia', tier: 4, prerequisite: 'm5',
      question: '墨家在战国盛极一时，但秦汉以后迅速衰落。最重要的原因是？',
      options: [
        '墨家学说本身不完善',
        '墨家严密的组织性和苦行作风难以吸引大多数人，加上大一统帝国不再需要"非攻"的游说',
        '儒家故意消灭墨家',
        '墨家没有传人'
      ],
      correct: 1,
      explanation: '墨家衰落有多重原因：组织纪律过于严苛（难以持续）、"兼爱"理想过于超前（超出时代接受度）、大一统帝国消灭了"非攻"的需求空间。但墨家的逻辑学、科学精神（光学力学）仍是先秦思想未被充分发扬的遗产。' },

    // ==================== 法家 ====================
    { id: 'f1', school: 'fajia', tier: 1, prerequisite: null,
      question: '法家思想的核心治理工具是什么？',
      options: ['道德教化', '法律和制度', '宗教信仰', '军事力量'],
      correct: 1,
      explanation: '法家主张以明确的法律和制度治理国家，反对依赖道德教化。商鞅变法就是典型的法家实践。' },

    { id: 'f2', school: 'fajia', tier: 1, prerequisite: null,
      question: '法家思想的集大成者是？',
      options: ['商鞅', '申不害', '慎到', '韩非'],
      correct: 3,
      explanation: '韩非综合了商鞅的"法"、申不害的"术"、慎到的"势"，建立了完整的法家理论体系。' },

    { id: 'f3', school: 'fajia', tier: 2, prerequisite: 'f1',
      question: '韩非的"法、术、势"三者分别指什么？',
      options: [
        '法律、战术、形势',
        '法=公开的法律规章，术=君主驾驭臣下的权术，势=君主的权威和权势',
        '方法、技术、势力',
        '法则、算术、势力'
      ],
      correct: 1,
      explanation: '韩非认为三者缺一不可：法（制度）让国家有章可循，术（权术）让君主不被蒙蔽，势（权威）让法令得以推行。' },

    { id: 'f4', school: 'fajia', tier: 2, prerequisite: 'f2',
      question: '商鞅变法中最具争议的措施是什么？',
      options: [
        '奖励耕战',
        '什伍连坐制度——邻里互相监督，一人犯法邻居连坐',
        '废井田开阡陌',
        '统一度量衡'
      ],
      correct: 1,
      explanation: '什伍连坐是法家极端法治的体现：将基层社会编织成严密的监控网络。它虽然高效，但严重损害了社会信任，为法家招致了最多的批评。' },

    { id: 'f5', school: 'fajia', tier: 3, prerequisite: 'f3',
      question: '秦国采用法家路线完成了统一，但秦朝二世而亡。法家治理模式的根本问题是什么？',
      options: [
        '法律不够详细',
        '过度依赖严刑峻法而忽视道德感召，社会的服从是恐惧而非认同',
        '没有足够的军队',
        '六国残余势力太强'
      ],
      correct: 1,
      explanation: '法家的问题不在于效率（它效率极高），而在于"合法性赤字"——建立在恐惧上的秩序无法持久。秦朝用实际行动检验了纯粹法家治理的极限。' },

    { id: 'f6', school: 'fajia', tier: 4, prerequisite: 'f5',
      question: '汉代以后统治者多采取"阳儒阴法"的策略。这意味着什么？',
      options: [
        '完全放弃法家',
        '表面上推崇儒家道德教化（获取合法性），实际上沿用法家的制度框架（确保效率）',
        '儒家和法家完全融合为一体',
        '法家秘密控制儒家'
      ],
      correct: 1,
      explanation: '"阳儒阴法"是理解中国两千年政治的关键概念。儒家的"仁政"话语提供统治合法性，法家的制度框架提供治理效率。两者并非水火不容，而是在实践中形成了互补共生的关系。' },

    // ==================== 兵家 ====================
    { id: 'b1', school: 'bingjia', tier: 1, prerequisite: null,
      question: '"兵者，诡道也"出自哪部兵书？',
      options: ['《孙膑兵法》', '《孙子兵法》', '《吴子》', '《六韬》'],
      correct: 1,
      explanation: '《孙子兵法·计篇》开篇即言"兵者，诡道也"，奠定了兵家以谋略为核心的战争观。' },

    { id: 'b2', school: 'bingjia', tier: 1, prerequisite: null,
      question: '《孙子兵法》的核心思想可以概括为？',
      options: ['以多胜少', '不战而屈人之兵', '速战速决', '全面战争'],
      correct: 1,
      explanation: '"不战而屈人之兵，善之善者也"——孙子认为最高明的胜利是通过谋略和威慑使敌人屈服，而非通过流血战斗。' },

    { id: 'b3', school: 'bingjia', tier: 2, prerequisite: 'b1',
      question: '"知彼知己，百战不殆"中，"殆"的意思是？',
      options: ['死亡', '危险', '失败', '疲惫'],
      correct: 1,
      explanation: '"殆"指危险。了解对方也了解自己，打一百仗都不会陷入危险。这句话概括了情报和自知的战略核心地位。' },

    { id: 'b4', school: 'bingjia', tier: 2, prerequisite: 'b2',
      question: '孙膑与庞涓的故事中，孙膑用什么策略在桂陵之战中击败魏军？',
      options: [
        '正面强攻',
        '"围魏救赵"——佯攻魏都逼庞涓回师，在途中伏击',
        '水攻',
        '长期围城'
      ],
      correct: 1,
      explanation: '围魏救赵是兵家"攻其必救"战术的经典案例——与其正面救援赵国，不如攻击魏国本土，迫使庞涓撤军，在桂陵设伏击溃。' },

    { id: 'b5', school: 'bingjia', tier: 3, prerequisite: 'b3',
      question: '《孙子兵法》说"上兵伐谋，其次伐交，其次伐兵，其下攻城"。这句话的战略层级排序反映了什么？',
      options: [
        '孙子不喜欢打仗',
        '从成本最高到最低排列',
        '从最优到最差：谋略取胜 > 外交施压 > 野战歼敌 > 惨烈攻城',
        '随机排列'
      ],
      correct: 2,
      explanation: '孙子建立了清晰的战略优选级：最上乘是在谋略层面瓦解敌人（成本最低、收益最大），次之通过外交联盟施压，再次野外作战，最次是攻城——因为攻城代价最大。这体现了兵家"慎战"的理性精神。' },

    { id: 'b6', school: 'bingjia', tier: 4, prerequisite: 'b5',
      question: '兵家与道家在思想上有深层关联。《孙子兵法》中"奇正相生，如循环之无端"体现了哪种哲学思维？',
      options: [
        '儒家伦理',
        '道家辩证法——事物对立面相互转化、生生不息',
        '法家的规则意识',
        '墨家的实用主义'
      ],
      correct: 1,
      explanation: '兵家思想深受道家辩证法影响。"正"是常规战法，"奇"是变招，两者相互转化、无穷无尽——这正是老子"反者道之动"的军事表达。中国思想学派之间从来不是孤立的。' },
  ],

  // ===== 辅助方法 =====

  /** 根据学派获取题目列表 */
  getQuestionsBySchool(schoolKey) {
    return this.questions.filter(q => q.school === schoolKey);
  },

  /** 根据 id 获取题目 */
  getQuestionById(id) {
    return this.questions.find(q => q.id === id);
  },

  /** 获取玩家当前可接触的碎片（基于已解锁题目和层级） */
  getAvailableFragments(player) {
    const unlockedIds = new Set();
    // 收集所有已答对的题目 ID
    for (const key of Object.keys(player.schoolProgress)) {
      for (const qid of player.schoolProgress[key]) {
        unlockedIds.add(qid);
      }
    }

    // 筛选：前置题目已被解锁的题目 -> 作为可刷新碎片
    const available = this.questions.filter(q => {
      if (unlockedIds.has(q.id)) return false;     // 已答对的不再出现
      if (q.prerequisite === null) return true;     // 无前置的始终可用
      return unlockedIds.has(q.prerequisite);       // 前置已解锁
    });

    return available;
  },

  /** 获取问道链的后续题目（同脉络更深层） */
  getDeeperQuestion(currentQuestionId) {
    // 找到以当前题目为前置的题目
    return this.questions.find(q => q.prerequisite === currentQuestionId);
  },
};
```

- [ ] **Step 2: 验证 — 在浏览器控制台执行 `QUESTION_BANK.getQuestionsBySchool('rujia')`，返回 6 题**

- [ ] **Step 3: 提交**

```bash
git add philosopher-devour/data/questions.js && git commit -m "feat: 题库 — 儒道墨法兵 30 题，知识树结构"
```

---

### Task 3: 游戏场景 — 地图、玩家、碎片

**Files:**
- Modify: `philosopher-devour/js/main.js`

**Interfaces:**
- Consumes: `QUESTION_BANK`（全局对象）
- Produces: `GameState` 玩家状态、`create()` 和 `update()` 完整实现

- [ ] **Step 1: 重写 main.js，实现地图背景绘制**

```js
// ===== Phaser 配置 =====
const config = {
  type: Phaser.CANVAS,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#d4c5a0',
  scene: { preload: preload, create: create, update: update },
};

const game = new Phaser.Game(config);

// ===== 游戏状态 =====
const GameState = {
  player: {
    x: 400, y: 300,
    size: 12,
    speed: 200,
    combo: 0,
    multiplier: 1,
    totalFragments: 0,
    schoolProgress: { rujia: [], daojia: [], mojia: [], fajia: [], bingjia: [] },
  },
  fragments: [],        // { x, y, questionId, school, tier, graphic }
  paused: false,
  daolianActive: false,
  daolianChainQid: null, // 问道链当前题目 id
  daolianStake: 1,
};

// Phaser 引用
let playerGraphic, comboText, sizeText, comboGlow;
let fragmentGroup;      // Phaser Group 管理碎片图形
let fragmentData = [];  // 碎片数据 [{graphic, questionId, school, tier}]

// 场景元素
let bgGraphics;

function preload() {}

function create() {
  // 1. 绘制地图背景
  drawMapBackground(this);

  // 2. 创建玩家图形（发光种子）
  playerGraphic = this.add.graphics();
  drawPlayer();
  GameState.player.x = 400;
  GameState.player.y = 300;

  // 3. 创建碎片组
  fragmentGroup = this.add.group();

  // 4. UI 文字
  comboText = this.add.text(10, 8, '', {
    fontSize: '22px',
    fontFamily: 'KaiTi, STKaiti, serif',
    color: '#ff6f00',
    fontStyle: 'bold',
  }).setDepth(100);

  sizeText = this.add.text(10, 36, '', {
    fontSize: '16px',
    fontFamily: 'KaiTi, STKaiti, serif',
    color: '#4a3520',
  }).setDepth(100);

  // 连击光晕
  comboGlow = this.add.graphics().setDepth(99);

  // 5. 键盘输入
  GameState.cursors = this.input.keyboard.createCursorKeys();
  GameState.keys = this.input.keyboard.addKeys('W,A,S,D');

  // 6. 鼠标点击移动
  this.input.on('pointerdown', (pointer) => {
    if (GameState.paused) return;
    // 设置目标点
    GameState.targetX = pointer.x;
    GameState.targetY = pointer.y;
  });

  // 7. 初始刷新碎片
  spawnInitialFragments(this);

  updateUI();
}

// ===== 地图背景 =====
function drawMapBackground(scene) {
  const g = scene.add.graphics();

  // 底色（羊皮纸质感用渐变模拟）
  g.fillStyle(0xd4c5a0, 1);
  g.fillRect(0, 0, 800, 600);

  // 水纹 / 道路
  g.lineStyle(1, 0xc4a86a, 0.3);
  for (let i = 0; i < 30; i++) {
    const y = 20 + i * 20;
    g.beginPath();
    for (let x = 0; x < 800; x += 20) {
      const yOff = Math.sin(x * 0.015 + i) * 4;
      if (x === 0) g.moveTo(x, y + yOff);
      else g.lineTo(x, y + yOff);
    }
    g.strokePath();
  }

  // 战国疆域轮廓（简化曲线）
  g.lineStyle(3, 0x8b6914, 0.25);
  g.beginPath();
  g.moveTo(120, 80);   g.lineTo(200, 60);   g.lineTo(300, 70);
  g.lineTo(380, 50);   g.lineTo(450, 65);   g.lineTo(520, 30);
  g.lineTo(620, 55);   g.lineTo(700, 80);   g.lineTo(750, 120);
  g.lineTo(760, 200);  g.lineTo(740, 280);  g.lineTo(700, 350);
  g.lineTo(650, 420);  g.lineTo(580, 470);  g.lineTo(500, 500);
  g.lineTo(400, 480);  g.lineTo(300, 510);  g.lineTo(200, 500);
  g.lineTo(100, 460);  g.lineTo(60,  380);  g.lineTo(50,  280);
  g.lineTo(55,  180);  g.lineTo(80,  130);
  g.closePath();
  g.strokePath();

  // 学派区域标注
  const labels = [
    { x: 200, y: 180, text: '儒', color: '#c0392b' },
    { x: 500, y: 120, text: '道', color: '#27ae60' },
    { x: 160, y: 380, text: '墨', color: '#2980b9' },
    { x: 600, y: 300, text: '法', color: '#8e44ad' },
    { x: 450, y: 420, text: '兵', color: '#d35400' },
  ];
  for (const l of labels) {
    scene.add.text(l.x, l.y, l.text, {
      fontSize: '48px',
      fontFamily: 'KaiTi, STKaiti, serif',
      color: l.color,
    }).setAlpha(0.15).setDepth(0);
  }
}

// ===== 玩家绘制 =====
function drawPlayer() {
  playerGraphic.clear();
  const { x, y, size } = GameState.player;

  // 光晕
  playerGraphic.fillStyle(0xffd54f, 0.2);
  playerGraphic.fillCircle(x, y, size * 1.6);

  // 主体（种子形状 — 椭圆+尖角）
  playerGraphic.fillStyle(0xffd54f, 1);
  playerGraphic.fillCircle(x, y, size);

  // 内核
  playerGraphic.fillStyle(0xff8f00, 0.6);
  playerGraphic.fillCircle(x, y, size * 0.5);

  // 高光
  playerGraphic.fillStyle(0xffffff, 0.5);
  playerGraphic.fillCircle(x - size * 0.2, y - size * 0.2, size * 0.25);
}

// ===== 碎片生成 =====
function spawnInitialFragments(scene) {
  const available = QUESTION_BANK.getAvailableFragments(GameState.player);
  const count = Math.min(15, available.length);

  for (let i = 0; i < count; i++) {
    const q = available[i % available.length];
    spawnFragment(scene, q);
  }
}

function spawnFragment(scene, question) {
  const x = 60 + Math.random() * 680;
  const y = 40 + Math.random() * 520;
  const schoolInfo = QUESTION_BANK.schools[question.school];
  const baseSize = 6 + question.tier * 3; // tier 1:9, 2:12, 3:15, 4:18

  const g = scene.add.graphics();
  drawFragment(g, x, y, baseSize, schoolInfo.color, question.tier);
  g.setDepth(5);

  const data = {
    graphic: g,
    x, y,
    questionId: question.id,
    school: question.school,
    tier: question.tier,
    size: baseSize,
    color: schoolInfo.color,
  };
  fragmentData.push(data);
  fragmentGroup.add(g);

  // 碎片呼吸动画
  scene.tweens.add({
    targets: g,
    scaleX: 1.15,
    scaleY: 1.15,
    duration: 800 + Math.random() * 400,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}

function drawFragment(g, x, y, size, color, tier) {
  // 光晕
  g.fillStyle(color, 0.15);
  g.fillCircle(x, y, size * 1.8);
  // 主体
  g.fillStyle(color, 0.7);
  g.fillCircle(x, y, size);
  // 内芯（越高层越亮）
  g.fillStyle(0xffffff, 0.3 + tier * 0.1);
  g.fillCircle(x, y, size * 0.45);
}

// ===== UI 更新 =====
function updateUI() {
  const p = GameState.player;
  comboText.setText(p.combo > 0 ? `🔥 连击 x${p.combo}` : '');
  sizeText.setText(`种子 ${Math.floor(p.size)} · 已收集 ${p.totalFragments} 碎片`);

  // 连击光晕
  comboGlow.clear();
  if (p.combo >= 5) {
    const alpha = Math.min(0.18 + p.combo * 0.015, 0.4);
    const color = p.combo >= 15 ? 0xffd700 : (p.combo >= 10 ? 0xff9800 : 0xff6f00);
    comboGlow.lineStyle(8, color, alpha);
    comboGlow.strokeRect(4, 4, 792, 592);
  }
}
```

- [ ] **Step 2: 实现 update 循环**

```js
function update(time, delta) {
  if (GameState.paused) return;

  let dx = 0, dy = 0;
  const speed = GameState.player.speed * (delta / 1000);

  // 键盘输入
  if (GameState.cursors.left.isDown  || GameState.keys.A.isDown)  dx = -1;
  if (GameState.cursors.right.isDown || GameState.keys.D.isDown)  dx = 1;
  if (GameState.cursors.up.isDown    || GameState.keys.W.isDown)  dy = -1;
  if (GameState.cursors.down.isDown  || GameState.keys.S.isDown)  dy = 1;

  // 鼠标点击移动
  if (GameState.targetX !== undefined) {
    const tx = GameState.targetX;
    const ty = GameState.targetY;
    const dist = Math.hypot(tx - GameState.player.x, ty - GameState.player.y);
    if (dist < 5) {
      delete GameState.targetX;
      delete GameState.targetY;
    } else {
      dx = (tx - GameState.player.x) / dist;
      dy = (ty - GameState.player.y) / dist;
    }
  }

  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    dx /= len; dy /= len;
    GameState.player.x = clamp(GameState.player.x + dx * speed, 25, 775);
    GameState.player.y = clamp(GameState.player.y + dy * speed, 25, 575);
    drawPlayer();
  }

  // 碰撞检测
  checkFragmentCollisions();
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function checkFragmentCollisions() {
  const p = GameState.player;
  for (let i = fragmentData.length - 1; i >= 0; i--) {
    const f = fragmentData[i];
    const dist = Math.hypot(p.x - f.x, p.y - f.y);
    const collisionDist = p.size + f.size;

    if (dist < collisionDist) {
      // 触发答题
      triggerQuestion(f);
      break; // 一次只触发一个
    }
  }
}

function triggerQuestion(fragData) {
  GameState.paused = true;
  GameState.currentFragment = fragData;

  const q = QUESTION_BANK.getQuestionById(fragData.questionId);
  showQuestionOverlay(q);
}
```

- [ ] **Step 3: 验证 — 打开 index.html，确认：方向键/WASD 控制种子移动、15 个碎片分布在地图上、碰到碎片日志输出（暂停未实现）**

- [ ] **Step 4: 提交**

```bash
git add philosopher-devour/js/main.js && git commit -m "feat: 地图背景、玩家移动、碎片生成与碰撞检测"
```

---

### Task 4: 答题弹窗系统

**Files:**
- Modify: `philosopher-devour/js/main.js`
- Modify: `philosopher-devour/index.html`（添加少量 JS 桥接函数）

**Interfaces:**
- Consumes: `GameState.paused`, `fragmentData`
- Produces: `showQuestionOverlay()`, `hideQuestionOverlay()`, `answerQuestion()`, 问道链按钮事件

- [ ] **Step 1: 在 main.js 末尾添加答题桥接函数**

```js
// ===== 答题系统（DOM 桥接） =====

let currentQuestionData = null;

function showQuestionOverlay(question) {
  currentQuestionData = question;

  document.getElementById('question-text').textContent =
    `【${QUESTION_BANK.schools[question.school].name}】${question.question}`;

  const optsDiv = document.getElementById('question-options');
  optsDiv.innerHTML = '';
  const labels = ['A', 'B', 'C', 'D'];
  question.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'q-option';
    btn.textContent = `${labels[idx]}. ${opt}`;
    btn.onclick = () => answerQuestion(idx);
    optsDiv.appendChild(btn);
  });

  document.getElementById('question-result').style.display = 'none';
  document.getElementById('question-result').textContent = '';
  document.getElementById('daolian-buttons').style.display = 'none';
  document.getElementById('daolian-info').style.display = 'none';

  document.getElementById('question-overlay').classList.add('active');

  // 键盘 1-4 答题
  window._qKeyHandler = (e) => {
    if (e.key >= '1' && e.key <= '4') {
      answerQuestion(parseInt(e.key) - 1);
    }
  };
  document.addEventListener('keydown', window._qKeyHandler);
}

function hideQuestionOverlay() {
  document.getElementById('question-overlay').classList.remove('active');
  document.removeEventListener('keydown', window._qKeyHandler);
  currentQuestionData = null;
}

function answerQuestion(chosenIdx) {
  if (!currentQuestionData) return;

  const q = currentQuestionData;
  const correct = chosenIdx === q.correct;
  const opts = document.querySelectorAll('.q-option');

  // 禁用按钮
  opts.forEach(o => o.style.pointerEvents = 'none');

  // 高亮正确/错误
  opts[q.correct].classList.add('correct-flash');
  if (!correct) {
    opts[chosenIdx].classList.add('wrong-flash');
  }

  // 显示解释
  const resultDiv = document.getElementById('question-result');
  resultDiv.style.display = 'block';
  if (correct) {
    resultDiv.innerHTML = `✅ 正确！${q.explanation}`;
  } else {
    resultDiv.innerHTML = `❌ 错误。${q.explanation}`;
  }

  // 结算
  setTimeout(() => {
    if (correct) {
      handleCorrectAnswer(q);
    } else {
      handleWrongAnswer(q);
    }
  }, 600);
}

function handleCorrectAnswer(q) {
  GameState.player.combo += 1;
  GameState.player.totalFragments += 1;

  // 添加到学派进度
  if (!GameState.player.schoolProgress[q.school].includes(q.id)) {
    GameState.player.schoolProgress[q.school].push(q.id);
  }

  // 移除碎片
  removeFragment(GameState.currentFragment);

  updateUI();

  // 检查问道链：有更深层题目则弹出
  const deeper = QUESTION_BANK.getDeeperQuestion(q.id);
  if (deeper) {
    showDaolianPrompt(deeper, 2);
  } else {
    // 没有更深题目，直接结算
    applyGrowth(1);
    resumeGame();
  }
}

function handleWrongAnswer(q) {
  GameState.player.combo = 0;
  updateUI();
  // 问道链断裂
  if (GameState.daolianActive) {
    GameState.daolianActive = false;
    GameState.daolianStake = 1;
  }
  applyGrowth(0);
  resumeGame();
}

// ===== 问道链 =====

function showDaolianPrompt(nextQuestion, nextMultiplier) {
  GameState.daolianActive = true;
  GameState.daolianStake = nextMultiplier;

  document.getElementById('next-multiplier').textContent = nextMultiplier;
  document.getElementById('daolian-info').style.display = 'block';
  document.getElementById('daolian-info').textContent =
    `当前累积倍率: x${nextMultiplier / 2} → 继续答对: x${nextMultiplier} | 答错: 归零`;

  document.getElementById('daolian-buttons').style.display = 'flex';
  document.getElementById('btn-continue').onclick = () => continueDaolian(nextQuestion);
  document.getElementById('btn-stop').onclick = () => stopDaolian();
}

function continueDaolian(nextQuestion) {
  document.getElementById('daolian-buttons').style.display = 'none';
  document.getElementById('daolian-info').style.display = 'none';

  // 显示下一题
  document.getElementById('question-result').style.display = 'none';
  document.getElementById('question-text').textContent =
    `【问道链 x${GameState.daolianStake}】${nextQuestion.question}`;

  const optsDiv = document.getElementById('question-options');
  optsDiv.innerHTML = '';
  const labels = ['A', 'B', 'C', 'D'];
  nextQuestion.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'q-option';
    btn.textContent = `${labels[idx]}. ${opt}`;
    btn.onclick = () => handleDaolianAnswer(idx, nextQuestion);
    optsDiv.appendChild(btn);
  });

  // 更新键盘监听
  document.removeEventListener('keydown', window._qKeyHandler);
  window._qKeyHandler = (e) => {
    if (e.key >= '1' && e.key <= '4') {
      handleDaolianAnswer(parseInt(e.key) - 1, nextQuestion);
    }
  };
  document.addEventListener('keydown', window._qKeyHandler);

  currentQuestionData = nextQuestion;
}

function handleDaolianAnswer(chosenIdx, question) {
  const correct = chosenIdx === question.correct;
  const opts = document.querySelectorAll('.q-option');
  opts.forEach(o => o.style.pointerEvents = 'none');
  opts[question.correct].classList.add('correct-flash');
  if (!correct) opts[chosenIdx].classList.add('wrong-flash');

  const resultDiv = document.getElementById('question-result');
  resultDiv.style.display = 'block';

  setTimeout(() => {
    if (correct) {
      resultDiv.innerHTML = `✅ 正确！${question.explanation}`;
      GameState.player.combo += 1;
      GameState.player.totalFragments += 1;
      if (!GameState.player.schoolProgress[question.school].includes(question.id)) {
        GameState.player.schoolProgress[question.school].push(question.id);
      }
      updateUI();

      // 检查更深层
      const deeper = QUESTION_BANK.getDeeperQuestion(question.id);
      if (deeper) {
        showDaolianPrompt(deeper, GameState.daolianStake * 2);
      } else {
        // 问道链到底了，强制结算
        applyGrowth(GameState.daolianStake);
        hideQuestionOverlay();
        resumeGame();
      }
    } else {
      // 问道链断裂！
      resultDiv.innerHTML = `💔 归零！${question.explanation}`;
      GameState.player.combo = 0;
      GameState.daolianActive = false;
      updateUI();
      setTimeout(() => {
        hideQuestionOverlay();
        resumeGame();
      }, 800);
    }
  }, 600);
}

function stopDaolian() {
  const stake = GameState.daolianStake / 2; // 当前已累积的倍率
  document.getElementById('question-result').textContent =
    `🛑 收手！获得 x${stake} 成长奖励 ✨`;
  applyGrowth(stake);
  GameState.daolianActive = false;
  GameState.daolianStake = 1;
  setTimeout(() => {
    hideQuestionOverlay();
    resumeGame();
  }, 600);
}

// ===== 结算 =====

function applyGrowth(multiplier) {
  if (multiplier > 0) {
    GameState.player.size += 1.5 * multiplier;
    GameState.player.size = Math.min(100, GameState.player.size);
  }
  drawPlayer();
}

function removeFragment(fragData) {
  fragData.graphic.destroy();
  const idx = fragmentData.indexOf(fragData);
  if (idx !== -1) fragmentData.splice(idx, 1);
}

function resumeGame() {
  GameState.paused = false;
  GameState.currentFragment = null;

  // 补充碎片
  maintainFragmentCount();
}

function maintainFragmentCount() {
  const available = QUESTION_BANK.getAvailableFragments(GameState.player);
  while (fragmentData.length < 15 && available.length > 0) {
    const q = available[Math.floor(Math.random() * available.length)];
    spawnFragment(game.scene.scenes[0], q); // 获取当前场景
  }
}
```

- [ ] **Step 2: 验证 — 走到碎片触发弹窗 → 选择答案 → 看到正确/错误反馈 → 连击计数变化 → 问道链按钮出现 → 继续/收手 → 种子变大**

- [ ] **Step 3: 提交**

```bash
git add philosopher-devour/js/main.js philosopher-devour/index.html && git commit -m "feat: 答题弹窗 + 问道链 + 连击 + 结算系统"
```

---

### Task 5: 知识图鉴 + 通关检测

**Files:**
- Modify: `philosopher-devour/js/main.js`（添加图鉴逻辑）
- Modify: `philosopher-devour/index.html`（图鉴面板内容填充）

**Interfaces:**
- Consumes: `GameState.player.schoolProgress`, `QUESTION_BANK.schools`
- Produces: `window.toggleCollection()`, 学派徽章检测

- [ ] **Step 1: 在 main.js 末尾添加图鉴逻辑**

```js
// ===== 图鉴系统 =====

window.toggleCollection = function () {
  const panel = document.getElementById('collection-panel');
  if (panel.classList.contains('active')) {
    panel.classList.remove('active');
    GameState.paused = false;
  } else {
    GameState.paused = true;
    renderCollection();
    panel.classList.add('active');
  }
};

function renderCollection() {
  const container = document.getElementById('collection-content');
  const progress = GameState.player.schoolProgress;

  let html = '';
  for (const [key, info] of Object.entries(QUESTION_BANK.schools)) {
    const questions = QUESTION_BANK.getQuestionsBySchool(key);
    const completed = progress[key] || [];
    const completeCount = completed.length;
    const total = questions.length;
    const mastered = completeCount >= total;

    html += '<div class="school-row" style="margin-bottom:18px;display:flex;align-items:center;gap:12px;">';
    html += `<span style="font-size:32px;">${mastered ? info.icon : '🔒'}</span>`;
    html += `<span style="font-size:20px;color:${mastered ? '#ffd54f' : '#888'};min-width:50px;">${info.name}</span>`;
    html += '<span style="display:flex;gap:4px;">';

    // 显示每道题的完成状态
    for (const q of questions) {
      const done = completed.includes(q.id);
      const tierLabel = ['根', '枝', '叶', '果'][q.tier - 1];
      html += `<span title="${tierLabel}: ${q.question.substring(0, 20)}..." style="
        display:inline-block;width:24px;height:24px;border-radius:50%;
        background:${done ? '#' + info.color.toString(16).padStart(6, '0') : '#555'};
        text-align:center;line-height:24px;font-size:11px;
      ">${tierLabel}</span>`;
    }

    html += `</span><span style="color:#aaa;font-size:14px;">${completeCount}/${total}</span>`;

    if (mastered) {
      html += '<span style="font-size:20px;">🏆 贯通</span>';
    }

    html += '</div>';
  }

  // 总体进度
  const totalCompleted = Object.values(progress).reduce((s, a) => s + a.length, 0);
  html += `<div style="margin-top:24px;padding-top:16px;border-top:1px solid #555;color:#aaa;text-align:center;font-size:16px;">
    总进度: ${totalCompleted} / 30 题
  </div>`;

  if (totalCompleted >= 30) {
    html += '<div style="text-align:center;margin-top:16px;font-size:24px;color:#ffd54f;">🏆 百家贯通！诸子之旅完成！🎉</div>';
  }

  container.innerHTML = html;
}
```

- [ ] **Step 2: 在 handleCorrectAnswer 之后添加学派徽章检测**

在 `handleCorrectAnswer` 函数的 `updateUI()` 之后加入：

```js
  // 检测学派是否完成
  checkSchoolMastery(q.school);
```

新增函数：

```js
function checkSchoolMastery(schoolKey) {
  const questions = QUESTION_BANK.getQuestionsBySchool(schoolKey);
  const completed = GameState.player.schoolProgress[schoolKey] || [];
  if (completed.length >= questions.length) {
    // 学派已全部完成 — 首次完成弹提示
    if (!GameState._schoolMastered) GameState._schoolMastered = {};
    if (!GameState._schoolMastered[schoolKey]) {
      GameState._schoolMastered[schoolKey] = true;
      showSchoolMasteryToast(schoolKey);
    }
  }
}

function showSchoolMasteryToast(schoolKey) {
  const info = QUESTION_BANK.schools[schoolKey];
  // 简单实现：弹出 alert（后续可改为动画提示）
  setTimeout(() => {
    alert(`🏆 ${info.name} 脉络贯通！获得「${info.name}」徽章！`);
  }, 1000);
}

function checkAllMastered() {
  let allDone = true;
  for (const key of Object.keys(QUESTION_BANK.schools)) {
    const questions = QUESTION_BANK.getQuestionsBySchool(key);
    const completed = GameState.player.schoolProgress[key] || [];
    if (completed.length < questions.length) { allDone = false; break; }
  }
  return allDone;
}
```

- [ ] **Step 3: 验证 — 按右上角「📜 图鉴」→ 查看各学派进度 → 关闭图鉴恢复游戏 → 打通一家6题弹徽章提示**

- [ ] **Step 4: 提交**

```bash
git add philosopher-devour/js/main.js philosopher-devour/index.html && git commit -m "feat: 知识图鉴 + 学派徽章 + 通关检测"
```

---

### Task 6: 连击特效增强 & 游戏收尾

**Files:**
- Modify: `philosopher-devour/js/main.js`

- [ ] **Step 1: 连击≥5 屏幕边框脉冲**

在 `updateUI` 的 `comboGlow` 部分增强：

```js
  // 连击光晕动画
  comboGlow.clear();
  if (p.combo >= 5) {
    const pulse = Math.sin(Date.now() * 0.005) * 0.5 + 0.5; // 0~1 呼吸
    const alpha = 0.1 + pulse * 0.2;
    const color = p.combo >= 15 ? 0xffd700 : (p.combo >= 10 ? 0xff9800 : 0xff6f00);
    const thickness = p.combo >= 15 ? 12 : (p.combo >= 10 ? 8 : 5);
    comboGlow.lineStyle(thickness, color, alpha);
    comboGlow.strokeRect(4, 4, 792, 592);
  }
```

- [ ] **Step 2: 连击≥10 吸收范围扩大**

在 `checkFragmentCollisions` 中：

```js
  const absorbBonus = Math.min(p.combo * 0.8, 20); // 最多+20px 范围
  const collisionDist = p.size + f.size + (p.combo >= 10 ? absorbBonus : 0);
```

- [ ] **Step 3: 连击≥15 稀有碎片生成**

在 `maintainFragmentCount` 中：

```js
  // 连击≥15 时偶尔生成稀有金色碎片
  if (GameState.player.combo >= 15 && Math.random() < 0.08 && available.length > 2) {
    const rareQ = available[Math.floor(Math.random() * available.length)];
    const scene = game.scene.scenes[0];
    const x = 60 + Math.random() * 680;
    const y = 40 + Math.random() * 520;
    const g = scene.add.graphics();
    // 金色碎片（更大更亮）
    g.fillStyle(0xffd700, 0.3);
    g.fillCircle(x, y, 20);
    g.fillStyle(0xffd700, 0.8);
    g.fillCircle(x, y, 14);
    g.fillStyle(0xfff8e1, 0.6);
    g.fillCircle(x, y, 7);
    g.setDepth(5);

    const data = {
      graphic: g, x, y,
      questionId: rareQ.id,
      school: rareQ.school,
      tier: rareQ.tier,
      size: 14,
      color: 0xffd700,
      rare: true,
    };
    fragmentData.push(data);
    fragmentGroup.add(g);

    // 闪烁效果
    scene.tweens.add({
      targets: g, alpha: 0.4, duration: 300, yoyo: true, repeat: 10,
      onComplete: () => {
        if (!fragmentData.includes(data)) return;
        // 10 次闪烁后消失
        fragmentData.splice(fragmentData.indexOf(data), 1);
        g.destroy();
      }
    });
  }
```

- [ ] **Step 4: 通关提示增强**

在 `checkSchoolMastery` 中添加全部通关检测：

```js
  if (checkAllMastered()) {
    setTimeout(() => {
      // 屏幕中央通关文字
      const victoryText = game.scene.scenes[0].add.text(400, 300, '🏆 百家贯通！\n诸子之旅完成！', {
        fontSize: '42px',
        fontFamily: 'KaiTi, STKaiti, serif',
        color: '#ffd54f',
        align: 'center',
        stroke: '#000',
        strokeThickness: 3,
      }).setOrigin(0.5).setDepth(200);

      game.scene.scenes[0].tweens.add({
        targets: victoryText,
        scaleX: 1.3,
        scaleY: 1.3,
        alpha: 0,
        duration: 4000,
        ease: 'Power2',
      });
    }, 1500);
  }
```

- [ ] **Step 5: 整体跑通验证**

打开 index.html，完整测试：

1. WASD 移动 → 碰到碎片 → 弹出答题
2. 答对 → 连击+1 → 问道链弹出
3. 问道链继续 → 更深题 → 答对 → 倍率翻倍 → 收手 → 种子变大
4. 问道链答错 → 归零提示 → 回到游戏
5. 连击 5 → 屏幕金边出现
6. 连击 15 → 金色稀有碎片出现
7. 打通 6 题 → 学派徽章提示
8. 30 题全通 → 通关动画
9. 图鉴按钮 → 查看进度 → 关闭继续游戏

- [ ] **Step 6: 提交**

```bash
git add philosopher-devour/js/main.js && git commit -m "feat: 连击特效增强 + 稀有碎片 + 通关动画"
```

---

### Task 7: 移动端适配 & 部署

**Files:**
- Modify: `philosopher-devour/index.html`（viewport 适配）
- Modify: `philosopher-devour/js/main.js`（触屏操控）

- [ ] **Step 1: index.html viewport 与响应式**

将 `<meta name="viewport">` 修改为：
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

添加响应式 CSS：
```css
@media (max-width: 820px) {
  #game-container {
    width: 100vw;
    height: 100vw * 0.75; /* 4:3 比例 */
  }
}
```

- [ ] **Step 2: 触屏操控**

在 `create()` 中添加触屏输入：

```js
  // 触屏滑动
  let touchStartX = 0, touchStartY = 0;
  this.input.on('pointerdown', (pointer) => {
    touchStartX = pointer.x;
    touchStartY = pointer.y;
  });
  this.input.on('pointermove', (pointer) => {
    if (!pointer.isDown) return;
    GameState.player.vx = (pointer.x - touchStartX) * 0.15;
    GameState.player.vy = (pointer.y - touchStartY) * 0.15;
    // 更新起点以实现持续滑动
    touchStartX = pointer.x;
    touchStartY = pointer.y;
  });
  this.input.on('pointerup', () => {
    GameState.player.vx = 0;
    GameState.player.vy = 0;
  });
```

init 中添加速度字段：
```js
// 在 GameState.player 中添加
vx: 0, vy: 0,
```

update 中添加惯性：
```js
  // 触屏惯性
  if (GameState.player.vx !== 0 || GameState.player.vy !== 0) {
    dx += GameState.player.vx;
    dy += GameState.player.vy;
    GameState.player.vx *= 0.92;  // 衰减
    GameState.player.vy *= 0.92;
    if (Math.abs(GameState.player.vx) < 0.01) GameState.player.vx = 0;
    if (Math.abs(GameState.player.vy) < 0.01) GameState.player.vy = 0;
  }
```

- [ ] **Step 3: 部署到 GitHub Pages**

```bash
# 确保 philosopher-devour/ 目录在 master 分支存在
git add philosopher-devour/
git commit -m "feat: 移动端触屏适配"
git push origin master
```

GitHub Pages 访问路径：`https://<username>.github.io/<repo>/philosopher-devour/`

- [ ] **Step 4: 手机浏览器测试**

用手机访问部署地址，确认：触屏滑动控制移动、碎片可碰触、答题弹窗正常显示

- [ ] **Step 5: 提交**

```bash
git add philosopher-devour/ && git commit -m "feat: 移动端触屏操控 + 响应式适配"
```

---

### 最终验收清单

- [ ] 桌面端 WASD/方向键控制移动
- [ ] 鼠标点击移动
- [ ] 碰撞碎片触发答题弹窗
- [ ] 键盘 1-4 或点击答选择题
- [ ] 答对：连击+1，问道链按钮出现
- [ ] 问道链"继续"→ 更深题 → 答对倍率翻倍 → 可继续
- [ ] 问道链"收手"→ 落袋为安，种子变大
- [ ] 问道链答错 → 奖励归零，连击归零
- [ ] 连击≥5 屏幕金边脉冲
- [ ] 连击≥15 稀有金色碎片出现
- [ ] 图鉴按钮 → 查看各学派进度
- [ ] 打通一家 6 题 → 徽章提示
- [ ] 全部 30 题完成 → 通关动画
- [ ] 手机触屏滑动控制
- [ ] GitHub Pages 正常访问
