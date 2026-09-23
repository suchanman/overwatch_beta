@echo off
chcp 65001 >nul
title 오버워치 2 웹 게임 실행기

echo ========================================================
echo   [OVERWATCH 2 : WEB HERO SHOOTER] 게임을 시작합니다...
echo ========================================================
echo.

where py >nul 2>nul
if %errorlevel% equ 0 (
    echo [1/2] 로컬 서버를 시작합니다 (포트 8000)...
    start /b py -3 -m http.server 8000 >nul 2>&1
    timeout /t 1 /nobreak >nul
    echo [2/2] 브라우저에서 게임을 엽니다: http://localhost:8000
    start http://localhost:8000
    goto end
)

where node >nul 2>nul
if %errorlevel% equ 0 (
    echo [1/2] Node.js 서버를 시작합니다...
    start /b node server.js >nul 2>&1
    timeout /t 1 /nobreak >nul
    echo [2/2] 브라우저에서 게임을 엽니다: http://localhost:8000
    start http://localhost:8000
    goto end
)

echo 브라우저에서 index.html을 직접 실행합니다...
start "" "%~dp0index.html"

:end
echo.
echo 게임이 브라우저에서 실행되었습니다!
timeout /t 3 >nul
exit
