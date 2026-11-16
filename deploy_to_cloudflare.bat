@echo off
echo ========================================================
echo   NOVA.AI - DEPLOY TO CLOUDFLARE PAGES
echo ========================================================
echo.
cd /d "%~dp0"

echo 1. Checking Cloudflare Login...
call npx wrangler whoami >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Opening browser to login to Cloudflare...
    echo Please click "Allow" in your browser window.
    call npx wrangler login
)

echo.
echo 2. Deploying public directory to Cloudflare Pages (nova-ai)...
call npx wrangler pages deploy public --project-name nova-ai --commit-dirty=true

echo.
echo ========================================================
echo   DEPLOYMENT COMPLETE!
echo   Visit: https://nova-ai-11u.pages.dev/
echo ========================================================
pause
