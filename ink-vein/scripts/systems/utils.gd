# scripts/systems/utils.gd
## 工具函数 — Autoload
extends Node


## 对 Vector2 随机偏移一个小角度（弧度）
static func randomize_angle(base: Vector2, spread_rad: float = 0.3) -> Vector2:
	return base.rotated(randf_range(-spread_rad, spread_rad))


## 限制值在 min/max 之间
static func clampf(value: float, min_val: float, max_val: float) -> float:
	return clamp(value, min_val, max_val)


## 简单缓动，0-1 三次方
static func ease_out_cubic(t: float) -> float:
	t = clampf(t, 0.0, 1.0)
	return 1.0 - pow(1.0 - t, 3.0)


## 颜色十六进制字符串转 Color
static func hex_color(hex: String) -> Color:
	return Color(hex)
