
#!/bin/bash

# StatusPulse - Installation Script
# This script will install all dependencies and set up the application

echo "╔══════════════════════════════════════════╗"
echo "║       StatusPulse Installation           ║"
echo "╚══════════════════════════════════════════╝"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "MySQL is not installed. Installing MySQL..."
    sudo apt-get update
    sudo apt-get install -y mysql-server
    
    # Secure MySQL installation
    echo "Securing MySQL installation..."
    sudo mysql_secure_installation
fi

# Create MySQL database and user
echo "Setting up MySQL database..."
echo "Please enter MySQL root password:"
read -s rootpass

# Create database and user
mysql -uroot -p$rootpass <<EOF
CREATE DATABASE IF NOT EXISTS statuspulse;
CREATE USER IF NOT EXISTS 'statuspulse'@'localhost' IDENTIFIED BY 'statuspulse';
GRANT ALL PRIVILEGES ON statuspulse.* TO 'statuspulse'@'localhost';
FLUSH PRIVILEGES;
EOF

echo "Database setup completed!"

# Install dependencies
echo "Installing application dependencies..."
npm install

# Build application
echo "Building application for production..."
npm run build

echo "╔══════════════════════════════════════════╗"
echo "║       Installation Complete!             ║"
echo "╚══════════════════════════════════════════╝"

echo "You can now start the application by running:"
echo "./start.sh"

exit 0
