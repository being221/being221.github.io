# scripts/systems/enemy_spawner.gd
extends Node2D
class_name EnemySpawner

@export var max_enemies: int = 30
@export var spawn_interval: float = 2.0

var _spawn_timer: float = 0.0
var _enemy_container: Node2D
var _float_scene: PackedScene = preload("res://scenes/enemies/ink_float.tscn")
var _crawl_scene: PackedScene = preload("res://scenes/enemies/ink_crawl.tscn")
var _burst_scene: PackedScene = preload("res://scenes/enemies/ink_burst.tscn")


func _ready() -> void:
	_enemy_container = Node2D.new()
	_enemy_container.name = "Enemies"
	add_child(_enemy_container)
	Events.enemy_killed.connect(_on_enemy_killed)


func _on_enemy_killed(enemy: Enemy, pos: Vector2) -> void:
	# 生成墨花 + 墨骸
	InkBloom.spawn_bloom(_enemy_container, pos, InkBloom.BloomType.NORMAL)
	InkHusk.spawn(_enemy_container, pos)


func _process(delta: float) -> void:
	_spawn_timer += delta
	if _spawn_timer >= spawn_interval:
		_spawn_timer = 0.0
		if _enemy_container.get_child_count() < max_enemies:
			_spawn_one()


func _spawn_one() -> void:
	var r = randf()
	var scene: PackedScene
	if r < 0.5:
		scene = _float_scene
	elif r < 0.8:
		scene = _crawl_scene
	else:
		scene = _burst_scene
	var enemy = scene.instantiate()
	enemy.global_position = _random_spawn_position()
	_enemy_container.add_child(enemy)


func _random_spawn_position() -> Vector2:
	var player = get_tree().get_first_node_in_group("player")
	var center = player.global_position if player else Vector2.ZERO
	var side = randi() % 4
	var pos: Vector2
	match side:
		0: pos = center + Vector2(randf_range(-400, 400), -250)
		1: pos = center + Vector2(randf_range(-400, 400), 250)
		2: pos = center + Vector2(-500, randf_range(-300, 300))
		3: pos = center + Vector2(500, randf_range(-300, 300))
	return pos
