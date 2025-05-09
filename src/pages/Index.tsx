
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatsSummary from '@/components/StatsSummary';
import NodeStatusCard from '@/components/NodeStatusCard';
import { useState, useEffect } from 'react';
import { fetchNodes } from '@/services/api';
import { Cpu, HardDrive, Memory, RefreshCw, Wifi } from 'lucide-react';
import ResourceCard from '@/components/ResourceCard';
import MetricsChart from '@/components/MetricsChart';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const getDummyData = (length: number) => {
  const data = [];
  for (let i = 0; i < length; i++) {
    data.push({
      time: `${i}:00`,
      cpu: Math.floor(Math.random() * 60) + 10,
      ram: Math.floor(Math.random() * 40) + 30,
      disk: Math.floor(Math.random() * 30) + 20,
    });
  }
  return data;
};

const networkData = Array(24).fill(0).map((_, i) => ({
  time: `${i}:00`,
  download: Math.floor(Math.random() * 15) + 5,
  upload: Math.floor(Math.random() * 5) + 1,
}));

const Index = () => {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalNodes: 0,
    activeNodes: 0,
    warningNodes: 0,
    criticalNodes: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const nodesData = await fetchNodes();
        setNodes(nodesData);
        
        // Calculate stats
        const activeNodes = nodesData.filter(n => n.status === 'healthy').length;
        const warningNodes = nodesData.filter(n => n.status === 'warning').length;
        const criticalNodes = nodesData.filter(n => n.status === 'critical').length;
        
        setStats({
          totalNodes: nodesData.length,
          activeNodes,
          warningNodes,
          criticalNodes,
        });
      } catch (error) {
        console.error('Failed to load nodes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const refreshData = async () => {
    setLoading(true);
    try {
      const nodesData = await fetchNodes();
      setNodes(nodesData);
      
      // Recalculate stats
      const activeNodes = nodesData.filter(n => n.status === 'healthy').length;
      const warningNodes = nodesData.filter(n => n.status === 'warning').length;
      const criticalNodes = nodesData.filter(n => n.status === 'critical').length;
      
      setStats({
        totalNodes: nodesData.length,
        activeNodes,
        warningNodes,
        criticalNodes,
      });
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">System Dashboard</h1>
          <Button variant="outline" onClick={refreshData} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-lg">Loading data...</div>
          </div>
        ) : (
          <>
            <StatsSummary 
              totalNodes={stats.totalNodes}
              activeNodes={stats.activeNodes}
              warningNodes={stats.warningNodes}
              criticalNodes={stats.criticalNodes}
              className="mb-8"
            />
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">System Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ResourceCard 
                  title="CPU Usage" 
                  value={35} 
                  icon={<Cpu className="h-5 w-5" />} 
                />
                <ResourceCard 
                  title="Memory Usage" 
                  value={58} 
                  icon={<Memory className="h-5 w-5" />} 
                />
                <ResourceCard 
                  title="Disk Usage" 
                  value={42} 
                  icon={<HardDrive className="h-5 w-5" />} 
                />
                <ResourceCard 
                  title="Network" 
                  value={12.5} 
                  icon={<Wifi className="h-5 w-5" />}
                  max={50}
                  unit=" Mbps" 
                />
              </div>
            </section>
            
            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Nodes Status</h2>
                <Button variant="outline" asChild>
                  <Link to="/nodes">View All Nodes</Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nodes.slice(0, 3).map((node) => (
                  <NodeStatusCard key={node.id} node={node} />
                ))}
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold mb-4">Performance Metrics</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MetricsChart 
                  title="System Resources (24h)"
                  data={getDummyData(24)}
                  lines={[
                    { key: 'cpu', color: '#8b5cf6', name: 'CPU Usage' },
                    { key: 'ram', color: '#3b82f6', name: 'RAM Usage' },
                    { key: 'disk', color: '#6366f1', name: 'Disk I/O' },
                  ]}
                />
                <MetricsChart 
                  title="Network Traffic (24h)"
                  data={networkData}
                  lines={[
                    { key: 'download', color: '#10b981', name: 'Download' },
                    { key: 'upload', color: '#f59e0b', name: 'Upload' },
                  ]}
                />
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
