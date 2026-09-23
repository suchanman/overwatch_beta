@echo off
chcp 65001 > nul
title Overwatch 2 - GitHub Deploy

set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%LOCALAPPDATA%\Programs\Git\mingw64\bin;%PATH%"

cd /d "%~dp0"

echo ======================================================================
echo   [Overwatch 2] GitHub Deploy (suchanman/overwatch_beta)
echo ======================================================================
echo.

git add .
git commit -m "Deploy update"
git branch -M main
git push -u origin main

echo.
echo ======================================================================
echo   작업이 완료되었습니다. 창을 닫으려면 아무 키나 누르세요.
echo ======================================================================
pause
