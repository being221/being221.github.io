# scripts/enemies/ink_crawl.gd — 墨蠕：细长条形+冲刺
extends Enemy
class_name InkCrawl

@export var dash_speed: float = 380.0
@export var telegraph_time: float = 0.45
@export var dash_duration: float = 0.35
@export var dash_cooldown: float = 2.2

var _state: int = 0
var _state_timer: float = 0.0
var _dash_direction: Vector2 = Vector2.ZERO


func _ready() -> void:
	super._ready()
	if enemy_id.is_empty(): enemy_id = "ink_crawl"
	move_speed = 80.0; max_health = 12; contact_damage = 8
	health = max_health


func _draw() -> void:
	if _is_dying: return
	var body_rect = Rect2(-4, -9, 8, 18)
	# 身体
	draw_rect(body_rect, Color(0.82, 0.79, 0.73, 0.8), true)
	# 头部光点
	draw_circle(Vector2(0, -8), 2.5, Color(0.23, 0.49, 0.65, 0.85))
	# 前摇警告
	if _state == 1 and sin(Time.get_ticks_msec() * 0.02) > 0:
		draw_rect(body_rect, Color(0.9, 0.2, 0.15, 0.5), true)
	# 冲刺残影
	if _state == 2:
		draw_line(Vector2.ZERO, -_dash_direction * 18, Color(0.91, 0.88, 0.83, 0.4), 2.5)


func _physics_process(delta: float) -> void:
	if not _player_ref or not _player_ref.is_alive: return
	_state_timer += delta
	match _state:
		0:
			var dir = (_player_ref.global_position - global_position).normalized()
			velocity = dir * move_speed; move_and_slide()
			if _state_timer > dash_cooldown: _enter_telegraph()
		1:
			velocity = Vector2.ZERO; move_and_slide()
			if _state_timer >= telegraph_time: _enter_dash()
		2:
			velocity = _dash_direction * dash_speed; move_and_slide()
			if _state_timer >= dash_duration: _enter_cooldown()
		3:
			var dir = (_player_ref.global_position - global_position).normalized()
			velocity = dir * move_speed * 0.5; move_and_slide()
			if _state_timer >= dash_cooldown: _state = 0; _state_timer = 0.0
	queue_redraw()


func _enter_telegraph() -> void: _state = 1; _state_timer = 0.0; _dash_direction = (_player_ref.global_position - global_position).normalized()
func _enter_dash() -> void: _state = 2; _state_timer = 0.0
func _enter_cooldown() -> void: _state = 3; _state_timer = 0.0; velocity = Vector2.ZERO
