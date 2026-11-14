@echo off
title Push NovaAi to GitHub
color 0A
echo ========================================================
echo             PUSH NOVAAI TO GITHUB
echo ========================================================
echo.
cd /d "%~dp0"

set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/fuertenitesh-sys/NovaAi.git): "
if "%REPO_URL%"=="" (
    echo Error: Repository URL cannot be empty.
    pause
    exit /b 1
)

echo.
echo Adding remote origin...
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%

echo Pushing to branch main...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo      SUCCESS: Project uploaded to GitHub!
    echo ========================================================
) else (
    echo.
    echo Push failed. Please verify repository permissions.
)
pause
