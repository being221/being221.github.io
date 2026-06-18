# scripts/enemies/ink_float.gd — 墨浮：圆团+双苍青光眼+浮动
extends Enemy
class_name InkFloat

@export var split_count: int = 2
@export var child_scale: float = 0.6

var _bob_phase: float = 0.0


func _ready() -> void:
	super._ready()
	if enemy_id.is_empty(): enemy_id = "ink_float"
	move_speed = 60.0; max_health = 15; contact_damage = 5
	health = max_health
	_bob_phase = randf() * TAU


func _draw() -> void:
	if _is_dying: return
	var bob = Vector2(0, sin(Time.get_ticks_msec() * 0.003 + _bob_phase) * 3.0)
	var r = 7.0 * scale.x
	# 身体
	draw_circle(bob, r, Color(0.88, 0.85, 0.80, 0.75))
	# 双苍青眼
	draw_circle(bob + Vector2(-2.5, -1.5), 1.8, Color(0.23, 0.49, 0.65, 0.9))
	draw_circle(bob + Vector2(2.5, -1.5), 1.8, Color(0.23, 0.49, 0.65, 0.9))
	# 外圈
	draw_circle(bob, r, Color(0.91, 0.88, 0.83, 0.3))


func _die() -> void:
	_is_dying = true
	Events.enemy_killed.emit(self, global_position)
	if scale.x > 0.35:
		for i in range(split_count):
			var child = duplicate() as InkFloat
			child.scale = scale * child_scale
			child.max_health = maxi(1, max_health / 2)
			child.health = child.max_health
			child.split_count = 2
			child._is_dying = false
			child.global_position = global_position + Vector2(randf_range(-12, 12), randf_range(-12, 12))
			get_parent().add_child(child)
	queue_free()
