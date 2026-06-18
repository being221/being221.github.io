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
	move_speed = 60.0
	max_health = 15
	contact_damage = 5
	health = max_health
	# 墨浮有漂浮感——轻微上下摆动
	var tween = create_tween()
	tween.set_loops()
	tween.tween_property(self, "position:y", position.y - 4.0, 1.0).set_ease(Tween.EASE_IN_OUT)
	tween.tween_property(self, "position:y", position.y + 4.0, 1.0).set_ease(Tween.EASE_IN_OUT)


func _die() -> void:
	_is_dying = true
	Events.enemy_killed.emit(self, global_position)
	# 分裂：生成更小的墨浮
	if scale.x > 0.3:
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
