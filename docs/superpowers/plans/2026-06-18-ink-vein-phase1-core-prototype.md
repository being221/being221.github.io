# 墨脉 Ink Vein — 第一阶段实施计划：核心原型

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建可玩的近战幸存者核心循环——移动、挥砍、3种敌人、涨墨爆发、连击墨沸、墨花特效。验证"光砍怪就停不下来"。

**Architecture:** Godot 4 2D 项目，`Area2D` 碰撞检测，`Line2D` 墨痕拖尾，`GPUParticles2D` 粒子特效，`PointLight2D` 实时光照。玩家与敌人共用 `hurtbox`/`hitbox` Area2D 碰撞对。

**Tech Stack:** Godot 4.6, GDScript, `AudioStreamPlayer2D`, `GPUParticles2D`, `Line2D`, `PointLight2D`, `CanvasModulate`, `FastNoiseLite`

## 全局约束

- Godot 4.6，二维项目，渲染器选 `compatibility`（兼容性最好）
- 所有脚本用 GDScript，UTF-8 编码
- 配色：墨黑 `#0a0a0f` 背景，纸白 `#e8e0d4` 拖尾，苍青 `#3a7ca5` 涨墨
- 命名风格：文件名 `snake_case`，类名 `PascalCase`，变量 `snake_case`
- FRAMES_PER_HIT_STOP = 4（命中停帧帧数）
- INK_SURGE_SEGMENTS = 3（涨墨段数）
- COMBO_DECAY_TIME = 1.5（连击断连时间，秒）
- 分辨率：960×540（16:9，后续可扩展）

---

### Task 1: 项目创建与目录结构

**Files:**
- Create: `ink-vein/project.godot`
- Create: `ink-vein/.gitignore`
- Create: `ink-vein/scenes/`、`ink-vein/scripts/`、`ink-vein/assets/`、`ink-vein/resources/`
- Create: `ink-vein/assets/particles/`、`ink-vein/assets/audio/`、`ink-vein/assets/fonts/`

**Interfaces:**
- Produces: 项目根目录，Godot 编辑器可直接打开

- [ ] **Step 1: 在 Godot 项目管理器中创建新项目**

打开 Godot 4.x 项目管理器 → 新建项目 → 名称 `ink-vein`，路径 `d:\邓杰鹏个人主页\ink-vein`，渲染器选 `Compatibility`。

- [ ] **Step 2: 创建目录结构**

在项目根目录下创建：
```
scripts/player/
scripts/enemies/
scripts/systems/
scripts/effects/
scripts/audio/
scripts/ui/
scenes/
assets/particles/
assets/audio/
assets/fonts/
resources/
```

- [ ] **Step 3: 配置 project.godot 基础设置**

编辑 `project.godot`，确保包含：
```ini
[application]
config/name="墨脉 Ink Vein"
config/version="0.1.0"
run/main_scene="res://scenes/game.tscn"

[display]
window/size/viewport_width=960
window/size/viewport_height=540
window/size/window_width_override=960
window/size/window_height_override=540

[rendering]
renderer/rendering_method="gl_compatibility"
```

- [ ] **Step 4: 创建 .gitignore**

```gitignore
.godot/
*.translation
export/
export_presets.cfg
```

- [ ] **Step 5: 验证**

在 Godot 编辑器中打开项目 → 确认文件系统面板显示完整目录结构。运行空场景 → 显示 960×540 窗口。

---

### Task 2: 玩家场景 — 剪影角色 + WASD 移动

**Files:**
- Create: `scenes/player.tscn`
- Create: `scripts/player/player.gd`
- Create: `scripts/player/player_movement.gd`

**Interfaces:**
- Produces: `Player` (CharacterBody2D)，导出 `velocity: Vector2`，移动速度 `move_speed: float = 300.0`

- [ ] **Step 1: 创建玩家场景结构**

在 `scenes/player.tscn` 创建：
```
Player (CharacterBody2D)
├── CollisionShape2D (圆形碰撞体，radius=12)
├── Sprite2D (临时：64×64 墨色人形剪影)
│   └── 用内置矩形 + 墨黑 #0a0a0f 填充的占位图
├── PointLight2D (墨核光，color=#3a7ca5，energy=0.3，range=80)
├── Area2D (武器碰撞区)
│   ├── CollisionShape2D (扇形/CircleShape2D，radius=36)
│   └── 命名：HitboxArea
└── GPUParticles2D (墨痕拖尾粒子占位)
```

- [ ] **Step 2: 编写 player_movement.gd**

```gdscript
# scripts/player/player_movement.gd
class_name PlayerMovement
extends Node

@export var move_speed: float = 300.0

var velocity: Vector2 = Vector2.ZERO
var _body: CharacterBody2D


func setup(body: CharacterBody2D) -> void:
	_body = body


func process_move(delta: float) -> void:
	var input_dir: Vector2 = Input.get_vector("move_left", "move_right", "move_up", "move_down")
	velocity = input_dir * move_speed
	if _body:
		_body.velocity = velocity
		_body.move_and_slide()
```

- [ ] **Step 3: 编写 player.gd 主脚本**

```gdscript
# scripts/player/player.gd
extends CharacterBody2D
class_name Player

## 当前生命值
var health: int = 100
## 最大生命值
var max_health: int = 100
## 当前朝向（鼠标方向归一化向量）
var aim_direction: Vector2 = Vector2.RIGHT
## 是否存活
var is_alive: bool = true

@onready var movement: PlayerMovement = $PlayerMovement


func _ready() -> void:
	movement.setup(self)


func _physics_process(delta: float) -> void:
	if not is_alive:
		return
	movement.process_move(delta)
	_aim_toward_mouse()


func _aim_toward_mouse() -> void:
	aim_direction = (get_global_mouse_position() - global_position).normalized()
	if aim_direction.length() < 0.01:
		aim_direction = Vector2.RIGHT
	rotation = aim_direction.angle()


## 受到伤害
func take_damage(amount: int) -> void:
	if not is_alive:
		return
	health = maxi(0, health - amount)
	Events.player_damaged.emit(amount)
	if health <= 0:
		_die()


func _die() -> void:
	is_alive = false
	Events.player_died.emit()
```

- [ ] **Step 4: 配置 Input Map**

在项目设置 → Input Map 中添加：
- `move_left`: A / 左箭头
- `move_right`: D / 右箭头
- `move_up`: W / 上箭头
- `move_down`: S / 下箭头
- `attack`: 鼠标左键
- `ui_cancel`: Escape

- [ ] **Step 5: 验证**

运行场景 → 按 WASD 移动，角色跟随鼠标旋转方向。按 Escape 不报错。

---

### Task 3: 全局事件总线 & 工具函数

**Files:**
- Create: `scripts/systems/events.gd` (Autoload)
- Create: `scripts/systems/utils.gd` (Autoload)

**Interfaces:**
- Produces: `Events` autoload（全局信号），`Utils` autoload（工具静态函数）

- [ ] **Step 1: 创建 Events 全局单例**

