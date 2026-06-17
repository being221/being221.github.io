extends RigidBody3D
## 玩家魔法弹 — 向前直线飞行，碰撞敌人后销毁

signal hit_enemy(hit_position: Vector3, hit_part: String)

const SPEED: float = 40.0
const LIFETIME: float = 3.0

var lifetime_timer: float = 0.0
var _dying: bool = false


func set_shoot_direction(dir: Vector3) -> void:
	linear_velocity = dir * SPEED
	# 让子弹梭形沿飞行方向拉长
	look_at(global_position + dir, Vector3.UP)


func _ready() -> void:
	# 如果 player 没调 set_shoot_direction（兜底），用自身朝向
	if linear_velocity.length() < 1.0:
		linear_velocity = -global_transform.basis.z * SPEED

	body_entered.connect(_on_body_entered)

	if has_node("Detector"):
		var detector: Area3D = $Detector
		detector.area_entered.connect(_on_area_entered)


func _physics_process(delta: float) -> void:
	lifetime_timer += delta
	if lifetime_timer > LIFETIME:
		queue_free()
	linear_velocity = linear_velocity.normalized() * SPEED


func _on_body_entered(_body: Node3D) -> void:
	if _dying:
		return
	_dying = true
	_die()


func _on_area_entered(area: Area3D) -> void:
	if _dying:
		return
	_dying = true

	var hit_part := "body"
	if area.is_in_group("head"):
		hit_part = "head"
	elif area.is_in_group("arm") or area.is_in_group("leg"):
		hit_part = "limb"

	hit_enemy.emit(area.global_position, hit_part)

	var parent := area.get_parent()
	if parent and parent.has_method("take_damage_from_bullet"):
		parent.take_damage_from_bullet(hit_part, global_position)

	# 爆头弹道残留
	if hit_part == "head":
		_show_golden_trail()

	_die()


func _show_golden_trail() -> void:
	var trail_mesh := MeshInstance3D.new()
	var cyl := CylinderMesh.new()
	cyl.top_radius = 0.03
	cyl.bottom_radius = 0.03
	cyl.height = 1.0
	trail_mesh.mesh = cyl

	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color.GOLD
	mat.emission_enabled = true
	mat.emission = Color.GOLD
	mat.emission_energy_multiplier = 5.0
	trail_mesh.material_override = mat

	get_tree().root.add_child(trail_mesh)
	trail_mesh.global_position = global_position
	trail_mesh.look_at(global_position + global_transform.basis.z)

	var tween := create_tween()
	tween.tween_interval(0.5)
	tween.tween_property(mat, "emission_energy_multiplier", 0.0, 0.3)
	tween.tween_callback(trail_mesh.queue_free)


func _die() -> void:
	collision_layer = 0
	collision_mask = 0
	queue_free()
