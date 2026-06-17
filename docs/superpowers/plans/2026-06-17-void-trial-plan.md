# 虚空试炼 (Void Trial) 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个第一人称 3D 极简战斗游戏——虚空平台、几何人形敌人、魔法弹射击 + 闪避、清关模式。

**Architecture:** Godot 4.x 单项目，GDScript 脚本。场景驱动架构：每个关卡、菜单、结算界面各自独立场景。核心玩法集中在 `player.gd`（移动/射击/闪避/血量）、`enemy_base.gd`（敌人基类）两个脚本。敌人使用多 Area3D 子节点实现精确部位命中判定，子弹用 RigidBody3D + CCD 防穿模。

**Tech Stack:** Godot 4.x, GDScript, Jolt Physics, Forward+ 渲染器

## Global Constraints

- Godot 4.x 最新稳定版
- 所有脚本使用 GDScript
- 物理引擎：Jolt Physics（Godot 4.x 默认）
- 发布目标：Windows / macOS / Linux 可执行文件
- 音效本次不做
- 第 2/3 关仅占位，"敬请期待"
- 爆头连杀加成第四层本次不做

---

### Task 1: Godot 项目搭建 + 输入映射 + 全局状态

**Files:**
- Create: `void-trial/project.godot`
- Create: `void-trial/scripts/autoload/game_state.gd`
- Create: `void-trial/scenes/` (directory)
- Create: `void-trial/scripts/player/` (directory)
- Create: `void-trial/scripts/enemies/` (directory)
- Create: `void-trial/scripts/projectiles/` (directory)
- Create: `void-trial/scripts/world/` (directory)
- Create: `void-trial/scripts/ui/` (directory)
- Create: `void-trial/assets/materials/` (directory)
- Create: `void-trial/assets/particles/` (directory)
- Create: `void-trial/assets/fonts/` (directory)

**Interfaces:**
- Produces: `GameState` autoload — 全局可访问 `GameState.current_level`, `GameState.total_kills`, `GameState.total_headshots`, `GameState.headshot_streak`, `GameState.total_damage_taken`, `GameState.level_start_time`
- Produces: 输入映射 — `move_forward`, `move_back`, `move_left`, `move_right`, `shoot`, `dash`

- [ ] **Step 1: 安装 Godot 4.x**

从 https://godotengine.org/download 下载 Godot 4.x 最新稳定版（4.4+），安装到本机。

验证：命令行运行 `godot --version` 输出版本号。

- [ ] **Step 2: 创建项目目录结构**

```bash
mkdir -p void-trial/scenes
mkdir -p void-trial/scripts/player
mkdir -p void-trial/scripts/enemies
mkdir -p void-trial/scripts/projectiles
mkdir -p void-trial/scripts/world
mkdir -p void-trial/scripts/ui
mkdir -p void-trial/scripts/autoload
mkdir -p void-trial/assets/materials
mkdir -p void-trial/assets/particles
mkdir -p void-trial/assets/fonts
```

- [ ] **Step 3: 在 Godot 编辑器中创建项目**

1. 打开 Godot 编辑器 → 新建项目
2. 项目名称：`虚空试炼`
3. 项目路径：选择 `void-trial/` 目录
4. 渲染器：**Forward+**
5. 创建后关闭编辑器

- [ ] **Step 4: 配置项目设置**

在 Godot 编辑器中打开项目，菜单：**项目 → 项目设置**：

**通用 → 显示 → Window：**
- Viewport Width: `1920`
- Viewport Height: `1080`
- Stretch Mode: `canvas_items`

**输入映射（Input Map 标签页）：**
添加以下 6 个动作：

| 动作名 | 按键 1 | 按键 2 |
|--------|--------|--------|
| `move_forward` | W | ↑ |
| `move_back` | S | ↓ |
| `move_left` | A | ← |
| `move_right` | D | → |
| `shoot` | 鼠标左键 | — |
| `dash` | Space | — |

每个动作点「添加」→ 按键 → 按下对应键 → OK。

**物理 → 3D：**
- Physics Engine: `Jolt Physics`

- [ ] **Step 5: 创建全局状态 autoload**

编写 [void-trial/scripts/autoload/game_state.gd](void-trial/scripts/autoload/game_state.gd)：

```gdscript
extends Node
## 全局游戏状态，跨场景持久化

var current_level: int = 1
var total_kills: int = 0
var total_headshots: int = 0
var headshot_streak: int = 0
var total_damage_taken: int = 0
var hits_taken: int = 0
var level_start_time: float = 0.0

func reset_run() -> void:
	total_kills = 0
	total_headshots = 0
	headshot_streak = 0
	total_damage_taken = 0
	hits_taken = 0
	level_start_time = Time.get_ticks_msec() / 1000.0

func add_kill(was_headshot: bool) -> void:
	total_kills += 1
	if was_headshot:
		total_headshots += 1
		headshot_streak += 1
	else:
		headshot_streak = 0

func add_damage(amount: float) -> void:
	total_damage_taken += amount
	hits_taken += 1

func get_elapsed_time() -> float:
	return Time.get_ticks_msec() / 1000.0 - level_start_time

func get_headshot_rate() -> float:
	if total_kills == 0:
		return 0.0
	return float(total_headshots) / float(total_kills) * 100.0
```

在 Godot 编辑器中注册 autoload：
1. **项目 → 项目设置 → 自动加载**
2. 路径选择 `scripts/autoload/game_state.gd`
3. 节点名：`GameState`
4. 点「添加」

- [ ] **Step 6: 测试**

1. 按 F5 运行项目（或点右上角「运行项目」按钮）
2. 应看到空白的 3D 视口（灰色背景）
3. 没有报错即项目搭建成功

- [ ] **Step 7: Commit**

```bash
cd void-trial
git init
git add -A
git commit -m "feat: Godot 4 项目搭建 — 输入映射 + GameState autoload"
```

---

### Task 2: Level 1 虚空平台场景

**Files:**
- Create: `void-trial/scenes/level_1.tscn`
- Create: `void-trial/scenes/player.tscn`（玩家场景骨架，脚本后续加）
- 材质在编辑器中直接创建

**Interfaces:**
- Produces: `level_1.tscn` — 完整的第 1 关场景，包含平台、掩体、装饰、灯光、WorldEnvironment，以及 Player 占位节点
- Produces: `player.tscn` — CharacterBody3D + Camera3D 骨架（无脚本）

**依赖:** Task 1

- [ ] **Step 1: 在 Godot 编辑器中创建 Level1 场景**

1. 新建场景 → 根节点选 `Node3D`，命名为 `Level1`
2. 保存为 `scenes/level_1.tscn`

- [ ] **Step 2: 搭建虚空环境**

在 `Level1` 下添加 `WorldEnvironment` 节点：

选中 WorldEnvironment，在检查器中新建 Environment 资源：
- **Background → Mode:** `Color`
- **Background → Color:** `#0a0a12`（深空黑蓝色）
- **Ambient Light → Color:** `#1a1a2e`
- **Ambient Light → Energy:** `0.3`
- **Fog → Enabled:** `true`
- **Fog → Mode:** `Exponential`
- **Fog → Density:** `0.008`
- **Fog → Color:** `#0a0a12`
- **Glow → Enabled:** `true`
- **Glow → Intensity:** `0.3`
- **Glow → Blend Mode:** `Additive`

添加 `DirectionalLight3D`：
- rotation: `(-45, -30, 0)`
- Energy: `0.6`
- Shadow → Enabled: `true`

- [ ] **Step 3: 搭建平台地板**

在 `Level1` 下添加 `Node3D`，命名为 `Platform`。

添加 `MeshInstance3D` 子节点命名为 `Floor`：
- Mesh: 新建 `BoxMesh`
- BoxMesh → Size: `(40, 0.3, 40)`
- Position: `(0, -0.15, 0)`

新建材质（StandardMaterial3D）：
- Albedo → Color: `#1a1a2e`
- Metallic: `0.3`
- Roughness: `0.7`
- Emission → Enabled: `true`
- Emission → Color: `#0a0a1e`
- Emission → Energy: `0.2`

添加地板碰撞体：
- 在 Floor 下添加 `StaticBody3D` 子节点
- StaticBody3D 下添加 `CollisionShape3D`
- Shape: 新建 `BoxShape3D`，Size: `(40, 0.3, 40)`

- [ ] **Step 4: 搭建掩体**

在 `Platform` 下添加 4 根方柱和 2 道断墙。

**方柱（Pillar × 4）：**
每个方柱 = MeshInstance3D + StaticBody3D：
```
Pillar1: position (-12, 1.5, -12), BoxMesh size (1, 3, 1)
Pillar2: position (12, 1.5, -12),  BoxMesh size (1, 3, 1)
Pillar3: position (-12, 1.5, 12),  BoxMesh size (1, 3, 1)
Pillar4: position (12, 1.5, 12),   BoxMesh size (1, 3, 1)
```

材质：StandardMaterial3D，Albedo `#2a2a3e`，Metallic `0.5`，Emission `#111122`。

每个 Pillar 下加 `StaticBody3D` + `CollisionShape3D`（BoxShape3D 匹配）。

**断墙（Wall × 2）：**
```
Wall1: position (-8, 1.0, 3),  BoxMesh size (5, 2, 0.4)
Wall2: position (8, 1.0, -5),  BoxMesh size (4, 2, 0.4)
```

材质同 Pillar。每面墙加 StaticBody3D 碰撞。

- [ ] **Step 5: 搭建装饰物**

**中央方尖碑（Obelisk）：**
在 `Platform` 下添加 `Node3D` 命名为 `Obelisk`，position `(0, 0, 0)`：

