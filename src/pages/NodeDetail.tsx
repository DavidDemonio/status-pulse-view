
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchNodeDetails, fetchMetrics } from '@/services/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Cpu, HardDrive, Memory, ArrowLeft, Wifi, RefreshCw } from 'lucide-react';
import ResourceCard from '@/components/ResourceCard';
import MetricsChart from '@/components/MetricsChart';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const statusConfig = {
  healthy: { label: "Healthy", className: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50" },
  warning: { label: "Warning", className: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50" },
  critical: { label: "Critical", className: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/50" },
  inactive: { label: "Inactive", className: "bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/50" }
};

const NodeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [node, setNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cpuData, setCpuData] = useState([]);
  const [ramData, setRamData] = useState([]);
  const [diskData, setDiskData] = useState([]);
  const [networkData, setNetworkData] = useState([]);
  const [timeFrame, setTimeFrame] = useState("24h");

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const nodeData = await fetchNodeDetails(id);
        if (!nodeData) {
          toast({
            title: "Node not found",
            description: "The requested node could not be found.",
            variant: "destructive",
          });
          navigate('/nodes');
          return;
        }
        
        setNode(nodeData);
        
        // Fetch metrics data
        const cpuMetrics = await fetchMetrics(id, 'cpu', timeFrame);
        const ramMetrics = await fetchMetrics(id, 'ram', timeFrame);
        const diskMetrics = await fetchMetrics(id, 'disk', timeFrame);
        const networkMetrics = await fetchMetrics(id, 'network', timeFrame);
        
        setCpuData(cpuMetrics);
        setRamData(ramMetrics);
        setDiskData(diskMetrics);
        setNetworkData(networkMetrics);
      } catch (error) {
        console.error('Error loading node details:', error);
        toast({
          title: "Error loading data",
          description: "Could not fetch node data from the server.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, navigate, toast, timeFrame]);
  
  const refreshData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const nodeData = await fetchNodeDetails(id);
      if (nodeData) {
        setNode(nodeData);
      }
      
      // Refresh metrics data
      const cpuMetrics = await fetchMetrics(id, 'cpu', timeFrame);
      const ramMetrics = await fetchMetrics(id, 'ram', timeFrame);
      const diskMetrics = await fetchMetrics(id, 'disk', timeFrame);
      const networkMetrics = await fetchMetrics(id, 'network', timeFrame);
      
      setCpuData(cpuMetrics);
      setRamData(ramMetrics);
      setDiskData(diskMetrics);
      setNetworkData(networkMetrics);
      
      toast({
        title: "Data refreshed",
        description: "Node data has been updated."
      });
    } catch (error) {
      console.error('Error refreshing node details:', error);
      toast({
        title: "Error refreshing data",
        description: "Could not fetch updated node data from the server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !node) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto py-6 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-lg">Loading node data...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const statusInfo = node ? statusConfig[node.status] : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-6 px-4">
        <div className="mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/nodes')}
            className="flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Nodes
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{node?.name}</h1>
                {statusInfo && (
                  <Badge variant="outline" className={statusInfo.className}>
                    {statusInfo.label}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{node?.ip}</p>
            </div>
            <Button variant="outline" onClick={refreshData} className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ResourceCard 
              title="CPU Usage" 
              value={node?.cpu || 0} 
              icon={<Cpu className="h-5 w-5" />} 
            />
            <ResourceCard 
              title="Memory Usage" 
              value={node?.ram || 0} 
              icon={<Memory className="h-5 w-5" />} 
            />
            <ResourceCard 
              title="Disk Usage" 
              value={node?.disk || 0} 
              icon={<HardDrive className="h-5 w-5" />} 
            />
            <ResourceCard 
              title="Network" 
              value={node?.network?.up || 0} 
              icon={<Wifi className="h-5 w-5" />}
              max={50}
              unit=" Mbps" 
            />
          </div>
        </section>
        
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Performance Metrics</h2>
            <div className="flex items-center">
              <Tabs defaultValue="24h" value={timeFrame} onValueChange={setTimeFrame}>
                <TabsList>
                  <TabsTrigger value="1h">1h</TabsTrigger>
                  <TabsTrigger value="6h">6h</TabsTrigger>
                  <TabsTrigger value="24h">24h</TabsTrigger>
                  <TabsTrigger value="7d">7d</TabsTrigger>
                  <TabsTrigger value="30d">30d</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <MetricsChart 
              title="CPU Usage"
              data={cpuData}
              lines={[
                { key: 'value', color: '#8b5cf6', name: 'CPU Usage (%)' },
              ]}
            />
            <MetricsChart 
              title="Memory Usage"
              data={ramData}
              lines={[
                { key: 'value', color: '#3b82f6', name: 'Memory Usage (%)' },
              ]}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricsChart 
              title="Disk Usage"
              data={diskData}
              lines={[
                { key: 'value', color: '#6366f1', name: 'Disk Usage (%)' },
              ]}
            />
            <MetricsChart 
              title="Network Traffic"
              data={networkData}
              lines={[
                { key: 'download', color: '#10b981', name: 'Download (Mbps)' },
                { key: 'upload', color: '#f59e0b', name: 'Upload (Mbps)' },
              ]}
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default NodeDetail;
