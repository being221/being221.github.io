# scripts/effects/ink_particles.gd
extends Node2D
class_name InkParticles

static var _mat_kill: ParticleProcessMaterial
static var _mat_surge: ParticleProcessMaterial
static var _tex: ImageTexture
static var _count: int = 0


static func _ensure_cache() -> void:
	if _mat_kill: return
	# 击杀粒子材质
	_mat_kill = ParticleProcessMaterial.new()
	_mat_kill.spread = 180.0
	_mat_kill.initial_velocity_min = 50.0
	_mat_kill.initial_velocity_max = 140.0
	_mat_kill.gravity = Vector3(0, 35, 0)
	_mat_kill.scale_min = 0.6; _mat_kill.scale_max = 2.0
	_mat_kill.color = Color(0.91, 0.88, 0.83, 0.7)
	_mat_kill.color_ramp = _ramp(Color(0.91, 0.88, 0.83))
	# 爆发粒子材质
	_mat_surge = ParticleProcessMaterial.new()
	_mat_surge.spread = 180.0
	_mat_surge.initial_velocity_min = 100.0
	_mat_surge.initial_velocity_max = 350.0
	_mat_surge.gravity = Vector3(0, 15, 0)
	_mat_surge.scale_min = 0.8; _mat_surge.scale_max = 3.5
	_mat_surge.color = Color(0.23, 0.49, 0.65, 0.8)
	# 贴图
	var img = Image.create(8, 8, false, Image.FORMAT_RGBA8)
	img.fill(Color(1, 1, 1, 1))
	_tex = ImageTexture.create_from_image(img)


static func _ramp(c: Color) -> Gradient:
	var g = Gradient.new()
	g.colors = PackedColorArray([c, Color(c, 0.0)])
	g.offsets = PackedFloat32Array([0.0, 1.0])
	return g


static func spawn(parent: Node, pos: Vector2) -> void:
	if _count > 25: return
	_ensure_cache()
	_count += 1
	var p = GPUParticles2D.new()
	p.top_level = true; p.global_position = pos
	p.one_shot = true; p.amount = 10; p.lifetime = 0.45
	p.process_material = _mat_kill; p.texture = _tex
	p.finished.connect(func(): _count -= 1; p.queue_free())
	parent.add_child(p); p.emitting = true


static func spawn_surge(parent: Node, pos: Vector2) -> void:
	_ensure_cache()
	var p = GPUParticles2D.new()
	p.top_level = true; p.global_position = pos
	p.one_shot = true; p.amount = 50; p.lifetime = 0.7
	p.process_material = _mat_surge; p.texture = _tex
	p.finished.connect(p.queue_free)
	parent.add_child(p); p.emitting = true
