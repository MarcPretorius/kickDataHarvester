import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface MessagesByHour {
  hour: string;
  count: number;
}

// Demo data for message activity (this would normally come from the backend)
const mockMessageData = [
  { hour: '00:00', count: 42 },
  { hour: '02:00', count: 28 },
  { hour: '04:00', count: 15 },
  { hour: '06:00', count: 20 },
  { hour: '08:00', count: 45 },
  { hour: '10:00', count: 78 },
  { hour: '12:00', count: 95 },
  { hour: '14:00', count: 102 },
  { hour: '16:00', count: 85 },
  { hour: '18:00', count: 92 },
  { hour: '20:00', count: 75 },
  { hour: '22:00', count: 58 },
];

const MessageActivity = () => {
  const { data, isLoading, error } = useQuery<MessagesByHour[]>({
    queryKey: ['/api/statistics/messages/hourly'],
    // Fallback to demo data until backend endpoint is implemented
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockMessageData;
    },
    refetchInterval: 60000 // 1 minute
  });
  
  if (isLoading) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Message Activity</CardTitle>
          <CardDescription>Message volume over the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (error || !data) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Message Activity</CardTitle>
          <CardDescription>Message volume over the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 p-4 text-center">
            Failed to load message activity data
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Find max value for better visualization
  const maxCount = Math.max(...data.map(item => item.count));
  
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Message Activity</CardTitle>
        <CardDescription>Message volume over the last 24 hours</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" />
              <YAxis domain={[0, maxCount + 10]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                name="Messages" 
                stroke="var(--primary)" 
                strokeWidth={2} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageActivity;