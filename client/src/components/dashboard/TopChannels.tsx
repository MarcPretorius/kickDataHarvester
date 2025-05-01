import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface ChannelData {
  name: string;
  messageCount: number;
}

// Demo data for top channels (this would normally come from the backend)
const mockChannelData = [
  { name: 'test_channel', messageCount: 1248 },
  { name: 'gaming_live', messageCount: 836 },
  { name: 'kick_official', messageCount: 732 },
  { name: 'channel3', messageCount: 621 },
  { name: 'esports_now', messageCount: 497 },
];

const TopChannels = () => {
  const { data, isLoading, error } = useQuery<ChannelData[]>({
    queryKey: ['/api/statistics/channels/top'],
    // Fallback to demo data until backend endpoint is implemented
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockChannelData;
    },
    refetchInterval: 60000 // 1 minute
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Channels</CardTitle>
          <CardDescription>Most active channels by message count</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Channels</CardTitle>
          <CardDescription>Most active channels by message count</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 p-4 text-center">
            Failed to load channel data
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Sort data by message count in descending order
  const sortedData = [...data].sort((a, b) => b.messageCount - a.messageCount);
  
  const colors = ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'];
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Top Channels</CardTitle>
          <CardDescription>Most active channels by message count</CardDescription>
        </div>
        <Link href="/stored-data">
          <Button variant="outline" size="sm" className="gap-1">
            <ExternalLink className="h-4 w-4" />
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" />
              <YAxis 
                dataKey="name" 
                type="category" 
                tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
              />
              <Tooltip 
                formatter={(value, name) => [value, 'Messages']}
                labelFormatter={(label) => `Channel: ${label}`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }} 
              />
              <Bar dataKey="messageCount" name="Messages">
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopChannels;