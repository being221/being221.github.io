# scripts/effects/ink_trail.gd
extends Line2D
class_name InkTrail

## 拖尾存活时间（秒）
@export var lifetime: float = 0.3
## 起始宽度
@export var start_width: float = 6.0
## 最大点数
@export var max_points: int = 30

var _elapsed: float = 0.0
var _is_active: bool = false
var _base_alpha: float = 1.0


func _ready() -> void:
	clear_points()
	visible = false
	top_level = true  # 不跟随父节点移动
	default_color = Color("#e8e0d4")  # 纸白


func start_trail(origin: Vector2) -> void:
	global_position = Vector2.ZERO
	clear_points()
	add_point(origin)
	_elapsed = 0.0
	_is_active = true
	visible = true
	width = start_width
	_base_alpha = 1.0


func update_trail(new_point: Vector2) -> void:
	if not _is_active:
		return
	add_point(new_point)
	# 限制点数
	while get_point_count() > max_points:
		remove_point(0)
	# 渐变宽度：越后面越细（出锋）
	var point_count = get_point_count()
	for i in range(point_count):
		var t = float(i) / float(max(1, point_count - 1))
		# 前面宽后面细，模拟收笔出锋
		width_curve = null  # 使用默认
	width = lerp(start_width, start_width * 0.2, float(point_count - 1) / float(max(1, max_points)))
	default_color.a = lerp(_base_alpha, 0.0, 0.5)


func end_trail() -> void:
	_is_active = false


func _process(delta: float) -> void:
	if not _is_active:
		return
	_elapsed += delta
	# 随时间淡出
	if _elapsed >= lifetime:
		visible = false
		clear_points()
		return
	# 整体逐渐透明
	var fade = 1.0 - (_elapsed / lifetime)
	default_color.a = clamp(fade, 0.0, _base_alpha)
