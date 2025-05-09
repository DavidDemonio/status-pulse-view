
#!/bin/bash

# ZenoScale - Start Script
# This script starts both the frontend and backend services

echo "╔══════════════════════════════════════════╗"
echo "║       Starting ZenoScale                 ║"
echo "╚══════════════════════════════════════════╝"

# Check if the build directory exists
if [ ! -d "dist" ]; then
    echo "Build directory not found. Running build..."
    npm run build
fi

# Start backend server
echo "Starting ZenoScale API server on port 8282..."
node server/index.js > zenoScale-api.log 2>&1 &
BACKEND_PID=$!

# Wait a moment for backend to initialize
sleep 2

# Start frontend in production mode
echo "Starting ZenoScale web server on port 8181..."
npm run preview -- --port 8181 &
FRONTEND_PID=$!

echo "ZenoScale is running!"
echo "Access the dashboard at: http://localhost:8181"
echo "API server is running at: http://localhost:8282"

# Create a function to handle cleanup on script termination
function cleanup() {
    echo "Shutting down services..."
    kill $FRONTEND_PID
    kill $BACKEND_PID
    exit 0
}

# Register the cleanup function to be called on script termination
trap cleanup INT TERM

# Keep the script running until Ctrl+C
echo "Press Ctrl+C to stop all services"
wait