```gdscript
# scripts/systems/events.gd
extends Node

## 玩家受到伤害 (amount: int)
signal player_damaged(amount: int)
## 玩家死亡
signal player_died()
## 敌人死亡 (enemy: Enemy, global_position: Vector2)
signal enemy_killed(enemy: Enemy, global_position: Vector2)
## 涨墨段位变化 (segments: int, max_segments: int)
signal ink_surge_changed(segments: int, max_segments: int)
## 涨墨爆发触发
signal ink_surge_triggered()
## 连击数变化 (combo: int)
signal combo_changed(combo: int)
## 墨沸状态变化 (is_boiling: bool)
signal ink_boil_changed(is_boiling: bool)
## 命中停帧请求 (frames: int)
signal hit_stop_requested(frames: int)
## 屏幕震动请求 (intensity: float)
signal screen_shake_requested(intensity: float)
## 升级（用于测试阶段）
signal level_up()
```

- [ ] **Step 2: 创建 Utils 工具单例**

```gdscript
# scripts/systems/utils.gd
extends Node

## 对 Vector2 随机偏移一个小角度（弧度）
static func randomize_angle(base: Vector2, spread_rad: float = 0.3) -> Vector2:
	return base.rotated(randf_range(-spread_rad, spread_rad))


## 限制值在 min/max 之间
static func clampf(value: float, min_val: float, max_val: float) -> float:
	return clamp(value, min_val, max_val)


## 简单缓动，0-1 三次方
static func ease_out_cubic(t: float) -> float:
	t = clampf(t, 0.0, 1.0)
	return 1.0 - pow(1.0 - t, 3.0)


## 颜色十六进制字符串转 Color
static func hex_color(hex: String) -> Color:
	return Color(hex)
```

- [ ] **Step 3: 注册 Autoload**

项目设置 → Autoload → 添加两个：
- 路径 `res://scripts/systems/events.gd`，名称 `Events`
- 路径 `res://scripts/systems/utils.gd`，名称 `Utils`

- [ ] **Step 4: 验证**

写一个临时的 test 脚本挂场景中，在 `_ready()` 里 `Events.enemy_killed.connect(func(e, p): print("killed at ", p))` → 运行确认 Autoload 生效。

---

### Task 4: 武器挥砍 — Line2D 墨痕拖尾 + 命中检测

**Files:**
- Create: `scripts/player/weapon.gd`
- Modify: `scripts/player/player.gd`（挂载武器组件）
- Create: `scripts/effects/ink_trail.gd`

**Interfaces:**
- Consumes: `Player.aim_direction: Vector2`
- Produces: `Weapon.attack()` 由 `Player._physics_process` 调用，攻击时自动产生 `Line2D` 墨痕 + 命中检测

- [ ] **Step 1: 创建 Weapon 节点**

在 `scenes/player.tscn` 中，Player 下添加：
```
Weapon (Node2D)
├── InkTrail (Line2D) — 用于绘制每次挥砍的墨痕
│   ├── width = 6 (起始宽度)
│   ├── default_color = Color("#e8e0d4") 纸白
│   ├── end_cap_mode = 2 (ROUND)
├── HitboxArea (Area2D) — 武器碰撞区（已有，确认挂在此节点下）
│   └── CollisionShape2D (CircleShape2D, radius=36)
├── AttackTimer (Timer) — 攻击冷却
│   ├── one_shot = true
│   └── wait_time = 0.25 (默认攻速)
└── AttackCooldown (float) — 基础冷却 0.25s
```

- [ ] **Step 2: 编写 ink_trail.gd — Line2D 墨痕拖尾**

```gdscript
# scripts/effects/ink_trail.gd
extends Line2D
class_name InkTrail

## 拖尾存活时间（秒）
@export var lifetime: float = 0.3
## 起始宽度
@export var start_width: float = 6.0
## 最大点数
@export var max_points: int = 30

var _elapsed: float = 0.0
var _is_active: bool = false
var _base_alpha: float = 1.0


func _ready() -> void:
	clear_points()
	visible = false
	top_level = true  # 不跟随父节点移动


func start_trail(origin: Vector2) -> void:
	global_position = Vector2.ZERO
	clear_points()
	add_point(origin)
	_elapsed = 0.0
	_is_active = true
	visible = true
	width = start_width


func update_trail(new_point: Vector2) -> void:
	if not _is_active:
		return
	add_point(new_point)
	# 限制点数
	while get_point_count() > max_points:
		remove_point(0)
	# 渐变宽度：越后面越细（出锋）
	var point_count = get_point_count()
	for i in range(point_count):
		var t = float(i) / float(max(1, point_count - 1))
		# 前面宽后面窄，模拟收笔出锋
		width = lerp(start_width, start_width * 0.2, t)
		# Alpha 递减
		default_color.a = lerp(_base_alpha, 0.0, t)


func end_trail() -> void:
	_is_active = false


func _process(delta: float) -> void:
	if not _is_active:
		return
	_elapsed += delta
	# 随时间淡出
	if _elapsed >= lifetime:
		visible = false
		clear_points()
		return
	# 整体逐渐透明
	var fade = 1.0 - (_elapsed / lifetime)
	default_color.a = clamp(fade, 0.0, _base_alpha)
```

- [ ] **Step 3: 编写 weapon.gd — 武器挥砍逻辑**

```gdscript
# scripts/player/weapon.gd
extends Node2D
class_name Weapon

## 基础攻击冷却（秒）
@export var base_cooldown: float = 0.25
## 武器范围（碰撞区半径）
@export var weapon_range: float = 36.0
## 基础伤害
@export var base_damage: int = 10

## 当前连击数（外部读写）
var combo_count: int = 0
## 上次命中时间（用于断连检测）
var _last_hit_time: float = 0.0
## 是否在冷却中
var _can_attack: bool = true

@onready var hitbox_area: Area2D = $HitboxArea
@onready var attack_timer: Timer = $AttackTimer
@onready var ink_trail: InkTrail = $InkTrail
@onready var collision_shape: CollisionShape2D = $HitboxArea/CollisionShape2D

var _hit_targets_this_swing: Array[Node] = []


func _ready() -> void:
	# 初始关闭碰撞区
	collision_shape.disabled = true
	hitbox_area.body_entered.connect(_on_hitbox_body_entered)
	attack_timer.timeout.connect(_on_attack_cooldown_end)


func attack(aim_direction: Vector2) -> void:
	if not _can_attack:
		return

	_can_attack = false
	_hit_targets_this_swing.clear()
	attack_timer.start(base_cooldown)

	# 墨痕拖尾
	var start_point = owner.global_position
	ink_trail.start_trail(start_point)

	# 短暂开启碰撞区做命中检测
	collision_shape.disabled = false

	# 挥砍方向
	var sweep_origin = start_point
	var sweep_end = start_point + aim_direction * weapon_range

	# 用 Tween 快速扫过武器弧线
	var tween = create_tween()
	tween.set_ease(Tween.EASE_OUT)
	tween.set_trans(Tween.TRANS_CUBIC)
	var swing_duration = base_cooldown * 0.5  # 挥砍总时长
	var steps = 8

	for i in range(1, steps + 1):
		# 只更新一次拖尾，简化版
		pass

	# 同步更新拖尾终点
	ink_trail.update_trail(sweep_end)
	# 延迟关闭碰撞区和拖尾
	await get_tree().create_timer(swing_duration).timeout
	collision_shape.disabled = true
	ink_trail.end_trail()


func _on_hitbox_body_entered(body: Node2D) -> void:
	if body in _hit_targets_this_swing:
		return
	if not body.has_method("take_damage"):
		return
	_hit_targets_this_swing.append(body)

	# 造成伤害
	var damage = base_damage
	body.take_damage(damage)

	# 命中反馈
	Events.hit_stop_requested.emit(4)
	Events.screen_shake_requested.emit(0.3)

	# 更新连击
	combo_count += 1
	_last_hit_time = Time.get_ticks_msec() / 1000.0
	Events.combo_changed.emit(combo_count)


func _on_attack_cooldown_end() -> void:
	_can_attack = true


func _process(delta: float) -> void:
	# 断连检测
	if combo_count > 0:
		var now = Time.get_ticks_msec() / 1000.0
		if now - _last_hit_time > 1.5:  # COMBO_DECAY_TIME
			combo_count = 0
			Events.combo_changed.emit(0)
```

