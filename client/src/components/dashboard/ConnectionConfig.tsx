import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

const ConnectionConfig = () => {
  const { toast } = useToast();
  const [connectionType, setConnectionType] = useState("websocket");
  const [newChannel, setNewChannel] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [dataCollection, setDataCollection] = useState("realtime");
  const [dataStorage, setDataStorage] = useState("local");
  const [retentionPeriod, setRetentionPeriod] = useState("30");
  const [exportFormats, setExportFormats] = useState({
    json: true,
    csv: true,
    excel: false,
    api: false
  });
  
  // Fetch channels
  const { data: channels } = useQuery({
    queryKey: ['/api/channels'],
  });
  
  // Add channel mutation
  const addChannelMutation = useMutation({
    mutationFn: async (channelName: string) => {
      return apiRequest('POST', '/api/connection', { channelName });
    },
    onSuccess: () => {
      toast({
        title: "Channel added",
        description: `Successfully added channel: ${newChannel}`,
      });
      setNewChannel("");
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
  
  // Save configuration mutation
  const saveConfigMutation = useMutation({
    mutationFn: async () => {
      // In a real app, we would save the full configuration
      return apiRequest('POST', '/api/config', {
        connectionType,
        channels: selectedChannels,
        dataCollection,
        dataStorage,
        retentionPeriod,
        exportFormats
      });
    },
    onSuccess: () => {
      toast({
        title: "Configuration saved",
        description: "Your connection settings have been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save configuration",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChannel.trim()) {
      if (!selectedChannels.includes(newChannel)) {
        setSelectedChannels([...selectedChannels, newChannel]);
        addChannelMutation.mutate(newChannel);
      } else {
        toast({
          title: "Channel already added",
          description: `Channel '${newChannel}' is already in your list`,
          variant: "destructive",
        });
      }
    }
  };
  
  const handleRemoveChannel = (channel: string) => {
    setSelectedChannels(selectedChannels.filter(c => c !== channel));
  };
  
  const handleSaveConfig = () => {
    saveConfigMutation.mutate();
  };

  return (
    <Card className="mb-6">
      <CardHeader className="py-4 px-5 border-b border-neutral-100">
        <CardTitle className="text-base font-medium">API Connection Configuration</CardTitle>
      </CardHeader>
      
      <CardContent className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <Label className="block text-sm font-medium mb-1">Connection Type</Label>
              <Select value={connectionType} onValueChange={setConnectionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select connection type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="websocket">Kick.com Websocket</SelectItem>
                  <SelectItem value="rest">Kick.com REST API</SelectItem>
                  <SelectItem value="custom">Custom Connector</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-4">
              <Label className="block text-sm font-medium mb-1">Channels to Monitor</Label>
              <form onSubmit={handleAddChannel} className="flex items-center">
                <div className="flex-1 relative">
                  <Input 
                    placeholder="Add channel..." 
                    value={newChannel}
                    onChange={e => setNewChannel(e.target.value)}
                    className="pr-12"
                  />
                  <Button 
                    type="submit" 
                    className="absolute right-0 top-0 bottom-0 rounded-l-none" 
                    disabled={addChannelMutation.isPending}
                  >
                    Add
                  </Button>
                </div>
              </form>
              
              <div className="mt-2">
                <div className="flex flex-wrap">
                  {channels?.map((channel: any) => (
                    <Badge 
                      key={channel.id} 
                      variant="secondary" 
                      className="m-1 bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      {channel.name}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-4 w-4 p-0 ml-1.5 rounded-full hover:bg-primary hover:text-white"
                        onClick={() => handleRemoveChannel(channel.name)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <Label className="block text-sm font-medium mb-1">Data Collection Interval</Label>
              <Select value={dataCollection} onValueChange={setDataCollection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select collection interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time</SelectItem>
                  <SelectItem value="1min">Every minute</SelectItem>
                  <SelectItem value="5min">Every 5 minutes</SelectItem>
                  <SelectItem value="15min">Every 15 minutes</SelectItem>
                  <SelectItem value="1hour">Every hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <Label className="block text-sm font-medium mb-1">Data Storage Configuration</Label>
              <Select value={dataStorage} onValueChange={setDataStorage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select storage type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local Database</SelectItem>
                  <SelectItem value="cloud">Cloud Database</SelectItem>
                  <SelectItem value="file">File Storage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-4">
              <Label className="block text-sm font-medium mb-1">Data Retention Period</Label>
              <Select value={retentionPeriod} onValueChange={setRetentionPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select retention period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                  <SelectItem value="unlimited">Indefinite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-4">
              <Label className="block text-sm font-medium mb-1">Data Export Format</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="json-format" 
                    checked={exportFormats.json}
                    onCheckedChange={(checked) => 
                      setExportFormats({...exportFormats, json: !!checked})
                    }
                  />
                  <Label htmlFor="json-format">JSON</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="csv-format" 
                    checked={exportFormats.csv}
                    onCheckedChange={(checked) => 
                      setExportFormats({...exportFormats, csv: !!checked})
                    }
                  />
                  <Label htmlFor="csv-format">CSV</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="excel-format" 
                    checked={exportFormats.excel}
                    onCheckedChange={(checked) => 
                      setExportFormats({...exportFormats, excel: !!checked})
                    }
                  />
                  <Label htmlFor="excel-format">Excel</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="api-format" 
                    checked={exportFormats.api}
                    onCheckedChange={(checked) => 
                      setExportFormats({...exportFormats, api: !!checked})
                    }
                  />
                  <Label htmlFor="api-format">API Access</Label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end space-x-3">
          <Button variant="outline">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveConfig}
            disabled={saveConfigMutation.isPending}
          >
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionConfig;
