import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Tv } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import Pagination from "@/components/common/Pagination";
import { ChatMessage, Channel } from "@shared/schema";
import { format } from "date-fns";

const RecentMessages = () => {
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 5;
  
  const channelsQuery = useQuery({
    queryKey: ['/api/channels'],
  });
  
  const messagesQuery = useQuery({
    queryKey: ['/api/messages', { 
      limit, 
      offset: (page - 1) * limit,
      channelId: selectedChannel !== "all" ? parseInt(selectedChannel) : undefined
    }],
  });
  
  const handleRefresh = () => {
    messagesQuery.refetch();
  };
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-4 px-5 border-b border-neutral-100">
        <CardTitle className="text-base font-medium">Recent Messages</CardTitle>
        <div className="flex items-center">
          <div className="mr-4">
            <Select 
              value={selectedChannel} 
              onValueChange={setSelectedChannel}
            >
              <SelectTrigger className="w-[180px] h-9 text-sm">
                <SelectValue placeholder="All Channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                {channelsQuery.data?.map((channel: Channel) => (
                  <SelectItem key={channel.id} value={channel.id.toString()}>
                    {channel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="link" 
            className="text-primary text-sm flex items-center"
            onClick={handleRefresh}
            disabled={messagesQuery.isFetching}
          >
            <RefreshCw className="mr-1 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-neutral-100">
          <thead className="bg-neutral-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Timestamp</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Channel</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">User</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Message</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Metadata</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-100">
            {messagesQuery.isLoading ? (
              Array(limit).fill(0).map((_, index) => (
                <tr key={index}>
                  <td colSpan={6} className="px-6 py-4">
                    <Skeleton className="h-8 w-full" />
                  </td>
                </tr>
              ))
            ) : messagesQuery.data?.messages?.length > 0 ? (
              messagesQuery.data.messages.map((message: ChatMessage) => {
                const channel = channelsQuery.data?.find((c: Channel) => c.id === message.channelId);
                return (
                  <tr key={message.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
                      {format(new Date(message.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-md bg-primary bg-opacity-10 flex items-center justify-center">
                          <Tv className="h-4 w-4 text-primary" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">{channel?.name || 'Unknown'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium">{message.username}</p>
                      <p className="text-xs text-neutral-300">ID: {message.userId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{message.message}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={message.userType} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="link" className="text-primary">Details</Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-neutral-400">
                  No messages found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <CardContent className="px-5 py-3 border-t border-neutral-100">
        <Pagination
          currentPage={page}
          totalItems={messagesQuery.data?.pagination?.total || 0}
          itemsPerPage={limit}
          onPageChange={handlePageChange}
        />
      </CardContent>
    </Card>
  );
};

export default RecentMessages;
