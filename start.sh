
#!/bin/bash

# StatusPulse - Start Script
# This script starts both the frontend and backend services

echo "╔══════════════════════════════════════════╗"
echo "║       Starting StatusPulse               ║"
echo "╚══════════════════════════════════════════╝"

# Check if the build directory exists
if [ ! -d "dist" ]; then
    echo "Build directory not found. Running build..."
    npm run build
fi

# Start frontend in production mode
echo "Starting StatusPulse server..."
npm run preview -- --port 8080 &
FRONTEND_PID=$!

echo "StatusPulse is running!"
echo "Access the dashboard at: http://localhost:8080"

# Create a function to handle cleanup on script termination
function cleanup() {
    echo "Shutting down services..."
    kill $FRONTEND_PID
    exit 0
}

# Register the cleanup function to be called on script termination
trap cleanup INT TERM

# Keep the script running until Ctrl+C
echo "Press Ctrl+C to stop all services"
wait
