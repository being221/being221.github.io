@echo off
echo 🔔 Task completed!
powershell.exe -Command "Add-Type -AssemblyName System.Media; $player = New-Object System.Media.SoundPlayer 'C:\Windows\Media\ding.wav'; $player.PlaySync(); Write-Host '🔔 提示音已播放' -ForegroundColor Green"