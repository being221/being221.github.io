# scripts/effects/damage_number.gd
## 浮动伤害数字
extends Label
class_name DamageNumber


static func spawn(parent: Node, pos: Vector2, amount: int, is_crit: bool = false) -> void:
	var label = Label.new()
	label.top_level = true
	label.global_position = pos + Vector2(randf_range(-12, 12), randf_range(-8, 8))
	label.text = str(amount)
	label.add_theme_font_size_override("font_size", 14 if not is_crit else 20)
	label.add_theme_color_override("font_color",
		Color(0.91, 0.88, 0.83, 1.0) if not is_crit else Color(1.0, 0.35, 0.3, 1.0))
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.z_index = 100
	parent.add_child(label)

	# 浮动动画
	var tween = label.create_tween()
	tween.set_parallel(true)
	tween.tween_property(label, "position:y", label.position.y - 30, 0.7).set_ease(Tween.EASE_OUT)
	tween.tween_property(label, "modulate:a", 0.0, 0.6).set_delay(0.15)
	tween.chain().tween_callback(label.queue_free)
