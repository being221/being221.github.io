# scripts/world/paper_bg.gd
## 宣纸纹理背景 — NoiseTexture2D 纸纤维 + 淡墨韵
extends Node2D

var _ink_blobs: Array[Vector2] = []
var _ink_blob_radii: Array[float] = []


func _ready() -> void:
	# 纸纤维纹理 — NoiseTexture2D 叠加在 ColorRect 上
	var noise = FastNoiseLite.new()
	noise.seed = randi()
	noise.frequency = 0.04
	noise.fractal_octaves = 3

	var noise_tex = NoiseTexture2D.new()
	noise_tex.noise = noise
	noise_tex.width = 512
	noise_tex.height = 512
	noise_tex.invert = false

	var paper = TextureRect.new()
	paper.texture = noise_tex
	paper.modulate = Color(0.6, 0.58, 0.53, 0.06)
	paper.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	# Stretch to cover screen
	paper.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	paper.stretch_mode = TextureRect.STRETCH_TILE
	paper.texture_repeat = CanvasItem.TEXTURE_REPEAT_ENABLED
	add_child(paper)

	# 随机墨韵晕染点
	for i in range(6):
		_ink_blobs.append(Vector2(randf_range(-900, 900), randf_range(-500, 500)))
		_ink_blob_radii.append(randf_range(150, 450))


func _draw() -> void:
	# 淡墨晕染（低频绘制，因为不变）
	for i in range(_ink_blobs.size()):
		var pos = _ink_blobs[i]
		var r = _ink_blob_radii[i]
		# 几层同心渐变
		for j in range(4):
			var jr = r * (0.25 + j * 0.2)
			draw_circle(pos, jr, Color(0.05, 0.05, 0.08, 0.015 + j * 0.006))
