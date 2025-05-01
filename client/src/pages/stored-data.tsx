import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from "@/components/common/Pagination";
import StatusBadge from "@/components/common/StatusBadge";
import { ChatMessage, Channel } from "@shared/schema";
import { Tv, Download, Trash2, RefreshCw, Pencil, Search } from "lucide-react";
import { format } from "date-fns";

const StoredData = () => {
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");
  const limit = 10;
  
  // Fetch channels
  const { data: channels, isLoading: isLoadingChannels } = useQuery({
    queryKey: ['/api/channels'],
  });
  
  // Fetch messages with filters
  const { data: messagesData, isLoading: isLoadingMessages, refetch } = useQuery({
    queryKey: ['/api/messages', { 
      limit, 
      offset: (page - 1) * limit,
      channelId: selectedChannel !== "all" ? parseInt(selectedChannel) : undefined,
      query: searchQuery
    }],
  });
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };
  
  const getChannelName = (channelId: number) => {
    const channel = channels?.find((c: Channel) => c.id === channelId);
    return channel?.name || 'Unknown';
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Stored Data</h1>
        <p className="text-neutral-500">
          Browse, search, and manage stored chat messages from your tracked channels.
        </p>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between py-4 px-5 border-b border-neutral-100">
          <CardTitle className="text-base font-medium">Message Database</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-300" />
                <Input
                  placeholder="Search messages or users..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
            
            <div className="flex gap-2">
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  {channels?.map((channel: Channel) => (
                    <SelectItem key={channel.id} value={channel.id.toString()}>
                      {channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [newSortBy, newSortOrder] = value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="timestamp-desc">Newest First</SelectItem>
                  <SelectItem value="timestamp-asc">Oldest First</SelectItem>
                  <SelectItem value="username-asc">Username (A-Z)</SelectItem>
                  <SelectItem value="username-desc">Username (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="border rounded-md">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-100">
                <thead className="bg-neutral-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Timestamp</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Channel</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">User</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Message</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-100">
                  {isLoadingMessages ? (
                    Array(limit).fill(0).map((_, index) => (
                      <tr key={index}>
                        <td colSpan={6} className="px-6 py-4">
                          <Skeleton className="h-8 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : messagesData?.messages?.length > 0 ? (
                    messagesData.messages.map((message: ChatMessage) => (
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
                              <p className="text-sm font-medium">{getChannelName(message.channelId)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium">{message.username}</p>
                          <p className="text-xs text-neutral-300">ID: {message.userId}</p>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <p className="text-sm truncate">{message.message}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={message.userType} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-neutral-400">
                        No messages found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 border-t border-neutral-100">
              <Pagination
                currentPage={page}
                totalItems={messagesData?.pagination?.total || 0}
                itemsPerPage={limit}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Data Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Data Retention</p>
                <Select defaultValue="30days">
                  <SelectTrigger>
                    <SelectValue placeholder="Select retention period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">7 Days</SelectItem>
                    <SelectItem value="30days">30 Days</SelectItem>
                    <SelectItem value="90days">90 Days</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Database Cleanup</p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">Archive Old Data</Button>
                  <Button variant="destructive" className="flex-1">Clear Database</Button>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Database Statistics</p>
                <div className="bg-neutral-50 p-4 rounded-md">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-neutral-500">Total Messages</p>
                      <p className="font-medium">{messagesData?.pagination?.total || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Storage Used</p>
                      <p className="font-medium">482 MB</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Last Cleanup</p>
                      <p className="font-medium">Never</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Channels</p>
                      <p className="font-medium">{channels?.length || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Bulk Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Export Options</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="flex items-center justify-center gap-1">
                    <Download className="h-4 w-4" />
                    Export as JSON
                  </Button>
                  <Button variant="outline" className="flex items-center justify-center gap-1">
                    <Download className="h-4 w-4" />
                    Export as CSV
                  </Button>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Filter for Export</p>
                <div className="space-y-2">
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Select channels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Channels</SelectItem>
                      {channels?.map((channel: Channel) => (
                        <SelectItem key={channel.id} value={channel.id.toString()}>
                          {channel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All User Types</SelectItem>
                      <SelectItem value="regular">Regular Users</SelectItem>
                      <SelectItem value="subscriber">Subscribers</SelectItem>
                      <SelectItem value="moderator">Moderators</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Start Date</p>
                      <Input type="date" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">End Date</p>
                      <Input type="date" />
                    </div>
                  </div>
                </div>
              </div>
              
              <Button className="w-full">Generate Export</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default StoredData;