- [ ] **Step 4: 修改 player.gd 挂载武器**

在 `player.gd` 的 `_ready()` 添加：
```gdscript
@onready var weapon: Weapon = $Weapon
```
在 `_physics_process` 的 `_aim_toward_mouse()` 之后添加攻击输入：
```gdscript
	if Input.is_action_pressed("attack"):
		weapon.attack(aim_direction)
```

- [ ] **Step 5: 验证**

运行 → 按住鼠标左键挥砍。观察 Line2D 墨痕拖尾出现和消失。靠近敌人命中时触发信号（暂时无敌人，只能看控制台输出）。

---

### Task 5: 敌人基类 & 墨浮（Ink Float）

**Files:**
- Create: `scripts/enemies/enemy_base.gd`
- Create: `scripts/enemies/ink_float.gd`
- Create: `scenes/enemies/ink_float.tscn`
- Create: `scripts/systems/enemy_spawner.gd`

**Interfaces:**
- Consumes: `Events.enemy_killed` 信号，`Enemy.take_damage(amount: int)` 被 Weapon 调用
- Produces: `Enemy` 基类（CharacterBody2D + Area2D hurtbox），`InkFloat` 子类

- [ ] **Step 1: 编写 enemy_base.gd**

```gdscript
# scripts/enemies/enemy_base.gd
extends CharacterBody2D
class_name Enemy

## 敌人 ID（用于图鉴）
@export var enemy_id: String = ""
## 生命值
@export var max_health: int = 20
## 移动速度
@export var move_speed: float = 80.0
## 击杀提供的涨墨值
@export var ink_charge_on_kill: float = 10.0
## 接触伤害
@export var contact_damage: int = 5

var health: int
var _player_ref: Player = null

@onready var hurtbox_area: Area2D = $HurtboxArea


func _ready() -> void:
	health = max_health
	hurtbox_area.body_entered.connect(_on_hurtbox_body_entered)
	_player_ref = get_tree().get_first_node_in_group("player")


func _physics_process(delta: float) -> void:
	if not _player_ref or not _player_ref.is_alive:
		return
	_move_toward_player(delta)


func _move_toward_player(delta: float) -> void:
	var direction = (_player_ref.global_position - global_position).normalized()
	velocity = direction * move_speed
	move_and_slide()


func take_damage(amount: int) -> void:
	health -= amount
	# 受击后仰
	var tween = create_tween()
	tween.tween_property(self, "modulate", Color.RED, 0.05)
	tween.tween_property(self, "modulate", Color.WHITE, 0.1)
	if health <= 0:
		_die()


func _die() -> void:
	Events.enemy_killed.emit(self, global_position)
	queue_free()


func _on_hurtbox_body_entered(body: Node2D) -> void:
	if body is Player:
		body.take_damage(contact_damage)
```

- [ ] **Step 2: 编写 ink_float.gd（墨浮）**

```gdscript
# scripts/enemies/ink_float.gd
extends Enemy
class_name InkFloat

## 死亡后分裂数量
@export var split_count: int = 2
## 子代缩放
@export var child_scale: float = 0.6


func _ready() -> void:
	super._ready()
	if enemy_id.is_empty():
		enemy_id = "ink_float"
	# 墨浮有漂浮感——轻微上下摆动
	var tween = create_tween()
	tween.set_loops()
	tween.tween_property(self, "position:y", position.y - 4.0, 1.0).set_ease(Tween.EASE_IN_OUT)
	tween.tween_property(self, "position:y", position.y + 4.0, 1.0).set_ease(Tween.EASE_IN_OUT)


func _die() -> void:
	Events.enemy_killed.emit(self, global_position)
	# 分裂：生成更小的墨浮
	if scale.x > 0.3:  # 防止无限分裂
		for i in range(split_count):
			var child = duplicate() as InkFloat
			child.scale = scale * child_scale
			child.max_health = maxi(1, max_health / 2)
			child.health = child.max_health
			child.split_count = 2
			child.global_position = global_position + Vector2(
				randf_range(-10, 10), randf_range(-10, 10)
			)
			get_parent().add_child(child)
	queue_free()
```

- [ ] **Step 3: 创建 ink_float.tscn**

```
InkFloat (CharacterBody2D, script=ink_float.gd)
├── CollisionShape2D (CircleShape2D, radius=8)
├── Sprite2D (临时：32×32 墨色圆团 + 两颗苍青小光点)
├── PointLight2D (color=#3a7ca5, energy=0.1, range=30)
├── HurtboxArea (Area2D)
│   └── CollisionShape2D (CircleShape2D, radius=12)
└── GPUParticles2D (预留死亡粒子)
```

- [ ] **Step 4: 编写 enemy_spawner.gd（简单版）**

```gdscript
# scripts/systems/enemy_spawner.gd
extends Node2D
class_name EnemySpawner

@export var spawn_area: Rect2 = Rect2(-400, -300, 800, 600)
@export var max_enemies: int = 30
@export var spawn_interval: float = 2.0
@export var ink_float_scene: PackedScene

var _spawn_timer: float = 0.0
var _enemy_container: Node2D


func _ready() -> void:
	_enemy_container = Node2D.new()
	_enemy_container.name = "Enemies"
	add_child(_enemy_container)


func _process(delta: float) -> void:
	_spawn_timer += delta
	if _spawn_timer >= spawn_interval:
		_spawn_timer = 0.0
		if _enemy_container.get_child_count() < max_enemies:
			_spawn_one()


func _spawn_one() -> void:
	var enemy = ink_float_scene.instantiate()
	enemy.global_position = _random_spawn_position()
	_enemy_container.add_child(enemy)


func _random_spawn_position() -> Vector2:
	# 在玩家视野外生成
	var player = get_tree().get_first_node_in_group("player")
	var center = player.global_position if player else Vector2.ZERO
	var side = randi() % 4
	var pos = center
	match side:
		0: pos += Vector2(spawn_area.size.x * randf(), -20)  # 上
		1: pos += Vector2(spawn_area.size.x * randf(), spawn_area.size.y + 20)  # 下
		2: pos += Vector2(-20, spawn_area.size.y * randf())  # 左
		3: pos += Vector2(spawn_area.size.x + 20, spawn_area.size.y * randf())  # 右
	return pos
```

- [ ] **Step 5: 创建测试场景**

在 `scenes/game.tscn` 创建：
```
Game (Node2D)
├── Player (实例化 player.tscn)，设 group="player"
├── EnemySpawner (Node2D, script=enemy_spawner.gd)
├── Camera2D (跟随玩家)
└── CanvasModulate (color=#0a0a0f 压暗全屏)
```

- [ ] **Step 6: 验证**

运行 → 玩家可移动挥砍 → 墨浮生成 → 挥砍命中墨浮 → 墨浮受击变色 → 墨浮死亡分裂成更小的 → 观察连击数（暂时只能看控制台信号）。

---

