
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Progress } from "@/components/ui/enhanced-progress";

interface ResourceCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  className?: string;
  max?: number;
  unit?: string;
}

const ResourceCard = ({ 
  title, 
  value, 
  icon, 
  className,
  max = 100,
  unit = "%"
}: ResourceCardProps) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  let statusColor = "bg-green-500";
  if (percentage > 80) {
    statusColor = "bg-red-500";
  } else if (percentage > 60) {
    statusColor = "bg-yellow-500";
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            {icon}
            {title}
          </span>
          <span className="text-xl font-semibold">
            {value.toFixed(1)}{unit}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={percentage} className="h-2" indicatorClassName={statusColor} />
      </CardContent>
    </Card>
  );
};

export default ResourceCard;
