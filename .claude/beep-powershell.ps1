# 使用 PowerShell 播放提示音
Write-Host "🔔 Task completed!" -ForegroundColor Green

# 简单的蜂鸣声
[Console]::Beep(800, 200)
Write-Host "✅ 提示音已播放" -ForegroundColor Yellow