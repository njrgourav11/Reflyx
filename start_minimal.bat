@echo off
echo Starting AI Coding Assistant - Minimal Setup...

REM Add paths to current session
set PATH=%PATH%;C:\Program Files\nodejs;%LOCALAPPDATA%\Programs\Ollama

echo Starting Docker services...
docker-compose -f docker-compose.minimal.yml up -d

echo Waiting for services to start...
timeout /t 10 /nobreak >nul

echo Starting test server...
cd server
venv\Scripts\python.exe test_server.py

pause
