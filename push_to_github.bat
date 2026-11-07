@echo off
title Push Attendance Manager to GitHub
cd /d "%~dp0"

echo ================================================================
echo   PUSHING ATTENDANCE MANAGER TO YOUR GITHUB REPOSITORY
echo   Repo: https://github.com/rishabhpatel183/Attendance-Manager.git
echo ================================================================
echo.

git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/rishabhpatel183/Attendance-Manager.git

echo Uploading files to GitHub...
git push -u origin main --force

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================================
    echo   SUCCESS! Your files are now uploaded to GitHub!
    echo ================================================================
    echo.
    echo Your live link is:
    echo   https://rishabhpatel183.github.io/Attendance-Manager/
    echo.
) else (
    echo.
    echo [NOTE] Push failed. If Windows prompted for credentials, please complete the sign-in.
)

pause