### Task 6: 命中停帧 & 屏幕震动

**Files:**
- Create: `scripts/effects/hit_stop.gd` (Autoload)
- Create: `scripts/effects/screen_shake.gd`

**Interfaces:**
- Consumes: `Events.hit_stop_requested(frames)`、`Events.screen_shake_requested(intensity)`
- Produces: 全局停帧 + 震动效果

- [ ] **Step 1: 编写 HitStop autoload**

```gdscript
# scripts/effects/hit_stop.gd
extends Node
## 命中停帧管理器 — 注册为 Autoload

var _timer: float = 0.0
var _is_frozen: bool = false
const TIME_SCALE_NORMAL: float = 1.0


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	Events.hit_stop_requested.connect(_on_hit_stop_requested)


func _on_hit_stop_requested(frames: int) -> void:
	# 4 帧在 60fps ≈ 0.067s
	var duration = frames / 60.0
	Engine.time_scale = 0.0
	_is_frozen = true
	_timer = duration
	# 恢复定时器
	await get_tree().create_timer(duration, true, false, true).timeout
	Engine.time_scale = TIME_SCALE_NORMAL
	_is_frozen = false
```

注册为 Autoload：路径 `res://scripts/effects/hit_stop.gd`，名称 `HitStop`

- [ ] **Step 2: 编写 ScreenShake 组件**

```gdscript
# scripts/effects/screen_shake.gd
extends Node
class_name ScreenShake

@export var camera: Camera2D
@export var decay: float = 0.8
@export var max_offset: Vector2 = Vector2(6, 4)

var _trauma: float = 0.0
var _trauma_power: int = 2
var _noise: FastNoiseLite
var _noise_y: float = 0.0


func _ready() -> void:
	_noise = FastNoiseLite.new()
	_noise.seed = randi()
	_noise.frequency = 0.5
	Events.screen_shake_requested.connect(_add_trauma)


func _add_trauma(intensity: float) -> void:
	_trauma = clamp(_trauma + intensity, 0.0, 1.0)


func _process(delta: float) -> void:
	if _trauma <= 0.0:
		return
	# 衰减
	_trauma = max(0.0, _trauma - decay * delta)
	# 震动量
	var amount = pow(_trauma, _trauma_power)
	_noise_y += delta * 20.0
	camera.offset.x = _noise.get_noise_2d(_noise_y, 0.0) * max_offset.x * amount
	camera.offset.y = _noise.get_noise_2d(0.0, _noise_y) * max_offset.y * amount
```

- [ ] **Step 3: 挂载到 game.tscn**

在 Camera2D 节点上添加 `ScreenShake` 子节点，设 `camera` 为父节点引用。

- [ ] **Step 4: 验证**

运行 → 挥砍命中敌人 → 观察画面短暂冻结（停帧）+ 镜头抖动。调整 `max_offset` 和停帧帧数直到手感满意。

---

### Task 7: 涨墨系统 (Ink Surge)

**Files:**
- Create: `scripts/player/ink_surge.gd`

**Interfaces:**
- Consumes: `Events.enemy_killed`（获取涨墨值）、`_on_attack` 或按键触发手动爆发
- Produces: `InkSurge` 类，导出 `ink_charge: float`、`segments: int`、`trigger_surge()`

- [ ] **Step 1: 编写 ink_surge.gd**

```gdscript
# scripts/player/ink_surge.gd
extends Node
class_name InkSurge

## 每段需要的墨能
@export var charge_per_segment: float = 100.0
## 最大段数
@export var max_segments: int = 3
## 爆发范围
@export var surge_radius: float = 300.0
## 爆发伤害
@export var surge_damage: int = 50
## 自动爆发等待时间（秒），0=手动
@export var auto_surge_delay: float = 3.0

var ink_charge: float = 0.0
var segments: int = 0
var _auto_timer: float = 0.0
var _can_gain_charge: bool = true

# 预兆状态
signal premonition_changed(level: int)  # 0=none, 1=1/3, 2=2/3, 3=3/3

@onready var player: Player = owner


func _ready() -> void:
	Events.enemy_killed.connect(_on_enemy_killed)


func _on_enemy_killed(enemy: Enemy, _pos: Vector2) -> void:
	if not _can_gain_charge:
		return
	_add_charge(enemy.ink_charge_on_kill)


func _add_charge(amount: float) -> void:
	ink_charge += amount
	if ink_charge >= charge_per_segment and segments < max_segments:
		ink_charge -= charge_per_segment
		segments += 1
		Events.ink_surge_changed.emit(segments, max_segments)
		premonition_changed.emit(segments)

		if segments >= max_segments:
			_full_charged()


func _full_charged() -> void:
	_auto_timer = 0.0
	premonition_changed.emit(3)
	if auto_surge_delay <= 0:
		# 纯手动模式
		return


func _process(delta: float) -> void:
	if segments >= max_segments and auto_surge_delay > 0:
		_auto_timer += delta
		if _auto_timer >= auto_surge_delay:
			trigger_surge()


func trigger_surge() -> void:
	if segments <= 0:
		return

	var surge_segments = segments
	segments = 0
	ink_charge = 0.0
	_auto_timer = 0.0
	premonition_changed.emit(0)
	Events.ink_surge_changed.emit(0, max_segments)

	# 全屏清场
	Events.ink_surge_triggered.emit()
	Events.hit_stop_requested.emit(8)  # 更长的停帧
	Events.screen_shake_requested.emit(0.8)

	# 查找范围内所有敌人
	var space = player.get_world_2d().direct_space_state
	var query = PhysicsShapeQueryParameters2D.new()
	var circle = CircleShape2D.new()
	circle.radius = surge_radius * surge_segments  # 范围随段数增大
	query.shape = circle
	query.transform = Transform2D(0, player.global_position)
	var results = space.intersect_shape(query)

	for result in results:
		var body = result.get("collider")
		if body and body.has_method("take_damage") and body is Enemy:
			body.take_damage(surge_damage * surge_segments)

	# 虚弱期：3秒无法积墨
	_can_gain_charge = false
	await get_tree().create_timer(3.0).timeout
	_can_gain_charge = true
```

- [ ] **Step 2: 挂载到 player.tscn**

在 Player 下添加 `InkSurge` 子节点，挂 `ink_surge.gd`。

- [ ] **Step 3: 添加手动爆发输入**

在 `player.gd` 中添加：
```gdscript
@onready var ink_surge: InkSurge = $InkSurge
```
在 `_input` 中：
```gdscript
func _input(event: InputEvent) -> void:
	if event.is_action_pressed("surge") and is_alive:
		ink_surge.trigger_surge()
```

在 Input Map 添加 `surge` 绑定空格键。

- [ ] **Step 4: 验证**

运行 → 击杀敌人 → 观察涨墨段数变化（控制台信号）→ 3段满后自动爆发清场 → 所有敌人被击杀 → 停帧+震动增强。

---

### Task 8: 墨花（Ink Bloom）— 击杀特效

**Files:**
- Create: `scripts/effects/ink_bloom.gd`
- Create: `assets/particles/ink_bloom_petal.png`（临时占位图）

**Interfaces:**
- Consumes: `Events.enemy_killed(enemy, global_position)`
- Produces: `InkBloom.spawn_bloom(position, bloom_type)` 实例化墨花特效

- [ ] **Step 1: 编写 ink_bloom.gd**

