@echo off
REM ===== Thynks - Save and upload to GitHub =====
REM Double-click this AFTER you finish working, to save and upload your changes.

cd /d "%~dp0"

echo.
echo Checking what changed...
echo.
git status --short
echo.

REM Ask for a short note describing the changes
set "msg="
set /p "msg=Type a short note about what changed (then Enter): "
if "%msg%"=="" set "msg=Update site content"

echo.
echo Saving and uploading...
echo.
git add .
git commit -m "%msg%"
git push
echo.
if %errorlevel%==0 (
  echo Done. Your changes are now on GitHub.
) else (
  echo Something went wrong above. Read the message, or ask Claude.
)
echo.
pause
