# 任务完成提示音脚本

Add-Type -AssemblyName System.Speech
Add-Type -AssemblyName System.Media

# 创建提示音
$beep = New-Object System.Media.SoundPlayer
$beep.SoundLocation = $args[0] -or "C:\Windows\Media\ding.wav"

# 播放提示音
try {
    $beep.Load()
    $beep.PlaySync()
    Write-Host "🔔 任务已完成！收到提示音" -ForegroundColor Green
} catch {
    # 如果系统声音文件不存在，使用默认蜂鸣声
    [Console]::Beep(800, 300)
    Write-Host "🔔 任务已完成！（使用默认蜂鸣声）" -ForegroundColor Green
}