
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, HardDrive, Activity, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsSummaryProps {
  totalNodes: number;
  activeNodes: number;
  warningNodes: number;
  criticalNodes: number;
  className?: string;
}

const StatsSummary = ({ 
  totalNodes, 
  activeNodes, 
  warningNodes, 
  criticalNodes,
  className 
}: StatsSummaryProps) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Nodes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Server className="h-5 w-5 mr-2 text-primary" />
            <span className="text-2xl font-bold">{totalNodes}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Nodes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-green-500" />
            <span className="text-2xl font-bold">{activeNodes}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Warning Nodes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
            <span className="text-2xl font-bold">{warningNodes}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Critical Nodes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <XCircle className="h-5 w-5 mr-2 text-red-500" />
            <span className="text-2xl font-bold">{criticalNodes}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsSummary;

// Add missing import
import { AlertTriangle, XCircle } from "lucide-react";
