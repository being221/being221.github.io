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
	# 画面边缘墨染吞噬
	var tween = create_tween()
	tween.tween_callback(func():
		Events.game_over.emit()
	).set_delay(1.0)
