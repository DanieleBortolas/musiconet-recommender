@echo off

powershell -ExecutionPolicy Bypass -Command "tsc"

if %errorlevel% neq 0 (
    echo TypeScript compilation failed. Please check the errors above.
    exit /b %errorlevel%
)

node ./dist/index.js
if %errorlevel% neq 0 (
    echo Node.js execution failed. Please check the errors above.
    exit /b %errorlevel%
)