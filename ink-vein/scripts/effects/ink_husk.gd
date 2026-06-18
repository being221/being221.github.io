# scripts/effects/ink_husk.gd
extends Sprite2D
class_name InkHusk

@export var lifetime: float = 10.0
@export var slow_amount: float = 0.25

var _elapsed: float = 0.0
var _slowed_bodies: Array[Node2D] = []

static var _cached_texture: ImageTexture = null
static var _cached_circle: CircleShape2D = null


static func _ensure_cache() -> void:
	if _cached_texture:
		return
	# 贴图
	var image = Image.create(16, 16, false, Image.FORMAT_RGBA8)
	image.fill(Color(0, 0, 0, 0))
	for y in range(16):
		for x in range(16):
			var d = sqrt((x - 8) * (x - 8) + (y - 8) * (y - 8))
			if d < 7:
				var a = clamp(1.0 - d / 7.0, 0.0, 0.5) * randf_range(0.7, 1.0)
				image.set_pixel(x, y, Color(0.35, 0.34, 0.31, a))
	_cached_texture = ImageTexture.create_from_image(image)
	# 碰撞形状
	_cached_circle = CircleShape2D.new()
	_cached_circle.radius = 30.0


func _ready() -> void:
	top_level = true
	_ensure_cache()
	texture = _cached_texture
	scale = Vector2.ONE * randf_range(0.7, 1.3)
	rotation = randf_range(0, TAU)
	modulate.a = 0.45

	# 减速区域
	var area = Area2D.new()
	var shape = CollisionShape2D.new()
	shape.shape = _cached_circle  # 复用同一个 CircleShape2D
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
		modulate.a = lerp(0.45, 0.0, (_elapsed - (lifetime - 3.0)) / 3.0)


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
