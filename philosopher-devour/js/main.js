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
