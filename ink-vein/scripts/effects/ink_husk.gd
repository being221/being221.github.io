# scripts/effects/ink_husk.gd
extends Sprite2D
class_name InkHusk

@export var lifetime: float = 15.0
@export var slow_radius: float = 40.0
@export var slow_amount: float = 0.3  # 敌人减速 30%

var _elapsed: float = 0.0
var _area: Area2D
var _slowed_bodies: Array[Node2D] = []


func _ready() -> void:
	top_level = true
	# 绘制圆形墨渍
	var image = Image.create(64, 64, false, Image.FORMAT_RGBA8)
	image.fill(Color(0, 0, 0, 0))
	for y in range(64):
		for x in range(64):
			var dx = x - 32
			var dy = y - 32
			var d = sqrt(dx * dx + dy * dy)
			if d < 28:
				var alpha = clamp(1.0 - d / 28.0, 0.0, 0.6)
				alpha *= randf_range(0.8, 1.0)  # 自然纹理
				image.set_pixel(x, y, Color(0, 0, 0, alpha))
	var tex = ImageTexture.create_from_image(image)
	texture = tex
	scale = Vector2.ONE * randf_range(0.8, 1.2)
	rotation = randf_range(0, TAU)
	modulate.a = 0.6

	# 减速区域
	_area = Area2D.new()
	var shape = CollisionShape2D.new()
	var circle = CircleShape2D.new()
	circle.radius = slow_radius
	shape.shape = circle
	_area.add_child(shape)
	add_child(_area)
	_area.collision_layer = 0
	_area.collision_mask = 2  # enemies layer

	_area.body_entered.connect(_on_body_entered)
	_area.body_exited.connect(_on_body_exited)


func _process(delta: float) -> void:
	_elapsed += delta
	if _elapsed >= lifetime:
		_cleanup_slows()
		queue_free()
		return
	if _elapsed > lifetime - 3.0:
		modulate.a = lerp(0.6, 0.0, (_elapsed - (lifetime - 3.0)) / 3.0)


func _on_body_entered(body: Node2D) -> void:
	if body is Enemy and not body in _slowed_bodies:
		_slowed_bodies.append(body)
		body.move_speed *= (1.0 - slow_amount)


func _on_body_exited(body: Node2D) -> void:
	if body in _slowed_bodies:
		_slowed_bodies.erase(body)
		body.move_speed /= (1.0 - slow_amount)


func _cleanup_slows() -> void:
	for body in _slowed_bodies:
		if is_instance_valid(body) and body is Enemy:
			body.move_speed /= (1.0 - slow_amount)
	_slowed_bodies.clear()


## 静态工厂
static func spawn(parent: Node, position: Vector2) -> void:
	var husk = InkHusk.new()
	husk.global_position = position
	parent.add_child(husk)
