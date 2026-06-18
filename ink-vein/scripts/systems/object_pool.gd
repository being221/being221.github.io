# scripts/systems/object_pool.gd
class_name ObjectPool
extends Node

var _scene: PackedScene
var _pool: Array[Node] = []
var _active: Array[Node] = []


func setup(scene: PackedScene, preload_count: int = 10) -> void:
	_scene = scene
	for i in range(preload_count):
		var obj = _scene.instantiate()
		add_child(obj)
		obj.process_mode = Node.PROCESS_MODE_DISABLED
		obj.visible = false
		_pool.append(obj)


func acquire() -> Node:
	var obj: Node
	if _pool.size() > 0:
		obj = _pool.pop_back()
	else:
		obj = _scene.instantiate()
		add_child(obj)
	obj.process_mode = Node.PROCESS_MODE_INHERIT
	obj.visible = true
	_active.append(obj)
	return obj


func release(obj: Node) -> void:
	_active.erase(obj)
	obj.process_mode = Node.PROCESS_MODE_DISABLED
	obj.visible = false
	_pool.append(obj)


func get_active_count() -> int:
	return _active.size()
