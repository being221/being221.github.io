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


func _ready() -> void:
	super._ready()
	if enemy_id.is_empty():
		enemy_id = "ink_crawl"
	move_speed = 80.0
	max_health = 12
	contact_damage = 8
	health = max_health
	_enemy_color = Color(0.82, 0.79, 0.73, 0.8)  # 稍暗纸白
	_body_radius = 5.0


func _draw() -> void:
	if _is_dying:
		return

	# 细长条形身体
	var body_rect = Rect2(-_body_radius, -_body_radius * 2, _body_radius * 2, _body_radius * 4)
	draw_rect(body_rect, _enemy_color, true)

	# 头部苍青光点
	draw_circle(Vector2(0, -_body_radius * 1.8), _body_radius * 0.5, Color(0.23, 0.49, 0.65, 0.8))

	# 前摇状态：红色闪烁
	if _state == 1:
		var flash = sin(Time.get_ticks_msec() * 0.02) > 0
		if flash:
			draw_rect(body_rect, Color(0.76, 0.23, 0.17, 0.6), true)

	# 冲刺状态：线条残影
	if _state == 2:
		draw_line(Vector2.ZERO, -_dash_direction * 20.0, Color(0.91, 0.88, 0.83, 0.5), 3.0)


func _physics_process(delta: float) -> void:
	if not _player_ref or not _player_ref.is_alive:
		return

	_state_timer += delta
	match _state:
		0:
			var dir = (_player_ref.global_position - global_position).normalized()
			velocity = dir * move_speed
			move_and_slide()
			if _state_timer > dash_cooldown:
				_enter_telegraph()
		1:
			velocity = Vector2.ZERO
			move_and_slide()
			if _state_timer >= telegraph_time:
				_enter_dash()
		2:
			velocity = _dash_direction * dash_speed
			move_and_slide()
			if _state_timer >= dash_duration:
				_enter_cooldown()
		3:
			var dir = (_player_ref.global_position - global_position).normalized()
			velocity = dir * move_speed * 0.5
			move_and_slide()
			if _state_timer >= dash_cooldown:
				_state = 0
				_state_timer = 0.0

	queue_redraw()


func _enter_telegraph() -> void:
	_state = 1
	_state_timer = 0.0
	_dash_direction = (_player_ref.global_position - global_position).normalized()


func _enter_dash() -> void:
	_state = 2
	_state_timer = 0.0


func _enter_cooldown() -> void:
	_state = 3
	_state_timer = 0.0
	velocity = Vector2.ZERO
