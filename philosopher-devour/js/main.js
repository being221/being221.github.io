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

// ===== 更新循环 =====
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

// ===== 答题弹窗桩（Task 4 实现完整交互） =====
function showQuestionOverlay(q) {
  console.log('[Task 3] 碰撞触发答题:', q.school, 'T' + q.tier, q.question);
  console.log('[Task 3] 选项:', q.options);
  // Task 4 将实现完整弹窗交互，此处仅验证碰撞检测通路
}
