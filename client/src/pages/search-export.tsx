import { useState, ChangeEvent } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Channel } from "@shared/schema";
import { Search, Download, FileJson, FileSpreadsheet, FileText, Calendar, Filter, Settings, MessageSquare, UserCheck, Tag } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const SearchExport = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTab, setSearchTab] = useState("messages");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState("json");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [userFilters, setUserFilters] = useState({
    regular: true,
    subscriber: true,
    moderator: true
  });
  const [advancedFilters, setAdvancedFilters] = useState({
    minMessages: "",
    maxMessages: "",
    keywords: ""
  });
  
  // Fetch channels
  const { data: channels } = useQuery({
    queryKey: ['/api/channels'],
  });
  
  // Export mutation 
  const exportMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/export', data);
    },
    onSuccess: () => {
      toast({
        title: "Export started",
        description: "Your data is being prepared for download.",
      });
    },
    onError: (error) => {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a search term",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would trigger a search query to the backend
    toast({
      title: "Search initiated",
      description: `Searching for "${searchQuery}" in ${searchTab}`,
    });
  };
  
  const handleExport = () => {
    if (selectedChannels.length === 0) {
      toast({
        title: "No channels selected",
        description: "Please select at least one channel to export",
        variant: "destructive"
      });
      return;
    }
    
    // Format export parameters
    const exportData = {
      channels: selectedChannels,
      format: exportFormat,
      dateRange,
      userTypes: Object.entries(userFilters)
        .filter(([_, isSelected]) => isSelected)
        .map(([type]) => type),
      advanced: advancedFilters
    };
    
    exportMutation.mutate(exportData);
  };
  
  const handleChannelSelection = (channelId: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };
  
  const toggleAllChannels = (select: boolean) => {
    if (select && channels) {
      setSelectedChannels(channels.map((channel: Channel) => channel.id.toString()));
    } else {
      setSelectedChannels([]);
    }
  };
  
  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAdvancedFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdvancedFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Search & Export</h1>
        <p className="text-neutral-500">
          Search through your chat data and export results in various formats for further analysis.
        </p>
      </div>
      
      <Tabs defaultValue="search" className="mb-6">
        <TabsList className="mb-6">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="saved">Saved Queries</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Advanced Search</CardTitle>
              <CardDescription>
                Search through chat messages, users, and data using powerful filters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Tabs value={searchTab} onValueChange={setSearchTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="messages">Messages</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="keywords">Keywords</TabsTrigger>
                  </TabsList>
                  
                  <form onSubmit={handleSearch}>
                    <div className="flex gap-2 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-300" />
                        <Input
                          placeholder={
                            searchTab === "messages" 
                              ? "Search for message content..." 
                              : searchTab === "users" 
                                ? "Search for usernames..." 
                                : "Search for keywords and phrases..."
                          }
                          className="pl-9"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Button type="submit">Search</Button>
                    </div>
                  </form>
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="filters">
                      <AccordionTrigger className="text-sm font-medium">
                        <div className="flex items-center">
                          <Filter className="h-4 w-4 mr-2" />
                          Advanced Filters
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                          <div>
                            <Label className="block text-sm font-medium mb-2">Channels</Label>
                            <Select>
                              <SelectTrigger>
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
                          </div>
                          
                          <div>
                            <Label className="block text-sm font-medium mb-2">User Type</Label>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox id="regular" defaultChecked />
                                <Label htmlFor="regular">Regular Users</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="subscriber" defaultChecked />
                                <Label htmlFor="subscriber">Subscribers</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="moderator" defaultChecked />
                                <Label htmlFor="moderator">Moderators</Label>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="block text-sm font-medium mb-2">Date Range</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor="startDate" className="text-xs text-neutral-500">From</Label>
                                <Input 
                                  id="startDate" 
                                  type="date" 
                                  name="startDate"
                                  value={dateRange.startDate}
                                  onChange={handleDateChange}
                                />
                              </div>
                              <div>
                                <Label htmlFor="endDate" className="text-xs text-neutral-500">To</Label>
                                <Input 
                                  id="endDate" 
                                  type="date" 
                                  name="endDate"
                                  value={dateRange.endDate}
                                  onChange={handleDateChange}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Tabs>
                
                <div className="bg-neutral-50 p-4 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Search Results</h3>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      Export Results
                    </Button>
                  </div>
                  
                  <div className="p-8 text-center text-neutral-400">
                    <Search className="h-12 w-12 mx-auto text-neutral-300 mb-2" />
                    <p className="mb-1">No search results yet</p>
                    <p className="text-sm">Use the search form above to find messages, users, or keywords</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Search Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-1">
                      <MessageSquare className="h-4 w-4" />
                      Message Search
                    </h4>
                    <p className="text-sm text-neutral-500">
                      Search for exact phrases using quotes, e.g., "hello world"
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-1">
                      <UserCheck className="h-4 w-4" />
                      User Search
                    </h4>
                    <p className="text-sm text-neutral-500">
                      Find users by username or user ID. For partial matches use asterisk, e.g., game*
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-1">
                      <Tag className="h-4 w-4" />
                      Keyword Search
                    </h4>
                    <p className="text-sm text-neutral-500">
                      Combine keywords with OR and AND operators, e.g., gaming AND streaming
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-1">
                      <Filter className="h-4 w-4" />
                      Filters
                    </h4>
                    <p className="text-sm text-neutral-500">
                      Combine multiple filters to narrow down results and find specific patterns
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Recent Searches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-md">
                    <div>
                      <p className="text-sm font-medium">"subscribe now"</p>
                      <p className="text-xs text-neutral-500">Messages • All Channels • Last week</p>
                    </div>
                    <Button variant="ghost" size="sm">Search Again</Button>
                  </div>
                  
                  <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-md">
                    <div>
                      <p className="text-sm font-medium">GameSlayer99</p>
                      <p className="text-xs text-neutral-500">Users • PewDiePie • Last month</p>
                    </div>
                    <Button variant="ghost" size="sm">Search Again</Button>
                  </div>
                  
                  <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-md">
                    <div>
                      <p className="text-sm font-medium">giveaway AND prize</p>
                      <p className="text-xs text-neutral-500">Keywords • All Channels • Last 3 days</p>
                    </div>
                    <Button variant="ghost" size="sm">Search Again</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="export">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Configure Export</CardTitle>
                  <CardDescription>
                    Select the data and format for your export
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Tv className="h-4 w-4" />
                      Select Channels
                    </h3>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toggleAllChannels(true)}
                        >
                          Select All
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toggleAllChannels(false)}
                        >
                          Clear
                        </Button>
                      </div>
                      <p className="text-xs text-neutral-500">
                        {selectedChannels.length} channels selected
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto border rounded-md p-2">
                      {channels?.map((channel: Channel) => (
                        <div key={channel.id} className="flex items-center">
                          <Checkbox 
                            id={`channel-${channel.id}`} 
                            checked={selectedChannels.includes(channel.id.toString())}
                            onCheckedChange={() => handleChannelSelection(channel.id.toString())}
                          />
                          <Label 
                            htmlFor={`channel-${channel.id}`} 
                            className="ml-2 text-sm"
                          >
                            {channel.name}
                          </Label>
                        </div>
                      ))}
                      {!channels?.length && (
                        <p className="text-sm text-neutral-400 w-full text-center py-2">
                          No channels available
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date Range
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="export-startDate" className="text-xs text-neutral-500">From</Label>
                          <Input 
                            id="export-startDate" 
                            type="date" 
                            name="startDate"
                            value={dateRange.startDate}
                            onChange={handleDateChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="export-endDate" className="text-xs text-neutral-500">To</Label>
                          <Input 
                            id="export-endDate" 
                            type="date" 
                            name="endDate"
                            value={dateRange.endDate}
                            onChange={handleDateChange}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        User Types
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="export-regular" 
                            checked={userFilters.regular}
                            onCheckedChange={(checked) => 
                              setUserFilters({...userFilters, regular: !!checked})
                            }
                          />
                          <Label htmlFor="export-regular">Regular Users</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="export-subscriber" 
                            checked={userFilters.subscriber}
                            onCheckedChange={(checked) => 
                              setUserFilters({...userFilters, subscriber: !!checked})
                            }
                          />
                          <Label htmlFor="export-subscriber">Subscribers</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="export-moderator" 
                            checked={userFilters.moderator}
                            onCheckedChange={(checked) => 
                              setUserFilters({...userFilters, moderator: !!checked})
                            }
                          />
                          <Label htmlFor="export-moderator">Moderators</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Advanced Filters
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="minMessages" className="text-xs text-neutral-500">Min Messages</Label>
                        <Input 
                          id="minMessages" 
                          type="number" 
                          placeholder="No minimum"
                          name="minMessages"
                          value={advancedFilters.minMessages}
                          onChange={handleAdvancedFilterChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxMessages" className="text-xs text-neutral-500">Max Messages</Label>
                        <Input 
                          id="maxMessages" 
                          type="number" 
                          placeholder="No maximum"
                          name="maxMessages"
                          value={advancedFilters.maxMessages}
                          onChange={handleAdvancedFilterChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="keywords" className="text-xs text-neutral-500">Keywords (comma separated)</Label>
                        <Input 
                          id="keywords" 
                          placeholder="Any content"
                          name="keywords"
                          value={advancedFilters.keywords}
                          onChange={handleAdvancedFilterChange}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleExport}
                    disabled={exportMutation.isPending}
                  >
                    {exportMutation.isPending ? "Processing..." : "Export Data"}
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-base font-medium">Export Format</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div 
                      className={`border rounded-md p-4 cursor-pointer ${
                        exportFormat === 'json' ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setExportFormat('json')}
                    >
                      <div className="flex items-center mb-2">
                        <FileJson className="h-5 w-5 text-primary mr-2" />
                        <p className="font-medium">JSON</p>
                        {exportFormat === 'json' && (
                          <Badge className="ml-auto" variant="outline">Selected</Badge>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500">
                        Full data in JavaScript Object Notation format, ideal for processing or importing into other applications.
                      </p>
                    </div>
                    
                    <div 
                      className={`border rounded-md p-4 cursor-pointer ${
                        exportFormat === 'csv' ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setExportFormat('csv')}
                    >
                      <div className="flex items-center mb-2">
                        <FileSpreadsheet className="h-5 w-5 text-green-600 mr-2" />
                        <p className="font-medium">CSV</p>
                        {exportFormat === 'csv' && (
                          <Badge className="ml-auto" variant="outline">Selected</Badge>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500">
                        Comma-separated values format, easy to open in Excel or any spreadsheet application.
                      </p>
                    </div>
                    
                    <div 
                      className={`border rounded-md p-4 cursor-pointer ${
                        exportFormat === 'txt' ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setExportFormat('txt')}
                    >
                      <div className="flex items-center mb-2">
                        <FileText className="h-5 w-5 text-neutral-600 mr-2" />
                        <p className="font-medium">Text</p>
                        {exportFormat === 'txt' && (
                          <Badge className="ml-auto" variant="outline">Selected</Badge>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500">
                        Simple text format with each record on a new line, readable by any text editor.
                      </p>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-medium mb-2">Export Options</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="include-metadata" defaultChecked />
                          <Label htmlFor="include-metadata">Include metadata</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="include-timestamps" defaultChecked />
                          <Label htmlFor="include-timestamps">Include timestamps</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="compress-export" />
                          <Label htmlFor="compress-export">Compress export (zip)</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Saved Queries & Exports</CardTitle>
              <CardDescription>
                Access your saved search queries and previous exports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-neutral-400">
                <Calendar className="h-12 w-12 mx-auto text-neutral-300 mb-2" />
                <p className="mb-1">No saved queries or exports yet</p>
                <p className="text-sm">Your saved queries and export history will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default SearchExport;
