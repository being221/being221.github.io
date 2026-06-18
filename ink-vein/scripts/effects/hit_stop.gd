# scripts/effects/hit_stop.gd
## 命中停帧管理器 — Autoload
extends Node

var _is_frozen: bool = false
const TIME_SCALE_NORMAL: float = 1.0


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	Events.hit_stop_requested.connect(_on_hit_stop_requested)


func _on_hit_stop_requested(frames: int) -> void:
	if _is_frozen:
		return
	_is_frozen = true
	var duration = frames / 60.0
	Engine.time_scale = 0.0
	await get_tree().create_timer(duration, true, false, true).timeout
	Engine.time_scale = TIME_SCALE_NORMAL
	_is_frozen = false
