# scripts/effects/ink_particles.gd
## 击杀粒子特效 — 使用 GPUParticles2D 代替 draw 墨花，性能更好
extends Node2D
class_name InkParticles


static func spawn(parent: Node, pos: Vector2, color: Color = Color(0.91, 0.88, 0.83), count: int = 12) -> void:
	var particles = GPUParticles2D.new()
	particles.top_level = true
	particles.global_position = pos
	particles.one_shot = true
	particles.explosiveness = 1.0
	particles.amount = count
	particles.lifetime = 0.5
	particles.finished.connect(particles.queue_free)

	# 材质
	var mat = ParticleProcessMaterial.new()
	mat.direction = Vector3(0, -1, 0)
	mat.spread = 180.0
	mat.initial_velocity_min = 60.0
	mat.initial_velocity_max = 180.0
	mat.gravity = Vector3(0, 40, 0)
	mat.scale_min = 0.8
	mat.scale_max = 2.5
	mat.color = color
	mat.color.a = 0.8
	mat.color_ramp = _make_color_ramp(color)
	mat.scale_curve = _make_scale_curve()
	particles.process_material = mat

	# 墨滴贴图（程序生成小圆点）
	var img = Image.create(8, 8, false, Image.FORMAT_RGBA8)
	img.fill(Color(1, 1, 1, 1))
	var tex = ImageTexture.create_from_image(img)
	particles.texture = tex

	parent.add_child(particles)
	particles.emitting = true


static func spawn_surge(parent: Node, pos: Vector2) -> void:
	var particles = GPUParticles2D.new()
	particles.top_level = true
	particles.global_position = pos
	particles.one_shot = true
	particles.explosiveness = 1.0
	particles.amount = 60
	particles.lifetime = 0.8
	particles.finished.connect(particles.queue_free)

	var mat = ParticleProcessMaterial.new()
	mat.direction = Vector3(0, -1, 0)
	mat.spread = 180.0
	mat.initial_velocity_min = 120.0
	mat.initial_velocity_max = 400.0
	mat.gravity = Vector3(0, 20, 0)
	mat.scale_min = 1.0
	mat.scale_max = 4.0
	mat.color = Color(0.23, 0.49, 0.65, 0.9)  # 苍青
	particles.process_material = mat

	var img = Image.create(8, 8, false, Image.FORMAT_RGBA8)
	img.fill(Color(1, 1, 1, 1))
	particles.texture = ImageTexture.create_from_image(img)

	parent.add_child(particles)
	particles.emitting = true


static func _make_color_ramp(color: Color) -> Gradient:
	var g = Gradient.new()
	g.colors = PackedColorArray([color, Color(color, 0.0)])
	g.offsets = PackedFloat32Array([0.0, 1.0])
	return g


static func _make_scale_curve() -> Curve:
	var c = Curve.new()
	c.add_point(Vector2(0, 1.0))
	c.add_point(Vector2(0.3, 1.3))
	c.add_point(Vector2(1.0, 0.0))
	return c
