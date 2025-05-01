import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Settings, ExternalLink } from "lucide-react";
import { Channel } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";

const ConnectionConfig = () => {
  const { data: channels, isLoading, error } = useQuery<Channel[]>({
    queryKey: ['/api/channels'],
    refetchInterval: 30000 // 30 seconds
  });

  const toggleTracking = async (channel: Channel) => {
    try {
      await apiRequest(`/api/channels/${channel.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          isTracking: !channel.isTracking
        })
      });
      
      // Invalidate channels query
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/status'] });
    } catch (error) {
      console.error('Failed to toggle channel tracking:', error);
    }
  };
  
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Channel Connections</CardTitle>
          <CardDescription>Configure which channels to track</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-md">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error || !channels) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Channel Connections</CardTitle>
          <CardDescription>Configure which channels to track</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 p-4 text-center">
            Failed to load channel connections
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Channel Connections</CardTitle>
          <CardDescription>Configure which channels to track</CardDescription>
        </div>
        <Link href="/api-settings">
          <Button variant="outline" size="sm" className="gap-1">
            <Settings className="h-4 w-4" />
            Edit Connections
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {channels.length === 0 ? (
          <div className="text-center p-6 text-gray-500">
            <p className="mb-4">No channels configured for tracking.</p>
            <Link href="/api-settings">
              <Button className="bg-primary text-white hover:bg-primary/90">
                Add a Channel
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {channels.map((channel) => (
              <div key={channel.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-md">
                <div className="space-y-1">
                  <div className="flex items-center">
                    <h3 className="font-medium">{channel.name}</h3>
                    <Badge 
                      variant="outline" 
                      className={`ml-2 ${
                        channel.status === 'active' 
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : channel.status === 'connecting'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {channel.status === 'active' ? 'Active' : 
                       channel.status === 'connecting' ? 'Connecting' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    {channel.isTracking 
                      ? 'Currently tracking messages' 
                      : 'Not tracking messages'}
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center mr-4">
                    <Switch 
                      id={`track-${channel.id}`} 
                      checked={channel.isTracking}
                      onCheckedChange={() => toggleTracking(channel)}
                      className="mr-2"
                    />
                    <Label htmlFor={`track-${channel.id}`} className="text-sm">
                      {channel.isTracking ? 'On' : 'Off'}
                    </Label>
                  </div>
                  <Link href={`/stored-data?channelId=${channel.id}`}>
                    <Button variant="ghost" size="sm" className="p-0 h-8 w-8 rounded-full">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 text-center">
          <Link href="https://kick.com/" target="_blank" rel="noopener noreferrer">
            <Button variant="link" className="gap-1">
              <ExternalLink className="h-4 w-4" />
              Visit Kick.com
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionConfig;