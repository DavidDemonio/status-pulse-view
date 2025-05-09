
-- StatusPulse Database Initialization
-- This script sets up the initial database structure for StatusPulse

-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nodes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    hostname VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    token VARCHAR(255) NOT NULL UNIQUE,
    status ENUM('healthy', 'warning', 'critical', 'inactive') DEFAULT 'inactive',
    last_seen TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    node_id INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cpu_usage FLOAT,
    memory_total BIGINT,
    memory_used BIGINT,
    memory_free BIGINT,
    memory_percentage FLOAT,
    disk_total BIGINT,
    disk_used BIGINT,
    disk_free BIGINT,
    disk_percentage FLOAT,
    network_download FLOAT,
    network_upload FLOAT,
    FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    node_id INT NOT NULL,
    alert_type ENUM('cpu', 'memory', 'disk', 'network', 'status') NOT NULL,
    severity ENUM('warning', 'critical') NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key VARCHAR(50) NOT NULL UNIQUE,
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create initial settings
INSERT INTO settings (key, value) VALUES
('cpu_warning_threshold', '70'),
('cpu_critical_threshold', '90'),
('memory_warning_threshold', '80'),
('memory_critical_threshold', '95'),
('disk_warning_threshold', '75'),
('disk_critical_threshold', '90'),
('check_interval', '60'),
('retention_days', '90');

-- Add indexes for better performance
CREATE INDEX idx_metrics_node_id ON metrics(node_id);
CREATE INDEX idx_metrics_timestamp ON metrics(timestamp);
CREATE INDEX idx_alerts_node_id ON alerts(node_id);
CREATE INDEX idx_alerts_timestamp ON alerts(timestamp);
