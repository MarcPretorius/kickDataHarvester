import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ExternalLink, Flag, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ChatMessage } from "@shared/schema";

interface MessagesResponse {
  messages: ChatMessage[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  }
}

const RecentMessages = () => {
  const { data, isLoading, error } = useQuery<MessagesResponse>({
    queryKey: ['/api/messages'],
    refetchInterval: 10000 // 10 seconds
  });
  
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>Latest chat messages across all channels</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-4 p-4 border border-gray-100 rounded-md">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error || !data) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
          <CardDescription>Latest chat messages across all channels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 p-4 text-center">
            Failed to load recent messages
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Messages</CardTitle>
          <CardDescription>Latest chat messages across all channels</CardDescription>
        </div>
        <Link href="/chat-monitor">
          <Button variant="outline" size="sm" className="gap-1">
            <ExternalLink className="h-4 w-4" />
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.messages.slice(0, 5).map((message) => (
            <div key={message.id} className="flex items-start space-x-4 p-4 border border-gray-100 rounded-md">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                message.userType === 'moderator' 
                  ? 'bg-purple-100 text-purple-600'
                  : message.userType === 'subscriber'
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {message.username.substring(0, 2).toUpperCase()}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{message.username}</span>
                    {message.userType === 'moderator' && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100">Mod</Badge>
                    )}
                    {message.userType === 'subscriber' && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Sub</Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <p className={message.isHidden ? 'text-gray-400 line-through' : ''}>
                  {message.message}
                </p>
                
                {message.isFlagged && (
                  <div className="flex items-center mt-2 text-xs text-amber-600">
                    <Flag className="h-3 w-3 mr-1" />
                    <span>
                      Flagged: {message.moderationReason || 'Content filter match'}
                    </span>
                  </div>
                )}
                
                {!message.isHidden && message.isFlagged && (
                  <div className="flex items-center mt-2 gap-2">
                    <Button variant="ghost" size="sm" className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50 p-0 px-2">
                      <X className="h-3 w-3 mr-1" />
                      Hide
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-green-600 hover:text-green-700 hover:bg-green-50 p-0 px-2">
                      <Check className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {data.messages.length === 0 && (
            <div className="text-center p-6 text-gray-600">
              No messages found. Start tracking channels to see chat messages.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentMessages;