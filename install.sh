
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

# MySQL Configuration
echo "╔══════════════════════════════════════════╗"
echo "║       MySQL Configuration                ║"
echo "╚══════════════════════════════════════════╝"

# Prompt for MySQL settings
read -p "Enter MySQL host [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Enter MySQL port [3306]: " DB_PORT
DB_PORT=${DB_PORT:-3306}

read -p "Enter MySQL database name [zenoScale]: " DB_NAME
DB_NAME=${DB_NAME:-zenoScale}

read -p "Enter MySQL username [zenoScale]: " DB_USER
DB_USER=${DB_USER:-zenoScale}

read -s -p "Enter MySQL password [zenoScale]: " DB_PASS
DB_PASS=${DB_PASS:-zenoScale}
echo ""

read -s -p "Enter MySQL root password (for database creation, leave empty if not set): " ROOT_PASS
echo ""

# Test MySQL connection with root
if [ -z "$ROOT_PASS" ]; then
    MYSQL_ROOT_CONN="mysql -u root"
else
    MYSQL_ROOT_CONN="mysql -u root -p$ROOT_PASS"
fi

echo "Testing MySQL root connection..."
if ! $MYSQL_ROOT_CONN -e "SELECT 'Root connection successful';" > /dev/null 2>&1; then
    echo "Error: Cannot connect to MySQL as root. Please check your credentials."
    echo "Would you like to continue anyway? (y/n)"
    read CONTINUE
    if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "Root connection successful. Creating database and user..."
    
    # Create database and user
    $MYSQL_ROOT_CONN <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME;
CREATE USER IF NOT EXISTS '$DB_USER'@'$DB_HOST' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'$DB_HOST';
FLUSH PRIVILEGES;
EOF
    
    # Test if database is accessible with new credentials
    if mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS $DB_NAME -e "SELECT 'Database connection successful';" > /dev/null 2>&1; then
        echo "Database connection successful!"
    else
        echo "Warning: Could not connect to MySQL with the provided credentials."
        echo "Would you like to continue anyway? (y/n)"
        read CONTINUE
        if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Import schema
    echo "Importing database schema..."
    mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS $DB_NAME < sql/init.sql
fi

# Create .env file for server
echo "Creating server configuration..."
cat > server/.env <<EOF
PORT=8282
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_USER=$DB_USER
DB_PASS=$DB_PASS
DB_NAME=$DB_NAME
JWT_SECRET=zenoScale_jwt_secret_$(date +%s)
EOF

# Check if MySQL is installed locally
if ! command -v mysql &> /dev/null && [ "$DB_HOST" = "localhost" ]; then
    echo "MySQL is not installed locally. Installing MySQL..."
    sudo apt-get update
    sudo apt-get install -y mysql-server
    
    # Secure MySQL installation
    echo "Securing MySQL installation..."
    sudo mysql_secure_installation
fi

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

echo "╔══════════════════════════════════════════╗"
echo "║       Installation Complete!             ║"
echo "╚══════════════════════════════════════════╝"

echo "You can now start the application by running:"
echo "./start.sh"

exit 0