```
Obelisk (Node3D)
├── Base (MeshInstance3D) — BoxMesh, size (1.5, 0.3, 1.5), pos (0, 0.15, 0)
├── Middle (MeshInstance3D) — BoxMesh, size (1.0, 1.5, 1.0), pos (0, 1.05, 0)
├── Top (MeshInstance3D) — BoxMesh, size (0.5, 1.0, 0.5), pos (0, 2.3, 0)
└── Crystal (MeshInstance3D) — SphereMesh, size (0.3, 1.0, 0.3), pos (0, 3.1, 0)
```

方尖碑材质（所有部件用同一个）：
- Albedo: `#3a3a5e`
- Metallic: `0.8`
- Roughness: `0.2`
- Emission: `#2222ff`, Energy: `0.5`

Crystal 用单独的发光材质：
- Albedo: `#8888ff`
- Emission: `#4444ff`, Energy: `2.0`

**高柱神殿（Temple，装饰性建筑）：**
在 `Platform` 下添加 `Node3D` 命名为 `Temple`，position `(0, 0, -16)`：

```
Temple (Node3D)
├── Column1 — CylinderMesh, size (0.3, 3, 0.3), pos (-2, 1.5, 0)
├── Column2 — 同上, pos (2, 1.5, 0)
├── Column3 — 同上, pos (-2, 1.5, -2)
├── Column4 — 同上, pos (2, 1.5, -2)
├── Roof — BoxMesh, size (5, 0.2, 3), pos (0, 3.1, -1), rotation (15°, 0, 0)
└── Lintel — BoxMesh, size (4.6, 0.2, 0.3), pos (0, 3.0, 0)
```

Temple 材质：Albedo `#2a2a3e`，Metallic `0.4`，Emission `#111122`，Energy `0.3`。

**石灯（Lantern × 8）：**
沿平台边缘均匀分布。每个 = 小圆柱 + 发光球：

```
Lantern (Node3D)
├── Stand (MeshInstance3D) — CylinderMesh, size (0.15, 0.8, 0.15)
└── Light (MeshInstance3D) — SphereMesh, size (0.2, 0.2, 0.2), pos (0, 0.5, 0)
```

Stand 材质：Albedo `#333344`
Light 材质：Emission `#8844ff`, Energy `3.0`

放置位置（沿 40×40 平台边缘，略内缩 1m）：
```
(-18, 0, -18), (0, 0, -18), (18, 0, -18),
(-18, 0, 18),  (0, 0, 18),  (18, 0, 18),
(-18, 0, 0),   (18, 0, 0)
```

- [ ] **Step 6: 添加敌人生成点标记**

在 `Level1` 下添加 `Node3D` 命名为 `SpawnPoints`。

在其下添加 8 个 `Marker3D` 子节点，均匀分布在平台边缘：

```
SpawnPoint1: position (-15, 0, -19)
SpawnPoint2: position (0, 0, -19)
SpawnPoint3: position (15, 0, -19)
SpawnPoint4: position (-15, 0, 19)
SpawnPoint5: position (0, 0, 19)
SpawnPoint6: position (15, 0, 19)
SpawnPoint7: position (-19, 0, 0)
SpawnPoint8: position (19, 0, 0)
```

每个 Marker3D 加一个临时的 MeshInstance3D 子节点用于可视化（细柱体，后续可隐藏）。

- [ ] **Step 7: 创建玩家场景骨架**

新建场景 → 根节点 `CharacterBody3D`，命名为 `Player`，保存为 `scenes/player.tscn`。

Player 节点结构：
```
Player (CharacterBody3D)
├── CollisionShape3D — CapsuleShape3D, height 1.8, radius 0.4
│   position: (0, 0.9, 0)
├── Camera3D — position (0, 1.7, 0), FOV 90
├── ShootOrigin (Marker3D) — position (0, 0, -0.5), 挂在 Camera3D 下
└── MuzzleFlash (Marker3D) — 占位，position (0, 0, -0.8), 挂在 Camera3D 下
```

> 注意：Camera3D 和 ShootOrigin、MuzzleFlash 都应作为 Player 的直接子节点（不是 Camera3D 的子节点）。Camera3D 在 `_ready` 中通过代码设为当前相机。

把 `Player` 场景实例化到 `Level1` 中：在 Level1 场景中，点「实例化子场景」→ 选择 `player.tscn`，position 设为 `(0, 1.0, 18)`。

- [ ] **Step 8: 测试**

1. 在 Godot 中打开 `level_1.tscn`
2. 按 F6 运行当前场景
3. 应看到：深色虚空背景 + 低雾 + 灰色平台 + 方柱墙体 + 中央发光方尖碑 + 神殿 + 发光石灯
4. 低角度光照使场景有立体感

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: Level 1 虚空平台场景 — 地板/掩体/方尖碑/神殿/石灯/生成点"
```

---

### Task 3: 玩家移动 & 第一人称相机

**Files:**
- Create: `void-trial/scripts/player/player.gd`
- Modify: `void-trial/scenes/player.tscn`（挂载脚本）

**Interfaces:**
- Produces: `player.gd` — 挂载在 CharacterBody3D 上，处理 WASD 移动、鼠标视角、光标锁定
- 信号（后续任务使用）：`health_changed(current, max)`, `dash_cooldown_changed(remaining, total)`, `player_damaged(amount, direction)`, `player_died()`, `headshot_landed(position)`, `bodyshot_landed(position, part)`

**依赖:** Task 2

- [ ] **Step 1: 在 player.tscn 上挂载脚本**

1. 打开 `scenes/player.tscn`
2. 选中根节点 Player (CharacterBody3D)
3. 在检查器中 → Script → 新建脚本 → 路径 `scripts/player/player.gd`
4. 模板选「CharacterBody3D: Basic movement」

- [ ] **Step 2: 编写 player.gd**

替换为以下代码：

```gdscript
extends CharacterBody3D

## 玩家主脚本：移动 / 视角 / 射击 / 闪避 / 血量

# ---- 导出属性 ----
@export var move_speed: float = 8.0
@export var mouse_sensitivity: float = 0.002
@export var shoot_cooldown: float = 0.3
@export var dash_distance: float = 3.0
@export var dash_cooldown: float = 1.5
@export var dash_duration: float = 0.2
@export var max_health: float = 100.0

# ---- 信号 ----
signal health_changed(current: float, maximum: float)
signal dash_cooldown_changed(remaining: float, total: float)
signal player_damaged(amount: float, direction: Vector3)
signal player_died()
signal headshot_landed(hit_position: Vector3)
signal bodyshot_landed(hit_position: Vector3, part: String)
signal shot_fired()

# ---- 内部状态 ----
var current_health: float
var shoot_timer: float = 0.0
var dash_timer: float = 0.0
var is_dashing: bool = false
var is_dead: bool = false

# ---- 节点引用 ----
@onready var camera: Camera3D = $Camera3D
@onready var shoot_origin: Marker3D = $Camera3D/ShootOrigin
@onready var muzzle_flash: Marker3D = $Camera3D/MuzzleFlash

# ---- 子弹场景（Task 4 设置） ----
var bullet_scene: PackedScene = null


func _ready() -> void:
	current_health = max_health
	# 锁定鼠标到游戏窗口
	Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)
	# 注册退出捕获（按 Esc 或失去焦点）
	get_tree().root.focus_entered.connect(_on_focus_entered)


func _on_focus_entered() -> void:
	# 延迟重新捕获，避免 Godot 编辑器切换时冲突
	await get_tree().process_frame
	if not is_dead:
		Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)


func _input(event: InputEvent) -> void:
	# 鼠标视角旋转
	if event is InputEventMouseMotion and Input.get_mouse_mode() == Input.MOUSE_MODE_CAPTURED:
		# 水平旋转（绕 Y 轴）
		rotate_y(-event.relative.x * mouse_sensitivity)
		# 垂直旋转（绕 X 轴，限制角度）
		camera.rotate_x(-event.relative.y * mouse_sensitivity)
		camera.rotation.x = clamp(camera.rotation.x, deg_to_rad(-89.0), deg_to_rad(89.0))


func _physics_process(delta: float) -> void:
	if is_dead:
		return

	# 更新冷却计时器
	shoot_timer = max(0.0, shoot_timer - delta)
	dash_timer = max(0.0, dash_timer - delta)

	# ---- 移动 ----
	var input_dir := Input.get_vector("move_left", "move_right", "move_forward", "move_back")
	var direction := (transform.basis * Vector3(input_dir.x, 0, input_dir.y)).normalized()

	if not is_dashing:
		velocity.x = direction.x * move_speed
		velocity.z = direction.z * move_speed
		# 重力（站在平台上需要）
		if not is_on_floor():
			velocity.y -= 9.8 * delta
		else:
			velocity.y = -0.1  # 轻压地面

	move_and_slide()

	# ---- 射击 ----
	if Input.is_action_pressed("shoot") and shoot_timer <= 0.0 and bullet_scene != null:
		_shoot()

	# ---- 闪避 ----
	if Input.is_action_just_pressed("dash") and dash_timer <= 0.0 and not is_dashing and direction.length() > 0.01:
		_dash(direction)

	# 发射信号更新 HUD
	dash_cooldown_changed.emit(dash_timer, dash_cooldown)


func _shoot() -> void:
	shoot_timer = shoot_cooldown
	shot_fired.emit()
	var bullet := bullet_scene.instantiate()
	get_tree().root.add_child(bullet)
	bullet.global_position = shoot_origin.global_position
	bullet.global_basis = shoot_origin.global_basis


func _dash(direction: Vector3) -> void:
	is_dashing = true
	dash_timer = dash_cooldown

	var tween := create_tween()
	tween.tween_property(self, "global_position",
		global_position + direction * dash_distance, dash_duration)

	await tween.finished
	is_dashing = false


func take_damage(amount: float, source_position: Vector3) -> void:
	if is_dashing or is_dead:
		return
	current_health -= amount
	var hit_dir := (global_position - source_position).normalized()
	player_damaged.emit(amount, hit_dir)
	health_changed.emit(current_health, max_health)

	if current_health <= 0:
		_die()


func _die() -> void:
	is_dead = true
	Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
	player_died.emit()
