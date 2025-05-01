import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChevronDown, Download } from "lucide-react";

const Analytics = () => {
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [timeRange, setTimeRange] = useState("7days");
  
  // Demo data for charts
  const messageVolumeData = [
    { name: "Mon", messages: 4500 },
    { name: "Tue", messages: 3800 },
    { name: "Wed", messages: 5200 },
    { name: "Thu", messages: 7100 },
    { name: "Fri", messages: 8500 },
    { name: "Sat", messages: 9800 },
    { name: "Sun", messages: 8100 }
  ];
  
  const userActivityData = [
    { name: "New Users", users: 1254 },
    { name: "Returning", users: 3850 },
    { name: "Active", users: 3216 },
    { name: "Engaged", users: 2185 },
    { name: "Subscribers", users: 942 },
    { name: "Moderators", users: 126 }
  ];
  
  const hourlyDistributionData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    messages: Math.floor(Math.random() * 1000) + 100
  }));
  
  const userTypeData = [
    { name: "Regular", value: 65 },
    { name: "Subscriber", value: 25 },
    { name: "Moderator", value: 10 }
  ];
  
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Analytics</h1>
        <p className="text-neutral-500">
          View detailed analytics about chat activity, user engagement, and more.
        </p>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="1">PewDiePie</SelectItem>
              <SelectItem value="2">xQc</SelectItem>
              <SelectItem value="3">Ninja</SelectItem>
              <SelectItem value="4">Pokimane</SelectItem>
              <SelectItem value="5">Shroud</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24hours">Last 24 Hours</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">156,248</div>
            <div className="text-sm text-green-600 flex items-center">
              ↑ 12.5% vs previous period
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">8,942</div>
            <div className="text-sm text-green-600 flex items-center">
              ↑ 8.1% vs previous period
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Avg. Messages/User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">17.5</div>
            <div className="text-sm text-red-600 flex items-center">
              ↓ 2.3% vs previous period
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="message-volume" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="message-volume">Message Volume</TabsTrigger>
          <TabsTrigger value="user-activity">User Activity</TabsTrigger>
          <TabsTrigger value="content-analysis">Content Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="message-volume">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-medium">Message Volume Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={messageVolumeData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="messages" 
                        stroke="hsl(var(--primary))" 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Hourly Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="hour" 
                        tick={{ fontSize: 10 }}
                        interval={3}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar 
                        dataKey="messages" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="user-activity">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-medium">User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userActivityData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="users" 
                        fill="hsl(var(--chart-2))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">User Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {userTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="content-analysis">
          <div className="p-8 text-center bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-2">Content Analysis</h3>
            <p className="text-neutral-500">
              Content analysis features are coming soon. These will include sentiment analysis,
              keyword frequency, and emoji usage statistics.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Analytics;
