import { useQuery } from "@tanstack/react-query";
import StatCard from "./StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Users, Tv, HardDrive } from "lucide-react";

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const StatsOverview = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/status'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-5 rounded-lg shadow-sm">
            <div className="flex justify-between mb-4">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <Skeleton className="h-8 w-28 mb-4" />
            <Skeleton className="h-4 w-36" />
          </div>
        ))}
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
