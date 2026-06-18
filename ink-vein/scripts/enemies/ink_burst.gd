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
	contact_damage = 5
	health = max_health
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
	_is_dying = true
	if _player_ref and global_position.distance_to(_player_ref.global_position) < explode_radius:
		_player_ref.take_damage(explode_damage)
	Events.enemy_killed.emit(self, global_position)
	queue_free()
