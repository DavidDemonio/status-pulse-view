
import axios from 'axios';
import { NodeData } from '@/components/NodeStatusCard';

const API_URL = 'http://localhost:8282/api';

// Authentication API calls
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data;
  } catch (error) {
    throw new Error('Authentication failed. Please check your credentials.');
  }
};

export const registerAdmin = async (username: string, email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, { 
      username, 
      email, 
      password,
      role: 'admin'
    });
    return response.data;
  } catch (error) {
    throw new Error('Registration failed. Please try again.');
  }
};

// Nodes API calls
export const fetchNodes = async (): Promise<NodeData[]> => {
  try {
    const response = await axios.get(`${API_URL}/nodes`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch nodes:', error);
    throw new Error('Failed to load node data from server');
  }
};

export const fetchNodeDetails = async (nodeId: string): Promise<NodeData | null> => {
  try {
    const response = await axios.get(`${API_URL}/nodes/${nodeId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch node ${nodeId} details:`, error);
    return null;
  }
};

export const addNode = async (name: string, token: string) => {
  try {
    const response = await axios.post(`${API_URL}/nodes`, { name, token });
    return response.data;
  } catch (error) {
    throw new Error('Failed to add node. Please try again.');
  }
};

export const removeNode = async (nodeId: string) => {
  try {
    await axios.delete(`${API_URL}/nodes/${nodeId}`);
    return true;
  } catch (error) {
    throw new Error('Failed to remove node. Please try again.');
  }
};

export const generateNodeToken = async () => {
  try {
    const response = await axios.post(`${API_URL}/nodes/token`);
    return response.data.token;
  } catch (error) {
    throw new Error('Failed to generate token. Please try again.');
  }
};

// MySQL connection test
export const testDbConnection = async () => {
  try {
    const response = await axios.get(`${API_URL}/system/db-test`);
    return response.data;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return {
      success: false,
      message: 'Failed to connect to database. Please check your configuration.'
    };
  }
};

// Metrics API calls
export const fetchMetrics = async (nodeId: string, metric: string, period: string = '24h') => {
  try {
    const response = await axios.get(
      `${API_URL}/metrics/${nodeId}?type=${metric}&period=${period}`
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch ${metric} metrics for node ${nodeId}:`, error);
    return [];
  }
};

// System settings
export const updateSystemSettings = async (settings: Record<string, any>) => {
  try {
    const response = await axios.put(`${API_URL}/settings`, settings);
    return response.data;
  } catch (error) {
    throw new Error('Failed to update system settings. Please try again.');
  }
};

export const fetchSystemSettings = async () => {
  try {
    const response = await axios.get(`${API_URL}/settings`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch system settings:', error);
    throw new Error('Failed to load system settings from server');
  }
};