```gdscript
# scripts/effects/ink_bloom.gd
extends Node2D
class_name InkBloom

enum BloomType { NORMAL, CRITICAL, HEAVY, BOIL, SURGE }

## 花瓣数量映射
const PETAL_COUNTS := {
	BloomType.NORMAL: 6,
	BloomType.CRITICAL: 10,
	BloomType.HEAVY: 14,
	BloomType.BOIL: 10,
	BloomType.SURGE: 8,
}

const PETAL_COLORS := {
	BloomType.NORMAL: Color("#e8e0d4"),
	BloomType.CRITICAL: Color("#e8e0d4"),
	BloomType.HEAVY: Color("#e8e0d4"),
	BloomType.BOIL: Color("#3a7ca5"),
	BloomType.SURGE: Color("#e8e0d4"),
}

## 花瓣存活时间
@export var lifetime: float = 0.5
## 花瓣伸展半径
@export var bloom_radius: float = 60.0

var _elapsed: float = 0.0
var _petal_points: Array[PackedVector2Array] = []
var _bloom_type: BloomType


func _init(p_type: BloomType = BloomType.NORMAL) -> void:
	_bloom_type = p_type


func _ready() -> void:
	top_level = true
	_generate_petals()


func _generate_petals() -> void:
	var count = PETAL_COUNTS.get(_bloom_type, 6)
	for i in range(count):
		var angle = float(i) / float(count) * TAU + randf_range(-0.1, 0.1)
		var petal = _generate_petal(angle)
		_petal_points.append(petal)


func _generate_petal(angle: float) -> PackedVector2Array:
	# 每条花瓣是从中心向外的弯曲墨线
	var points := PackedVector2Array()
	points.append(Vector2.ZERO)
	var length = bloom_radius * randf_range(0.6, 1.0)
	var steps = 6
	for i in range(1, steps + 1):
		var t = float(i) / float(steps)
		var r = length * t
		# 轻微弯曲（书法笔势）
		var curve_offset = sin(t * PI) * randf_range(-8, 8)
		var dir = Vector2.RIGHT.rotated(angle)
		var perp = dir.orthogonal() * curve_offset
		points.append(dir * r + perp)
	return points


func _process(delta: float) -> void:
	_elapsed += delta
	var t = _elapsed / lifetime
	if t >= 1.0:
		queue_free()
		return
	queue_redraw()


func _draw() -> void:
	var t = _elapsed / lifetime
	var color = PETAL_COLORS.get(_bloom_type, Color.WHITE)
	# 花瓣伸展→碎裂
	for petal in _petal_points:
		if petal.size() < 2:
			continue
		# 缩放花瓣伸展程度
		var draw_points := PackedVector2Array()
		for i in range(petal.size()):
			var p = petal[i]
			# 前0.25秒伸展，之后碎裂
			if t < 0.5:
				p *= Utils.ease_out_cubic(t * 2.0)
			draw_points.append(p)

		# 线条宽度：根部粗尖部细（飞白）
		var line_color = color
		line_color.a = clamp(1.0 - t, 0.0, 1.0)
		for i in range(draw_points.size() - 1):
			var progress = float(i) / float(max(1, draw_points.size() - 2))
			var line_width = lerp(4.0, 0.5, progress)
			draw_line(draw_points[i], draw_points[i + 1], line_color, line_width, true)


## 静态工厂方法
static func spawn_bloom(parent: Node, position: Vector2, bloom_type: BloomType = BloomType.NORMAL) -> void:
	var bloom = load("res://scripts/effects/ink_bloom.gd").new(bloom_type)
	bloom.global_position = position
	parent.add_child(bloom)
```

- [ ] **Step 2: 集成到敌人生成**

在 `enemy_spawner.gd` 中添加对 `Events.enemy_killed` 的监听：
```gdscript
func _ready() -> void:
	# ... 原有代码
	Events.enemy_killed.connect(_spawn_bloom)

func _spawn_bloom(enemy: Enemy, pos: Vector2) -> void:
	InkBloom.spawn_bloom(_enemy_container, pos, InkBloom.BloomType.NORMAL)
```

- [ ] **Step 3: 验证**

运行 → 击杀敌人 → 观察墨菊从死亡位置绽开→碎裂→消失。调整花瓣数量/颜色/时长直到视觉满意。

---

### Task 9: 连击 & 墨沸系统

**Files:**
- Create: `scripts/player/combo_system.gd`

**Interfaces:**
- Consumes: `Events.combo_changed(combo)`、`Weapon.combo_count`
- Produces: `ComboSystem` — 管理墨沸状态，驱动屏幕边缘波纹

- [ ] **Step 1: 编写 combo_system.gd**

```gdscript
# scripts/player/combo_system.gd
extends Node
class_name ComboSystem

## 燃墨阈值
@export var ignite_threshold: int = 10
## 墨沸阈值
@export var boil_threshold: int = 30
## 断连时间（秒）
@export var decay_time: float = 1.5

enum ComboState { NORMAL, IGNITED, BOILING }

var combo: int = 0
var state: ComboState = ComboState.NORMAL
var _last_hit_time: float = 0.0


func _ready() -> void:
	Events.combo_changed.connect(_on_combo_changed)


func _process(delta: float) -> void:
	if combo == 0:
		return
	var now = Time.get_ticks_msec() / 1000.0
	if now - _last_hit_time > decay_time:
		_reset_combo()


func _on_combo_changed(new_combo: int) -> void:
	combo = new_combo
	_last_hit_time = Time.get_ticks_msec() / 1000.0

	var new_state = state
	if combo >= boil_threshold:
		new_state = ComboState.BOILING
	elif combo >= ignite_threshold:
		new_state = ComboState.IGNITED
	else:
		new_state = ComboState.NORMAL

	if new_state != state:
		state = new_state
		match state:
			ComboState.IGNITED:
				Events.ink_boil_changed.emit(false)  # ignited
			ComboState.BOILING:
				Events.ink_boil_changed.emit(true)   # boiling


func _reset_combo() -> void:
	combo = 0
	state = ComboState.NORMAL
	Events.combo_changed.emit(0)
	Events.ink_boil_changed.emit(false)


## 获取当前伤害倍率（墨沸状态加成）
func get_damage_multiplier() -> float:
	match state:
		ComboState.IGNITED: return 1.15
		ComboState.BOILING: return 1.3
		_: return 1.0
```

- [ ] **Step 2: 挂载到 player.tscn**

在 Player 下添加 `ComboSystem` 子节点。

- [ ] **Step 3: 在 weapon.gd 中集成伤害倍率**

修改 `weapon.gd`，在计算伤害时：
```gdscript
var multiplier: float = 1.0
func _ready() -> void:
	# 查找 ComboSystem
	_combo_system = owner.get_node("ComboSystem") as ComboSystem

func _on_hitbox_body_entered(body: Node2D) -> void:
	# ...原有内容...
	var damage = int(base_damage * _combo_system.get_damage_multiplier())
```

- [ ] **Step 4: 验证**

运行 → 保持连击 10 次 → 观察 "燃墨" 信号 → 连击 30 次 → "墨沸" 信号 → 断连 1.5 秒 → 连击重置到 0。

---

### Task 10: HUD — 涨墨条 + 血量 + 连击显示

**Files:**
- Create: `scripts/ui/hud.gd`
- Create: `scenes/hud.tscn`

**Interfaces:**
- Consumes: `Events.ink_surge_changed`、`Events.combo_changed`、`Events.player_damaged`
- Produces: HUD CanvasLayer

