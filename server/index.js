
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const os = require('os');
const fs = require('fs').promises;
const speedTest = require('speedtest-net');
const si = require('systeminformation');

// Create Express app
const app = express();
const PORT = process.env.PORT || 8282;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection pool
let pool;

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'zenoScale_jwt_secret_key';

// Initialize database connection
async function initDatabase() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'zenoScale',
      password: process.env.DB_PASS || 'zenoScale',
      database: process.env.DB_NAME || 'zenoScale',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    console.log('Database connected successfully');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Check if admin exists
async function checkAdminExists() {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE role = "admin" LIMIT 1');
    return rows.length > 0;
  } catch (error) {
    console.error('Failed to check admin existence:', error);
    return false;
  }
}

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Check if admin already exists
    const adminExists = await checkAdminExists();
    if (adminExists && role === 'admin') {
      return res.status(403).json({ error: 'Admin already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role || 'user']
    );
    
    // Generate JWT
    const token = jwt.sign(
      { id: result.insertId, username, email, role: role || 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      user: { id: result.insertId, username, email, role: role || 'user' },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Get user
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = rows[0];
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Nodes routes
app.get('/api/nodes', authenticate, async (req, res) => {
  try {
    const [nodes] = await pool.query(`
      SELECT n.*, 
             IFNULL(m.cpu_usage, 0) as cpu,
             IFNULL(m.memory_percentage, 0) as ram,
             IFNULL(m.disk_percentage, 0) as disk,
             IFNULL(m.network_upload, 0) as network_up,
             IFNULL(m.network_download, 0) as network_down,
             TIMESTAMPDIFF(SECOND, n.last_seen, NOW()) as seconds_since_last_seen
      FROM nodes n
      LEFT JOIN (
        SELECT node_id, cpu_usage, memory_percentage, disk_percentage, network_upload, network_download
        FROM metrics
        WHERE id IN (
          SELECT MAX(id) FROM metrics GROUP BY node_id
        )
      ) m ON n.id = m.node_id
    `);
    
    // Format the response
    const formattedNodes = nodes.map(node => {
      let lastSeen;
      if (node.seconds_since_last_seen < 60) {
        lastSeen = `${node.seconds_since_last_seen}s ago`;
      } else if (node.seconds_since_last_seen < 3600) {
        lastSeen = `${Math.floor(node.seconds_since_last_seen / 60)}m ago`;
      } else if (node.seconds_since_last_seen < 86400) {
        lastSeen = `${Math.floor(node.seconds_since_last_seen / 3600)}h ago`;
      } else {
        lastSeen = `${Math.floor(node.seconds_since_last_seen / 86400)}d ago`;
      }
      
      // Calculate uptime if available
      let uptime = '-';
      if (node.uptime_seconds) {
        const days = Math.floor(node.uptime_seconds / 86400);
        const hours = Math.floor((node.uptime_seconds % 86400) / 3600);
        const minutes = Math.floor((node.uptime_seconds % 3600) / 60);
        uptime = `${days}d ${hours}h ${minutes}m`;
      }
      
      return {
        id: node.id.toString(),
        name: node.name,
        ip: node.ip_address || 'Unknown',
        status: node.status,
        cpu: parseFloat(node.cpu) || 0,
        ram: parseFloat(node.ram) || 0,
        disk: parseFloat(node.disk) || 0,
        network: {
          up: parseFloat(node.network_up) || 0,
          down: parseFloat(node.network_down) || 0
        },
        uptime,
        lastSeen
      };
    });
    
    res.json(formattedNodes);
  } catch (error) {
    console.error('Failed to fetch nodes:', error);
    res.status(500).json({ error: 'Failed to fetch nodes' });
  }
});

app.get('/api/nodes/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [nodes] = await pool.query(`
      SELECT n.*, 
             IFNULL(m.cpu_usage, 0) as cpu,
             IFNULL(m.memory_percentage, 0) as ram,
             IFNULL(m.disk_percentage, 0) as disk,
             IFNULL(m.network_upload, 0) as network_up,
             IFNULL(m.network_download, 0) as network_down,
             TIMESTAMPDIFF(SECOND, n.last_seen, NOW()) as seconds_since_last_seen
      FROM nodes n
      LEFT JOIN (
        SELECT node_id, cpu_usage, memory_percentage, disk_percentage, network_upload, network_download
        FROM metrics
        WHERE id IN (
          SELECT MAX(id) FROM metrics GROUP BY node_id
        )
      ) m ON n.id = m.node_id
      WHERE n.id = ?
    `, [id]);
    
    if (nodes.length === 0) {
      return res.status(404).json({ error: 'Node not found' });
    }
    
    const node = nodes[0];
    
    // Format the response
    let lastSeen;
    if (node.seconds_since_last_seen < 60) {
      lastSeen = `${node.seconds_since_last_seen}s ago`;
    } else if (node.seconds_since_last_seen < 3600) {
      lastSeen = `${Math.floor(node.seconds_since_last_seen / 60)}m ago`;
    } else if (node.seconds_since_last_seen < 86400) {
      lastSeen = `${Math.floor(node.seconds_since_last_seen / 3600)}h ago`;
    } else {
      lastSeen = `${Math.floor(node.seconds_since_last_seen / 86400)}d ago`;
    }
    
    // Calculate uptime if available
    let uptime = '-';
    if (node.uptime_seconds) {
      const days = Math.floor(node.uptime_seconds / 86400);
      const hours = Math.floor((node.uptime_seconds % 86400) / 3600);
      const minutes = Math.floor((node.uptime_seconds % 3600) / 60);
      uptime = `${days}d ${hours}h ${minutes}m`;
    }
    
    const formattedNode = {
      id: node.id.toString(),
      name: node.name,
      ip: node.ip_address || 'Unknown',
      status: node.status,
      cpu: parseFloat(node.cpu) || 0,
      ram: parseFloat(node.ram) || 0,
      disk: parseFloat(node.disk) || 0,
      network: {
        up: parseFloat(node.network_up) || 0,
        down: parseFloat(node.network_down) || 0
      },
      uptime,
      lastSeen
    };
    
    res.json(formattedNode);
  } catch (error) {
    console.error(`Failed to fetch node ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch node details' });
  }
});

app.post('/api/nodes/token', authenticate, async (req, res) => {
  try {
    // Generate a random token
    const token = 'zs_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    res.json({ token });
  } catch (error) {
    console.error('Failed to generate token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

app.post('/api/nodes', authenticate, async (req, res) => {
  try {
    const { name, token } = req.body;
    
    // Insert node
    const [result] = await pool.query(
      'INSERT INTO nodes (name, token, status, last_seen) VALUES (?, ?, "inactive", NOW())',
      [name, token]
    );
    
    res.json({
      id: result.insertId,
      name,
      token,
      status: 'inactive'
    });
  } catch (error) {
    console.error('Failed to add node:', error);
    res.status(500).json({ error: 'Failed to add node' });
  }
});

app.delete('/api/nodes/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete node
    await pool.query('DELETE FROM nodes WHERE id = ?', [id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error(`Failed to delete node ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete node' });
  }
});

// Metrics routes
app.get('/api/metrics/:nodeId', authenticate, async (req, res) => {
  try {
    const { nodeId } = req.params;
    const { type, period } = req.query;
    
    let timeLimit;
    switch (period) {
      case '1h':
        timeLimit = 'DATE_SUB(NOW(), INTERVAL 1 HOUR)';
        break;
      case '6h':
        timeLimit = 'DATE_SUB(NOW(), INTERVAL 6 HOUR)';
        break;
      case '7d':
        timeLimit = 'DATE_SUB(NOW(), INTERVAL 7 DAY)';
        break;
      case '30d':
        timeLimit = 'DATE_SUB(NOW(), INTERVAL 30 DAY)';
        break;
      case '24h':
      default:
        timeLimit = 'DATE_SUB(NOW(), INTERVAL 24 HOUR)';
    }
    
    let query;
    if (type === 'network') {
      query = `
        SELECT 
          timestamp,
          network_upload as upload,
          network_download as download,
          DATE_FORMAT(timestamp, '%H:%i') as time
        FROM metrics
        WHERE node_id = ? AND timestamp > ${timeLimit}
        ORDER BY timestamp ASC
      `;
    } else {
      let column;
      switch (type) {
        case 'cpu':
          column = 'cpu_usage';
          break;
        case 'ram':
          column = 'memory_percentage';
          break;
        case 'disk':
          column = 'disk_percentage';
          break;
        default:
          column = 'cpu_usage';
      }
      
      query = `
        SELECT 
          timestamp,
          ${column} as value,
          DATE_FORMAT(timestamp, '%H:%i') as time
        FROM metrics
        WHERE node_id = ? AND timestamp > ${timeLimit}
        ORDER BY timestamp ASC
      `;
    }
    
    const [metrics] = await pool.query(query, [nodeId]);
    
    res.json(metrics);
  } catch (error) {
    console.error(`Failed to fetch metrics for node ${req.params.nodeId}:`, error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Metrics submission endpoint for node clients
app.post('/api/metrics', async (req, res) => {
  try {
    // Validate token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Find node by token
    const [nodes] = await pool.query('SELECT id FROM nodes WHERE token = ?', [token]);
    if (nodes.length === 0) {
      return res.status(401).json({ error: 'Invalid node token' });
    }
    
    const nodeId = nodes[0].id;
    const { 
      timestamp,
      hostname,
      cpuUsage,
      memoryUsage,
      diskUsage,
      networkInterfaces,
      uptime 
    } = req.body;
    
    // Update node status
    let status = 'healthy';
    if (cpuUsage > 90 || memoryUsage.percentage > 90 || diskUsage[0]?.percentage > 90) {
      status = 'critical';
    } else if (cpuUsage > 70 || memoryUsage.percentage > 70 || diskUsage[0]?.percentage > 70) {
      status = 'warning';
    }
    
    await pool.query(
      'UPDATE nodes SET status = ?, hostname = ?, ip_address = ?, uptime_seconds = ?, last_seen = NOW() WHERE id = ?',
      [status, hostname, req.ip, uptime, nodeId]
    );
    
    // Insert metrics
    await pool.query(`
      INSERT INTO metrics (
        node_id,
        timestamp,
        cpu_usage,
        memory_total,
        memory_used,
        memory_free,
        memory_percentage,
        disk_total,
        disk_used,
        disk_free,
        disk_percentage,
        network_download,
        network_upload
      ) VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      nodeId,
      cpuUsage,
      memoryUsage.total,
      memoryUsage.used,
      memoryUsage.free,
      memoryUsage.percentage,
      diskUsage[0]?.total || 0,
      diskUsage[0]?.used || 0,
      diskUsage[0]?.free || 0,
      diskUsage[0]?.percentage || 0,
      networkInterfaces[0]?.downloadSpeed || 0,
      networkInterfaces[0]?.uploadSpeed || 0
    ]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to store metrics:', error);
    res.status(500).json({ error: 'Failed to store metrics' });
  }
});

// Settings routes
app.get('/api/settings', authenticate, async (req, res) => {
  try {
    const [settings] = await pool.query('SELECT * FROM settings');
    
    // Convert to key-value object
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    
    res.json(settingsObj);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/settings', authenticate, async (req, res) => {
  try {
    const settings = req.body;
    
    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
        [key, value, value]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Start server
async function startServer() {
  const dbConnected = await initDatabase();
  if (dbConnected) {
    app.listen(PORT, () => {
      console.log(`ZenoScale API server running on port ${PORT}`);
    });
  } else {
    console.error('Failed to start server: Database connection failed');
    process.exit(1);
  }
}

startServer();
