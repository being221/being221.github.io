# scripts/effects/damage_number.gd
extends Label
class_name DamageNumber

static var _count: int = 0
static var MAX_COUNT: int = 30
static var _parent: Node = null


static func set_parent(p: Node) -> void:
	_parent = p


static func spawn(pos: Vector2, amount: int, is_crit: bool = false) -> void:
	if _count >= MAX_COUNT or not _parent:
		return
	_count += 1

	var label = Label.new()
	label.global_position = pos + Vector2(randf_range(-8, 8), randf_range(-5, 5))
	label.text = str(amount)
	label.add_theme_font_size_override("font_size", 13 if not is_crit else 18)
	label.add_theme_color_override("font_color",
		Color(0.91, 0.88, 0.83, 1.0) if not is_crit else Color(1.0, 0.35, 0.3, 1.0))
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_parent.add_child(label)

	var tween = label.create_tween()
	tween.set_parallel(true)
	tween.tween_property(label, "position:y", label.position.y - 22, 0.55).set_ease(Tween.EASE_OUT)
	tween.tween_property(label, "modulate:a", 0.0, 0.45).set_delay(0.08)
	tween.chain().tween_callback(func():
		if is_instance_valid(label): label.queue_free()
		_count -= 1
	)
