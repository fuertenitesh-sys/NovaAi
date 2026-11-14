@echo off
title Nova.ai Enterprise Platform
color 0B
echo ========================================================
echo        STARTING NOVA.AI ENTERPRISE PLATFORM
echo ========================================================
echo.
cd /d "%~dp0"
echo Checking Node.js environment...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Starting Nova.ai Server on http://localhost:5500 ...
echo.
node server.js
pause