- [ ] **Step 1: 创建 HUD 场景结构**

`scenes/hud.tscn`：
```
HUD (CanvasLayer)
├── MarginContainer (全屏边距 20px)
│   └── VBoxContainer
│       ├── TopRow (HBoxContainer)
│       │   ├── ComboLabel (Label, 左上角, font_size=24, color=#b8935a)
│       │   └── Spacer + TimerLabel (Label, 右上角, font_size=18)
│       └── BottomRow (HBoxContainer)
│           ├── VBoxContainer (左下)
│           │   ├── HealthBar (ProgressBar, 可自定义)
│           │   └── InkSurgeBar (HBoxContainer 三小段)
│           └── 右下图标区（武器形态/共鸣状态——后续Task补充）
```

- [ ] **Step 2: 编写 hud.gd**

```gdscript
# scripts/ui/hud.gd
extends CanvasLayer
class_name HUD

@onready var combo_label: Label = $MarginContainer/VBoxContainer/TopRow/ComboLabel
@onready var timer_label: Label = $MarginContainer/VBoxContainer/TopRow/Spacer/TimerLabel
@onready var health_bar: ProgressBar = $MarginContainer/VBoxContainer/BottomRow/VBoxContainer/HealthBar
@onready var ink_segments: Array = []
@onready var ink_container: HBoxContainer = $MarginContainer/VBoxContainer/BottomRow/VBoxContainer/InkSurgeBar

const MAX_COMBO_FONT: int = 48
const BOIL_COMBO_FONT: int = 64
const BASE_COMBO_FONT: int = 24


func _ready() -> void:
	Events.combo_changed.connect(_on_combo_changed)
	Events.ink_surge_changed.connect(_on_surge_changed)
	Events.player_damaged.connect(_on_player_damaged)
	Events.ink_boil_changed.connect(_on_boil_changed)
	_init_ink_segments()


func _init_ink_segments() -> void:
	for i in range(3):
		var seg = ColorRect.new()
		seg.size = Vector2(40, 8)
		seg.color = Color("#3a7ca5")
		seg.color.a = 0.3
		ink_container.add_child(seg)
		ink_segments.append(seg)


func _on_combo_changed(combo: int) -> void:
	if combo == 0:
		combo_label.visible = false
		return
	combo_label.visible = true
	combo_label.text = str(combo)
	var font_size = BASE_COMBO_FONT
	if combo >= 30:
		font_size = BOIL_COMBO_FONT
		combo_label.add_theme_color_override("font_color", Color("#b8935a"))  # 残金
	elif combo >= 10:
		font_size = MAX_COMBO_FONT
		combo_label.add_theme_color_override("font_color", Color("#e8e0d4"))  # 纸白
	else:
		combo_label.add_theme_color_override("font_color", Color("#e8e0d490"))


func _on_boil_changed(is_boiling: bool) -> void:
	if is_boiling:
		# 墨沸波纹效果提示（HUD边角闪残金）
		pass


func _on_surge_changed(segments: int, max_segments: int) -> void:
	for i in range(ink_segments.size()):
		ink_segments[i].color.a = 1.0 if i < segments else 0.3


func _on_player_damaged(_amount: int) -> void:
	var player = get_tree().get_first_node_in_group("player")
	if player:
		health_bar.value = float(player.health) / float(player.max_health) * 100.0
```

- [ ] **Step 3: 集成到 game.tscn**

在 Game 场景中添加 HUD 实例化。

- [ ] **Step 4: 验证**

运行 → HUD 显示在画面四角 → 击杀敌人连击数变化 → 涨墨段位亮起 → 血量变化进度条更新。

---

### Task 11: 临时音效系统

**Files:**
- Create: `scripts/audio/audio_manager.gd` (Autoload)
- Create: `assets/audio/`（放置临时音效文件）

**Interfaces:**
- Consumes: `Events.enemy_killed`、`Events.hit_stop_requested`、`Events.ink_surge_triggered`、`Events.combo_changed`
- Produces: `AudioManager` — 全局音效播放器，用 `AudioStreamPlayer2D` 池

- [ ] **Step 1: 编写 audio_manager.gd**

```gdscript
# scripts/audio/audio_manager.gd
extends Node
class_name AudioManager
## 音效管理器 — Autoload

const MAX_PLAYERS: int = 16

var _player_pool: Array[AudioStreamPlayer2D] = []
var _next_index: int = 0


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	for i in range(MAX_PLAYERS):
		var player = AudioStreamPlayer2D.new()
		add_child(player)
		_player_pool.append(player)

	# 连接核心音效事件
	Events.enemy_killed.connect(func(_e, pos): _play_at("kill", pos))
	Events.ink_surge_triggered.connect(func(): _play_at("surge", _get_player_pos()))
	Events.player_damaged.connect(func(_a): _play_at("hurt", _get_player_pos()))
	Events.hit_stop_requested.connect(func(_f): _play_at("hit", _get_player_pos()))
	Events.combo_changed.connect(func(c):
		if c > 0 and c % 10 == 0:
			_play_at("combo", _get_player_pos())
	)


func _get_player_pos() -> Vector2:
	var tree = get_tree()
	if tree:
		var player = tree.get_first_node_in_group("player")
		if player:
			return player.global_position
	return Vector2.ZERO


func _play_at(sound_name: String, pos: Vector2) -> void:
	# 暂时用占位逻辑——后续替换为实际音频文件
	# 实际使用时：
	# var stream = _get_stream(sound_name)
	# if not stream: return
	# var player = _player_pool[_next_index]
	# _next_index = (_next_index + 1) % MAX_PLAYERS
	# player.global_position = pos
	# player.stream = stream
	# player.pitch_scale = randf_range(0.9, 1.1)
	# player.volume_db = randf_range(-2.0, 2.0)
	# player.play()
	pass  # Phase 5 实现完整音频


func play_stream(stream: AudioStream, pos: Vector2 = Vector2.ZERO, volume: float = 0.0) -> void:
	var player = _player_pool[_next_index]
	_next_index = (_next_index + 1) % MAX_PLAYERS
	player.global_position = pos
	player.stream = stream
	player.pitch_scale = randf_range(0.9, 1.1)
	player.volume_db = volume + randf_range(-2.0, 2.0)
	player.play()
```

注册为 Autoload：路径 `res://scripts/audio/audio_manager.gd`，名称 `AudioManager`

- [ ] **Step 2: 验证**

运行 → 命中/击杀/涨墨等操作不会因缺少音效而崩溃。Autoload 加载无报错。

---

### Task 12: 墨骸残留（地面墨渍）

**Files:**
- Create: `scripts/effects/ink_husk.gd`

**Interfaces:**
- Consumes: `Events.enemy_killed(enemy, global_position)`
- Produces: 敌人死亡位置留下墨渍 `Sprite2D`，15秒消散

- [ ] **Step 1: 编写 ink_husk.gd**

