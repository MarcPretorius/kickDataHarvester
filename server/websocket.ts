import WebSocket from 'ws';
import { storage } from './storage';
import { InsertChatMessage, InsertChannel } from '@shared/schema';

interface KickMessageData {
  id: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
  role?: string;
  subscriber?: boolean;
}

interface KickChannel {
  name: string;
  id: number;
}

export class KickChatClient {
  private ws: WebSocket | null = null;
  private channels: Map<string, number> = new Map(); // Map of channel name to internal channel ID
  private connectionStatus: 'connected' | 'disconnected' | 'connecting' = 'disconnected';
  private pingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.reconnect = this.reconnect.bind(this);
  }

  // Connect to a Kick.com channel's chat
  async connectToChannel(channelName: string): Promise<boolean> {
    try {
      // First check if we already have this channel in our database
      let channel = await storage.getChannelByName(channelName);
      
      if (!channel) {
        // Create a new channel in our database
        channel = await storage.createChannel({
          name: channelName,
          status: 'inactive',
          isTracking: true
        });
      } else {
        // Update existing channel to set tracking to true
        channel = await storage.updateChannel(channel.id, { 
          isTracking: true,
          status: 'connecting'
        }) || channel;
      }
      
      // Store the mapping of channel name to our internal ID
      this.channels.set(channelName.toLowerCase(), channel.id);
      
      // If we're already connected, no need to reconnect
      if (this.connectionStatus === 'connected') {
        await storage.updateChannel(channel.id, { status: 'active' });
        return true;
      }
      
      // Otherwise establish a new connection
      return this.reconnect();
    } catch (error) {
      console.error(`Failed to connect to channel ${channelName}:`, error);
      return false;
    }
  }

  // Disconnect from a channel
  async disconnectFromChannel(channelName: string): Promise<boolean> {
    try {
      const lowerChannelName = channelName.toLowerCase();
      const channelId = this.channels.get(lowerChannelName);
      
      if (channelId) {
        // Update channel status in our database
        await storage.updateChannel(channelId, { 
          isTracking: false,
          status: 'inactive'
        });
        
        // Remove from our tracked channels
        this.channels.delete(lowerChannelName);
        
        // If no more channels to track, close the connection
        if (this.channels.size === 0) {
          this.closeConnection();
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Failed to disconnect from channel ${channelName}:`, error);
      return false;
    }
  }

  // Get all tracked channels
  async getTrackedChannels(): Promise<string[]> {
    return Array.from(this.channels.keys());
  }

  // Get connection status
  getConnectionStatus(): string {
    return this.connectionStatus;
  }

  // Private methods
  private closeConnection() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    this.connectionStatus = 'disconnected';
  }

  private async reconnect(): Promise<boolean> {
    try {
      // Close any existing connection
      this.closeConnection();
      
      if (this.channels.size === 0) {
        return false; // No channels to track
      }
      
      this.connectionStatus = 'connecting';
      
      // Update all channels to connecting status
      for (const [channelName, channelId] of this.channels.entries()) {
        await storage.updateChannel(channelId, { status: 'connecting' });
      }
      
      // Connect to Kick's WebSocket API
      this.ws = new WebSocket('wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=js&version=7.4.0&flash=false');
      
      this.ws.on('open', this.handleOpen.bind(this));
      this.ws.on('message', this.handleMessage.bind(this));
      this.ws.on('error', this.handleError.bind(this));
      this.ws.on('close', this.handleClose.bind(this));
      
      return true;
    } catch (error) {
      console.error('Failed to reconnect to Kick chat:', error);
      this.connectionStatus = 'disconnected';
      
      // Update all channels to inactive status
      for (const [channelName, channelId] of this.channels.entries()) {
        await storage.updateChannel(channelId, { status: 'inactive' });
      }
      
      return false;
    }
  }

  private async handleOpen() {
    console.log('Connected to Kick WebSocket');
    this.connectionStatus = 'connected';
    
    // Set up a ping interval to keep connection alive
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ event: 'pusher:ping', data: {} }));
      }
    }, 30000); // 30 seconds
    
    // Subscribe to all tracked channels
    for (const [channelName, channelId] of this.channels.entries()) {
      this.subscribeToChannel(channelName);
      await storage.updateChannel(channelId, { status: 'active' });
    }
  }

  private async handleMessage(data: WebSocket.Data) {
    try {
      const message = JSON.parse(data.toString());
      
      // Handle pusher protocol messages
      if (message.event === 'pusher:connection_established') {
        console.log('Pusher connection established');
      } 
      else if (message.event === 'pusher_internal:subscription_succeeded') {
        console.log(`Successfully subscribed to channel: ${message.channel}`);
      }
      // Handle chat messages from Kick
      else if (message.event === 'App\\Events\\ChatMessageEvent') {
        const chatData: KickMessageData = JSON.parse(message.data).message;
        const channelName = message.channel.replace('chatrooms.', '');
        
        // Get our internal channel ID
        const channelId = this.channels.get(channelName);
        
        if (channelId) {
          // Determine user type
          let userType = 'regular';
          if (chatData.subscriber) userType = 'subscriber';
          if (chatData.role === 'moderator') userType = 'moderator';
          
          // Create a new chat message in our storage
          const chatMessage: InsertChatMessage = {
            channelId,
            userId: chatData.user_id,
            username: chatData.username,
            userType,
            message: chatData.message,
            timestamp: new Date(chatData.created_at)
          };
          
          await storage.createChatMessage(chatMessage);
        }
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  private handleError(error: Error) {
    console.error('WebSocket error:', error);
    setTimeout(this.reconnect, 5000); // Try to reconnect after 5 seconds
  }

  private async handleClose() {
    console.log('WebSocket connection closed');
    this.connectionStatus = 'disconnected';
    
    // Update all channels to inactive status
    for (const [channelName, channelId] of this.channels.entries()) {
      await storage.updateChannel(channelId, { status: 'inactive' });
    }
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    // Try to reconnect
    setTimeout(this.reconnect, 5000); // Try to reconnect after 5 seconds
  }

  private subscribeToChannel(channelName: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const subscriptionData = {
        event: 'pusher:subscribe',
        data: {
          auth: '',
          channel: `chatrooms.${channelName.toLowerCase()}`
        }
      };
      
      this.ws.send(JSON.stringify(subscriptionData));
    }
  }
}

// Create a singleton instance
export const kickChatClient = new KickChatClient();
