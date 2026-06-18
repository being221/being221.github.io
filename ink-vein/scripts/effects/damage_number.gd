# scripts/effects/damage_number.gd
extends Label
class_name DamageNumber

static var _count: int = 0
static var MAX_COUNT: int = 40


static func spawn(parent: Node, pos: Vector2, amount: int, is_crit: bool = false) -> void:
	if _count >= MAX_COUNT:
		return  # 丢弃溢出，防止堆积卡顿
	_count += 1

	var label = Label.new()
	label.top_level = true
	label.global_position = pos + Vector2(randf_range(-10, 10), randf_range(-6, 6))
	label.text = str(amount)
	label.add_theme_font_size_override("font_size", 13 if not is_crit else 18)
	label.add_theme_color_override("font_color",
		Color(0.91, 0.88, 0.83, 1.0) if not is_crit else Color(1.0, 0.35, 0.3, 1.0))
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.z_index = 100
	parent.add_child(label)

	var tween = label.create_tween()
	tween.set_parallel(true)
	tween.tween_property(label, "position:y", label.position.y - 25, 0.6).set_ease(Tween.EASE_OUT)
	tween.tween_property(label, "modulate:a", 0.0, 0.5).set_delay(0.1)
	tween.chain().tween_callback(func():
		label.queue_free()
		_count -= 1
	)
