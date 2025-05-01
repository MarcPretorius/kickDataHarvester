import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Users, Tv, HardDrive } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Define type for status response
interface StatusResponse {
  apiConnection: string;
  databaseStatus: string;
  messageCount: number;
  activeUserCount: number;
  trackedChannelCount: number;
  dataStorageSize: number;
}

// StatCard component for individual stats
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  progress?: {
    value: number;
    max: number;
  };
}

const StatCard = ({ title, value, icon, change, progress }: StatCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center mb-2">
        <div className="h-10 w-10 rounded-md bg-primary bg-opacity-10 flex items-center justify-center mr-3">
          {icon}
        </div>
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      
      <div className="mb-2">
        <p className="text-2xl font-bold">{value}</p>
        
        {change && (
          <div className="flex items-center mt-1">
            <span className={`text-xs ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {change.isPositive ? '↑' : '↓'} {change.value}% {change.label}
            </span>
          </div>
        )}
      </div>
      
      {progress && (
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-primary h-2 rounded-full" 
            style={{ width: `${Math.min(100, (progress.value / progress.max) * 100)}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

// Format large numbers with commas
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

// Format bytes to KB, MB, GB, etc.
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const StatsOverview = () => {
  const { data, isLoading, error } = useQuery<StatusResponse>({
    queryKey: ['/api/status'],
    refetchInterval: 10000
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center mb-2">
              <Skeleton className="h-10 w-10 rounded-md mr-3" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="bg-red-50 p-4 rounded-lg mb-6">
        <h3 className="text-red-800 font-medium">Error Loading Stats</h3>
        <p className="text-red-600 text-sm">Failed to load stats overview. Please try again later.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Total Messages"
        value={formatNumber(data.messageCount)}
        icon={<MessageSquare className="text-primary" />}
        change={{ value: 12.5, label: "vs last week", isPositive: true }}
      />
      
      <StatCard
        title="Active Users"
        value={formatNumber(data.activeUserCount)}
        icon={<Users className="text-green-500" />}
        change={{ value: 8.1, label: "vs last week", isPositive: true }}
      />
      
      <StatCard
        title="Channels Tracked"
        value={data.trackedChannelCount}
        icon={<Tv className="text-amber-500" />}
        change={data.trackedChannelCount > 0 
          ? { value: data.trackedChannelCount, label: "active now", isPositive: true }
          : { value: 0, label: "active now", isPositive: false }
        }
      />
      
      <StatCard
        title="Data Storage"
        value={formatBytes(data.dataStorageSize)}
        icon={<HardDrive className="text-primary" />}
        progress={{ value: data.dataStorageSize, max: 1024 * 1024 * 1024 }}  // 1GB max for demo
      />
    </div>
  );
};

export default StatsOverview;