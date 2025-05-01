import { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  progress?: {
    value: number;
    max: number;
  };
}

const StatCard = ({ title, value, icon, change, progress }: StatCardProps) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-neutral-300">{title}</h3>
        <div className="p-1.5 rounded-md bg-primary bg-opacity-10">
          {icon}
        </div>
      </div>
      
      <p className="text-2xl font-semibold">{value}</p>
      
      {change && (
        <div className="flex items-center mt-2 text-sm">
          <span className={cn(
            "flex items-center",
            change.isPositive ? "text-green-500" : "text-red-500"
          )}>
            {change.isPositive 
              ? <ArrowUpRight className="h-4 w-4 mr-1" /> 
              : <ArrowDownRight className="h-4 w-4 mr-1" />}
            {change.value}%
          </span>
          <span className="text-neutral-300 ml-2">{change.label}</span>
        </div>
      )}
      
      {progress && (
        <div className="flex items-center mt-2 text-sm">
          <div className="w-full bg-neutral-200 rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full" 
              style={{ width: `${(progress.value / progress.max) * 100}%` }}
            ></div>
          </div>
          <span className="text-neutral-300 ml-2">{Math.round((progress.value / progress.max) * 100)}%</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
