# scripts/enemies/ink_float.gd
extends Enemy
class_name InkFloat

## 死亡后分裂数量
@export var split_count: int = 2
## 子代缩放
@export var child_scale: float = 0.6

var _bob_offset: float = 0.0


func _ready() -> void:
	super._ready()
	if enemy_id.is_empty():
		enemy_id = "ink_float"
	move_speed = 60.0
	max_health = 15
	contact_damage = 5
	health = max_health
	_enemy_color = Color(0.91, 0.88, 0.83, 0.7)  # 淡纸白
	_body_radius = 6.0


func _physics_process(delta: float) -> void:
	super._physics_process(delta)
	# 浮动动画
	_bob_offset = sin(Time.get_ticks_msec() * 0.003) * 3.0


func _draw() -> void:
	if _is_dying:
		return
	# 用位置偏移画漂浮感
	var bob = Vector2(0, _bob_offset)
	# 两个苍青光点（"眼睛"）
	draw_circle(bob + Vector2(-2.5, -1), _body_radius * 0.35, Color(0.23, 0.49, 0.65, 0.8))
	draw_circle(bob + Vector2(2.5, -1), _body_radius * 0.35, Color(0.23, 0.49, 0.65, 0.8))
	# 身体
	draw_circle(bob, _body_radius, _enemy_color)
	# 描边
	draw_arc(bob, _body_radius, 0, TAU, 16, _enemy_color.lightened(0.2), 1.0)


func _die() -> void:
	_is_dying = true
	Events.enemy_killed.emit(self, global_position)
	# 分裂
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