```

- [ ] **Step 3: 调整 Camera3D 节点结构**

在 `player.tscn` 中确认：
1. `Camera3D` → 勾选 `Current: true`
2. `Camera3D` → position `(0, 1.7, 0)`
3. `ShootOrigin (Marker3D)` → 作为 Camera3D 的子节点，position `(0, -0.1, -0.5)`
4. `MuzzleFlash (Marker3D)` → 作为 Camera3D 的子节点，position `(0, -0.2, -0.8)`

- [ ] **Step 4: 测试**

1. 打开 `level_1.tscn`，确保 Player 实例化在里面
2. 按 F6 运行场景
3. 验证：
   - 鼠标可以环顾四周（上下左右）
   - WASD 可以在平台上移动
   - 走到平台边缘会被碰撞挡住（因为还没做 kill_zone）
4. 按 Esc 释放鼠标

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: 玩家移动 + 第一人称相机 — WASD/鼠标环顾/光标锁定"
```

---

### Task 4: 玩家射击 — 魔法弹

**Files:**
- Create: `void-trial/scenes/magic_bolt.tscn`
- Create: `void-trial/scripts/projectiles/magic_bolt.gd`
- Modify: `void-trial/scripts/player/player.gd`（赋值 bullet_scene）

**Interfaces:**
- Consumes: `shot_fired` 信号（player.gd）
- Produces: `magic_bolt.tscn` — RigidBody3D 子弹，飞行后自动销毁，碰撞时发出 `hit_enemy(hit_position, hit_part)` 信号
- 暴露给 player.gd 的 PackedScene 引用

**依赖:** Task 3

- [ ] **Step 1: 创建 magic_bolt.tscn 场景**

新建场景 → 根节点 `RigidBody3D`，命名为 `MagicBolt`，保存为 `scenes/magic_bolt.tscn`。

节点结构：
```
MagicBolt (RigidBody3D)
├── CollisionShape3D — SphereShape3D, radius 0.1
├── MeshInstance3D — SphereMesh, radius 0.08, height 0.3
└── OmniLight3D — range 2.0, energy 0.5, color #88aaff
```

RigidBody3D 设置：
- **Freeze:** `true`（不参与物理模拟旋转/下落）
- **Continuous CD:** `true`（防止高速穿模）
- **Gravity Scale:** `0`
- **Linear → Damp:** `0`

MeshInstance3D 材质：
- Albedo: `#aaccff`
- Emission: `#4488ff`, Energy: `3.0`
- 勾选 **No Depth Test**（始终渲染在遮挡物前面，可选）

- [ ] **Step 2: 编写 magic_bolt.gd**

在 `MagicBolt` 根节点上新建脚本 `scripts/projectiles/magic_bolt.gd`：

```gdscript
extends RigidBody3D

## 玩家魔法弹 — 向前直线飞行，碰撞敌人后销毁

signal hit_enemy(hit_position: Vector3, hit_part: String)

const SPEED: float = 40.0
const LIFETIME: float = 3.0

var lifetime_timer: float = 0.0


func _ready() -> void:
	# 设置初始速度（沿自身 Z 轴负方向，即前方）
	linear_velocity = -global_transform.basis.z * SPEED

	# 连接碰撞信号
	body_entered.connect(_on_body_entered)
	area_entered.connect(_on_area_entered)


func _physics_process(delta: float) -> void:
	lifetime_timer += delta
	if lifetime_timer > LIFETIME:
		queue_free()

	# 保持速度不变（物理阻尼可能会减慢）
	linear_velocity = linear_velocity.normalized() * SPEED


var _dying: bool = false


func _on_body_entered(body: Node3D) -> void:
	if _dying:
		return
	_dying = true
	# 碰撞到了敌人身体（CharacterBody3D 层）
	# 直接由敌人的 hitbox Area3D 处理，这里作为兜底
	_die()


func _on_area_entered(area: Area3D) -> void:
	if _dying:
		return
	_dying = true

	# 获取命中部位信息（按优先级：head > body > limb）
	var hit_part := "body"
	if area.is_in_group("head"):
		hit_part = "head"
	elif area.is_in_group("arm") or area.is_in_group("leg"):
		hit_part = "limb"

	hit_enemy.emit(area.global_position, hit_part)

	# 调用敌人的受击方法
	var parent := area.get_parent()
	if parent and parent.has_method("take_damage_from_bullet"):
		parent.take_damage_from_bullet(hit_part, global_position)

	_die()


func _die() -> void:
	# 禁用碰撞防止同帧二次触发
	collision_layer = 0
	collision_mask = 0
	queue_free()
```

- [ ] **Step 3: 在 player.gd 中关联子弹场景**

打开 `player.gd`，在文件顶部 `@export` 区域添加：

```gdscript
@export var bullet_scene: PackedScene
```

移除原来的 `var bullet_scene: PackedScene = null`。

回到 `player.tscn` 场景编辑器，在检查器的 Player 脚本属性中，把 `Bullet Scene` 拖入 `magic_bolt.tscn`。

- [ ] **Step 4: 测试**

1. 运行 `level_1.tscn`
2. 按鼠标左键 → 应看到蓝色发光球从画面中心飞出
3. 子弹飞行约 3 秒后自动消失
4. 可以边走边射

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: 玩家射击 — 魔法弹 RigidBody3D + CCD + 自动销毁"
```

---

### Task 5: 玩家闪避 & 血量系统

**Files:**
- Modify: `void-trial/scripts/player/player.gd`（闪避和血量已在 Task 3 写了框架，本任务完善）

**Interfaces:**
- Consumes: player.gd 中的 dash/health 逻辑
- Produces: 完善闪避无敌帧 + 死亡逻辑 + 平台掉落检测

**依赖:** Task 3

- [ ] **Step 1: 完善闪避无敌帧逻辑**

闪避逻辑已在 Task 3 的 `player.gd` 中实现。本步添加 _physics_process 中的闪避点检测——闪避过程中忽略伤害。确认 `take_damage` 中的 `if is_dashing` 守卫已存在。

在 `_dash` 方法中增加视觉反馈（屏幕边缘模糊）：

在 `_dash` 方法的 `var tween := create_tween()` 之前插入：

```gdscript
	# 闪避开始时屏幕效果
	var dash_effect := ColorRect.new()
	dash_effect.color = Color(0.3, 0.5, 1.0, 0.15)
	dash_effect.size = Vector2(2000, 2000)
	dash_effect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	camera.add_child(dash_effect)

	tween.tween_callback(dash_effect.queue_free).set_delay(dash_duration)
```

- [ ] **Step 2: 测试闪避**

1. 运行游戏
2. 按住 W + 按空格 → 应向前闪现约 3 米
3. 松开 W 再按空格 → 应该不会闪现（没有方向输入）
4. 等待 1.5 秒冷却后方可再次闪避

- [ ] **Step 3: 完善玩家死亡**

在 `_die()` 方法后追加：

```gdscript
func _die() -> void:
	is_dead = true
	Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
	# 短暂延迟后显示死亡画面
	player_died.emit()
```

- [ ] **Step 4: 添加平台掉落检测**

在 `Level1` 场景中，Platform 下方（position `(0, -5, 0)`）添加一个 `Area3D` 命名为 `KillZone`：
- CollisionShape3D → BoxShape3D, size `(50, 2, 50)`
- 连接 `body_entered` 信号到 Player

但更简单的做法：在 player.gd 的 `_physics_process` 中添加掉落检测（如果玩家 Y < -3，触发死亡）：

```gdscript
	# _physics_process 中 move_and_slide() 之后：
	if global_position.y < -5.0:
		current_health = 0
		_die()
```

- [ ] **Step 5: 测试血量**

在当前测试环境下，由于还没有敌人，血量无法直接测试。可以通过在 player.gd 的 `_ready` 中临时添加自伤代码验证：

```gdscript
# 临时测试代码（验证后删除）
# take_damage(25.0, global_position + Vector3(1, 0, 0))
```

运行游戏，确认 HUD 信号正常发出（控制台无报错）。

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: 闪避无敌帧 + 死亡逻辑 + 掉落检测"
```

---

### Task 6: 敌人基类 + 冲撞者（Charger）

**Files:**
- Create: `void-trial/scenes/charger.tscn`
- Create: `void-trial/scripts/enemies/enemy_base.gd`
- Create: `void-trial/scripts/enemies/charger.gd`

**Interfaces:**
- Consumes: `magic_bolt.gd` 的 `hit_enemy` 信号 → 调用 `take_damage_from_bullet(hit_part, bullet_pos)`
- Produces: `enemy_base.gd` — 基类，HP 管理、部位判定、死亡动画。信号: `enemy_died(was_headshot: bool, death_position: Vector3)`
- Produces: `charger.gd` 继承 enemy_base — 追踪、前摇、冲撞、近战伤害

**依赖:** Task 4

- [ ] **Step 1: 编写敌人基类 enemy_base.gd**

```gdscript
class_name EnemyBase
extends CharacterBody3D

## 敌人基类 — HP 管理 / 部位判定 / 死亡

signal enemy_died(was_headshot: bool, death_position: Vector3)

# 部位伤害映射
@export var head_damage: float = 20.0
@export var body_damage: float = 10.0
@export var limb_damage: float = 6.0
@export var max_health: float = 30.0

var current_health: float


func _ready() -> void:
	current_health = max_health
	_setup_hitboxes()


func _setup_hitboxes() -> void:
	# 子类可重写来设置碰撞体 group
	pass


func take_damage_from_bullet(hit_part: String, bullet_pos: Vector3) -> void:
	var damage: float
	match hit_part:
		"head":
			damage = head_damage
		"limb":
			damage = limb_damage
		_:
			damage = body_damage

	current_health -= damage
	print("命中部位: %s, 伤害: %.0f, 剩余HP: %.0f" % [hit_part, damage, current_health])

	if current_health <= 0:
		_die(hit_part == "head")


func _die(was_headshot: bool) -> void:
	enemy_died.emit(was_headshot, global_position)
	queue_free()


func _deal_damage_to_player(amount: float) -> void:
	# 获取场景中的 Player 引用
	var player := get_tree().get_first_node_in_group("player")
	if player and player.has_method("take_damage"):
		player.take_damage(amount, global_position)
```

