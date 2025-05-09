
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NodeStatusCard from '@/components/NodeStatusCard';
import { useState, useEffect } from 'react';
import { fetchNodes } from '@/services/api';
import { Plus, RefreshCw, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Nodes = () => {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const nodesData = await fetchNodes();
        setNodes(nodesData);
      } catch (error) {
        console.error('Failed to load nodes:', error);
        toast({
          title: "Error loading nodes",
          description: "Could not fetch node data from the server.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [toast]);
  
  const refreshData = async () => {
    setLoading(true);
    try {
      const nodesData = await fetchNodes();
      setNodes(nodesData);
      toast({
        title: "Data refreshed",
        description: "Node data has been updated."
      });
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast({
        title: "Error refreshing data",
        description: "Could not fetch updated node data from the server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const filteredNodes = nodes.filter(node => 
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    node.ip.includes(searchQuery)
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Nodes</h1>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={refreshData} className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Node
            </Button>
          </div>
        </div>
        
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            className="pl-10"
            placeholder="Search by name or IP address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-lg">Loading nodes...</div>
          </div>
        ) : (
          filteredNodes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNodes.map((node) => (
                <NodeStatusCard key={node.id} node={node} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-lg text-muted-foreground mb-4">No nodes found matching your search</p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            </div>
          )
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Nodes;
