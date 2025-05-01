import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Channel } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, AlertTriangle, Database, Link, PlugZap, Key, 
  Lock, PlayCircle, StopCircle, RefreshCw, Webhook, 
  Server, Gauge, CheckCircle, XCircle, Plus, Trash2 
} from "lucide-react";

const ApiSettings = () => {
  const { toast } = useToast();
  const [newChannelName, setNewChannelName] = useState("");
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [selectedConnectionType, setSelectedConnectionType] = useState("websocket");
  
  // Fetch channels
  const { data: channels, isLoading: isLoadingChannels } = useQuery({
    queryKey: ['/api/channels'],
  });
  
  // Fetch connection status
  const { data: status, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['/api/status'],
    refetchInterval: 10000 // Refresh every 10 seconds
  });
  
  // Add channel mutation
  const addChannelMutation = useMutation({
    mutationFn: async (channelName: string) => {
      return apiRequest('POST', '/api/connection', { channelName });
    },
    onSuccess: () => {
      toast({
        title: "Channel added",
        description: `Successfully added channel: ${newChannelName}`,
      });
      setNewChannelName("");
      setIsAddingChannel(false);
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/status'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to add channel",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Toggle channel tracking mutation
  const toggleChannelMutation = useMutation({
    mutationFn: async ({ id, isTracking }: { id: number, isTracking: boolean }) => {
      return apiRequest('PATCH', `/api/channels/${id}`, { isTracking });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/status'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to toggle channel",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete channel mutation
  const deleteChannelMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/connection/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Channel deleted",
        description: "Channel has been removed from tracking",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/status'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete channel",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newChannelName.trim()) {
      toast({
        title: "Channel name required",
        description: "Please enter a valid channel name",
        variant: "destructive"
      });
      return;
    }
    
    addChannelMutation.mutate(newChannelName);
  };
  
  const handleToggleChannel = (channel: Channel) => {
    toggleChannelMutation.mutate({
      id: channel.id,
      isTracking: !channel.isTracking
    });
  };
  
  const handleDeleteChannel = (channelId: number) => {
    if (confirm("Are you sure you want to delete this channel? All associated data will be kept.")) {
      deleteChannelMutation.mutate(channelId);
    }
  };
  
  const getConnectionStatusText = () => {
    if (isLoadingStatus || !status) return "Checking status...";
    
    if (status.apiConnection === 'connected') {
      return "Connected and operational";
    } else if (status.apiConnection === 'connecting') {
      return "Connecting to Kick.com";
    } else {
      return "Disconnected";
    }
  };
  
  const getConnectionStatusClass = () => {
    if (isLoadingStatus || !status) return "bg-amber-100 text-amber-800";
    
    if (status.apiConnection === 'connected') {
      return "bg-green-100 text-green-800";
    } else if (status.apiConnection === 'connecting') {
      return "bg-amber-100 text-amber-800";
    } else {
      return "bg-red-100 text-red-800";
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">API Settings</h1>
        <p className="text-neutral-500">
          Configure your connections to Kick.com and manage tracked channels.
        </p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
        <div className="xl:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Link className="h-5 w-5" />
                Connection Status
              </CardTitle>
              <CardDescription>
                Current status of your connection to Kick.com chat service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className={`p-4 rounded-md mb-4 ${getConnectionStatusClass()}`}>
                    <div className="flex items-center gap-2">
                      {status?.apiConnection === 'connected' ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : status?.apiConnection === 'connecting' ? (
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                      <p className="font-medium">{getConnectionStatusText()}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="border rounded-md p-4">
                      <div className="flex items-center mb-2">
                        <Database className="h-5 w-5 text-neutral-500 mr-2" />
                        <p className="font-medium">Storage Status</p>
                      </div>
                      <p className="text-sm text-green-600 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Active and storing data
                      </p>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <div className="flex items-center mb-2">
                        <Gauge className="h-5 w-5 text-neutral-500 mr-2" />
                        <p className="font-medium">API Limits</p>
                      </div>
                      <div className="h-2 w-full bg-neutral-100 rounded-full mb-1">
                        <div className="h-full bg-primary rounded-full" style={{ width: "15%" }}></div>
                      </div>
                      <p className="text-xs text-neutral-500">15% of rate limit used</p>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <div className="flex items-center mb-2">
                      <Server className="h-5 w-5 text-neutral-500 mr-2" />
                      <p className="font-medium">Connection Details</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-neutral-500">Connection Type:</p>
                        <p>WebSocket</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Last Connected:</p>
                        <p>{new Date().toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Active Channels:</p>
                        <p>{status?.trackedChannelCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Messages Received:</p>
                        <p>{status?.messageCount?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="border rounded-md p-4 mb-4">
                    <div className="flex items-center mb-3">
                      <PlugZap className="h-5 w-5 text-neutral-500 mr-2" />
                      <p className="font-medium">Connection Configuration</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm mb-1 block">Connection Type</Label>
                        <Select 
                          value={selectedConnectionType} 
                          onValueChange={setSelectedConnectionType}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select connection type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="websocket">WebSocket (Real-time)</SelectItem>
                            <SelectItem value="rest">REST API (Polling)</SelectItem>
                            <SelectItem value="custom">Custom Integration</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-sm mb-1 block">Auto-Reconnect</Label>
                        <div className="flex items-center space-x-2">
                          <Switch id="auto-reconnect" defaultChecked />
                          <Label htmlFor="auto-reconnect">Enabled</Label>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          Automatically reconnect if connection is lost
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-sm mb-1 block">Connection Timeout</Label>
                        <Select defaultValue="30">
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeout" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 seconds</SelectItem>
                            <SelectItem value="30">30 seconds</SelectItem>
                            <SelectItem value="60">1 minute</SelectItem>
                            <SelectItem value="300">5 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button>Save Configuration</Button>
                    </div>
                  </div>
                  
                  <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Connection Limitations</AlertTitle>
                    <AlertDescription>
                      Kick.com may limit connections based on API usage. 
                      Monitor your connection status for any issues.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reconnect All Channels
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <StopCircle className="mr-2 h-4 w-4" />
                Pause All Tracking
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <PlayCircle className="mr-2 h-4 w-4" />
                Resume All Tracking
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Webhook className="mr-2 h-4 w-4" />
                Test Webhook
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Database className="mr-2 h-4 w-4" />
                Clear Data Cache
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Tabs defaultValue="channels" className="mb-6">
        <TabsList className="mb-6">
          <TabsTrigger value="channels">Tracked Channels</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="webhooks">Webhook</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="channels">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4 px-5 border-b border-neutral-100">
              <CardTitle className="text-base font-medium">Manage Channels</CardTitle>
              <Button 
                onClick={() => setIsAddingChannel(true)}
                className="flex items-center"
                size="sm"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Channel
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {isAddingChannel && (
                <form 
                  onSubmit={handleAddChannel}
                  className="p-4 border-b border-dashed border-neutral-200 bg-neutral-50"
                >
                  <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex-1">
                      <Label htmlFor="channelName" className="sr-only">Channel Name</Label>
                      <Input 
                        id="channelName"
                        placeholder="Enter Kick.com channel name"
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                        className="bg-white"
                        disabled={addChannelMutation.isPending}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={addChannelMutation.isPending}
                      >
                        {addChannelMutation.isPending ? "Adding..." : "Add Channel"}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddingChannel(false)}
                        disabled={addChannelMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              )}
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Channel</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Messages</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Last Active</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Track</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {isLoadingChannels ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center">
                          <p className="text-neutral-500">Loading channels...</p>
                        </td>
                      </tr>
                    ) : channels?.length > 0 ? (
                      channels.map((channel: Channel) => (
                        <tr key={channel.id} className="bg-white">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-md bg-primary bg-opacity-10 flex items-center justify-center">
                                <Server className="h-4 w-4 text-primary" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium">{channel.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={`
                              ${channel.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                              ${channel.status === 'inactive' ? 'bg-red-100 text-red-800' : ''}
                              ${channel.status === 'paused' ? 'bg-amber-100 text-amber-800' : ''}
                              ${channel.status === 'connecting' ? 'bg-blue-100 text-blue-800' : ''}
                            `}>
                              {channel.status.charAt(0).toUpperCase() + channel.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {channel.messageCount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                            {channel.lastActive 
                              ? new Date(channel.lastActive).toLocaleString() 
                              : 'Never'
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <Switch 
                                id={`track-${channel.id}`} 
                                checked={channel.isTracking}
                                onCheckedChange={() => handleToggleChannel(channel)}
                                disabled={toggleChannelMutation.isPending}
                              />
                              <Label htmlFor={`track-${channel.id}`}>
                                {channel.isTracking ? 'On' : 'Off'}
                              </Label>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteChannel(channel.id)}
                              disabled={deleteChannelMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center">
                          <p className="text-neutral-500">No channels added yet</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <CardFooter className="border-t border-neutral-100 p-4">
                <p className="text-sm text-neutral-500">
                  {channels?.length || 0} channels configured • 
                  {channels?.filter((c: Channel) => c.isTracking).length || 0} actively tracking
                </p>
              </CardFooter>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="authentication">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Authentication
              </CardTitle>
              <CardDescription>
                Manage API keys and authentication settings for Kick.com
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-md p-4">
                  <Label className="text-sm font-medium">API Key</Label>
                  <div className="flex mt-1 mb-2">
                    <Input 
                      type="password" 
                      value="•••••••••••••••••••••••" 
                      readOnly 
                      className="rounded-r-none"
                    />
                    <Button 
                      className="rounded-l-none"
                      onClick={() => {
                        toast({
                          title: "API Key Copied",
                          description: "The API key has been copied to your clipboard"
                        });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Your API key provides access to the Kick.com API. Keep it secret.
                  </p>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="regenerate">
                    <AccordionTrigger className="text-sm font-medium">
                      Regenerate API Key
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-4 bg-red-50 text-red-800 rounded-md mb-4">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          <p className="font-medium">Warning: This action cannot be undone</p>
                        </div>
                        <p className="text-sm">
                          Regenerating your API key will invalidate the existing key immediately.
                          All current API connections will need to be updated with the new key.
                        </p>
                      </div>
                      <Button variant="destructive">Regenerate API Key</Button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Authentication Options</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="use-oauth" />
                      <Label htmlFor="use-oauth">Use OAuth Authentication</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch id="limit-ip" defaultChecked />
                      <Label htmlFor="limit-ip">Limit API access by IP address</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch id="require-ssl" defaultChecked />
                      <Label htmlFor="require-ssl">Require SSL for API requests</Label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Security Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-neutral-500">Access Token Expiration</Label>
                      <Select defaultValue="30">
                        <SelectTrigger>
                          <SelectValue placeholder="Select expiration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="1440">24 hours</SelectItem>
                          <SelectItem value="never">Never expires</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-neutral-500">Rate Limiting</Label>
                      <Select defaultValue="500">
                        <SelectTrigger>
                          <SelectValue placeholder="Select rate limit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100">100 requests/min</SelectItem>
                          <SelectItem value="500">500 requests/min</SelectItem>
                          <SelectItem value="1000">1000 requests/min</SelectItem>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full">Save Authentication Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhook Configuration
              </CardTitle>
              <CardDescription>
                Configure webhooks to receive real-time updates from KickChat Analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-neutral-400">
                <Webhook className="h-12 w-12 mx-auto text-neutral-300 mb-2" />
                <p className="mb-1">Webhook configuration coming soon</p>
                <p className="text-sm">This feature will allow you to send real-time updates to external systems</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Advanced Settings
              </CardTitle>
              <CardDescription>
                Configure advanced system settings and performance options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-neutral-400">
                <Settings className="h-12 w-12 mx-auto text-neutral-300 mb-2" />
                <p className="mb-1">Advanced settings coming soon</p>
                <p className="text-sm">This feature will provide detailed system configuration options</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default ApiSettings;