- [ ] **Step 2: 编写 charger.gd（冲撞者 AI）**

```gdscript
extends EnemyBase

## 冲撞者 — 追踪玩家、蓄力前摇、冲撞近战

@export var walk_speed: float = 5.0
@export var charge_speed: float = 14.0
@export var charge_distance: float = 1.5
@export var charge_cooldown: float = 2.0
@export var charge_damage: float = 15.0

enum State { IDLE, CHASING, WINDUP, CHARGING, RECOVERING }
var current_state: State = State.IDLE
var state_timer: float = 0.0
var player_ref: Node3D = null
var charge_direction: Vector3 = Vector3.ZERO


func _ready() -> void:
	super._ready()
	add_to_group("enemy")
	_find_player()


func _find_player() -> void:
	player_ref = get_tree().get_first_node_in_group("player")


func _physics_process(delta: float) -> void:
	if player_ref == null:
		_find_player()
		if player_ref == null:
			return

	state_timer -= delta

	match current_state:
		State.IDLE:
			# 检测玩家距离，开始追踪
			if global_position.distance_to(player_ref.global_position) < 25.0:
				current_state = State.CHASING

		State.CHASING:
			_look_at_player(delta)
			var dir := (player_ref.global_position - global_position).normalized()
			dir.y = 0
			velocity.x = dir.x * walk_speed
			velocity.z = dir.z * walk_speed

			var dist := global_position.distance_to(player_ref.global_position)
			if dist < charge_distance * 3 and state_timer <= 0.0:
				# 进入蓄力前摇
				current_state = State.WINDUP
				state_timer = 0.4  # 前摇时间
				velocity = Vector3.ZERO

		State.WINDUP:
			# 蓄力（身体后仰效果通过缩放实现）
			if state_timer <= 0.0:
				current_state = State.CHARGING
				charge_direction = (player_ref.global_position - global_position).normalized()
				charge_direction.y = 0
				state_timer = 1.0  # 冲刺持续时间

		State.CHARGING:
			velocity.x = charge_direction.x * charge_speed
			velocity.z = charge_direction.z * charge_speed

			# 撞到玩家
			var dist := global_position.distance_to(player_ref.global_position)
			if dist < charge_distance:
				_deal_damage_to_player(charge_damage)
				current_state = State.RECOVERING
				state_timer = charge_cooldown
				velocity = Vector3.ZERO

			if state_timer <= 0.0:
				# 冲刺超时，进入恢复
				current_state = State.RECOVERING
				state_timer = charge_cooldown
				velocity = Vector3.ZERO

		State.RECOVERING:
			velocity = Vector3.ZERO
			if state_timer <= 0.0:
				current_state = State.CHASING

	move_and_slide()


func _look_at_player(delta: float) -> void:
	var target := player_ref.global_position
	target.y = global_position.y
	var dir := target - global_position
	if dir.length() > 0.01:
		var target_rot := atan2(dir.x, dir.z)
		rotation.y = lerp_angle(rotation.y, target_rot, delta * 5.0)


func _die(was_headshot: bool) -> void:
	# 冲撞者死亡特效先调用基类然后扩展
	super._die(was_headshot)
```

- [ ] **Step 3: 创建 charger.tscn 场景**

新建场景 → 根节点 `CharacterBody3D`，命名为 `Charger`，挂载 `charger.gd`。

构建几何人形：

```
Charger (CharacterBody3D) [charger.gd]
├── Head (Node3D) — position (0, 1.7, 0)
│   ├── HeadMesh (MeshInstance3D) — SphereMesh, radius 0.25
│   └── HeadArea (Area3D) — CollisionShape3D: SphereShape3D, radius 0.23
├── Body (Node3D) — position (0, 1.1, 0)
│   ├── BodyMesh (MeshInstance3D) — BoxMesh, size (0.6, 0.8, 0.35)
│   └── BodyArea (Area3D) — CollisionShape3D: BoxShape3D, size (0.58, 0.78, 0.33)
├── LeftArm (Node3D) — position (-0.42, 1.5, 0)
│   ├── ArmMesh (MeshInstance3D) — CylinderMesh (旋转), 或 BoxMesh size (0.15, 0.6, 0.15)
│   └── LeftArmArea (Area3D) — CollisionShape3D: BoxShape3D, size (0.13, 0.58, 0.13)
├── RightArm (Node3D) — position (0.42, 1.5, 0)
│   ├── ArmMesh
│   └── RightArmArea (Area3D)
├── LeftLeg (Node3D) — position (-0.18, 0.35, 0)
│   ├── LegMesh — BoxMesh size (0.2, 0.7, 0.2)
│   └── LeftLegArea (Area3D)
├── RightLeg (Node3D) — position (0.18, 0.35, 0)
│   ├── LegMesh
│   └── RightLegArea (Area3D)
└── CollisionShape3D — CapsuleShape3D, height 1.8, radius 0.35, pos (0, 0.9, 0)
    （用于 CharacterBody3D 自身的物理碰撞，不用于子弹判定）
```

**材质（红色系）：**
- Albedo: `#cc3333`
- Metallic: `0.3`
- Roughness: `0.5`
- Emission: `#440000`, Energy: `0.8`

**Group 标记：**
- `HeadArea` → 添加 group `head`
- `LeftArmArea`, `RightArmArea` → 添加 group `arm`
- `LeftLegArea`, `RightLegArea` → 添加 group `leg`
- `BodyArea` → 添加 group `body`
- 根节点 `Charger` → 添加 group `enemy`

每个 Area3D 的 **Monitoring** 和 **Monitorable** 都勾选。

- [ ] **Step 4: 在 Level 1 中测试冲撞者**

1. 手动在 `level_1.tscn` 中实例化一个 `charger.tscn`，position 放在平台中央 `(0, 0, 0)`
2. 运行游戏
3. 验证：
   - 冲撞者朝向玩家追踪
   - 接近后进入前摇 → 冲刺
   - 撞到玩家后进入冷却
4. 射击冲撞者不同部位，观察控制台输出不同伤害值
5. HP 耗尽后敌人消失（queue_free）

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: 敌人基类 + 冲撞者 — 人形几何体 + 多部位 Area3D + 追踪/蓄力/冲撞"
```

---

### Task 7: 喷射者（Spitter）敌人

**Files:**
- Create: `void-trial/scenes/spitter.tscn`
- Create: `void-trial/scenes/enemy_bolt.tscn`
- Create: `void-trial/scripts/enemies/spitter.gd`
- Create: `void-trial/scripts/projectiles/enemy_bolt.gd`

**Interfaces:**
- Consumes: `enemy_base.gd` 基类
- Produces: `spitter.gd` — 保持距离 + 环移 + 蓄力发射光弹
- Produces: `enemy_bolt.tscn` + `enemy_bolt.gd` — 敌人光弹，命中玩家扣血

**依赖:** Task 6

- [ ] **Step 1: 编写 spitter.gd**

```gdscript
extends EnemyBase

## 喷射者 — 保持距离 + 环移 + 蓄力发射光弹

@export var move_speed: float = 3.5
@export var preferred_distance: float = 12.0
@export var shoot_interval: float = 2.0
@export var windup_time: float = 0.5
@export var bolt_scene: PackedScene

var shoot_timer: float = 0.0
var current_state: int = 0  # 0=idle, 1=positioning, 2=windup, 3=shooting
var player_ref: Node3D = null
var strafe_direction: int = 1  # 1=右, -1=左


func _ready() -> void:
	super._ready()
	add_to_group("enemy")
	_find_player()
	shoot_timer = shoot_interval * 0.5  # 首发射击缩短等待


func _find_player() -> void:
	player_ref = get_tree().get_first_node_in_group("player")


func _physics_process(delta: float) -> void:
	if player_ref == null:
		_find_player()
		if player_ref == null:
			return

	shoot_timer -= delta

	var to_player := player_ref.global_position - global_position
	var dist := to_player.length()
	var dir_to_player := to_player.normalized()

	# 始终面朝玩家
	if dist > 0.01:
		var target_rot := atan2(dir_to_player.x, dir_to_player.z)
		rotation.y = lerp_angle(rotation.y, target_rot, delta * 3.0)

	# 状态机
	if current_state == 2:  # windup — 蓄力中不移动
		velocity = Vector3.ZERO
	elif dist > preferred_distance + 3.0:
		# 太远了，靠近玩家
		velocity.x = dir_to_player.x * move_speed
		velocity.z = dir_to_player.z * move_speed
	elif dist < preferred_distance - 3.0:
		# 太近了，后退 + 环移
		var backward := -dir_to_player
		var right := dir_to_player.cross(Vector3.UP).normalized() * strafe_direction
		var move_dir := (backward + right * 0.7).normalized()
		velocity.x = move_dir.x * move_speed
		velocity.z = move_dir.z * move_speed
	else:
		# 在舒适距离，环移
		var right := dir_to_player.cross(Vector3.UP).normalized() * strafe_direction
		velocity.x = right.x * move_speed * 0.6
		velocity.z = right.z * move_speed * 0.6

	# 定期切换环移方向
	if randi() % 300 == 0:
		strafe_direction *= -1

	# 射击逻辑
	if shoot_timer <= 0.0 and current_state == 0:
		current_state = 2  # windup
		shoot_timer = windup_time
	elif shoot_timer <= 0.0 and current_state == 2:
		_shoot(dir_to_player)
		current_state = 0
		shoot_timer = shoot_interval

	move_and_slide()


