extends Node
## 全局事件总线 — 解耦敌人/波次/UI 之间的通信

signal enemy_killed(was_headshot: bool, death_position: Vector3)
