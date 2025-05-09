
#!/bin/bash

# ZenoScale Node Client - Installation Script
# This script installs the node monitoring client

echo "╔══════════════════════════════════════════╗"
echo "║       ZenoScale Node Client              ║"
echo "║           Installation                   ║"
echo "╚══════════════════════════════════════════╝"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check npm version and update if necessary
NPM_VERSION=$(npm -v)
echo "NPM version: $NPM_VERSION"

# Install dependencies
echo "Installing client dependencies..."
npm install

echo "Testing system information gathering..."
# Test if systeminformation works
if node -e "const si = require('systeminformation'); si.cpu().then(data => console.log('CPU test successful:', data.manufacturer));" > /dev/null 2>&1; then
    echo "System information library is working correctly."
else
    echo "Warning: The system information library might not be working correctly on this system."
fi

echo "Installation complete!"
echo "To start the client, run:"
echo "./start.sh <token> [server_url] [interval]"
echo "Example: ./start.sh zs_abc123 http://yourdomain.com:8282/api/metrics 30"

exit 0
