@echo off
cd /d "d:\wmt\backend-node"
echo Installing dependencies...
call npm install
echo Starting Node.js backend...
call npm start
pause
