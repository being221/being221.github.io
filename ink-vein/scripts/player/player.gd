# scripts/player/player.gd
extends CharacterBody2D
class_name Player

var health: int = 100
var max_health: int = 100
var aim_direction: Vector2 = Vector2.RIGHT
var is_alive: bool = true
var _draw_counter: int = 0

@onready var movement: PlayerMovement = $PlayerMovement
@onready var weapon: Weapon = $Weapon
@onready var ink_surge: InkSurge = $InkSurge


func _ready() -> void:
	add_to_group("player")
	movement.setup(self)


func _physics_process(delta: float) -> void:
	if not is_alive: return
	movement.process_move(delta)
	_aim_toward_mouse()
	if Input.is_action_pressed("attack"):
		weapon.attack(aim_direction)
	_draw_counter += 1
	if _draw_counter >= 3:
		_draw_counter = 0
		queue_redraw()


func _draw() -> void:
	if not is_alive: return

	var dir = aim_direction
	var side = dir.orthogonal()
	var back = -dir

	# === 墨刃（武器方向） ===
	var blade_color = Color(0.91, 0.88, 0.83, 0.9)
	# 弧形刀身
	var blade_points = PackedVector2Array([
		dir * 5,                         # 刀刃根部
		dir * 18 + side * 3,             # 刀尖
		dir * 14,                        # 刀背
		dir * 5 + side * (-2),           # 刀背根部
	])
	draw_colored_polygon(blade_points, blade_color)
	# 刀刃亮线
	draw_line(dir * 6, dir * 17 + side * 2.5, Color(1.0, 0.97, 0.92, 0.6), 1.0)

	# === 身体轮廓 ===
	var body_color = Color(0.06, 0.06, 0.10, 0.92)
	# 头
	draw_circle(Vector2.ZERO, 6.0, body_color)
	# 躯干
	var torso = PackedVector2Array([
		back * 5 + side * 4.5,
		back * (-7) + side * 4.5,
		back * (-7) + side * (-4.5),
		back * 5 + side * (-4.5),
	])
	draw_colored_polygon(torso, body_color)
	# 肩膀线条
	draw_line(side * (-5), side * 5, Color(0.91, 0.88, 0.83, 0.4), 1.5)

	# === 墨核 ===
	var core_brightness = 1.0
	if ink_surge and ink_surge.segments > 0:
		core_brightness = 1.0 + ink_surge.segments * 0.5
	var core = Color(0.23, 0.49, 0.65, 0.7 * core_brightness)
	draw_circle(back * (-3), 2.5, core)
	draw_circle(back * (-3), 4.5, Color(0.23, 0.49, 0.65, 0.2 * core_brightness))

	# === 低血预警 ===
	if health < max_health * 0.35:
		var warn_pulse = sin(Time.get_ticks_msec() * 0.008) * 0.3 + 0.4
		draw_circle(Vector2.ZERO, 11.0, Color(0.76, 0.17, 0.15, warn_pulse))

	# === 移动方向残影（WASD指示） ===
	if movement.velocity.length() > 10:
		var move_dir = movement.velocity.normalized()
		draw_line(Vector2.ZERO, move_dir * 14, Color(0.91, 0.88, 0.83, 0.15), 2.0)


func _input(event: InputEvent) -> void:
	if event.is_action_pressed("surge") and is_alive:
		ink_surge.trigger_surge()


func _aim_toward_mouse() -> void:
	aim_direction = (get_global_mouse_position() - global_position).normalized()
	if aim_direction.length() < 0.01: aim_direction = Vector2.RIGHT
	rotation = aim_direction.angle()


func take_damage(amount: int) -> void:
	if not is_alive: return
	health = maxi(0, health - amount)
	Events.player_damaged.emit(amount)
	if health <= 0: _die()


func _die() -> void:
	is_alive = false
	Events.player_died.emit()
	var tween = create_tween()
	tween.tween_callback(func(): Events.game_over.emit()).set_delay(1.0)
