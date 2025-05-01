import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tv } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import { Channel } from "@shared/schema";

const TopChannels = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/channels'],
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Top Channels</CardTitle>
        <Button variant="link" size="sm" className="text-primary">
          View All
        </Button>
      </CardHeader>
      
      <CardContent className="pt-2">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="py-2 border-b border-neutral-100">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div>
            {data && data.length > 0 ? (
              data
                .sort((a: Channel, b: Channel) => b.messageCount - a.messageCount)
                .slice(0, 5)
                .map((channel: Channel) => (
                  <div key={channel.id} className="py-2 border-b border-neutral-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-md bg-primary bg-opacity-10 flex items-center justify-center mr-3">
                          <Tv className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{channel.name}</p>
                          <p className="text-xs text-neutral-300">
                            {channel.messageCount.toLocaleString()} messages
                          </p>
                        </div>
                      </div>
                      <div>
                        <StatusBadge status={channel.status} />
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-neutral-400">No channels tracked yet</p>
                <Button variant="link" className="mt-2 text-primary text-sm">
                  Add a channel
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopChannels;
