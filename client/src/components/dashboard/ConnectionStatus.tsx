import { useQuery } from "@tanstack/react-query";
import { Link, Database, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const ConnectionStatus = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/status'],
    refetchInterval: 5000 // Refresh every 5 seconds
  });
  
  if (isLoading) {
    return (
      <div className="flex flex-wrap items-center mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="mr-6 mb-2">
            <div className="bg-white p-3 rounded-lg shadow-sm w-64">
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg mb-6">
        <h3 className="text-red-800 font-medium">Connection Error</h3>
        <p className="text-red-600 text-sm">Failed to load connection status. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center mb-6">
      <div className="mr-6 mb-2">
        <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
          <div className={`h-10 w-10 rounded-md flex items-center justify-center mr-3 ${
            data.apiConnection === 'connected' 
              ? 'bg-green-100 text-green-600' 
              : 'bg-amber-100 text-amber-600'
          }`}>
            <Link className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-neutral-300">API Connection</p>
            <div className="flex items-center">
              <span className={`h-2 w-2 rounded-full mr-2 ${
                data.apiConnection === 'connected' ? 'bg-green-500' : 'bg-amber-500'
              }`}></span>
              <p className="font-medium capitalize">{data.apiConnection}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mr-6 mb-2">
        <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
          <div className="h-10 w-10 rounded-md bg-primary bg-opacity-10 flex items-center justify-center text-primary mr-3">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-neutral-300">Database</p>
            <div className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
              <p className="font-medium">Active</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mr-6 mb-2">
        <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
          <div className={`h-10 w-10 rounded-md flex items-center justify-center mr-3 ${
            data.trackedChannelCount > 0 
              ? 'bg-amber-100 text-amber-600' 
              : 'bg-red-100 text-red-600'
          }`}>
            <History className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-neutral-300">Streaming Status</p>
            <div className="flex items-center">
              <span className={`h-2 w-2 rounded-full mr-2 ${
                data.trackedChannelCount > 0 ? 'bg-amber-500' : 'bg-red-500'
              }`}></span>
              <p className="font-medium">
                {data.trackedChannelCount > 0 
                  ? `Tracking (${data.trackedChannelCount} channels)` 
                  : 'No active channels'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="ml-auto mb-2">
        <Link href="/api-settings">
          <Button className="bg-primary text-white hover:bg-primary/90 flex items-center">
            <span className="mr-1">+</span>
            New Connection
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ConnectionStatus;
