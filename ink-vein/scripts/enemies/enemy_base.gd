# scripts/enemies/enemy_base.gd
extends CharacterBody2D
class_name Enemy

## 敌人 ID（用于图鉴）
@export var enemy_id: String = ""
## 生命值
@export var max_health: int = 20
## 移动速度
@export var move_speed: float = 80.0
## 击杀提供的涨墨值
@export var ink_charge_on_kill: float = 10.0
## 接触伤害
@export var contact_damage: int = 5

var health: int
var _player_ref: Player = null
var _is_dying: bool = false

@onready var hurtbox_area: Area2D = $HurtboxArea


func _ready() -> void:
	health = max_health
	hurtbox_area.body_entered.connect(_on_hurtbox_body_entered)
	_player_ref = get_tree().get_first_node_in_group("player")


func _physics_process(delta: float) -> void:
	if not _player_ref or not _player_ref.is_alive:
		return
	_move_toward_player(delta)


func _move_toward_player(_delta: float) -> void:
	var direction = (_player_ref.global_position - global_position).normalized()
	velocity = direction * move_speed
	move_and_slide()


func take_damage(amount: int) -> void:
	if _is_dying:
		return
	health -= amount
	# 受击后仰
	var tween = create_tween()
	tween.tween_property(self, "modulate", Color.RED, 0.05)
	tween.tween_property(self, "modulate", Color.WHITE, 0.1)
	if health <= 0:
		_die()


func _die() -> void:
	_is_dying = true
	Events.enemy_killed.emit(self, global_position)
	queue_free()


func _on_hurtbox_body_entered(body: Node2D) -> void:
	if body is Player:
		body.take_damage(contact_damage)