func _shoot(direction: Vector3) -> void:
	if bolt_scene == null:
		return
	var bolt := bolt_scene.instantiate()
	get_tree().root.add_child(bolt)
	# 从头部位置发射
	var spawn_pos := global_position + Vector3(0, 1.7, 0)
	bolt.global_position = spawn_pos
	# 设置飞行方向
	if bolt.has_method("set_direction"):
		bolt.set_direction(direction, global_position)


func _die(was_headshot: bool) -> void:
	super._die(was_headshot)
```

- [ ] **Step 2: 创建 spitter.tscn 场景**

参照 charger.tscn 的结构，但稍微小一些（1.8m）：

```
Spitter (CharacterBody3D) [spitter.gd]
├── Head (Node3D) — position (0, 1.55, 0)
│   ├── HeadMesh (MeshInstance3D) — 新建 BoxMesh 后旋转成八面体效果
│   │   或用 SphereMesh radius 0.2 拉伸
│   └── HeadArea (Area3D) — SphereShape3D, radius 0.18
├── Body (Node3D) — position (0, 1.0, 0)
│   ├── BodyMesh (MeshInstance3D) — BoxMesh, size (0.5, 0.7, 0.3)
│   └── BodyArea (Area3D) — BoxShape3D, size (0.48, 0.68, 0.28)
├── LeftArm (Node3D) — position (-0.38, 1.3, 0)
│   ├── ArmMesh — BoxMesh size (0.12, 0.5, 0.12)
│   └── LeftArmArea (Area3D)
├── RightArm (Node3D) — position (0.38, 1.3, 0)
│   ├── ArmMesh
│   └── RightArmArea (Area3D)
├── LeftLeg (Node3D) — position (-0.15, 0.3, 0)
│   ├── LegMesh — BoxMesh size (0.18, 0.6, 0.18)
│   └── LeftLegArea (Area3D)
├── RightLeg (Node3D) — position (0.15, 0.3, 0)
│   ├── LegMesh
│   └── RightLegArea (Area3D)
└── CollisionShape3D — CapsuleShape3D, height 1.6, radius 0.3, pos (0, 0.8, 0)
```

整体 position 的 Y 设为 0.5（悬浮效果）。

**材质（蓝色冷光）：**
- Albedo: `#3344cc`
- Metallic: `0.4`
- Roughness: `0.5`
- Emission: `#000044`, Energy: `0.6`

Group 同 charger。

- [ ] **Step 3: 创建 enemy_bolt.tscn + enemy_bolt.gd**

**enemy_bolt.tscn：**
```
EnemyBolt (RigidBody3D)
├── CollisionShape3D — SphereShape3D, radius 0.15
└── MeshInstance3D — SphereMesh, radius 0.12, height 0.4
```

设置同 magic_bolt（Freeze: true, Continuous CD: true, Gravity Scale: 0）。

Mesh 材质：
- Albedo: `#ff6644`
- Emission: `#ff4400`, Energy: `2.5`

**enemy_bolt.gd：**

```gdscript
extends RigidBody3D

## 敌人光弹 — 沿指定方向飞行，命中玩家扣血

const SPEED: float = 18.0
const LIFETIME: float = 4.0
const DAMAGE: float = 10.0

var flight_direction: Vector3 = Vector3.ZERO
var lifetime_timer: float = 0.0
var _dying: bool = false


func set_direction(direction: Vector3, _origin: Vector3) -> void:
	flight_direction = direction.normalized()
	linear_velocity = flight_direction * SPEED


func _ready() -> void:
	if flight_direction == Vector3.ZERO:
		flight_direction = -global_transform.basis.z
		linear_velocity = flight_direction * SPEED

	body_entered.connect(_on_body_entered)


func _physics_process(delta: float) -> void:
	lifetime_timer += delta
	if lifetime_timer > LIFETIME:
		queue_free()
	linear_velocity = linear_velocity.normalized() * SPEED


func _on_body_entered(body: Node3D) -> void:
	if _dying:
		return
	_dying = true

	if body.is_in_group("player"):
		if body.has_method("take_damage"):
			body.take_damage(DAMAGE, global_position)

	collision_layer = 0
	collision_mask = 0
	queue_free()
```

- [ ] **Step 4: 在 spitter.tscn 挂载 Bolt Scene 引用**

1. 打开 `spitter.tscn`
2. 选中根节点，在检查器找到 `Bolt Scene` 属性
3. 拖入 `enemy_bolt.tscn`

同时在 player.tscn 中，给 Player 根节点添加 group `player`：
1. 选中 Player → 检查器 → Node → Groups → 添加 `player`

- [ ] **Step 5: 测试**

1. 在 `level_1.tscn` 中手动放置一个 Spitter，position `(5, 0.5, -5)`
2. 运行游戏
3. 验证：
   - Spitter 保持距离，绕玩家环移
   - 定期发射红色光弹
   - 光弹命中玩家 → 扣血（检查控制台）
   - 玩家可以射击 Spitter，头部伤害 20（秒杀），身体 8

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: 喷射者敌人 — 环移 AI + 蓄力发射 + 敌人光弹"
```

---

### Task 8: 波次管理器（Wave Manager）

**Files:**
- Create: `void-trial/scripts/world/wave_manager.gd`
- Modify: `void-trial/scenes/level_1.tscn`（添加 WaveManager 节点）

**Interfaces:**
- Consumes: `charger.tscn`, `spitter.tscn` (PackedScene 引用)，`SpawnPoints` 节点的 Marker3D 数组
- Produces: 波次递进、敌人计数、波间过渡 UI、过关触发信号 `all_waves_cleared()`

**依赖:** Task 7

- [ ] **Step 1: 编写 wave_manager.gd**

```gdscript
extends Node

## 波次管理器 — 敌人波次生成 / 计数 / 递进

signal wave_changed(wave: int, total: int)
signal enemies_remaining_changed(remaining: int)
signal all_waves_cleared()
signal wave_transition_started(wave: int)

@export var charger_scene: PackedScene
@export var spitter_scene: PackedScene
@export var spawn_points_parent: NodePath

# 波次定义: [冲撞者数量, 喷射者数量]
var waves: Array = [
	[3, 1],   # 波次 1
	[4, 2],   # 波次 2
	[5, 3],   # 波次 3
]

var current_wave: int = -1  # -1 表示未开始, 0-indexed
var enemies_alive: int = 0
var wave_active: bool = false
var between_waves: bool = false


func _ready() -> void:
	# 监听所有敌人死亡
	EventBus.enemy_killed.connect(_on_enemy_killed)


func start_first_wave() -> void:
	await get_tree().create_timer(0.5).timeout
	_advance_wave()


func _advance_wave() -> void:
	current_wave += 1

	if current_wave >= waves.size():
		all_waves_cleared.emit()
		return

	var wave_data := waves[current_wave]
	var charger_count: int = wave_data[0]
	var spitter_count: int = wave_data[1]

	wave_transition_started.emit(current_wave + 1)

	# 波间过渡延迟
	between_waves = true
	await get_tree().create_timer(3.0).timeout
	between_waves = false

	wave_changed.emit(current_wave + 1, waves.size())
	wave_active = true

	# 生成冲撞者
	for i in range(charger_count):
		_spawn_enemy(charger_scene)
		await get_tree().create_timer(0.3).timeout

	# 生成喷射者
	for i in range(spitter_count):
		_spawn_enemy(spitter_scene)
		await get_tree().create_timer(0.3).timeout

	enemies_remaining_changed.emit(enemies_alive)


func _spawn_enemy(scene: PackedScene) -> void:
	if scene == null:
		return

	var enemy := scene.instantiate()
	get_tree().root.add_child(enemy)

	# 随机选择一个生成点
	var spawn_points := get_node(spawn_points_parent)
	var point_count := spawn_points.get_child_count()
	if point_count > 0:
		var idx := randi() % point_count
		var spawn_marker: Marker3D = spawn_points.get_child(idx)
		enemy.global_position = spawn_marker.global_position

	enemies_alive += 1


func _on_enemy_killed(_was_headshot: bool, _pos: Vector3) -> void:
	enemies_alive -= 1
	enemies_remaining_changed.emit(enemies_alive)

	if enemies_alive <= 0 and wave_active and not between_waves:
		wave_active = false
		_check_wave_complete()


func _check_wave_complete() -> void:
	if current_wave + 1 >= waves.size():
		# 全部波次完成
		all_waves_cleared.emit()
	else:
		# 进入下一波
		await get_tree().create_timer(1.0).timeout
		_advance_wave()
```

- [ ] **Step 2: 创建 EventBus 全局事件系统**

敌人死亡需要通知 WaveManager。创建 `void-trial/scripts/autoload/event_bus.gd`：

```gdscript
extends Node

## 全局事件总线 — 解耦敌人和波次管理器

signal enemy_killed(was_headshot: bool, death_position: Vector3)
```

在 Godot 编辑器中注册 autoload：
1. **项目 → 项目设置 → 自动加载**
2. 路径：`scripts/autoload/event_bus.gd`
3. 节点名：`EventBus`
4. 点「添加」

- [ ] **Step 3: 修改 enemy_base.gd 发射事件**

在 `enemy_base.gd` 的 `_die` 方法中添加：

```gdscript
func _die(was_headshot: bool) -> void:
	EventBus.enemy_killed.emit(was_headshot, global_position)
	enemy_died.emit(was_headshot, global_position)
	queue_free()
```

- [ ] **Step 4: 在 Level 1 中添加 WaveManager**

1. 打开 `level_1.tscn`
2. 在 `Level1` 根节点下添加 `Node`，命名为 `WaveManager`
3. 挂载 `wave_manager.gd`
4. 在检查器中设置：
   - `Charger Scene` → 拖入 `charger.tscn`
   - `Spitter Scene` → 拖入 `spitter.tscn`
   - `Spawn Points Parent` → 点击后选择 `SpawnPoints` 节点

5. 在 `WaveManager` 的检查器中，连接信号：
   - `wave_transition_started` → 后续 HUD 处理
   - `all_waves_cleared` → 后续胜利画面处理

- [ ] **Step 5: 在 Player 的 _ready 中触发首波**

在 `player.gd` 的 `_ready()` 末尾添加：

```gdscript
	# 触发首波敌人
	var wave_mgr := get_tree().get_first_node_in_group("wave_manager")
	if wave_mgr and wave_mgr.has_method("start_first_wave"):
		wave_mgr.start_first_wave()
