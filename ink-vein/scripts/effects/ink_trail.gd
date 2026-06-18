# scripts/effects/ink_trail.gd
extends Line2D
class_name InkTrail

@export var lifetime: float = 0.25

var _elapsed: float = 0.0
var _active: bool = false

# 静态缓存的宽度曲线，不每次创建
static var _width_curve: Curve


static func _ensure_curve() -> void:
	if _width_curve:
		return
	_width_curve = Curve.new()
	_width_curve.add_point(Vector2(0, 1.0))
	_width_curve.add_point(Vector2(0.5, 0.6))
	_width_curve.add_point(Vector2(0.85, 0.2))
	_width_curve.add_point(Vector2(1.0, 0.03))


func _ready() -> void:
	clear_points()
	visible = false
	top_level = true
	default_color = Color(0.91, 0.88, 0.83, 0.85)
	end_cap_mode = Line2D.LINE_CAP_ROUND
	begin_cap_mode = Line2D.LINE_CAP_ROUND
	_ensure_curve()
	width_curve = _width_curve


func spawn_arc(start: Vector2, end: Vector2) -> void:
	clear_points()
	visible = true
	_active = true
	_elapsed = 0.0

	var mid = (start + end) * 0.5
	var perp = (end - start).orthogonal().normalized()
	var arc_height = (end - start).length() * randf_range(-0.12, 0.12)
	mid += perp * arc_height

	for i in range(8):
		var t = float(i) / 7.0
		var p = start.lerp(mid, t).lerp(mid.lerp(end, t), t)
		add_point(p)


func _process(delta: float) -> void:
	if not _active:
		return
	_elapsed += delta
	var fade = 1.0 - (_elapsed / lifetime)
	if fade <= 0.0:
		visible = false
		clear_points()
		_active = false
		return
	default_color.a = fade * 0.85
