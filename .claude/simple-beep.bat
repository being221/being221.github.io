@echo off
echo 🔔 Task completed!
powershell -c "echo ([char]7)" 2>nul || (echo 🔔 Task completed! & echo "")
exit /b 0