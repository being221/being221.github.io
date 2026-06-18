# scripts/ui/hud.gd
extends CanvasLayer
class_name HUD

@onready var combo_label: Label = $MarginContainer/VBoxContainer/TopRow/ComboLabel
@onready var timer_label: Label = $MarginContainer/VBoxContainer/TopRow/TimerLabel
@onready var health_bar: ProgressBar = $MarginContainer/VBoxContainer/BottomRow/HealthContainer/HealthBar
@onready var ink_container: HBoxContainer = $MarginContainer/VBoxContainer/BottomRow/HealthContainer/InkSurgeBar

var _ink_segments: Array[ColorRect] = []
var _game_time: float = 0.0
var _is_game_over: bool = false

const MAX_SEGMENTS: int = 3


func _ready() -> void:
	Events.combo_changed.connect(_on_combo_changed)
	Events.ink_surge_changed.connect(_on_surge_changed)
	Events.player_damaged.connect(_on_player_damaged)
	Events.ink_boil_changed.connect(_on_boil_changed)
	Events.game_over.connect(_on_game_over)
	_init_ink_segments()


func _init_ink_segments() -> void:
	for i in range(MAX_SEGMENTS):
		var seg = ColorRect.new()
		seg.size = Vector2(40, 8)
		seg.color = Color("#3a7ca5")
		seg.color.a = 0.3
		ink_container.add_child(seg)
		_ink_segments.append(seg)


func _process(delta: float) -> void:
	if _is_game_over:
		return
	_game_time += delta
	var minutes = int(_game_time / 60)
	var seconds = int(int(_game_time) % 60)
	timer_label.text = "%02d:%02d" % [minutes, seconds]


func _on_combo_changed(combo: int) -> void:
	if combo == 0:
		combo_label.visible = false
		return
	combo_label.visible = true
	combo_label.text = str(combo)


func _on_surge_changed(segments: int, _max_segments: int) -> void:
	for i in range(_ink_segments.size()):
		_ink_segments[i].color.a = 1.0 if i < segments else 0.3


func _on_player_damaged(_amount: int) -> void:
	var player = get_tree().get_first_node_in_group("player")
	if player:
		health_bar.value = float(player.health) / float(player.max_health) * 100.0


func _on_boil_changed(_is_boiling: bool) -> void:
	pass  # Phase 4: 墨沸波纹视觉效果


func _on_game_over() -> void:
	_is_game_over = true
	var result = Label.new()
	result.text = "墨脉沉寂\n\n按 R 重开"
	result.add_theme_font_size_override("font_size", 36)
	result.add_theme_color_override("font_color", Color("#e8e0d4"))
	result.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	result.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	result.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(result)


func _input(event: InputEvent) -> void:
	if event.is_action_pressed("restart"):
		get_tree().reload_current_scene()