```

同时在 `Level1` 场景中，给 WaveManager 节点添加 group `wave_manager`。

移除之前手动放置的测试敌人（charger 和 spitter 实例）。

- [ ] **Step 6: 测试**

1. 运行 `level_1.tscn`
2. 验证：
   - 等待 0.5s → 屏幕应有 3s 过渡 → 波次 1 开始
   - 3 个 Charger + 1 个 Spitter 从边缘生成点出现
   - 击杀所有敌人后 → 短暂等待 → 波次 2 开始
   - 击杀波次 3 所有敌人后 → 控制台应打印 "all_waves_cleared"

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: 波次管理器 — 3 波递进 + 生成点随机 + EventBus 解耦"
```

---

### Task 9: HUD & 准星

**Files:**
- Create: `void-trial/scenes/hud.tscn`
- Create: `void-trial/scripts/ui/hud.gd`

**Interfaces:**
- Consumes: `player.gd` 信号（`health_changed`, `dash_cooldown_changed`, `player_damaged`）
- Consumes: `wave_manager.gd` 信号（`wave_changed`, `enemies_remaining_changed`, `wave_transition_started`）
- Produces: 完整战斗 HUD CanvasLayer

**依赖:** Task 8, Task 5

- [ ] **Step 1: 创建 HUD 场景**

新建场景 → 根节点 `CanvasLayer`，命名为 `HUD`，保存为 `scenes/hud.tscn`。

节点结构：
```
HUD (CanvasLayer) [hud.gd]
├── HealthContainer (Control) — anchors: 左下
│   ├── HealthBg (ColorRect) — 暗底, size (260, 30), color #00000088
│   ├── HealthFill (ColorRect) — 红色, size (260, 30), color #ff3333cc
│   ├── HealthLabel (Label) — "HP 100/100"
│   └── DashIndicator (Label) — "[闪避 ◆]" 或 "[闪避 ◆ 冷却中]"
├── WaveInfo (Label) — anchors: 顶部中央, "波次 1/3  |  敌剩余 0"
├── WaveTransition (Label) — anchors: 全屏中央, 默认隐藏, 大号字
├── HeadshotCounter (Label) — anchors: 上方, 默认隐藏, 金色
├── Crosshair (Control) — anchors: 全屏中央
│   ├── CrossH (ColorRect) — 横线
│   ├── CrossV (ColorRect) — 竖线
│   └── HitExpand (ColorRect) — 命中扩散金环, 默认隐藏
├── HitDirection (ColorRect) — 全屏红色渐晕, 默认透明, 受击时闪
└── ScreenFlash (ColorRect) — 全屏, 默认透明, 爆头击杀金色脉冲
```

- [ ] **Step 2: 编写 hud.gd**

```gdscript
extends CanvasLayer

## 战斗 HUD — 血条/闪避冷却/波次/准星/受击方向

@onready var health_fill: ColorRect = $HealthContainer/HealthFill
@onready var health_label: Label = $HealthContainer/HealthLabel
@onready var dash_indicator: Label = $HealthContainer/DashIndicator
@onready var wave_info: Label = $WaveInfo
@onready var wave_transition: Label = $WaveTransition
@onready var headshot_counter: Label = $HeadshotCounter
@onready var hit_expand: ColorRect = $Crosshair/HitExpand
@onready var hit_direction: ColorRect = $HitDirection
@onready var screen_flash: ColorRect = $ScreenFlash
@onready var cross_h: ColorRect = $Crosshair/CrossH
@onready var cross_v: ColorRect = $Crosshair/CrossV


func _ready() -> void:
	# 连接 Player 信号
	var player := get_tree().get_first_node_in_group("player")
	if player:
		player.health_changed.connect(_on_health_changed)
		player.dash_cooldown_changed.connect(_on_dash_changed)
		player.player_damaged.connect(_on_player_damaged)
		player.player_died.connect(_on_player_died)
		player.headshot_landed.connect(_on_headshot_landed)
		player.bodyshot_landed.connect(_on_bodyshot_landed)

	# 连接 WaveManager 信号
	var wave_mgr := get_tree().get_first_node_in_group("wave_manager")
	if wave_mgr:
		wave_mgr.wave_changed.connect(_on_wave_changed)
		wave_mgr.enemies_remaining_changed.connect(_on_enemies_remaining)
		wave_mgr.wave_transition_started.connect(_on_wave_transition_started)

	# 初始化显示
	health_fill.size.x = 260
	wave_transition.hide()
	headshot_counter.hide()
	hit_direction.modulate.a = 0.0
	screen_flash.modulate.a = 0.0


func _on_health_changed(current: float, maximum: float) -> void:
	var ratio := current / maximum
	health_fill.size.x = 260.0 * ratio
	health_label.text = "HP %.0f/%.0f" % [current, maximum]

	if ratio < 0.3:
		health_fill.color = Color(0.8, 0.1, 0.1, 0.8)  # 低血量深红
	else:
		health_fill.color = Color(1.0, 0.2, 0.2, 0.8)


func _on_dash_changed(remaining: float, total: float) -> void:
	if remaining <= 0.0:
		dash_indicator.text = "[闪避 ◆ 就绪]"
		dash_indicator.add_theme_color_override("font_color", Color.GREEN)
	else:
		dash_indicator.text = "[闪避 ◆ %.1fs]" % remaining
		dash_indicator.add_theme_color_override("font_color", Color.GRAY)


func _on_player_damaged(amount: float, direction: Vector3) -> void:
	# 屏幕红色渐晕 + 方向指示
	var tween := create_tween()
	hit_direction.modulate = Color(1.0, 0.0, 0.0, 0.3)
	tween.tween_property(hit_direction, "modulate:a", 0.0, 0.5)


func _on_player_died() -> void:
	wave_transition.text = "你死了"
	wave_transition.show()


func _on_wave_changed(wave: int, total: int) -> void:
	wave_info.text = "波次 %d/%d" % [wave, total]


func _on_enemies_remaining(remaining: int) -> void:
	var parts := wave_info.text.split("|")
	if parts.size() >= 1:
		wave_info.text = parts[0] + " | 敌剩余 %d" % remaining


func _on_wave_transition_started(wave: int) -> void:
	wave_transition.text = "波次 %d" % wave
	wave_transition.show()

	var tween := create_tween()
	tween.tween_property(wave_transition, "modulate:a", 1.0, 0.3)
	tween.tween_interval(1.5)
	tween.tween_property(wave_transition, "modulate:a", 0.0, 0.5)
	tween.tween_callback(wave_transition.hide)

	wave_info.text = "波次 %d/3 | 敌剩余 -" % wave


func _on_headshot_landed(_position: Vector3) -> void:
	# 准星扩散金环
	_hit_feedback(Color.GOLD)

	# 更新爆头计数器
	headshot_counter.text = "🎯 爆头 x%d" % GameState.headshot_streak
	headshot_counter.show()

	var tween := create_tween()
	tween.tween_interval(1.5)
	tween.tween_callback(headshot_counter.hide)


func _on_bodyshot_landed(_position: Vector3, _part: String) -> void:
	_hit_feedback(Color.WHITE)


func _hit_feedback(color: Color) -> void:
	# 准星短暂扩大
	var tween := create_tween()
	cross_h.size.x = 24
	cross_v.size.y = 24
	tween.tween_property(cross_h, "size:x", 12, 0.1)
	tween.parallel().tween_property(cross_v, "size:y", 12, 0.1)
```

- [ ] **Step 3: 设计准星样式**

在 `Crosshair` Control 中：
- `CrossH` (ColorRect): size `(12, 2)`, position 居中偏左，color `#ffffffcc`
- `CrossV` (ColorRect): size `(2, 12)`, position 居中偏上，color `#ffffffcc`
- 中心留 4px 空隙（两条线不连在一起）
- `HitExpand` (ColorRect): 与外层同尺寸但默认全透明，命中时短暂显示金色

- [ ] **Step 4: 将 HUD 添加到 Level 1**

1. 打开 `level_1.tscn`
2. 实例化子场景 → 选择 `hud.tscn`
3. 作为 `Level1` 的直接子节点

- [ ] **Step 5: 测试**

1. 运行 `level_1.tscn`
2. 验证：
   - 左下角 HP 条 `100/100`
   - 左下角 `[闪避 ◆ 就绪]`，按空格后进入冷却倒计时
   - 顶部中央波次信息
   - 屏幕中央小十字准星
   - 被敌人打到后屏幕边缘红色渐晕
   - 波次过渡时中央大字提示

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: HUD + 准星 — 血条/闪避冷却/波次/受击/爆头计数"
```

---

### Task 10: 伤害数字 + 命中粒子 + 死亡特效

**Files:**
- Create: `void-trial/scripts/world/damage_popup.gd`
- Create: `void-trial/scenes/damage_popup.tscn`
- Modify: `void-trial/scripts/enemies/enemy_base.gd`（添加死亡粒子）
- Create: 粒子材质在编辑器中创建

**Interfaces:**
- Consumes: `magic_bolt.gd` → `enemy_base.take_damage_from_bullet()` → 触发生成伤害数字
- Produces: 浮动伤害数字 + 命中粒子 + 死亡碎裂粒子

**依赖:** Task 9

- [ ] **Step 1: 创建 damage_popup.tscn + damage_popup.gd**

新建场景 → 根节点 `Node3D`，命名为 `DamagePopup`，保存为 `scenes/damage_popup.tscn`。

```
DamagePopup (Node3D)
└── Label3D — 3D 文字标签
    - Billboard: Enabled（始终朝向相机）
    - Font Size: 32
    - Outline Size: 2
    - Modulate: white（代码中动态改色）
