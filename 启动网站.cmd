@echo off
cd /d "%~dp0"
node launcher.cjs
if errorlevel 1 pause
