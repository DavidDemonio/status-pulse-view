
#!/bin/bash

# ZenoScale - Logs Script
# This script shows logs for the application

echo "╔══════════════════════════════════════════╗"
echo "║       ZenoScale Logs                     ║"
echo "╚══════════════════════════════════════════╝"

# Pick which logs to show
echo "Which logs do you want to view?"
echo "1) Frontend logs"
echo "2) API server logs"
echo "3) All logs"
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "Showing frontend logs..."
        tail -f zenoScale-frontend.log
        ;;
    2)
        echo "Showing API server logs..."
        tail -f zenoScale-api.log
        ;;
    3)
        echo "Showing all logs..."
        tail -f zenoScale-*.log
        ;;
    *)
        echo "Invalid choice. Showing all logs..."
        tail -f zenoScale-*.log
        ;;
esac
