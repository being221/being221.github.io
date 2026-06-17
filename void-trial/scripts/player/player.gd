extends CharacterBody3D
## 玩家主脚本：WASD 移动 / 鼠标视角 / 射击 / 闪避 / 血量

# ---- 导出属性 ----
@export var move_speed: float = 8.0
@export var mouse_sensitivity: float = 0.002
@export var shoot_cooldown: float = 0.3
@export var dash_distance: float = 3.0
@export var dash_cooldown: float = 1.5
@export var dash_duration: float = 0.2
@export var max_health: float = 100.0
## 子弹场景，在编辑器中拖入 magic_bolt.tscn（Task 4 时设置）
@export var bullet_scene: PackedScene

# ---- 信号 ----
signal health_changed(current: float, maximum: float)
signal dash_cooldown_changed(remaining: float, total: float)
signal player_damaged(amount: float, direction: Vector3)
signal player_died()
signal headshot_landed(hit_position: Vector3)
signal bodyshot_landed(hit_position: Vector3, part: String)
signal shot_fired()

# ---- 内部状态 ----
var current_health: float
var shoot_timer: float = 0.0
var dash_timer: float = 0.0
var is_dashing: bool = false
var is_dead: bool = false
var debug_collisions_visible: bool = false

# ---- 节点引用 ----
@onready var camera: Camera3D = $Camera3D
@onready var shoot_origin: Marker3D = $Camera3D/ShootOrigin


func _ready() -> void:
	current_health = max_health
	Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)
	add_to_group("player")

	# 触发首波敌人（Task 8 时生效）
	await get_tree().process_frame
	var wave_mgr := get_tree().get_first_node_in_group("wave_manager")
	if wave_mgr and wave_mgr.has_method("start_first_wave"):
		wave_mgr.start_first_wave()


func _input(event: InputEvent) -> void:
	if is_dead:
		return

	# 鼠标视角旋转
	if event is InputEventMouseMotion and Input.get_mouse_mode() == Input.MOUSE_MODE_CAPTURED:
		rotate_y(-event.relative.x * mouse_sensitivity)
		camera.rotate_x(-event.relative.y * mouse_sensitivity)
		camera.rotation.x = clamp(camera.rotation.x, deg_to_rad(-89.0), deg_to_rad(89.0))

	# F1 切换碰撞线框
	if event.is_action_pressed("debug_toggle"):
		debug_collisions_visible = not debug_collisions_visible
		get_viewport().debug_draw = (
			Viewport.DEBUG_DRAW_WIREFRAME if debug_collisions_visible
			else Viewport.DEBUG_DRAW_DISABLED
		)

		# Esc 释放/锁定鼠标
	if event.is_action_pressed("ui_cancel"):
		if Input.get_mouse_mode() == Input.MOUSE_MODE_CAPTURED:
			Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
		else:
			Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)


func _physics_process(delta: float) -> void:
	if is_dead:
		return

	# 更新冷却
	shoot_timer = max(0.0, shoot_timer - delta)
	dash_timer = max(0.0, dash_timer - delta)

	# ---- 移动 ----
	var input_dir := Input.get_vector("move_left", "move_right", "move_forward", "move_back")
	var direction := (transform.basis * Vector3(input_dir.x, 0, input_dir.y)).normalized()

	if not is_dashing:
		velocity.x = direction.x * move_speed
		velocity.z = direction.z * move_speed
		if not is_on_floor():
			velocity.y -= 9.8 * delta
		else:
			velocity.y = -0.1

	move_and_slide()

	# 平台掉落检测
	if global_position.y < -5.0:
		current_health = 0
		_die()

	# ---- 射击 ----
	if Input.is_action_pressed("shoot") and shoot_timer <= 0.0 and bullet_scene != null:
		_shoot()

	# ---- 闪避 ----
	if Input.is_action_just_pressed("dash") and dash_timer <= 0.0 and not is_dashing and direction.length() > 0.01:
		_dash(direction)

	dash_cooldown_changed.emit(dash_timer, dash_cooldown)


func _shoot() -> void:
	shoot_timer = shoot_cooldown
	shot_fired.emit()
	var bullet := bullet_scene.instantiate()
	get_tree().root.add_child(bullet)
	bullet.global_position = shoot_origin.global_position
	# 直接用相机方向设速度，避开实例化时 basis 未就绪的问题
	var shoot_dir := -camera.global_transform.basis.z
	if bullet.has_method("set_shoot_direction"):
		bullet.set_shoot_direction(shoot_dir)
	else:
		bullet.linear_velocity = shoot_dir * 40.0


func _dash(direction: Vector3) -> void:
	is_dashing = true
	dash_timer = dash_cooldown

	# 屏幕边缘蓝色闪光
	var dash_effect := ColorRect.new()
	dash_effect.color = Color(0.3, 0.5, 1.0, 0.15)
	dash_effect.size = Vector2(2000, 2000)
	dash_effect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	camera.add_child(dash_effect)

	var tween := create_tween()
	tween.tween_property(self, "global_position",
		global_position + direction * dash_distance, dash_duration)
	tween.tween_callback(dash_effect.queue_free)

	await tween.finished
	is_dashing = false


func take_damage(amount: float, source_position: Vector3) -> void:
	if is_dashing or is_dead:
		return
	current_health -= amount
	var hit_dir := (global_position - source_position).normalized()
	player_damaged.emit(amount, hit_dir)
	health_changed.emit(current_health, max_health)

	if current_health <= 0:
		_die()


func _die() -> void:
	is_dead = true
	Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
	player_died.emit()
