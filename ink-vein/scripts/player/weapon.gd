# scripts/player/weapon.gd
extends Node2D
class_name Weapon

## 基础攻击冷却（秒）
@export var base_cooldown: float = 0.25
## 武器范围（碰撞区半径）
@export var weapon_range: float = 36.0
## 基础伤害
@export var base_damage: int = 10

## 当前连击数（外部读写）
var combo_count: int = 0
## 上次命中时间（用于断连检测）
var _last_hit_time: float = 0.0

var _can_attack: bool = true
var _hit_targets_this_swing: Array[Node] = []
var _combo_system: ComboSystem

@onready var hitbox_area: Area2D = $HitboxArea
@onready var attack_timer: Timer = $AttackTimer
@onready var ink_trail: InkTrail = $InkTrail
@onready var collision_shape: CollisionShape2D = $HitboxArea/CollisionShape2D


func _ready() -> void:
	collision_shape.disabled = true
	hitbox_area.body_entered.connect(_on_hitbox_body_entered)
	attack_timer.timeout.connect(_on_attack_cooldown_end)
	# 延迟查找 ComboSystem
	await owner.ready
	_combo_system = owner.get_node_or_null("ComboSystem") as ComboSystem


func attack(aim_direction: Vector2) -> void:
	if not _can_attack:
		return

	_can_attack = false
	_hit_targets_this_swing.clear()
	attack_timer.start(base_cooldown)

	# 墨痕拖尾弧形
	var start_point = owner.global_position
	var sweep_end = start_point + aim_direction * weapon_range
	ink_trail.spawn_arc(start_point, sweep_end)

	# 短暂开启碰撞区做命中检测
	collision_shape.disabled = false

	# 延迟关闭碰撞区
	var swing_duration = base_cooldown * 0.4
	await get_tree().create_timer(swing_duration).timeout
	collision_shape.disabled = true


func _on_hitbox_body_entered(body: Node2D) -> void:
	if body in _hit_targets_this_swing:
		return
	if not body.has_method("take_damage"):
		return
	if body is Player:
		return
	_hit_targets_this_swing.append(body)

	# 伤害倍率
	var multiplier: float = 1.0
	if _combo_system:
		multiplier = _combo_system.get_damage_multiplier()
	var damage = int(base_damage * multiplier)
	body.take_damage(damage)

	# 命中反馈
	Events.hit_stop_requested.emit(4)
	Events.screen_shake_requested.emit(0.3)
	# 伤害数字
	var is_crit = multiplier > 1.2
	DamageNumber.spawn(get_tree().root, body.global_position, damage, is_crit)

	# 更新连击
	combo_count += 1
	_last_hit_time = Time.get_ticks_msec() / 1000.0
	Events.combo_changed.emit(combo_count)


func _on_attack_cooldown_end() -> void:
	_can_attack = true


func _process(_delta: float) -> void:
	# 断连检测
	if combo_count > 0:
		var now = Time.get_ticks_msec() / 1000.0
		if now - _last_hit_time > 1.5:
			combo_count = 0
			Events.combo_changed.emit(0)
