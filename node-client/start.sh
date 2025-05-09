
#!/bin/bash

# StatusPulse Node Client - Start Script
# This script starts the node monitoring client

echo "╔══════════════════════════════════════════╗"
echo "║       StatusPulse Node Client            ║"
echo "╚══════════════════════════════════════════╝"

# Check if token is provided
TOKEN=""
if [ -f ".token" ]; then
    TOKEN=$(cat .token)
fi

if [ -z "$TOKEN" ]; then
    echo "No token found. Please enter your client token:"
    read TOKEN
    
    # Save token for future use
    echo $TOKEN > .token
    echo "Token saved."
fi

echo "Starting node monitoring client..."
node monitor.js --token=$TOKEN &
CLIENT_PID=$!

echo "Client is running! Monitoring data is being sent to the main server."

# Create a function to handle cleanup on script termination
function cleanup() {
    echo "Shutting down client..."
    kill $CLIENT_PID
    exit 0
}

# Register the cleanup function to be called on script termination
trap cleanup INT TERM

# Keep the script running until Ctrl+C
echo "Press Ctrl+C to stop the client"
wait
