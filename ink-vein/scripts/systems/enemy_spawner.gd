# scripts/systems/enemy_spawner.gd
extends Node2D
class_name EnemySpawner

@export var max_enemies: int = 25
@export var spawn_interval: float = 1.5
@export var spawn_distance: float = 500.0
@export var cleanup_distance: float = 900.0  # 超过此距离清除

var _spawn_timer: float = 0.0
var _enemy_container: Node2D
var _float_scene: PackedScene = preload("res://scenes/enemies/ink_float.tscn")
var _crawl_scene: PackedScene = preload("res://scenes/enemies/ink_crawl.tscn")
var _burst_scene: PackedScene = preload("res://scenes/enemies/ink_burst.tscn")
var _cleanup_timer: float = 0.0


func _ready() -> void:
	_enemy_container = Node2D.new()
	_enemy_container.name = "Enemies"
	add_child(_enemy_container)
	Events.enemy_killed.connect(_on_enemy_killed)
	# 开局直接出怪
	for i in range(6):
		_spawn_one()


func _on_enemy_killed(enemy: Enemy, pos: Vector2) -> void:
	InkParticles.spawn(_enemy_container, pos)
	InkHusk.spawn(_enemy_container, pos)


func _process(delta: float) -> void:
	_spawn_timer += delta
	_cleanup_timer += delta

	# 生成
	if _spawn_timer >= spawn_interval:
		_spawn_timer = 0.0
		var enemy_count = 0
		for c in _enemy_container.get_children():
			if c is Enemy and not c._is_dying:
				enemy_count += 1
		if enemy_count < max_enemies:
			_spawn_one()

	# 定期清理离屏敌人和旧墨骸
	if _cleanup_timer > 3.0:
		_cleanup_timer = 0.0
		_cleanup_distant()


func _spawn_one() -> void:
	var r = randf()
	var scene: PackedScene
	if r < 0.55:
		scene = _float_scene
	elif r < 0.85:
		scene = _crawl_scene
	else:
		scene = _burst_scene
	var enemy = scene.instantiate()
	enemy.global_position = _random_spawn_position()
	_enemy_container.add_child(enemy)


func _random_spawn_position() -> Vector2:
	var player = get_tree().get_first_node_in_group("player")
	var center = player.global_position if player else Vector2.ZERO
	var angle = randf() * TAU
	return center + Vector2.RIGHT.rotated(angle) * spawn_distance * randf_range(0.8, 1.2)


func _cleanup_distant() -> void:
	var player = get_tree().get_first_node_in_group("player")
	if not player:
		return
	var pos = player.global_position
	for child in _enemy_container.get_children():
		if child.global_position.distance_squared_to(pos) > cleanup_distance * cleanup_distance:
			if child is Enemy and child._is_dying:
				child.queue_free()
			elif child is InkHusk and child._elapsed > 5.0:
				child.queue_free()
