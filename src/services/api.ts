
// This file would connect to your real backend API
// For now, we'll simulate data for the frontend

import { NodeData } from '@/components/NodeStatusCard';

// Simulated nodes data
export const fetchNodes = async (): Promise<NodeData[]> => {
  // In a real app, this would be an API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    {
      id: '1',
      name: 'Web Server',
      ip: '192.168.1.100',
      status: 'healthy',
      cpu: 25,
      ram: 40,
      disk: 32,
      network: {
        up: 5.2,
        down: 10.6
      },
      uptime: '7d 12h 45m',
      lastSeen: '1m ago'
    },
    {
      id: '2',
      name: 'Database Server',
      ip: '192.168.1.101',
      status: 'warning',
      cpu: 72,
      ram: 85,
      disk: 67,
      network: {
        up: 2.7,
        down: 4.3
      },
      uptime: '14d 6h 22m',
      lastSeen: '1m ago'
    },
    {
      id: '3',
      name: 'Backup Server',
      ip: '192.168.1.102',
      status: 'healthy',
      cpu: 12,
      ram: 30,
      disk: 45,
      network: {
        up: 1.2,
        down: 1.8
      },
      uptime: '30d 8h 15m',
      lastSeen: '1m ago'
    },
    {
      id: '4',
      name: 'Cache Server',
      ip: '192.168.1.103',
      status: 'critical',
      cpu: 98,
      ram: 94,
      disk: 88,
      network: {
        up: 0.5,
        down: 0.2
      },
      uptime: '2d 3h 10m',
      lastSeen: '1m ago'
    },
    {
      id: '5',
      name: 'Load Balancer',
      ip: '192.168.1.104',
      status: 'inactive',
      cpu: 0,
      ram: 0,
      disk: 23,
      network: {
        up: 0,
        down: 0
      },
      uptime: '-',
      lastSeen: '2h ago'
    }
  ];
};

export const fetchNodeDetails = async (nodeId: string): Promise<NodeData | null> => {
  const nodes = await fetchNodes();
  return nodes.find(node => node.id === nodeId) || null;
};

// Simulated metrics data for charts
export const fetchMetrics = async (nodeId: string, metric: string, period: string = '24h') => {
  // In a real app, this would be an API call with proper params
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate some sample data points for the chart
  const dataPoints = 24;
  const data = [];
  
  for (let i = 0; i < dataPoints; i++) {
    const time = `${i}:00`;
    
    if (metric === 'cpu') {
      data.push({
        time,
        value: Math.floor(Math.random() * 50) + 10, // Random value between 10-60
      });
    } else if (metric === 'ram') {
      data.push({
        time,
        value: Math.floor(Math.random() * 40) + 30, // Random value between 30-70
      });
    } else if (metric === 'disk') {
      data.push({
        time,
        value: Math.floor(Math.random() * 30) + 20, // Random value between 20-50
      });
    } else if (metric === 'network') {
      data.push({
        time,
        download: Math.floor(Math.random() * 15) + 5, // Random value between 5-20
        upload: Math.floor(Math.random() * 5) + 1, // Random value between 1-6
      });
    }
  }
  
  return data;
};
