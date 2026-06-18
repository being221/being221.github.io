# scripts/enemies/ink_burst.gd
extends Enemy
class_name InkBurst

@export var explode_radius: float = 80.0
@export var explode_damage: int = 20
@export var chase_time: float = 2.0
@export var expand_time: float = 0.6

var _state: int = 0  # 0=追踪, 1=膨胀, 2=爆炸
var _timer: float = 0.0
var _expand_progress: float = 0.0


func _ready() -> void:
	super._ready()
	if enemy_id.is_empty():
		enemy_id = "ink_burst"
	move_speed = 100.0
	max_health = 8
	contact_damage = 5
	health = max_health
	_enemy_color = Color(0.76, 0.23, 0.17, 0.7)  # 朱砂半透明
	_body_radius = 7.0


func _draw() -> void:
	if _is_dying:
		return

	var radius = _body_radius
	if _state == 1:
		radius = _body_radius * (1.0 + _expand_progress * 0.8)

	# 主体
	draw_circle(Vector2.ZERO, radius, _enemy_color)

	# 内部苍青光脉动
	var pulse = sin(Time.get_ticks_msec() * 0.005)
	var glow_color = Color(0.23, 0.49, 0.65, 0.5 + pulse * 0.3)
	draw_circle(Vector2.ZERO, radius * 0.6, glow_color)

	# 膨胀状态加描边
	if _state == 1:
		draw_arc(Vector2.ZERO, radius, 0, TAU, 32, Color(1.0, 0.3, 0.2, 0.8), 2.0)


func _physics_process(delta: float) -> void:
	if not _player_ref or not _player_ref.is_alive:
		return

	match _state:
		0:
			var dir = (_player_ref.global_position - global_position).normalized()
			velocity = dir * move_speed
			move_and_slide()
			_timer += delta
			if _timer >= chase_time:
				_enter_expand()
		1:
			velocity = Vector2.ZERO
			move_and_slide()
			_timer += delta
			_expand_progress = min(_timer / expand_time, 1.0)
			if _timer >= expand_time:
				_explode()

	queue_redraw()


func _enter_expand() -> void:
	_state = 1
	_timer = 0.0


func _explode() -> void:
	_is_dying = true
	if _player_ref and global_position.distance_to(_player_ref.global_position) < explode_radius:
		_player_ref.take_damage(explode_damage)
	Events.enemy_killed.emit(self, global_position)
	queue_free()