```gdscript
# scripts/effects/ink_husk.gd
extends Sprite2D
class_name InkHusk

@export var lifetime: float = 15.0
@export var slow_radius: float = 40.0
@export var slow_amount: float = 0.3  # 敌人减速 30%

var _elapsed: float = 0.0
var _area: Area2D


func _ready() -> void:
	# 圆形墨渍
	modulate = Color("#0a0a0f")
	modulate.a = 0.6
	# 减速区域
	_area = Area2D.new()
	var shape = CollisionShape2D.new()
	var circle = CircleShape2D.new()
	circle.radius = slow_radius
	shape.shape = circle
	_area.add_child(shape)
	add_child(_area)

	_area.body_entered.connect(_on_body_entered_slow)
	_area.body_exited.connect(_on_body_exited_slow)


func _process(delta: float) -> void:
	_elapsed += delta
	if _elapsed >= lifetime:
		queue_free()
		return
	# 最后 3 秒逐渐透明
	if _elapsed > lifetime - 3.0:
		modulate.a = lerp(0.6, 0.0, (_elapsed - (lifetime - 3.0)) / 3.0)


func _on_body_entered_slow(body: Node2D) -> void:
	if body is Enemy:
		body.move_speed *= (1.0 - slow_amount)


func _on_body_exited_slow(body: Node2D) -> void:
	if body is Enemy:
		body.move_speed /= (1.0 - slow_amount)


## 固定生成一个墨骸
static func spawn(parent: Node, position: Vector2) -> void:
	var husk = load("res://scripts/effects/ink_husk.gd").new()
	husk.global_position = position
	# 随机旋转和轻微缩放增添自然感
	husk.rotation = randf_range(0, TAU)
	husk.scale = Vector2.ONE * randf_range(0.8, 1.2)
	parent.add_child(husk)
```

- [ ] **Step 2: 在 enemy_spawner 中集成**

在 `_spawn_bloom` 方法中添加墨骸生成：
```gdscript
func _spawn_bloom(enemy: Enemy, pos: Vector2) -> void:
	InkBloom.spawn_bloom(_enemy_container, pos, InkBloom.BloomType.NORMAL)
	InkHusk.spawn(_enemy_container, pos)
```

- [ ] **Step 3: 验证**

运行 → 击杀敌人 → 地面留下圆形墨渍 → 15 秒后消失 → 敌人经过墨渍减速。

---

### Task 13: 墨蠕（Ink Crawl）& 墨爆（Ink Burst）

**Files:**
- Create: `scripts/enemies/ink_crawl.gd`
- Create: `scripts/enemies/ink_burst.gd`
- Create: `scenes/enemies/ink_crawl.tscn`
- Create: `scenes/enemies/ink_burst.tscn`

**Interfaces:**
- Consumes: `Enemy` 基类接口
- Produces: 两种新敌人，补全第一阶段敌人阵容

- [ ] **Step 1: 编写 ink_crawl.gd**

```gdscript
# scripts/enemies/ink_crawl.gd
extends Enemy
class_name InkCrawl

## 冲刺速度
@export var dash_speed: float = 400.0
## 冲刺前摇（秒）
@export var telegraph_time: float = 0.5
## 冲刺持续时间
@export var dash_duration: float = 0.4
## 冲刺冷却
@export var dash_cooldown: float = 2.0

var _state: int = 0  # 0=追踪, 1=前摇, 2=冲刺, 3=冷却
var _state_timer: float = 0.0
var _dash_direction: Vector2 = Vector2.ZERO
var _ground_circle: Sprite2D  # 地面墨圈预警


func _ready() -> void:
	super._ready()
	if enemy_id.is_empty():
		enemy_id = "ink_crawl"
	move_speed = 80.0
	max_health = 12


func _physics_process(delta: float) -> void:
	if not _player_ref or not _player_ref.is_alive:
		return

	_state_timer += delta
	match _state:
		0:  # 追踪
			var dir = (_player_ref.global_position - global_position).normalized()
			velocity = dir * move_speed
			move_and_slide()
			if _state_timer > dash_cooldown:
				_enter_telegraph()
		1:  # 前摇（地面墨圈预警）
			velocity = Vector2.ZERO
			move_and_slide()
			if _state_timer >= telegraph_time:
				_enter_dash()
		2:  # 冲刺
			velocity = _dash_direction * dash_speed
			move_and_slide()
			if _state_timer >= dash_duration:
				_enter_cooldown()
		3:  # 冷却
			_move_toward_player_lazy(delta)
			if _state_timer >= dash_cooldown:
				_state = 0
				_state_timer = 0.0


func _move_toward_player_lazy(delta: float) -> void:
	var dir = (_player_ref.global_position - global_position).normalized()
	velocity = dir * move_speed * 0.5
	move_and_slide()


func _enter_telegraph() -> void:
	_state = 1
	_state_timer = 0.0
	_dash_direction = (_player_ref.global_position - global_position).normalized()
	# TODO Phase 4：在地面显示墨圈预警


func _enter_dash() -> void:
	_state = 2
	_state_timer = 0.0


func _enter_cooldown() -> void:
	_state = 3
	_state_timer = 0.0
	velocity = Vector2.ZERO
```

- [ ] **Step 2: 编写 ink_burst.gd**

```gdscript
# scripts/enemies/ink_burst.gd
extends Enemy
class_name InkBurst

@export var explode_radius: float = 80.0
@export var explode_damage: int = 20
@export var chase_time: float = 2.0
@export var expand_time: float = 0.6

var _state: int = 0  # 0=追踪, 1=膨胀, 2=爆炸
var _timer: float = 0.0
var _original_scale: Vector2


func _ready() -> void:
	super._ready()
	if enemy_id.is_empty():
		enemy_id = "ink_burst"
	move_speed = 100.0
	max_health = 8
	_original_scale = scale


func _physics_process(delta: float) -> void:
	if not _player_ref or not _player_ref.is_alive:
		return

	match _state:
		0:  # 追踪
			var dir = (_player_ref.global_position - global_position).normalized()
			velocity = dir * move_speed
			move_and_slide()
			_timer += delta
			if _timer >= chase_time:
				_enter_expand()
		1:  # 膨胀
			velocity = Vector2.ZERO
			move_and_slide()
			_timer += delta
			var t = _timer / expand_time
			scale = _original_scale * lerp(1.0, 1.8, t)
			if _timer >= expand_time:
				_explode()


func _enter_expand() -> void:
	_state = 1
	_timer = 0.0


func _explode() -> void:
	# 对范围内玩家造成伤害
	if _player_ref and global_position.distance_to(_player_ref.global_position) < explode_radius:
		_player_ref.take_damage(explode_damage)

	# 留下墨迹减速地板（暂时视觉占位，墨骸系统复用）
	InkHusk.spawn(get_parent(), global_position)

	Events.enemy_killed.emit(self, global_position)
	queue_free()
```

- [ ] **Step 3: 创建场景文件**

参照 `ink_float.tscn` 的结构，分别创建 `ink_crawl.tscn`（细长条形剪影）和 `ink_burst.tscn`（膨胀圆球剪影，内部泛苍青光）。

- [ ] **Step 4: 更新 enemy_spawner.gd 支持多种敌人**

```gdscript
@export var ink_float_scene: PackedScene
@export var ink_crawl_scene: PackedScene
@export var ink_burst_scene: PackedScene

func _spawn_one() -> void:
	var scenes = [ink_float_scene, ink_crawl_scene, ink_burst_scene]
	var weights = [0.5, 0.3, 0.2]  # 墨浮多，墨爆少
	var scene = _weighted_random(scenes, weights)
	var enemy = scene.instantiate()
	enemy.global_position = _random_spawn_position()
	_enemy_container.add_child(enemy)

func _weighted_random(items: Array, weights: Array) -> Variant:
	var total = 0.0
	for w in weights: total += w
	var r = randf() * total
	var cumulative = 0.0
	for i in range(items.size()):
		cumulative += weights[i]
		if r <= cumulative:
			return items[i]
	return items[0]
```

