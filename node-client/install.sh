
#!/bin/bash

# StatusPulse Node Client - Installation Script
# This script installs the node monitoring client

echo "╔══════════════════════════════════════════╗"
echo "║       StatusPulse Node Client            ║"
echo "║           Installation                   ║"
echo "╚══════════════════════════════════════════╝"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install dependencies
echo "Installing client dependencies..."
npm install

echo "Installation complete!"
echo "To start the client, run:"
echo "./start.sh"

exit 0
