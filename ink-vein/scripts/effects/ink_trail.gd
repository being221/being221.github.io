# scripts/effects/ink_trail.gd
extends Line2D
class_name InkTrail

@export var lifetime: float = 0.25
@export var start_width: float = 5.0
@export var end_width: float = 0.5
@export var arc_points: int = 10  # 弧线采样点数

var _elapsed: float = 0.0
var _active: bool = false


func _ready() -> void:
	clear_points()
	visible = false
	top_level = true
	default_color = Color(0.91, 0.88, 0.83, 0.85)
	end_cap_mode = Line2D.LINE_CAP_ROUND
	begin_cap_mode = Line2D.LINE_CAP_ROUND


func draw_arc(start: Vector2, end: Vector2) -> void:
	clear_points()
	visible = true
	_active = true
	_elapsed = 0.0

	# 弧线——从起点画到终点，中间带轻微弯曲
	var mid = (start + end) * 0.5
	var perp = (end - start).orthogonal().normalized()
	var arc_height = (end - start).length() * randf_range(-0.15, 0.15)
	mid += perp * arc_height

	for i in range(arc_points + 1):
		var t = float(i) / float(arc_points)
		# 二次贝塞尔
		var p = start.lerp(mid, t).lerp(mid.lerp(end, t), t)
		add_point(p)

	# 宽度渐变——起笔粗，收笔细（飞白）
	var curve = Curve.new()
	curve.add_point(Vector2(0, 1.0))           # 起笔最粗
	curve.add_point(Vector2(0.6, 0.5))          # 行笔渐细
	curve.add_point(Vector2(0.9, 0.15))          # 收笔飞白
	curve.add_point(Vector2(1.0, 0.02))
	width_curve = curve


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
	# 整体宽度随时间略微缩小
	width = lerp(0.0, start_width, fade)