```

**damage_popup.gd：**

```gdscript
extends Node3D

## 浮动伤害数字 — 在命中位置弹出并飘升淡出

@onready var label: Label3D = $Label3D


func setup(damage: float, is_headshot: bool) -> void:
	var text := "%.0f" % damage
	if is_headshot:
		text = "🎯" + text
		label.modulate = Color.GOLD
		label.font_size = 40
	else:
		label.modulate = Color.WHITE
		label.font_size = 28

	label.text = text
	_animate()


func _animate() -> void:
	var tween := create_tween()
	tween.set_parallel(true)

	# 向上飘
	tween.tween_property(self, "position:y", position.y + 2.5, 1.0)
	# 淡出
	tween.tween_property(label, "modulate:a", 0.0, 0.8)

	await tween.finished
	queue_free()
```

- [ ] **Step 2: 在 enemy_base.gd 中添加伤害数字生成**

在 `enemy_base.gd` 中添加：

```gdscript
@export var damage_popup_scene: PackedScene

func take_damage_from_bullet(hit_part: String, bullet_pos: Vector3) -> void:
	# ... 原有伤害计算 ...

	# 生成伤害数字
	_spawn_damage_popup(damage, hit_part == "head", bullet_pos)

	# ... 原有死亡检查 ...


func _spawn_damage_popup(damage: float, is_headshot: bool, at_position: Vector3) -> void:
	if damage_popup_scene == null:
		return
	var popup := damage_popup_scene.instantiate()
	get_tree().root.add_child(popup)
	popup.global_position = at_position + Vector3(0, 0.5, 0)
	if popup.has_method("setup"):
		popup.setup(damage, is_headshot)
```

在 Godot 编辑器中，打开 `charger.tscn` 和 `spitter.tscn`，在 EnemyBase 属性中找到 `Damage Popup Scene`，拖入 `damage_popup.tscn`。

- [ ] **Step 3: 创建命中粒子效果**

在 `enemy_base.gd` 的 `take_damage_from_bullet` 中，命中点生成粒子：

```gdscript
func take_damage_from_bullet(hit_part: String, bullet_pos: Vector3) -> void:
	# ...伤害计算...
	_spawn_damage_popup(damage, hit_part == "head", bullet_pos)
	_spawn_hit_particles(bullet_pos, hit_part == "head")
	# ...

func _spawn_hit_particles(at_position: Vector3, is_headshot: bool) -> void:
	# 创建一个临时 GPUParticles3D
	var particles := GPUParticles3D.new()
	get_tree().root.add_child(particles)
	particles.global_position = at_position
	particles.one_shot = true
	particles.explosiveness = 1.0
	particles.amount = 15 if is_headshot else 5
	particles.lifetime = 0.5

	# 创建粒子材质
	var mat := ParticleProcessMaterial.new()
	mat.direction = Vector3(0, 1, 0)
	mat.spread = 180.0
	mat.gravity = Vector3(0, -2, 0)
	mat.initial_velocity_min = 3.0
	mat.initial_velocity_max = 8.0
	mat.scale_min = 0.05
	mat.scale_max = 0.15
	particles.process_material = mat

	# 简易方块网格作为粒子
	var mesh := QuadMesh.new()
	mesh.size = Vector2(0.1, 0.1)
	var draw_pass := particles.draw_pass_1
	draw_pass.mesh = mesh
	draw_pass.material_override = StandardMaterial3D.new()
	if is_headshot:
		draw_pass.material_override.albedo_color = Color.GOLD
		draw_pass.material_override.emission = Color.GOLD
		draw_pass.material_override.emission_energy = 2.0
	else:
		draw_pass.material_override.albedo_color = Color.WHITE

	particles.emitting = true

	# 延迟清理
	await get_tree().create_timer(1.0).timeout
	particles.queue_free()
```

- [ ] **Step 4: 添加死亡碎裂特效**

在 `enemy_base.gd` 的 `_die` 方法中添加：

```gdscript
func _die(was_headshot: bool) -> void:
	EventBus.enemy_killed.emit(was_headshot, global_position)
	_spawn_death_particles(global_position, was_headshot)
	enemy_died.emit(was_headshot, global_position)
	queue_free()


func _spawn_death_particles(at_position: Vector3, was_headshot: bool) -> void:
	var particles := GPUParticles3D.new()
	get_tree().root.add_child(particles)
	particles.global_position = at_position
	particles.one_shot = true
	particles.explosiveness = 1.0
	particles.amount = 30 if was_headshot else 15
	particles.lifetime = 0.8

	var mat := ParticleProcessMaterial.new()
	mat.direction = Vector3(0, 1, 0)
	mat.spread = 180.0
	mat.gravity = Vector3(0, -1, 0)
	mat.initial_velocity_min = 2.0
	mat.initial_velocity_max = 6.0
	mat.scale_min = 0.05
	mat.scale_max = 0.2
	particles.process_material = mat

	# 使用 BoxMesh 作为粒子形状（更符合几何风格）
	var mesh := BoxMesh.new()
	mesh.size = Vector3(0.08, 0.08, 0.08)
	var draw_pass := particles.draw_pass_1
	draw_pass.mesh = mesh
	draw_pass.material_override = StandardMaterial3D.new()
	draw_pass.material_override.albedo_color = Color.RED if not was_headshot else Color.GOLD
	draw_pass.material_override.emission = Color.RED if not was_headshot else Color.GOLD
	draw_pass.material_override.emission_energy = 2.0

	particles.emitting = true

	await get_tree().create_timer(1.5).timeout
	particles.queue_free()
```

- [ ] **Step 5: 测试**

1. 运行 `level_1.tscn`
2. 射击敌人：
   - 命中身体 → 白色数字飘起 + 白色小粒子
   - 命中头部 → 金色🎯数字飘起 + 金色粒子 + 屏幕准星扩散
   - 击杀 → 方块碎片扩散粒子（红色/金色）
3. 检查伤害数字是否始终朝向玩家（Label3D Billboard）

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: 伤害数字 + 命中/死亡粒子特效"
```

---

### Task 11: 爆头击杀 — 极短时停 + 弹道残留 + 屏幕脉冲

**Files:**
- Modify: `void-trial/scripts/enemies/enemy_base.gd`（爆头击杀触发时停）
- Modify: `void-trial/scripts/ui/hud.gd`（屏幕金色脉冲）
- Modify: `void-trial/scripts/projectiles/magic_bolt.gd`（爆头弹道残留）

**Interfaces:**
- Consumes: `enemy_base._die(was_headshot=true)` → 触发时停
- Produces: 完整爆头击杀爽感（时停 0.05s + 屏幕金脉冲 + 弹道残留）

**依赖:** Task 10

- [ ] **Step 1: 实现极短时停**

在 `enemy_base.gd` 中修改 `_die`：

```gdscript
func _die(was_headshot: bool) -> void:
	if was_headshot:
		# 极短时停
		Engine.time_scale = 0.05
		await get_tree().create_timer(0.05 * 0.05, true, false, true).timeout
		Engine.time_scale = 1.0

	EventBus.enemy_killed.emit(was_headshot, global_position)
	_spawn_death_particles(global_position, was_headshot)
	enemy_died.emit(was_headshot, global_position)
	queue_free()
```

> 注意：`create_timer` 使用 `process_always = false` 和 `ignore_time_scale = true` 确保即使时停也能触发回调。

- [ ] **Step 2: 屏幕金色脉冲**

在 `hud.gd` 中，监听 `enemy_died` 信号：

```gdscript
func _ready() -> void:
	# ... 原有连接 ...
	# 连接 EventBus 爆头击杀
	EventBus.enemy_killed.connect(_on_enemy_killed_global)


func _on_enemy_killed_global(was_headshot: bool, _position: Vector3) -> void:
	if was_headshot:
		_screen_gold_pulse()


func _screen_gold_pulse() -> void:
	var tween := create_tween()
	screen_flash.color = Color.GOLD
	screen_flash.modulate.a = 0.15
	tween.tween_property(screen_flash, "modulate:a", 0.0, 0.3)
```

- [ ] **Step 3: 弹道残留**

修改 `magic_bolt.gd`，在 `_die` 前检查是否是爆头击杀：

在 `magic_bolt.gd` 的 `_on_area_entered` 中，获取敌人信息后决定弹道留存：

```gdscript
func _on_area_entered(area: Area3D) -> void:
	var hit_part := "body"
	if area.is_in_group("head"):
		hit_part = "head"
	elif area.is_in_group("arm") or area.is_in_group("leg"):
		hit_part = "limb"

	hit_enemy.emit(area.global_position, hit_part)

	var parent := area.get_parent()
	if parent and parent.has_method("take_damage_from_bullet"):
		parent.take_damage_from_bullet(hit_part, global_position)

	# 爆头：弹道残留
	if hit_part == "head":
		_show_golden_trail()

	_die()


func _show_golden_trail() -> void:
	# 创建金色弹道线
	var trail_mesh := MeshInstance3D.new()
	trail_mesh.mesh = CylinderMesh.new()
	trail_mesh.mesh.top_radius = 0.03
	trail_mesh.mesh.bottom_radius = 0.03
	trail_mesh.mesh.height = global_position.distance_to(
		global_position - global_transform.basis.z * 5.0)  # 粗略长度

	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color.GOLD
	mat.emission = Color.GOLD
	mat.emission_energy = 5.0
	trail_mesh.material_override = mat

	get_tree().root.add_child(trail_mesh)
	trail_mesh.global_position = global_position

	# 0.5 秒后淡出
	var tween := create_tween()
	tween.tween_interval(0.5)
	tween.tween_property(mat, "emission_energy", 0.0, 0.3)
	tween.tween_callback(trail_mesh.queue_free)
```

- [ ] **Step 4: 测试**

