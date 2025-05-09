
#!/bin/bash

# ZenoScale Node Client - Start Script
# This script starts the monitoring client

echo "╔══════════════════════════════════════════╗"
echo "║       ZenoScale Node Client              ║"
echo "╚══════════════════════════════════════════╝"

# Check if token is provided
if [ -z "$1" ]; then
    echo "Error: No token provided"
    echo "Usage: ./start.sh <token> [server_url] [interval]"
    echo "Example: ./start.sh zs_abc123 http://yourdomain.com:8282/api/metrics 30"
    exit 1
fi

TOKEN=$1
SERVER=${2:-"http://localhost:8282/api/metrics"}
INTERVAL=${3:-60}

echo "Starting node monitoring..."
echo "Server: $SERVER"
echo "Interval: $INTERVAL seconds"

# Run the monitor script
node monitor.js --token=$TOKEN --server=$SERVER --interval=$INTERVAL

exit 0
