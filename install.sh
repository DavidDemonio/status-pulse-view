
#!/bin/bash

# ZenoScale - Installation Script
# This script will install all dependencies and set up the application

echo "╔══════════════════════════════════════════╗"
echo "║       ZenoScale Installation             ║"
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
echo "Please enter MySQL root password (leave empty if no password is set):"
read -s rootpass

# Set password option based on whether a password was provided
if [ -z "$rootpass" ]; then
    MYSQL_PWD_OPTION=""
else
    MYSQL_PWD_OPTION="-p$rootpass"
fi

# Create database and user
mysql -uroot $MYSQL_PWD_OPTION <<EOF
CREATE DATABASE IF NOT EXISTS zenoScale;
CREATE USER IF NOT EXISTS 'zenoScale'@'localhost' IDENTIFIED BY 'zenoScale';
GRANT ALL PRIVILEGES ON zenoScale.* TO 'zenoScale'@'localhost';
FLUSH PRIVILEGES;
EOF

# Import schema
mysql -uroot $MYSQL_PWD_OPTION zenoScale < sql/init.sql

echo "Database setup completed!"

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd server
npm init -y
npm install express cors body-parser mysql2 bcrypt jsonwebtoken systeminformation speedtest-net
cd ..

# Install node client dependencies
echo "Setting up node client..."
cd node-client
npm install
cd ..

# Build application
echo "Building application for production..."
npm run build

# Configure server ports
echo "Configuring server ports..."
# Create .env file for server
cat > server/.env <<EOF
PORT=8282
DB_HOST=localhost
DB_USER=zenoScale
DB_PASS=zenoScale
DB_NAME=zenoScale
JWT_SECRET=zenoScale_jwt_secret_$(date +%s)
EOF

# Update configuration for web server
sed -i 's/port: 8080/port: 8181/g' vite.config.ts

echo "╔══════════════════════════════════════════╗"
echo "║       Installation Complete!             ║"
echo "╚══════════════════════════════════════════╝"

echo "You can now start the application by running:"
echo "./start.sh"

exit 0
