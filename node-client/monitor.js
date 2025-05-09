
/**
 * StatusPulse Node Client
 * This script collects system metrics and sends them to the main server
 */

const os = require('os');
const fs = require('fs');
const { exec } = require('child_process');
const axios = require('axios');

// Default configuration
const config = {
  serverUrl: 'http://localhost:8080/api/metrics',
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
function getCpuUsage() {
  return new Promise((resolve) => {
    const startMeasure = os.cpus();

    // Wait for 100ms to get a more accurate measurement
    setTimeout(() => {
      const endMeasure = os.cpus();
      
      let idleDifference = 0;
      let totalDifference = 0;
      
      for (let i = 0; i < startMeasure.length; i++) {
        const startCpu = startMeasure[i].times;
        const endCpu = endMeasure[i].times;
        
        const startTotal = Object.values(startCpu).reduce((acc, val) => acc + val, 0);
        const endTotal = Object.values(endCpu).reduce((acc, val) => acc + val, 0);
        
        idleDifference += (endCpu.idle - startCpu.idle);
        totalDifference += (endTotal - startTotal);
      }
      
      const cpuUsage = 100 - (100 * idleDifference / totalDifference);
      resolve(cpuUsage);
    }, 100);
  });
}

// Get memory usage
function getMemoryUsage() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
  return {
    total: totalMem,
    free: freeMem,
    used: usedMem,
    percentage: (usedMem / totalMem) * 100
  };
}

// Get disk usage
function getDiskUsage() {
  return new Promise((resolve, reject) => {
    // Different command for different OS
    const command = process.platform === 'win32' 
      ? 'wmic logicaldisk get size,freespace,caption' 
      : 'df -h /';

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }

      if (process.platform === 'win32') {
        // Parse Windows output
        const lines = stdout.trim().split('\r\n').slice(1);
        const disks = [];
        
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 3) {
            const caption = parts[0];
            const freeSpace = parseInt(parts[1], 10);
            const size = parseInt(parts[2], 10);
            
            if (size > 0) {
              disks.push({
                drive: caption,
                total: size,
                free: freeSpace,
                used: size - freeSpace,
                percentage: ((size - freeSpace) / size) * 100
              });
            }
          }
        });
        
        resolve(disks);
      } else {
        // Parse Linux/Mac output
        const lines = stdout.trim().split('\n').slice(1);
        const disks = [];
        
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 6) {
            const usage = parseInt(parts[4].replace('%', ''), 10);
            
            disks.push({
              filesystem: parts[0],
              total: parts[1],
              used: parts[2],
              available: parts[3],
              percentage: usage
            });
          }
        });
        
        resolve(disks);
      }
    });
  });
}

// Get network usage (this is a simplified approximation)
function getNetworkUsage() {
  return new Promise((resolve) => {
    const networkInterfaces = os.networkInterfaces();
    const interfaces = [];
    
    for (const [name, netInterface] of Object.entries(networkInterfaces)) {
      const ipv4Interface = netInterface.find(iface => iface.family === 'IPv4');
      if (ipv4Interface) {
        interfaces.push({
          name,
          address: ipv4Interface.address,
          netmask: ipv4Interface.netmask,
          mac: ipv4Interface.mac
        });
      }
    }
    
    // In a real implementation, you would track bytes sent/received
    // Since OS doesn't provide direct API for bandwidth, we'd use a library or external tool
    resolve(interfaces);
  });
}

// Collect all system metrics
async function collectMetrics() {
  try {
    const hostname = os.hostname();
    const platform = os.platform();
    const cpuUsage = await getCpuUsage();
    const memoryUsage = getMemoryUsage();
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
  log('Starting monitoring...');
  log(`Server: ${config.serverUrl}`);
  log(`Interval: ${config.interval} seconds`);
  
  // First run immediately
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
