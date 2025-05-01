import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Search, Users, User, UserPlus, UserCheck, Tv, MessageSquare, Calendar } from "lucide-react";

const UserAnalysis = () => {
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState("7days");
  
  // Fetch channels
  const { data: channels, isLoading: isLoadingChannels } = useQuery({
    queryKey: ['/api/channels'],
  });
  
  // Demo data for user analysis
  const userTypeData = [
    { name: "Regular", value: 65, color: "#9E9E9E" },
    { name: "Subscriber", value: 25, color: "#0066CC" },
    { name: "Moderator", value: 10, color: "#4CAF50" }
  ];
  
  const topUsersData = [
    { name: "GameSlayer99", messages: 1548, userType: "subscriber" },
    { name: "JuicerFan42", messages: 1247, userType: "regular" },
    { name: "BroFist2022", messages: 1103, userType: "moderator" },
    { name: "AimBot135", messages: 956, userType: "subscriber" },
    { name: "ChatHopper", messages: 820, userType: "regular" },
    { name: "PogChampion", messages: 784, userType: "subscriber" },
    { name: "StreamSniper", messages: 721, userType: "regular" },
    { name: "Lurker123", messages: 689, userType: "subscriber" },
    { name: "EmoteSpammer", messages: 652, userType: "regular" },
    { name: "DonationKing", messages: 623, userType: "subscriber" }
  ];
  
  const userActivityByDayData = [
    { day: "Mon", active: 4218 },
    { day: "Tue", active: 3842 },
    { day: "Wed", active: 4153 },
    { day: "Thu", active: 5294 },
    { day: "Fri", active: 6482 },
    { day: "Sat", active: 7921 },
    { day: "Sun", active: 5872 }
  ];
  
  const userRetentionData = [
    { period: "First Time", users: 3245 },
    { period: "Returned Once", users: 2187 },
    { period: "Returned 2-5", users: 1654 },
    { period: "Returned 5-10", users: 978 },
    { period: "Regular (10+)", users: 878 }
  ];
  
  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  const getRandomUsers = () => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      username: topUsersData[i % topUsersData.length].name,
      messages: Math.floor(Math.random() * 1000) + 100,
      lastActive: new Date(Date.now() - Math.floor(Math.random() * 10) * 86400000).toISOString(),
      userType: ["regular", "subscriber", "moderator"][Math.floor(Math.random() * 3)]
    }));
  };
  
  const randomUsers = getRandomUsers();

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">User Analysis</h1>
        <p className="text-neutral-500">
          Analyze user participation, identify top contributors, and track engagement patterns.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              {channels?.map((channel: any) => (
                <SelectItem key={channel.id} value={channel.id.toString()}>
                  {channel.name}
                </SelectItem>
              ))}
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
        
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-300" />
          <Input
            placeholder="Search users..."
            className="pl-9 w-full sm:w-[250px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-500 mr-3">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Total Users</p>
                  <p className="text-2xl font-semibold">8,942</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">New Users</p>
                  <p className="text-2xl font-semibold">245</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-md bg-primary bg-opacity-10 flex items-center justify-center text-primary mr-3">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Avg. Messages</p>
                  <p className="text-2xl font-semibold">17.5</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-md bg-green-100 flex items-center justify-center text-green-500 mr-3">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Subscribers</p>
                  <p className="text-2xl font-semibold">2,235</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="top-users">Top Users</TabsTrigger>
          <TabsTrigger value="retention">User Retention</TabsTrigger>
          <TabsTrigger value="directory">User Directory</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">User Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
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
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-medium">User Activity by Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userActivityByDayData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="active" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Active Users" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="top-users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4 px-5 border-b border-neutral-100">
              <CardTitle className="text-base font-medium">Top Contributors</CardTitle>
              <Button variant="outline" size="sm">
                Export List
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Messages</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Primary Channel</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-300 uppercase tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {topUsersData.map((user, index) => (
                      <tr key={index} className="bg-white">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          #{index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-3">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getUserInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-sm font-medium">{user.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {user.messages.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.userType === 'moderator' 
                              ? 'bg-green-100 text-green-800' 
                              : user.userType === 'subscriber'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-neutral-100 text-neutral-800'
                          }`}>
                            {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Tv className="h-4 w-4 text-neutral-400 mr-2" />
                            <span className="text-sm">
                              {["PewDiePie", "xQc", "Ninja", "Shroud", "Pokimane"][index % 5]}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <Button variant="link" size="sm">View Profile</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="retention">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">User Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userRetentionData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="period" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="users" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} name="Users" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium mb-2">Session Duration</p>
                    <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: "65%" }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-neutral-500">
                      <span>Average: 24 minutes</span>
                      <span>65% of total viewers</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Messages per Session</p>
                    <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: "42%" }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-neutral-500">
                      <span>Average: 8.3 messages</span>
                      <span>42% of users above average</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Return Rate</p>
                    <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: "28%" }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-neutral-500">
                      <span>28% return within a week</span>
                      <span>Target: 35%</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Daily Active Users</p>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="h-12 bg-primary rounded-md opacity-50" style={{ 
                          opacity: 0.3 + (i / 10),
                          height: `${40 + (i * 8)}px`
                        }}></div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-neutral-500">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="directory">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4 px-5 border-b border-neutral-100">
              <CardTitle className="text-base font-medium">User Directory</CardTitle>
              <div className="flex gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="subscriber">Subscribers</SelectItem>
                    <SelectItem value="moderator">Moderators</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">Export</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Messages</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Last Active</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {randomUsers.map((user, index) => (
                      <tr key={user.id} className="bg-white">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-3">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getUserInitials(user.username)}
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-sm font-medium">{user.username}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {user.messages.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.userType === 'moderator' 
                              ? 'bg-green-100 text-green-800' 
                              : user.userType === 'subscriber'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-neutral-100 text-neutral-800'
                          }`}>
                            {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 text-neutral-400 mr-2" />
                            {new Date(user.lastActive).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <Button variant="link" size="sm">View Details</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default UserAnalysis;
