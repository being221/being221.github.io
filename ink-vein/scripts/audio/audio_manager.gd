# scripts/audio/audio_manager.gd
## 音效管理器 — Autoload
extends Node

const MAX_PLAYERS: int = 16

var _player_pool: Array[AudioStreamPlayer2D] = []
var _next_index: int = 0


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	for i in range(MAX_PLAYERS):
		var player = AudioStreamPlayer2D.new()
		add_child(player)
		_player_pool.append(player)

	# 连接核心音效事件（Phase 5 填充实际音频）
	Events.enemy_killed.connect(func(_e, _pos): _play_dummy("kill"))
	Events.ink_surge_triggered.connect(func(): _play_dummy("surge"))
	Events.player_damaged.connect(func(_a): _play_dummy("hurt"))
	Events.hit_stop_requested.connect(func(_f): _play_dummy("hit"))
	Events.combo_changed.connect(func(c):
		if c > 0 and c % 10 == 0:
			_play_dummy("combo")
	)


func _play_dummy(_sound_name: String) -> void:
	# Phase 5: 替换为实际音频文件
	pass


func play_stream(stream: AudioStream, pos: Vector2 = Vector2.ZERO, volume: float = 0.0) -> void:
	var player = _player_pool[_next_index]
	_next_index = (_next_index + 1) % MAX_PLAYERS
	player.global_position = pos
	player.stream = stream
	player.pitch_scale = randf_range(0.9, 1.1)
	player.volume_db = volume + randf_range(-2.0, 2.0)
	player.play()
