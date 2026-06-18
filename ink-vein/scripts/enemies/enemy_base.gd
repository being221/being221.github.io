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
var _body_radius: float = 8.0
var _draw_frame: int = 0  # 隔帧绘制优化

@onready var hurtbox_area: Area2D = $HurtboxArea


func _ready() -> void:
	health = max_health
	hurtbox_area.body_entered.connect(_on_hurtbox_body_entered)
	_player_ref = get_tree().get_first_node_in_group("player")


func _physics_process(delta: float) -> void:
	if not _player_ref or not _player_ref.is_alive:
		return
	_move_toward_player(delta)

	# 只隔3帧重绘一次，25个敌人从25次/帧降到~8次/帧
	_draw_frame = (_draw_frame + 1) % 3
	if _draw_frame == 0:
		queue_redraw()


func _move_toward_player(_delta: float) -> void:
	var direction = (_player_ref.global_position - global_position).normalized()
	velocity = direction * move_speed
	move_and_slide()


func _draw() -> void:
	if _is_dying:
		return
	draw_circle(Vector2.ZERO, _body_radius, _enemy_color)
	draw_circle(Vector2.ZERO, _body_radius * 0.35, Color(0.23, 0.49, 0.65, 0.7))
	draw_arc(Vector2.ZERO, _body_radius, 0, TAU, 16, _enemy_color.lightened(0.15), 1.0)


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
