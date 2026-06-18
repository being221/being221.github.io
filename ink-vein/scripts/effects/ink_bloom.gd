# scripts/effects/ink_bloom.gd
extends Node2D
class_name InkBloom

enum BloomType { NORMAL, CRITICAL, HEAVY, BOIL, SURGE }

const COLORS := {
	BloomType.NORMAL: Color(0.91, 0.88, 0.83),
	BloomType.CRITICAL: Color(0.91, 0.88, 0.83),
	BloomType.HEAVY: Color(0.91, 0.88, 0.83),
	BloomType.BOIL: Color(0.23, 0.49, 0.65),
	BloomType.SURGE: Color(0.91, 0.88, 0.83),
}

var _elapsed: float = 0.0
var _lifetime: float = 0.45
var _petal_count: int = 6
var _radius: float = 50.0
var _color: Color = Color.WHITE
var _angles: Array[float] = []
var _lengths: Array[float] = []
var _offsets: Array[float] = []


func _init(bloom_type: BloomType = BloomType.NORMAL) -> void:
	_lifetime = 0.45
	match bloom_type:
		BloomType.NORMAL: _petal_count = 6; _radius = 45
		BloomType.CRITICAL: _petal_count = 10; _radius = 60
		BloomType.HEAVY: _petal_count = 12; _radius = 55
		BloomType.BOIL: _petal_count = 8; _radius = 50
		BloomType.SURGE: _petal_count = 6; _radius = 40
	_color = COLORS.get(bloom_type, Color.WHITE)
	for i in range(_petal_count):
		_angles.append(float(i) / float(_petal_count) * TAU + randf_range(-0.12, 0.12))
		_lengths.append(_radius * randf_range(0.5, 1.0))
		_offsets.append(randf_range(-6, 6))


func _ready() -> void:
	top_level = true


func _process(delta: float) -> void:
	_elapsed += delta
	if _elapsed >= _lifetime:
		queue_free()
		return
	queue_redraw()


func _draw() -> void:
	var t = min(_elapsed / _lifetime, 1.0)
	var grow_t = min(t * 2.5, 1.0)
	var fade = 1.0 - t

	for i in range(_petal_count):
		var angle = _angles[i]
		var length = _lengths[i]
		var offset = _offsets[i]
		var dir = Vector2.RIGHT.rotated(angle)
		var perp = dir.orthogonal()

		# 花瓣从中心向外伸展
		var p0 = Vector2.ZERO
		var p1 = dir * length * grow_t * 0.5 + perp * offset * grow_t
		var p2 = dir * length * grow_t

		var line_color = _color
		line_color.a = fade * 0.7
		draw_line(p0, p1, line_color, 3.0 * fade, true)
		draw_line(p1, p2, line_color, 1.5 * fade, true)

	# 中心墨点
	draw_circle(Vector2.ZERO, 3.0 * grow_t, Color(_color, fade * 0.9))


## 限制全局活跃墨花数量
static var _active_count: int = 0
static var MAX_ACTIVE: int = 30


static func spawn_bloom(parent: Node, position: Vector2, bloom_type: BloomType = BloomType.NORMAL) -> void:
	if _active_count > MAX_ACTIVE:
		return
	_active_count += 1
	var bloom = InkBloom.new(bloom_type)
	bloom.global_position = position
	bloom.tree_exited.connect(func(): _active_count -= 1)
	parent.add_child(bloom)
