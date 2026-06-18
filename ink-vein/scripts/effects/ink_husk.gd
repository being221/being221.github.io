# scripts/effects/ink_husk.gd — 地面墨渍（纯视觉，不做碰撞）
extends Sprite2D
class_name InkHusk

@export var lifetime: float = 8.0
var _elapsed: float = 0.0

static var _tex: ImageTexture = null


static func _ensure_tex() -> void:
	if _tex: return
	var img = Image.create(16, 16, false, Image.FORMAT_RGBA8)
	img.fill(Color(0, 0, 0, 0))
	for y in range(16):
		for x in range(16):
			var d = sqrt((x - 8) * (x - 8) + (y - 8) * (y - 8))
			if d < 7:
				var a = clamp(1.0 - d / 7.0, 0.0, 0.45) * randf_range(0.7, 1.0)
				img.set_pixel(x, y, Color(0.32, 0.31, 0.28, a))
	_tex = ImageTexture.create_from_image(img)


func _ready() -> void:
	top_level = true
	_ensure_tex()
	texture = _tex
	scale = Vector2.ONE * randf_range(0.7, 1.3)
	rotation = randf_range(0, TAU)
	modulate.a = 0.4


func _process(delta: float) -> void:
	_elapsed += delta
	if _elapsed >= lifetime: queue_free(); return
	if _elapsed > lifetime - 2.5:
		modulate.a = lerp(0.4, 0.0, (_elapsed - (lifetime - 2.5)) / 2.5)


static func spawn(parent: Node, position: Vector2) -> void:
	if parent.get_child_count() > 60: return  # 硬防堆积
	var h = InkHusk.new(); h.global_position = position
	parent.add_child(h)
