
/**
 * ZenoScale Node Client
 * This script collects system metrics and sends them to the main server
 */

const os = require('os');
const fs = require('fs');
const { exec } = require('child_process');
const axios = require('axios');
const si = require('systeminformation');

// Default configuration
const config = {
  serverUrl: 'http://localhost:8282/api/metrics',
  interval: 60, // seconds
  token: '',
  log: true
};

// Parse command line arguments
process.argv.forEach(arg => {
  if (arg.startsWith('--token=')) {
    config.token = arg.split('=')[1];
  }
  if (arg.startsWith('--server=')) {
    config.serverUrl = arg.split('=')[1];
  }
  if (arg.startsWith('--interval=')) {
    config.interval = parseInt(arg.split('=')[1], 10);
  }
});

// Validate token
if (!config.token) {
  console.error('Error: No token provided. Use --token=YOUR_TOKEN');
  process.exit(1);
}

// Log function
function log(message) {
  if (config.log) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  }
}

// Get CPU usage
async function getCpuUsage() {
  try {
    const data = await si.currentLoad();
    return data.currentLoad;
  } catch (error) {
    log(`Error getting CPU usage: ${error.message}`);
    return 0;
  }
}

// Get memory usage
async function getMemoryUsage() {
  try {
    const data = await si.mem();
    return {
      total: data.total,
      free: data.free,
      used: data.used,
      percentage: (data.used / data.total) * 100
    };
  } catch (error) {
    log(`Error getting memory usage: ${error.message}`);
    return {
      total: 0,
      free: 0,
      used: 0,
      percentage: 0
    };
  }
}

// Get disk usage
async function getDiskUsage() {
  try {
    const data = await si.fsSize();
    return data.map(disk => ({
      drive: disk.fs,
      type: disk.type,
      total: disk.size,
      free: disk.available,
      used: disk.size - disk.available,
      percentage: disk.use
    }));
  } catch (error) {
    log(`Error getting disk usage: ${error.message}`);
    return [];
  }
}

// Get network usage
let lastNetworkStats = null;
let lastNetworkTime = Date.now();

async function getNetworkUsage() {
  try {
    const data = await si.networkStats();
    const now = Date.now();
    const interfaces = [];

    if (lastNetworkStats) {
      const timeElapsed = (now - lastNetworkTime) / 1000; // Time in seconds
      
      for (let i = 0; i < data.length; i++) {
        const current = data[i];
        const previous = lastNetworkStats.find(p => p.iface === current.iface);
        
        if (previous) {
          const downloadSpeed = (current.rx_bytes - previous.rx_bytes) / timeElapsed; // bytes per second
          const uploadSpeed = (current.tx_bytes - previous.tx_bytes) / timeElapsed; // bytes per second
          
          interfaces.push({
            name: current.iface,
            downloadSpeed: downloadSpeed / 1048576, // Convert to Mbps (bytes to megabits)
            uploadSpeed: uploadSpeed / 1048576, // Convert to Mbps (bytes to megabits)
            rx_bytes: current.rx_bytes,
            tx_bytes: current.tx_bytes
          });
        }
      }
    }
    
    lastNetworkStats = data;
    lastNetworkTime = now;
    
    return interfaces;
  } catch (error) {
    log(`Error getting network usage: ${error.message}`);
    return [];
  }
}

// Collect all system metrics
async function collectMetrics() {
  try {
    const hostname = os.hostname();
    const platform = os.platform();
    const cpuUsage = await getCpuUsage();
    const memoryUsage = await getMemoryUsage();
    const diskUsage = await getDiskUsage();
    const networkInterfaces = await getNetworkUsage();
    const uptime = os.uptime();
    
    return {
      timestamp: new Date().toISOString(),
      hostname,
      platform,
      cpuUsage,
      memoryUsage,
      diskUsage,
      networkInterfaces,
      uptime
    };
  } catch (error) {
    log(`Error collecting metrics: ${error.message}`);
    return null;
  }
}

// Send metrics to server
async function sendMetrics(metrics) {
  try {
    const response = await axios.post(config.serverUrl, metrics, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    log(`Metrics sent successfully: ${response.status}`);
    return true;
  } catch (error) {
    log(`Error sending metrics: ${error.message}`);
    return false;
  }
}

// Main monitoring function
async function monitor() {
  log('Starting ZenoScale Node Client...');
  log(`Server: ${config.serverUrl}`);
  log(`Interval: ${config.interval} seconds`);
  
  // Collect network metrics initially to establish baseline
  await getNetworkUsage();
  
  // Wait one interval to get meaningful network metrics
  log('Collecting initial metrics...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // First run
  let metrics = await collectMetrics();
  if (metrics) {
    await sendMetrics(metrics);
  }
  
  // Set up interval
  setInterval(async () => {
    metrics = await collectMetrics();
    if (metrics) {
      await sendMetrics(metrics);
    }
  }, config.interval * 1000);
}

// Start monitoring
monitor();
