import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useKeywordNotification } from "@/hooks/useKeywordNotification";
import { ChatMessage, Channel } from "@shared/schema";
import StatusBadge from "@/components/common/StatusBadge";
import KeywordFilter from "@/components/chat/KeywordFilter";
import { format } from "date-fns";
import { User, MessageSquare, Filter, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define the types for API responses
interface ChannelsResponse {
  [key: string]: any;
  channels?: Channel[];
}

interface MessagesResponse {
  [key: string]: any;
  messages?: ChatMessage[];
}

const ChatMonitor = () => {
  const { toast } = useToast();
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState("");
  const [messageTab, setMessageTab] = useState("live");
  const [showKeywords, setShowKeywords] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Set up keyword notification
  const { checkMessage } = useKeywordNotification([], {
    onMatch: (message, keyword) => {
      toast({
        title: `Keyword match: "${keyword}"`,
        description: `From ${message.username}: ${message.message}`,
      });
    }
  });
  
  // Fetch available channels
  const { data: channelsData, isLoading: isLoadingChannels } = useQuery<ChannelsResponse>({
    queryKey: ['/api/channels'],
  });
  
  // Extract channels from response
  const channels = channelsData?.channels || [];
  
  // Fetch initial messages
  const { data: messagesData, isLoading: isLoadingMessages } = useQuery<MessagesResponse>({
    queryKey: ['/api/messages', { 
      limit: 100,
      channelId: selectedChannel !== "all" ? parseInt(selectedChannel) : undefined
    }],
  });
  
  // Set up WebSocket for real-time message updates
  const { isConnected } = useWebSocket({
    onMessage: (data) => {
      if (data.type === 'newMessage') {
        const message = data.message as ChatMessage;
        
        // Check for keyword matches
        checkMessage(message);
        
        // Only add message if it matches the selected channel filter
        if (selectedChannel === "all" || message.channelId.toString() === selectedChannel) {
          setMessages(prev => [message, ...prev].slice(0, 1000)); // Keep last 1000 messages
        }
      }
    }
  });
  
  // Initialize messages from the query
  useEffect(() => {
    if (messagesData?.messages && Array.isArray(messagesData.messages)) {
      setMessages(messagesData.messages);
    }
  }, [messagesData]);
  
  // Scroll to bottom when new messages arrive if autoScroll is enabled
  useEffect(() => {
    if (autoScroll && messagesEndRef.current && messageTab === "live") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll, messageTab]);
  
  // Filter messages based on input
  const filteredMessages = messages.filter(message => {
    if (!filter) return true;
    
    const lowerFilter = filter.toLowerCase();
    return (
      message.username.toLowerCase().includes(lowerFilter) ||
      message.message.toLowerCase().includes(lowerFilter)
    );
  });
  
  const getChannelName = (channelId: number) => {
    const channel = channels.find((c: Channel) => c.id === channelId);
    return channel?.name || 'Unknown';
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Chat Monitor</h1>
        <p className="text-neutral-500">
          Track and analyze chat messages in real-time. Filter by channel, user, or content.
        </p>
      </div>
      
      {/* Keyword Notifications Panel */}
      {showKeywords && (
        <div className="mb-6">
          <KeywordFilter
            onMatchFound={(message, keyword) => {
              toast({
                title: `Keyword Match: "${keyword}"`,
                description: `From ${message.username}: ${message.message}`,
              });
            }}
          />
        </div>
      )}
      
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between py-4 px-5 border-b border-neutral-100">
          <CardTitle className="text-base font-medium">Live Chat Feed</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="auto-scroll" 
                checked={autoScroll} 
                onCheckedChange={setAutoScroll} 
              />
              <Label htmlFor="auto-scroll">Auto-scroll</Label>
            </div>
            
            <Select 
              value={selectedChannel} 
              onValueChange={setSelectedChannel}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select channel" />
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
            
            <div className="relative">
              <Filter className="absolute left-3 top-2.5 h-4 w-4 text-neutral-300" />
              <Input
                placeholder="Filter messages..."
                className="pl-9 w-[220px]"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setShowKeywords(!showKeywords)}
            >
              <Bell className="h-4 w-4" />
              {showKeywords ? 'Hide Keywords' : 'Keywords'}
            </Button>
          </div>
        </CardHeader>
        
        <Tabs value={messageTab} onValueChange={setMessageTab}>
          <div className="px-5 pt-2 border-b border-neutral-100">
            <TabsList>
              <TabsTrigger value="live">Live Feed</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="users">User Activity</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="live" className="p-0">
            <div className="max-h-[calc(100vh-350px)] overflow-y-auto custom-scrollbar p-4 flex flex-col-reverse">
              {isLoadingMessages ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="rounded-lg p-4 border border-neutral-100">
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ))}
                </div>
              ) : filteredMessages.length > 0 ? (
                filteredMessages.map((message) => (
                  <div key={message.id} className="mb-3 p-3 bg-white rounded-lg shadow-sm border border-neutral-100">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 mr-2">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <p className="font-semibold text-sm">{message.username}</p>
                            <StatusBadge status={message.userType} className="ml-2 text-[10px] py-0 h-4" />
                          </div>
                          <p className="text-xs text-neutral-400">
                            {getChannelName(message.channelId)} • {format(new Date(message.timestamp), 'MMM d, h:mm:ss a')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="pl-10">
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <MessageSquare className="h-10 w-10 mx-auto text-neutral-300 mb-2" />
                  <p className="text-neutral-500">No messages to display</p>
                  <p className="text-sm text-neutral-400">
                    {filter ? "Try changing your filter" : "Waiting for new messages..."}
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t border-neutral-100 bg-neutral-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} mr-2`}></span>
                  <p className="text-sm text-neutral-500">
                    {isConnected ? 'Connected' : 'Disconnected'} - 
                    Showing {filteredMessages.length} {filter ? 'filtered ' : ''}messages
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setMessages([])}>
                  Clear Feed
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="statistics" className="p-0">
            <div className="p-8 text-center">
              <h3 className="text-lg font-medium mb-2">Message Statistics</h3>
              <p className="text-neutral-500">
                This feature will show message volume trends, user participation, and more.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="p-0">
            <div className="p-8 text-center">
              <h3 className="text-lg font-medium mb-2">User Activity</h3>
              <p className="text-neutral-500">
                This feature will show most active users, moderation actions, and user engagement.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </Layout>
  );
};

export default ChatMonitor;
