
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { fetchNodes } from '@/services/api';
import { Check, Copy, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Dummy function to generate a client token
const generateClientToken = () => {
  return 'sp_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const Admin = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNodeToken, setNewNodeToken] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const nodesData = await fetchNodes();
        setNodes(nodesData);
      } catch (error) {
        console.error('Failed to load nodes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handleGenerateToken = () => {
    const token = generateClientToken();
    setNewNodeToken(token);
    toast({
      title: "Token generated",
      description: "Copy this token to connect a new node."
    });
  };

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(newNodeToken);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Node token has been copied to clipboard."
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the token manually.",
        variant: "destructive"
      });
    }
  };

  const removeNode = (nodeId) => {
    setNodes((prev) => prev.filter((node) => node.id !== nodeId));
    toast({
      title: "Node removed",
      description: "The node has been removed from your dashboard."
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
        
        <Tabs defaultValue="nodes" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="nodes">Manage Nodes</TabsTrigger>
            <TabsTrigger value="account">Account Settings</TabsTrigger>
            <TabsTrigger value="system">System Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="nodes">
            <div className="space-y-6">
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Add New Node</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="token">Client Token</Label>
                    <div className="flex mt-1.5">
                      <Input
                        id="token"
                        value={newNodeToken}
                        readOnly
                        placeholder="Generate a token to connect a new node"
                        className="flex-1 rounded-r-none"
                      />
                      <Button
                        onClick={copyToken}
                        className="rounded-l-none"
                        disabled={!newNodeToken}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button onClick={handleGenerateToken} className="flex items-center gap-1">
                      <Plus className="h-4 w-4" />
                      Generate Token
                    </Button>
                    <Button variant="outline" onClick={() => setNewNodeToken('')}>Clear</Button>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-md text-sm">
                    <p className="font-medium mb-1">Instructions:</p>
                    <ol className="list-decimal list-inside">
                      <li>Generate a new token</li>
                      <li>Copy the token</li>
                      <li>Run the client setup script on your target node</li>
                      <li>Paste the token when prompted</li>
                    </ol>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg border">
                <div className="flex justify-between items-center p-6 pb-4">
                  <h2 className="text-xl font-semibold">Connected Nodes</h2>
                  <Button variant="outline" className="flex items-center gap-1">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>
                
                <div className="p-6 pt-0">
                  {loading ? (
                    <div className="h-40 flex items-center justify-center">
                      <p className="text-muted-foreground animate-pulse">Loading nodes...</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>IP Address</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Seen</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {nodes.map((node) => (
                          <TableRow key={node.id}>
                            <TableCell className="font-medium">{node.name}</TableCell>
                            <TableCell>{node.ip}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  node.status === 'healthy'
                                    ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/50'
                                    : node.status === 'warning'
                                    ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/50'
                                    : node.status === 'critical'
                                    ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/50'
                                    : 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/50'
                                }
                              >
                                {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>{node.lastSeen}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeNode(node.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="account">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Account Information</h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={user?.username || ''} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" value={user?.email || ''} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={user?.role || ''} className="mt-1.5" readOnly />
                </div>
                <div>
                  <Button>Update Account Information</Button>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Change Password</h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" className="mt-1.5" />
                </div>
                <div>
                  <Button>Change Password</Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="system">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">System Configuration</h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <Label htmlFor="data-retention">Data Retention (days)</Label>
                  <Input id="data-retention" type="number" defaultValue="90" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="check-interval">Check Interval (seconds)</Label>
                  <Input id="check-interval" type="number" defaultValue="60" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="alert-threshold">Alert Threshold (%)</Label>
                  <Input id="alert-threshold" type="number" defaultValue="80" className="mt-1.5" />
                </div>
                <div>
                  <Button>Save Configuration</Button>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Email Notifications</h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <Label htmlFor="smtp-server">SMTP Server</Label>
                  <Input id="smtp-server" placeholder="smtp.example.com" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input id="smtp-port" placeholder="587" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="smtp-user">SMTP Username</Label>
                  <Input id="smtp-user" placeholder="user@example.com" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="smtp-password">SMTP Password</Label>
                  <Input id="smtp-password" type="password" className="mt-1.5" />
                </div>
                <div>
                  <Button>Save SMTP Settings</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
