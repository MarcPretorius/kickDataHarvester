import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type TimeRange = "day" | "week" | "month";

const MessageActivity = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("day");
  
  // Demo data for chart
  const generateChartData = () => {
    if (timeRange === "day") {
      return Array.from({ length: 24 }, (_, i) => ({
        name: `${i}:00`,
        messages: Math.floor(Math.random() * 500) + 50,
      }));
    } else if (timeRange === "week") {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return days.map(day => ({
        name: day,
        messages: Math.floor(Math.random() * 5000) + 1000,
      }));
    } else {
      return Array.from({ length: 30 }, (_, i) => ({
        name: `${i + 1}`,
        messages: Math.floor(Math.random() * 15000) + 5000,
      }));
    }
  };
  
  const { data, isLoading } = useQuery({
    queryKey: ['/api/messages', { timeRange }],
    enabled: false, // Disable actual fetching for this demo
    initialData: { chartData: generateChartData() }
  });

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Message Activity</CardTitle>
        <div className="flex">
          <Button
            variant={timeRange === "day" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeRange("day")}
            className="text-xs"
          >
            Day
          </Button>
          <Button
            variant={timeRange === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeRange("week")}
            className="text-xs"
          >
            Week
          </Button>
          <Button
            variant={timeRange === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeRange("month")}
            className="text-xs"
          >
            Month
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData} barSize={timeRange === "day" ? 15 : 30}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }} 
                  tickLine={false}
                  axisLine={{ stroke: '#E0E0E0' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip 
                  formatter={(value) => [value.toLocaleString(), "Messages"]}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Bar 
                  dataKey="messages" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MessageActivity;
