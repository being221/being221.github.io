# scripts/world/paper_bg.gd
## 宣纸纹理背景 — CanvasLayer 跟随镜头
extends CanvasLayer

var _drawn: bool = false


func _ready() -> void:
	layer = -100  # 最底层
	# 纸纤维纹理
	var noise = FastNoiseLite.new()
	noise.seed = randi()
	noise.frequency = 0.04
	noise.fractal_octaves = 3

	var noise_tex = NoiseTexture2D.new()
	noise_tex.noise = noise
	noise_tex.width = 256
	noise_tex.height = 256

	var paper = TextureRect.new()
	paper.texture = noise_tex
	paper.modulate = Color(0.55, 0.53, 0.48, 0.05)
	paper.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	paper.stretch_mode = TextureRect.STRETCH_TILE
	paper.texture_repeat = CanvasItem.TEXTURE_REPEAT_ENABLED
	paper.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(paper)

	# 纯黑底（确保没有漏光）
	var bg = ColorRect.new()
	bg.color = Color(0.06, 0.06, 0.08, 1)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)
	move_child(bg, 0)  # 放到最底层

	# 淡墨韵晕染（只画一次）
	var ink_layer = Node2D.new()
	ink_layer.name = "InkLayer"
	add_child(ink_layer)
	for i in range(6):
		var blob = ColorRect.new()
		blob.position = Vector2(randf_range(100, 860), randf_range(100, 440))
		blob.size = Vector2.ONE * randf_range(200, 500)
		blob.color = Color(0.05, 0.05, 0.08, randf_range(0.03, 0.08))
		blob.mouse_filter = Control.MOUSE_FILTER_IGNORE
		ink_layer.add_child(blob)
