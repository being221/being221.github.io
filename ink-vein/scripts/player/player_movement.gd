# scripts/player/player_movement.gd
class_name PlayerMovement
extends Node

@export var move_speed: float = 300.0

var velocity: Vector2 = Vector2.ZERO
var _body: CharacterBody2D


func setup(body: CharacterBody2D) -> void:
	_body = body


func process_move(_delta: float) -> void:
	var input_dir: Vector2 = Input.get_vector("move_left", "move_right", "move_up", "move_down")
	velocity = input_dir * move_speed
	if _body:
		_body.velocity = velocity
		_body.move_and_slide()
