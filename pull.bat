@echo off
REM ===== Thynks - Pull latest from GitHub =====
REM Double-click this BEFORE you start working, to grab the newest version.

cd /d "%~dp0"
echo.
echo Pulling the latest changes from GitHub...
echo.
git pull
echo.
if %errorlevel%==0 (
  echo Done. You have the latest version.
) else (
  echo Something went wrong above. Read the message, or ask Claude.
)
echo.
pause
