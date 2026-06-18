# scripts/enemies/enemy_base.gd
extends CharacterBody2D
class_name Enemy

@export var enemy_id: String = ""
@export var max_health: int = 20
@export var move_speed: float = 80.0
@export var ink_charge_on_kill: float = 10.0
@export var contact_damage: int = 5

var health: int
var _player_ref: Player = null
var _is_dying: bool = false
var _enemy_color: Color = Color(0.91, 0.88, 0.83, 0.85)
var _draw_counter: int = 0

@onready var hurtbox_area: Area2D = $HurtboxArea


func _ready() -> void:
	health = max_health
	hurtbox_area.body_entered.connect(_on_hurtbox_body_entered)
	_player_ref = get_tree().get_first_node_in_group("player")


func _physics_process(delta: float) -> void:
	if not _player_ref or not _player_ref.is_alive:
		return
	_move_toward_player(delta)
	_draw_counter += 1
	if _draw_counter >= 4:  # 每4帧才重绘
		_draw_counter = 0
		queue_redraw()


func _move_toward_player(_delta: float) -> void:
	var dir = (_player_ref.global_position - global_position).normalized()
	velocity = dir * move_speed
	move_and_slide()


# 基类不做 _draw —— 子类各自画，避免基类浪费


func take_damage(amount: int) -> void:
	if _is_dying:
		return
	health -= amount
	modulate = Color.RED
	var tween = create_tween()
	tween.tween_property(self, "modulate", Color.WHITE, 0.08)
	if health <= 0:
		_die()


func _die() -> void:
	_is_dying = true
	Events.enemy_killed.emit(self, global_position)
	queue_free()


func _on_hurtbox_body_entered(body: Node2D) -> void:
	if body is Player:
		body.take_damage(contact_damage)