1. 运行游戏
2. 找一个喷射者（头 20 伤害 = 秒杀）
3. 瞄准头部射击：
   - 命中瞬间画面冻结 0.05s
   - 短暂金环屏幕脉冲
   - 金色伤害数字 + 金色粒子
   - 弹道线短暂残留金色
4. 身体击杀：无时停，无脉冲，只是普通死亡动画

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: 爆头击杀爽感 — 0.05s时停 + 屏幕金脉冲 + 弹道残留"
```

---

### Task 12: 菜单 & 游戏流程

**Files:**
- Create: `void-trial/scenes/main_menu.tscn`
- Create: `void-trial/scenes/victory_screen.tscn`（作为独立场景或 PackedScene 加载到 level_1）
- Create: `void-trial/scenes/level_2.tscn`（占位）
- Create: `void-trial/scenes/level_3.tscn`（占位）
- Create: `void-trial/scripts/ui/main_menu.gd`
- Create: `void-trial/scripts/ui/victory_screen.gd`
- Create: `void-trial/scripts/ui/pause_menu.gd`
- Modify: `void-trial/scripts/player/player.gd`（Esc 暂停）
- Modify: `void-trial/project.godot`（设置主场景为 main_menu）

**Interfaces:**
- Consumes: `GameState` autoload（读取统计数据显示在胜利界面）
- Produces: 完整游戏流程：主菜单 → 关卡 1 → 胜利 → 关卡 2（占位）

**依赖:** Task 11

- [ ] **Step 1: 创建主菜单场景**

新建场景 → 根节点 `Control`，命名为 `MainMenu`，另存为 `scenes/main_menu.tscn`，挂载 `scripts/ui/main_menu.gd`。

```
MainMenu (Control) [main_menu.gd]
├── ColorRect — 全屏深色背景, color #0a0a12
├── VBoxContainer — 居中
│   ├── Label — "🪐 虚空试炼", font_size 64, 发光效果
│   ├── Label — "VOID TRIAL", font_size 24, color gray
│   ├── Control — 间距
│   ├── Button — "开始试炼"
│   ├── Button — "退出"
│   └── Label — "v0.1 — Godot 4", font_size 14
```

**main_menu.gd：**

```gdscript
extends Control

func _ready() -> void:
	Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)

	$VBoxContainer/ButtonStart.pressed.connect(_on_start)
	$VBoxContainer/ButtonQuit.pressed.connect(_on_quit)


func _on_start() -> void:
	GameState.reset_run()
	get_tree().change_scene_to_file("res://scenes/level_1.tscn")


func _on_quit() -> void:
	get_tree().quit()
```

- [ ] **Step 2: 设置主场景**

在 Godot 编辑器中：**项目 → 项目设置 → 通用 → 应用 → 运行 → 主场景** → 选择 `scenes/main_menu.tscn`。

- [ ] **Step 3: 创建暂停菜单**

在 `scenes/` 中不需要单独的暂停场景——直接在 player.gd 中处理 Esc 键并在 HUD 上叠加暂停面板。

修改 `player.gd` 的 `_input`：

```gdscript
func _input(event: InputEvent) -> void:
	# ... 原有鼠标视角代码 ...

	# 暂停
	if event.is_action_pressed("ui_cancel"):
		_toggle_pause()


func _toggle_pause() -> void:
	if is_dead:
		return

	var hud := get_tree().get_first_node_in_group("hud")
	if not hud or not hud.has_method("toggle_pause"):
		return

	hud.toggle_pause()
```

在 HUD 场景中添加暂停面板（作为 `Control` 节点，默认隐藏）：

```
PausePanel (Control) — 全屏半透明暗底
├── ColorRect — color #00000088, 全屏
└── VBoxContainer — 居中
    ├── Label — "暂停"
    ├── Button — "继续游戏"
    ├── Button — "重新开始"
    └── Button — "返回主菜单"
```

在 `hud.gd` 中添加：

```gdscript
@onready var pause_panel: Control = $PausePanel
var is_paused: bool = false


func toggle_pause() -> void:
	is_paused = not is_paused
	pause_panel.visible = is_paused
	get_tree().paused = is_paused
	if is_paused:
		Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
	else:
		Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)


func _ready() -> void:
	# ... 原有连接 ...
	pause_panel.hide()

	# 暂停按钮连接
	$PausePanel/VBoxContainer/ButtonResume.pressed.connect(toggle_pause)
	$PausePanel/VBoxContainer/ButtonRestart.pressed.connect(_restart_level)
	$PausePanel/VBoxContainer/ButtonMenu.pressed.connect(_back_to_menu)


func _restart_level() -> void:
	get_tree().paused = false
	GameState.reset_run()
	get_tree().reload_current_scene()


func _back_to_menu() -> void:
	get_tree().paused = false
	get_tree().change_scene_to_file("res://scenes/main_menu.tscn")
```

给 HUD 添加 group `hud`（在 HUD 节点 → Node → Groups → 添加 `hud`）。

- [ ] **Step 4: 创建胜利结算界面**

在 `level_1.tscn` 中直接添加胜利面板（或作为子场景）。最简单的做法：给 HUD 添加 VictoryPanel。

在 `HUD` 下添加：

```
VictoryPanel (Control) — 全屏, 默认隐藏
├── ColorRect — color #000000cc, 全屏
└── VBoxContainer — 居中
    ├── Label — "✦ 试炼通过 ✦", font_size 48
    ├── Label — "击杀数: {kills}"
    ├── Label — "爆头数: {headshots}"
    ├── Label — "受伤次数: {hits}"
    ├── Label — "爆头率: {rate}%"
    ├── Label — "通关时间: {time}"
    ├── Button — "下一关"（→ level_2.tscn 占位）
    └── Button — "返回主菜单"
```

在 `hud.gd` 中连接 WaveManager 的 `all_waves_cleared` 信号：

```gdscript
func _ready() -> void:
	# ...原有连接...
	var wave_mgr := get_tree().get_first_node_in_group("wave_manager")
	if wave_mgr:
		# ...原有信号...
		wave_mgr.all_waves_cleared.connect(_on_all_waves_cleared)


func _on_all_waves_cleared() -> void:
	$VictoryPanel.show()
	Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)

	# 更新统计数据
	var kills_label: Label = $VictoryPanel/VBoxContainer/LabelKills
	var headshots_label: Label = $VictoryPanel/VBoxContainer/LabelHeadshots
	var hits_label: Label = $VictoryPanel/VBoxContainer/LabelHits
	var rate_label: Label = $VictoryPanel/VBoxContainer/LabelRate
	var time_label: Label = $VictoryPanel/VBoxContainer/LabelTime

	kills_label.text = "击杀数: %d" % GameState.total_kills
	headshots_label.text = "爆头数: %d" % GameState.total_headshots
	hits_label.text = "受伤次数: %d" % GameState.hits_taken
	rate_label.text = "爆头率: %.0f%%" % GameState.get_headshot_rate()

	var elapsed := GameState.get_elapsed_time()
	var minutes := int(elapsed) / 60
	var seconds := int(elapsed) % 60
	time_label.text = "通关时间: %d:%02d" % [minutes, seconds]
```

- [ ] **Step 5: 创建占位关卡**

创建 `level_2.tscn` 和 `level_3.tscn`：

每个都是简单场景：
```
Level2/Level3 (Node3D)
├── WorldEnvironment — 同上设置
└── Control (CanvasLayer)
    └── Label — "敬请期待" / "Coming Soon", 居中大号
```

在 VictoryPanel 的"下一关"按钮中：

```gdscript
func _on_next_level() -> void:
	get_tree().paused = false
	match GameState.current_level:
		1:
			get_tree().change_scene_to_file("res://scenes/level_2.tscn")
		2:
			get_tree().change_scene_to_file("res://scenes/level_3.tscn")
		_:
			get_tree().change_scene_to_file("res://scenes/main_menu.tscn")
```

- [ ] **Step 6: 添加调试模式（F1 碰撞线框）**

在 `player.gd` 的 `_input` 中添加：

```gdscript
	# F1 切换碰撞体可视化
	if event.is_action_pressed("debug_toggle"):
		_toggle_debug_collisions()
```

在项目设置中添加 `debug_toggle` 输入动作（F1 键）。

```gdscript
var debug_collisions_visible: bool = false


func _toggle_debug_collisions() -> void:
	debug_collisions_visible = not debug_collisions_visible
	# 遍历场景中所有 CollisionShape3D
	for shape in get_tree().get_nodes_in_group("enemy"):
		for child in shape.get_children():
			if child is CollisionShape3D:
				child.debug_shape_color = Color.RED if not debug_collisions_visible else Color(
					child.debug_shape_color, 0.0)  # 切换可见性
```

更简单的做法：`get_tree().debug_collisions_hint = debug_collisions_visible`（Godot 4 内置调试）。

- [ ] **Step 7: 完整流程测试**

1. 运行项目 → 主菜单
2. 点「开始试炼」→ 进入 Level 1
3. 打完 3 波 → 胜利结算
4. 点「下一关」→ Level 2 "敬请期待"
5. 按 Esc 暂停 → 继续 / 重新开始 / 返回主菜单
6. 按 F1 切换碰撞线框

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: 菜单 + 暂停 + 胜利结算 + 关卡流程 + 调试模式"
```

---

## 实施顺序总结

```
Task 1  (项目搭建)
  ↓
Task 2  (平台场景)
  ↓
Task 3  (玩家移动)
  ↓
Task 4  (射击)
  ↓
Task 5  (闪避+血量)
  ↓
Task 6  (敌人基类+冲撞者)
  ↓
Task 7  (喷射者)
  ↓
Task 8  (波次管理器)
  ↓
Task 9  (HUD)
  ↓
Task 10 (命中反馈)
  ↓
Task 11 (爆头时停)
  ↓
Task 12 (菜单流程)
```

每个 Task 完成后应可以独立测试验证，然后提交。
