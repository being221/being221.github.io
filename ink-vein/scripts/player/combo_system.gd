# scripts/player/combo_system.gd
extends Node
class_name ComboSystem

## 燃墨阈值
@export var ignite_threshold: int = 10
## 墨沸阈值
@export var boil_threshold: int = 30
## 断连时间（秒）
@export var decay_time: float = 1.5

enum ComboState { NORMAL, IGNITED, BOILING }

var combo: int = 0
var state: ComboState = ComboState.NORMAL
var _last_hit_time: float = 0.0


func _ready() -> void:
	Events.combo_changed.connect(_on_combo_changed)


func _process(_delta: float) -> void:
	if combo == 0:
		return
	var now = Time.get_ticks_msec() / 1000.0
	if now - _last_hit_time > decay_time:
		_reset_combo()


func _on_combo_changed(new_combo: int) -> void:
	combo = new_combo
	_last_hit_time = Time.get_ticks_msec() / 1000.0

	var new_state = state
	if combo >= boil_threshold:
		new_state = ComboState.BOILING
	elif combo >= ignite_threshold:
		new_state = ComboState.IGNITED
	else:
		new_state = ComboState.NORMAL

	if new_state != state:
		state = new_state
		match state:
			ComboState.IGNITED:
				Events.ink_boil_changed.emit(false)
			ComboState.BOILING:
				Events.ink_boil_changed.emit(true)


func _reset_combo() -> void:
	combo = 0
	state = ComboState.NORMAL
	Events.combo_changed.emit(0)
	Events.ink_boil_changed.emit(false)


## 获取当前伤害倍率（墨沸状态加成）
func get_damage_multiplier() -> float:
	match state:
		ComboState.IGNITED: return 1.15
		ComboState.BOILING: return 1.3
		_: return 1.0
