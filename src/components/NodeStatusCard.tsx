
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, AlertTriangle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "healthy" | "warning" | "critical" | "inactive";

interface StatusConfig {
  icon: React.ReactNode;
  label: string;
  className: string;
}

const statusConfig: Record<Status, StatusConfig> = {
  healthy: {
    icon: <Check className="h-4 w-4" />,
    label: "Healthy",
    className: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4" />,
    label: "Warning",
    className: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50",
  },
  critical: {
    icon: <XCircle className="h-4 w-4" />,
    label: "Critical",
    className: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/50",
  },
  inactive: {
    icon: <Clock className="h-4 w-4" />,
    label: "Inactive",
    className: "bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/50",
  }
};

export interface NodeData {
  id: string;
  name: string;
  ip: string;
  status: Status;
  cpu: number;
  ram: number;
  disk: number;
  network: {
    up: number;
    down: number;
  };
  uptime: string;
  lastSeen: string;
}

interface NodeStatusCardProps {
  node: NodeData;
  className?: string;
}

const NodeStatusCard = ({ node, className }: NodeStatusCardProps) => {
  const { icon, label, className: statusClassName } = statusConfig[node.status];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{node.name}</CardTitle>
          <Badge variant="outline" className={cn("flex items-center gap-1 px-2", statusClassName)}>
            {icon} {label}
          </Badge>
        </div>
        <CardDescription>{node.ip}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">CPU</span>
            <span>{node.cpu}%</span>
          </div>
          <Progress value={node.cpu} className="h-1" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">RAM</span>
            <span>{node.ram}%</span>
          </div>
          <Progress value={node.ram} className="h-1" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Disk</span>
            <span>{node.disk}%</span>
          </div>
          <Progress value={node.disk} className="h-1" />
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between text-xs text-muted-foreground">
        <span>Uptime: {node.uptime}</span>
        <span>Last seen: {node.lastSeen}</span>
      </CardFooter>
    </Card>
  );
};

export default NodeStatusCard;
