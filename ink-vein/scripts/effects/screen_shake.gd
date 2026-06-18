# scripts/effects/screen_shake.gd
extends Node
class_name ScreenShake

@export var decay: float = 0.8
@export var max_offset: Vector2 = Vector2(6, 4)

var _trauma: float = 0.0
var _trauma_power: int = 2
var _noise: FastNoiseLite
var _noise_y: float = 0.0
var _camera: Camera2D


func _ready() -> void:
	_noise = FastNoiseLite.new()
	_noise.seed = randi()
	_noise.frequency = 0.5
	_camera = get_parent() as Camera2D
	Events.screen_shake_requested.connect(_add_trauma)


func _add_trauma(intensity: float) -> void:
	_trauma = clamp(_trauma + intensity, 0.0, 1.0)


func _process(delta: float) -> void:
	if _trauma <= 0.0:
		if _camera:
			_camera.offset = Vector2.ZERO
		return
	_trauma = max(0.0, _trauma - decay * delta)
	var amount = pow(_trauma, _trauma_power)
	_noise_y += delta * 20.0
	if _camera:
		_camera.offset.x = _noise.get_noise_2d(_noise_y, 0.0) * max_offset.x * amount
		_camera.offset.y = _noise.get_noise_2d(0.0, _noise_y) * max_offset.y * amount
