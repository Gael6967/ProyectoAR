@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instala Node.js 18 o superior para ejecutar el servidor local.
  echo La version publicada en GitHub Pages no necesita Node.js.
  pause
  exit /b 1
)
start "" "http://localhost:8080"
node tools/serve.mjs
pause
