# scripts/systems/enemy_spawner.gd
extends Node2D
class_name EnemySpawner

@export var max_enemies: int = 15
@export var spawn_interval: float = 1.8
@export var spawn_distance: float = 500.0
const CLEANUP_DIST: float = 850.0

var _spawn_timer: float = 0.0
var _cleanup_timer: float = 0.0
var _container: Node2D
var _float_scene: PackedScene = preload("res://scenes/enemies/ink_float.tscn")
var _crawl_scene: PackedScene = preload("res://scenes/enemies/ink_crawl.tscn")
var _burst_scene: PackedScene = preload("res://scenes/enemies/ink_burst.tscn")


func _ready() -> void:
	_container = Node2D.new(); _container.name = "Enemies"
	add_child(_container)
	DamageNumber.set_parent(get_parent())  # 伤害数字挂在 Game 节点
	Events.enemy_killed.connect(_on_kill)
	for i in range(5): _spawn_one()


func _on_kill(_e: Enemy, pos: Vector2) -> void:
	InkParticles.spawn(_container, pos)
	InkHusk.spawn(_container, pos)


func _process(delta: float) -> void:
	_spawn_timer += delta
	_cleanup_timer += delta

	if _spawn_timer >= spawn_interval:
		_spawn_timer = 0.0
		var alive = 0
		for c in _container.get_children():
			if c is Enemy and not c._is_dying: alive += 1
		if alive < max_enemies:
			_spawn_one()

	if _cleanup_timer > 2.5:
		_cleanup_timer = 0.0
		_cleanup()


func _spawn_one() -> void:
	var r = randf()
	var scene = _float_scene if r < 0.58 else (_crawl_scene if r < 0.85 else _burst_scene)
	var e = scene.instantiate()
	e.global_position = _random_pos()
	_container.add_child(e)


func _random_pos() -> Vector2:
	var p = get_tree().get_first_node_in_group("player")
	var c = p.global_position if p else Vector2.ZERO
	return c + Vector2.RIGHT.rotated(randf() * TAU) * spawn_distance * randf_range(0.8, 1.2)


func _cleanup() -> void:
	var p = get_tree().get_first_node_in_group("player")
	if not p: return
	var pos = p.global_position
	for child in _container.get_children():
		if not is_instance_valid(child): continue
		var d2 = child.global_position.distance_squared_to(pos)
		if d2 > CLEANUP_DIST * CLEANUP_DIST:
			if child is Enemy and child._is_dying:
				child.queue_free()
			elif child is InkHusk and child._elapsed > 4.0:
				child.queue_free()
