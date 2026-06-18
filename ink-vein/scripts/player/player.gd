# scripts/player/player.gd
extends CharacterBody2D
class_name Player

## 当前生命值
var health: int = 100
## 最大生命值
var max_health: int = 100
## 当前朝向（鼠标方向归一化向量）
var aim_direction: Vector2 = Vector2.RIGHT
## 是否存活
var is_alive: bool = true

@onready var movement: PlayerMovement = $PlayerMovement
@onready var weapon: Weapon = $Weapon
@onready var ink_surge: InkSurge = $InkSurge


func _ready() -> void:
	add_to_group("player")
	movement.setup(self)


func _physics_process(delta: float) -> void:
	if not is_alive:
		return
	movement.process_move(delta)
	_aim_toward_mouse()

	if Input.is_action_pressed("attack"):
		weapon.attack(aim_direction)

	queue_redraw()


func _draw() -> void:
	if not is_alive:
		return

	# 武器方向指示（纸白色三角）
	var tip = aim_direction * 18.0
	var perp = aim_direction.orthogonal() * 6.0
	var color = Color(0.91, 0.88, 0.83, 1.0)  # 纸白
	draw_colored_polygon(
		PackedVector2Array([tip, -tip * 0.3 + perp, -tip * 0.3 - perp]),
		color
	)

	# 身体（墨色圆）
	draw_circle(Vector2.ZERO, 8.0, Color(0.06, 0.06, 0.09, 0.9))

	# 墨核苍青光点
	var core_glow = Color(0.23, 0.49, 0.65, 0.8)
	draw_circle(Vector2.ZERO, 3.0, core_glow)

	# 血量低时红色预警
	if health < max_health * 0.3:
		draw_circle(Vector2.ZERO, 10.0, Color(0.76, 0.23, 0.17, 0.3))


func _input(event: InputEvent) -> void:
	if event.is_action_pressed("surge") and is_alive:
		ink_surge.trigger_surge()


func _aim_toward_mouse() -> void:
	aim_direction = (get_global_mouse_position() - global_position).normalized()
	if aim_direction.length() < 0.01:
		aim_direction = Vector2.RIGHT
	rotation = aim_direction.angle()


## 受到伤害
func take_damage(amount: int) -> void:
	if not is_alive:
		return
	health = maxi(0, health - amount)
	Events.player_damaged.emit(amount)
	if health <= 0:
		_die()


func _die() -> void:
	is_alive = false
	Events.player_died.emit()
	var tween = create_tween()
	tween.tween_callback(func():
		Events.game_over.emit()
	).set_delay(1.0)
