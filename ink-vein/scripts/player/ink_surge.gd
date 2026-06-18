# scripts/player/ink_surge.gd
extends Node
class_name InkSurge

## 每段需要的墨能
@export var charge_per_segment: float = 100.0
## 最大段数
@export var max_segments: int = 3
## 爆发范围
@export var surge_radius: float = 300.0
## 爆发伤害
@export var surge_damage: int = 50
## 自动爆发等待时间（秒），0=手动
@export var auto_surge_delay: float = 3.0

var ink_charge: float = 0.0
var segments: int = 0
var _auto_timer: float = 0.0
var _can_gain_charge: bool = true

signal premonition_changed(level: int)  # 0=none, 1=1/3, 2=2/3, 3=3/3

@onready var player: Player = owner


func _ready() -> void:
	Events.enemy_killed.connect(_on_enemy_killed)


func _on_enemy_killed(enemy: Enemy, _pos: Vector2) -> void:
	if not _can_gain_charge:
		return
	_add_charge(enemy.ink_charge_on_kill)


func _add_charge(amount: float) -> void:
	ink_charge += amount
	if ink_charge >= charge_per_segment and segments < max_segments:
		ink_charge -= charge_per_segment
		segments += 1
		Events.ink_surge_changed.emit(segments, max_segments)
		premonition_changed.emit(segments)
		if segments >= max_segments:
			_full_charged()


func _full_charged() -> void:
	_auto_timer = 0.0
	premonition_changed.emit(3)


func _process(delta: float) -> void:
	if segments >= max_segments and auto_surge_delay > 0:
		_auto_timer += delta
		if _auto_timer >= auto_surge_delay:
			trigger_surge()


func trigger_surge() -> void:
	if segments <= 0:
		return

	var surge_segments = segments
	segments = 0
	ink_charge = 0.0
	_auto_timer = 0.0
	premonition_changed.emit(0)
	Events.ink_surge_changed.emit(0, max_segments)

	Events.ink_surge_triggered.emit()
	Events.hit_stop_requested.emit(8)
	Events.screen_shake_requested.emit(0.8)
	# 爆发粒子
	InkParticles.spawn_surge(player.get_parent(), player.global_position)

	# 全屏清场
	var space = player.get_world_2d().direct_space_state
	var query = PhysicsShapeQueryParameters2D.new()
	var circle = CircleShape2D.new()
	circle.radius = surge_radius * surge_segments
	query.shape = circle
	query.transform = Transform2D(0, player.global_position)
	query.collision_mask = 2  # enemy body layer
	var results = space.intersect_shape(query)

	for result in results:
		var body = result.get("collider")
		if body and body.has_method("take_damage") and body is Enemy:
			body.take_damage(surge_damage * surge_segments)

	# 虚弱期：3秒无法积墨
	_can_gain_charge = false
	await get_tree().create_timer(3.0).timeout
	_can_gain_charge = true
