# scripts/systems/events.gd
## 全局事件总线 — Autoload
extends Node


## 玩家受到伤害 (amount: int)
signal player_damaged(amount: int)
## 玩家死亡
signal player_died()
## 敌人死亡 (enemy: Enemy, global_position: Vector2)
signal enemy_killed(enemy: Enemy, global_position: Vector2)
## 涨墨段位变化 (segments: int, max_segments: int)
signal ink_surge_changed(segments: int, max_segments: int)
## 涨墨爆发触发
signal ink_surge_triggered()
## 连击数变化 (combo: int)
signal combo_changed(combo: int)
## 墨沸状态变化 (is_boiling: bool)
signal ink_boil_changed(is_boiling: bool)
## 命中停帧请求 (frames: int)
signal hit_stop_requested(frames: int)
## 屏幕震动请求 (intensity: float)
signal screen_shake_requested(intensity: float)
## 升级
signal level_up()
## 游戏结束
signal game_over()
