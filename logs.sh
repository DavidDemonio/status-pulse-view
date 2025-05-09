
#!/bin/bash

# StatusPulse - Logs Script
# This script shows logs for the application

echo "╔══════════════════════════════════════════╗"
echo "║       StatusPulse Logs                   ║"
echo "╚══════════════════════════════════════════╝"

echo "Showing application logs..."
echo "Press Ctrl+C to exit"

# Check if a log file exists, if not create it
if [ ! -f "statuspulse.log" ]; then
    touch statuspulse.log
    echo "Log file created."
fi

# Tail the log file
tail -f statuspulse.log
