@echo off
echo Starting Presentation AI...
echo.

echo Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo Installing Python backend dependencies...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Failed to install backend dependencies
    echo Please make sure Python and pip are installed
    pause
    exit /b 1
)

echo.
echo Starting FastAPI backend server...
start "FastAPI Backend Server" cmd /k "python run.py"

echo.
echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting React frontend development server...
cd ..
start "React Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting up...
echo Frontend will be available at: http://localhost:3000
echo Backend API will be available at: http://localhost:5000
echo API Documentation: http://localhost:5000/docs
echo.
echo Press any key to exit this window...
pause > nul