- [ ] **Step 5: 验证**

运行 → 三种敌人按不同概率生成 → 墨浮分裂 → 墨蠕冲刺（有前摇停顿）→ 墨爆追人后膨胀爆炸。

---

### Task 14: 场景搭建 — game.tscn 完整组装

**Files:**
- Create: `scenes/game.tscn`
- Modify: `project.godot`（设为主场景）

**Interfaces:**
- 整合所有已完成模块为可运行游戏场景

- [ ] **Step 1: 搭建完整 game.tscn**

```
Game (Node2D)
├── CanvasModulate (color=#0a0a0f)
├── Background (Node2D)  # 纯黑背景
│   └── ColorRect (全屏，#0a0a0f)
├── Player (实例化 player.tscn) [group="player"]
├── EnemySpawner (enemy_spawner.gd)
├── Camera2D
│   ├── current=true
│   ├── position_smoothing enabled=true
│   └── ScreenShake (screen_shake.gd)
└── HUD (实例化 hud.tscn)
```

- [ ] **Step 2: 设置主场景**

`project.godot`：
```ini
run/main_scene="res://scenes/game.tscn"
```

- [ ] **Step 3: 验证**

运行 → 完整游戏循环：移动→挥砍→敌人生成→命中反馈→击杀墨花→涨墨爆发→HUD全功能。

---

### Task 15: 性能基础优化

**Files:**
- Modify: `scripts/systems/enemy_spawner.gd`
- Create: `scripts/systems/object_pool.gd`

**Interfaces:**
- 敌人池化：`ObjectPool` 通用池，减少 `instantiate`/`queue_free` 开销

- [ ] **Step 1: 编写 object_pool.gd**

```gdscript
# scripts/systems/object_pool.gd
class_name ObjectPool
extends Node

var _scene: PackedScene
var _pool: Array[Node] = []
var _active: Array[Node] = []


func setup(scene: PackedScene, preload_count: int = 10) -> void:
	_scene = scene
	for i in range(preload_count):
		var obj = _scene.instantiate()
		add_child(obj)
		obj.process_mode = Node.PROCESS_MODE_DISABLED
		obj.visible = false
		_pool.append(obj)


func acquire() -> Node:
	var obj: Node
	if _pool.size() > 0:
		obj = _pool.pop_back()
	else:
		obj = _scene.instantiate()
		add_child(obj)
	obj.process_mode = Node.PROCESS_MODE_INHERIT
	obj.visible = true
	_active.append(obj)
	return obj


func release(obj: Node) -> void:
	_active.erase(obj)
	obj.process_mode = Node.PROCESS_MODE_DISABLED
	obj.visible = false
	_pool.append(obj)
```

- [ ] **Step 2: 修改 enemy_spawner 使用池**

在 `enemy_spawner.gd` 中为每种敌人创建 `ObjectPool`，替换 `instantiate`。

- [ ] **Step 3: 性能验证**

运行 → 同屏 50+ 敌人 → FPS 保持 60。使用 Godot 内置 `Debugger → Monitors` 观察每秒对象创建数接近 0。

---

### Task 16: 死亡 & 简单结算

**Files:**
- Modify: `scripts/player/player.gd`
- Modify: `scripts/ui/hud.gd`

**Interfaces:**
- 玩家死亡 → 画面墨染吞噬 → 显示存活时间 + 击杀数 → 按键重开

- [ ] **Step 1: 在 player.gd 实现死亡动画**

```gdscript
func _die() -> void:
	is_alive = false
	Events.player_died.emit()
	# 画面边缘墨染吞噬效果（Phase 4 打磨，目前简单黑屏）
	var tween = create_tween()
	var fade = CanvasModulate.new()
	fade.color = Color("#0a0a0f")
	get_tree().root.add_child(fade)
	tween.tween_property(fade, "color:a", 1.0, 1.0)
	await tween.finished
	Events.game_over.emit()
```

- [ ] **Step 2: 添加 game_over 信号到 Events**

```gdscript
signal game_over()
```

- [ ] **Step 3: 在 HUD 中显示结算**

```gdscript
func _ready() -> void:
	Events.game_over.connect(_show_result)

func _show_result() -> void:
	var result = Label.new()
	result.text = "墨脉沉寂\n\n按 R 重开"
	result.add_theme_font_size_override("font_size", 36)
	result.add_theme_color_override("font_color", Color("#e8e0d4"))
	result.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	result.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	add_child(result)
```

- [ ] **Step 4: 监听 R 键重开**

在 HUD 中添加：
```gdscript
func _input(event: InputEvent) -> void:
	if event.is_action_pressed("restart"):
		get_tree().reload_current_scene()
```
Input Map 添加 `restart` 绑定 R 键。

- [ ] **Step 5: 验证**

运行 → 故意被敌人打死 → 画面黑屏 → 显示提示文字 → 按 R 重开。

---

### 第一阶段验证清单

完成所有 Task 后，逐项确认：

- [ ] 移动与攻击响应无延迟（WASD + 鼠标左键）
- [ ] 每次命中都有停帧（画面极短暂冻结）
- [ ] 每次命中都有屏幕震动（强度随暴击/重击变化）
- [ ] 墨痕拖尾有粗细变化（Line2D 宽度渐变）
- [ ] 墨浮死后分裂，子代更小
- [ ] 墨蠕冲刺前有明显前摇停顿
- [ ] 墨爆追人后膨胀→爆炸→留墨迹
- [ ] 涨墨 3 段满 → 自动爆发 → 全屏清场
- [ ] 爆发后有 3 秒虚弱（无法积墨）
- [ ] 连击 10 → 燃墨，连击 30 → 墨沸
- [ ] 断连 1.5 秒 → 连击归零
- [ ] 击杀留下墨花 + 墨骸
- [ ] 墨骸减速敌人直至消散
- [ ] HUD 涨墨段/血量/连击实时更新
- [ ] 死亡后按 R 重开
- [ ] 同屏 50+ 敌人流畅运行

---

## 后续阶段概要

### 第二阶段：Build 系统（3周）
- 卡牌资源定义（.tres）
- 升级选牌 UI（3选1 + 重掷 + 封印）
- 15 张基础卡牌实现
- 共鸣关键字匹配逻辑
- 第一层质变（3个：沥墨/凝墨/御墨）
- 局外墨脉图谱基础版

### 第三阶段：敌人完整阵容（2周）
- 墨缚、墨蛹、墨蛭、墨镜、墨影
- 精英墨猿、墨隼（含入场演出）
- Boss 古灵三阶段
- 波次节奏系统
- 墨脉随机事件

### 第四阶段：视觉打磨（2-3周）
- 三层背景系统
- 实时光照系统
- Line2D 书法笔触 + 飞白 Shader
- 墨花差异化
- 墨变外观系统
- 过渡动画

### 第五阶段：音频完整（1-2周）
- 音效素材集成 + 变调防疲劳
- 动态分层音乐
- 空间音频
- UI 音效

### 第六阶段：收尾上线（2-3周）
- 主菜单/设置/存档
- Steamworks SDK
- 成就系统
- 本地化
- 测试+Bug修复
- Steam商店页

---

> **第一阶段交付标准：** 任何人拿起游戏，砍第一刀觉得"这个手感对"，砍完第一波涨墨爆发后想再来一局。后续所有阶段都在这个手感基线上叠加。
