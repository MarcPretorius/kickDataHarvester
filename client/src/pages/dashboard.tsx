import Layout from "@/components/layout/Layout";
import ConnectionStatus from "@/components/dashboard/ConnectionStatus";
import StatsOverview from "@/components/dashboard/StatsOverview";
import MessageActivity from "@/components/dashboard/MessageActivity";
import TopChannels from "@/components/dashboard/TopChannels";
import RecentMessages from "@/components/dashboard/RecentMessages";
import ConnectionConfig from "@/components/dashboard/ConnectionConfig";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { toast } = useToast();
  
  // Set up WebSocket connection for real-time updates
  const { isConnected, lastMessage } = useWebSocket({
    onMessage: (data) => {
      // When we receive updates from the server, invalidate relevant queries
      if (data.type === 'messageUpdate') {
        queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      } else if (data.type === 'channelUpdate') {
        queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
      } else if (data.type === 'statusUpdate') {
        queryClient.invalidateQueries({ queryKey: ['/api/status'] });
      }
    },
    onOpen: () => {
      toast({
        title: "Connected",
        description: "Real-time updates are now active",
      });
    },
    onClose: () => {
      toast({
        title: "Disconnected",
        description: "Real-time updates are paused",
        variant: "destructive",
      });
    }
  });
  
  // Invalidate queries on first load
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/status'] });
    queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
  }, []);

  return (
    <>
      <ConnectionStatus />
      
      <StatsOverview />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <MessageActivity />
        <TopChannels />
      </div>
      
      <RecentMessages />
      
      <ConnectionConfig />
    </>
  );
};

export default Dashboard;
