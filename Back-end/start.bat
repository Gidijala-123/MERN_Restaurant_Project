@echo off
CALL npm install > install.log 2>&1
CALL node server.js > server.log 2>&1
