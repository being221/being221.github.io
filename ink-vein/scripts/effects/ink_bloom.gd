# scripts/effects/ink_bloom.gd
extends Node2D
class_name InkBloom

enum BloomType { NORMAL, CRITICAL, HEAVY, BOIL, SURGE }

const PETAL_COUNTS := {
	BloomType.NORMAL: 6,
	BloomType.CRITICAL: 10,
	BloomType.HEAVY: 14,
	BloomType.BOIL: 10,
	BloomType.SURGE: 8,
}

const PETAL_COLORS := {
	BloomType.NORMAL: Color("#e8e0d4"),
	BloomType.CRITICAL: Color("#e8e0d4"),
	BloomType.HEAVY: Color("#e8e0d4"),
	BloomType.BOIL: Color("#3a7ca5"),
	BloomType.SURGE: Color("#e8e0d4"),
}

@export var lifetime: float = 0.5
@export var bloom_radius: float = 60.0

var _elapsed: float = 0.0
var _petal_points: Array[PackedVector2Array] = []
var _petal_angles: Array[float] = []
var _bloom_type: BloomType


func _init(p_type: BloomType = BloomType.NORMAL) -> void:
	_bloom_type = p_type


func _ready() -> void:
	top_level = true
	_generate_petals()


func _generate_petals() -> void:
	var count = PETAL_COUNTS.get(_bloom_type, 6)
	for i in range(count):
		var angle = float(i) / float(count) * TAU + randf_range(-0.1, 0.1)
		_petal_angles.append(angle)
		var petal = _generate_petal(angle)
		_petal_points.append(petal)


func _generate_petal(angle: float) -> PackedVector2Array:
	var points := PackedVector2Array()
	var length = bloom_radius * randf_range(0.6, 1.0)
	var steps = 6
	for i in range(steps + 1):
		var t = float(i) / float(steps)
		var r = length * t
		var curve_offset = sin(t * PI) * randf_range(-8, 8)
		var dir = Vector2.RIGHT.rotated(angle)
		var perp = dir.orthogonal() * curve_offset
		points.append(dir * r + perp)
	return points


func _process(delta: float) -> void:
	_elapsed += delta
	if _elapsed >= lifetime:
		queue_free()
		return
	queue_redraw()


func _draw() -> void:
	var t = _elapsed / lifetime
	var color = PETAL_COLORS.get(_bloom_type, Color.WHITE)

	for pi in range(_petal_points.size()):
		var petal = _petal_points[pi]
		if petal.size() < 2:
			continue
		var draw_points := PackedVector2Array()
		for i in range(petal.size()):
			var p = petal[i]
			if t < 0.5:
				p *= Utils.ease_out_cubic(t * 2.0)
			draw_points.append(p)

		var line_color = color
		line_color.a = clamp(1.0 - t, 0.0, 1.0)
		for i in range(draw_points.size() - 1):
			var progress = float(i) / float(max(1, draw_points.size() - 2))
			var line_width = lerp(4.0, 0.5, progress)
			draw_line(draw_points[i], draw_points[i + 1], line_color, line_width, true)


## 静态工厂方法
static func spawn_bloom(parent: Node, position: Vector2, bloom_type: BloomType = BloomType.NORMAL) -> void:
	var bloom = InkBloom.new(bloom_type)
	bloom.global_position = position
	parent.add_child(bloom)
