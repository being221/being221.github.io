# scripts/effects/ink_husk.gd
extends Sprite2D
class_name InkHusk

@export var lifetime: float = 12.0
@export var slow_radius: float = 32.0
@export var slow_amount: float = 0.25

var _elapsed: float = 0.0
var _slowed_bodies: Array[Node2D] = []

# 全局缓存纹理，只生成一次
static var _cached_texture: ImageTexture = null


static func _ensure_texture() -> void:
	if _cached_texture:
		return
	var image = Image.create(32, 32, false, Image.FORMAT_RGBA8)
	image.fill(Color(0, 0, 0, 0))
	var cx = 16; var cy = 16
	for y in range(32):
		for x in range(32):
			var d = sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy))
			if d < 13:
				var a = clamp(1.0 - d / 13.0, 0.0, 0.5) * randf_range(0.7, 1.0)
				image.set_pixel(x, y, Color(0.35, 0.34, 0.31, a))
	_cached_texture = ImageTexture.create_from_image(image)


func _ready() -> void:
	top_level = true
	_ensure_texture()
	texture = _cached_texture
	scale = Vector2.ONE * randf_range(0.7, 1.3)
	rotation = randf_range(0, TAU)
	modulate.a = 0.5

	# 减速区域
	var area = Area2D.new()
	var shape = CollisionShape2D.new()
	var circle = CircleShape2D.new()
	circle.radius = slow_radius
	shape.shape = circle
	area.add_child(shape)
	add_child(area)
	area.collision_layer = 0
	area.collision_mask = 2
	area.body_entered.connect(_on_enter)
	area.body_exited.connect(_on_exit)


func _process(delta: float) -> void:
	_elapsed += delta
	if _elapsed >= lifetime:
		_cleanup()
		queue_free()
		return
	if _elapsed > lifetime - 3.0:
		modulate.a = lerp(0.5, 0.0, (_elapsed - (lifetime - 3.0)) / 3.0)


func _on_enter(body: Node2D) -> void:
	if body is Enemy and not body in _slowed_bodies:
		_slowed_bodies.append(body)
		body.move_speed *= (1.0 - slow_amount)


func _on_exit(body: Node2D) -> void:
	if body in _slowed_bodies:
		_slowed_bodies.erase(body)
		if is_instance_valid(body):
			body.move_speed /= (1.0 - slow_amount)


func _cleanup() -> void:
	for body in _slowed_bodies:
		if is_instance_valid(body) and body is Enemy:
			body.move_speed /= (1.0 - slow_amount)
	_slowed_bodies.clear()


static func spawn(parent: Node, position: Vector2) -> void:
	var husk = InkHusk.new()
	husk.global_position = position
	parent.add_child(husk)
