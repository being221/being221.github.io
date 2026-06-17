extends Node
## 全局游戏状态，跨场景持久化

var current_level: int = 1
var total_kills: int = 0
var total_headshots: int = 0
var headshot_streak: int = 0
var total_damage_taken: float = 0.0
var hits_taken: int = 0
var level_start_time: float = 0.0


func reset_run() -> void:
	total_kills = 0
	total_headshots = 0
	headshot_streak = 0
	total_damage_taken = 0.0
	hits_taken = 0
	level_start_time = Time.get_ticks_msec() / 1000.0


func add_kill(was_headshot: bool) -> void:
	total_kills += 1
	if was_headshot:
		total_headshots += 1
		headshot_streak += 1
	else:
		headshot_streak = 0


func add_damage(amount: float) -> void:
	total_damage_taken += amount
	hits_taken += 1


func get_elapsed_time() -> float:
	return Time.get_ticks_msec() / 1000.0 - level_start_time


func get_headshot_rate() -> float:
	if total_kills == 0:
		return 0.0
	return float(total_headshots) / float(total_kills) * 100.0
