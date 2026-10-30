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
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================================
    echo   SUCCESS! Your files are now uploaded to GitHub!
    echo ================================================================
    echo.
    echo Next Step (Turn on GitHub Pages):
    echo   1. Go to: https://github.com/rishabhpatel183/Attendance-Manager/settings/pages
    echo   2. Under "Branch", select "main" and "/ (root)", then click Save.
    echo   3. Your live link will be:
    echo      https://rishabhpatel183.github.io/Attendance-Manager/
    echo.
) else (
    echo.
    echo [NOTE] If Windows prompted you to sign in to GitHub, please complete the sign-in.
)

pause
