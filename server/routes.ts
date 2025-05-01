import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer } from "ws";
import WebSocket from "ws";
import { kickChatClient } from "./websocket";
import { 
  InsertChatMessage, 
  InsertChannel, 
  InsertContentFilter, 
  ModerationAction,
  insertChannelSchema, 
  insertChatMessageSchema, 
  insertContentFilterSchema,
  moderationActionSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Set up WebSocket server for realtime updates to the client
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Handle WebSocket connections
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });
  
  // Function to broadcast updates to all connected clients
  const broadcastUpdate = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // API Routes
  app.get('/api/status', async (req, res) => {
    try {
      const connectionStatus = kickChatClient.getConnectionStatus();
      const messageCount = await storage.getChatMessageCount();
      const activeUserCount = await storage.getActiveUserCount();
      const trackedChannelCount = await storage.getTrackedChannelCount();
      const dataStorageSize = await storage.getDataStorageSize();
      
      res.json({
        apiConnection: connectionStatus,
        databaseStatus: 'active',
        messageCount,
        activeUserCount,
        trackedChannelCount,
        dataStorageSize
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching status' });
    }
  });
  
  // Channel routes
  app.get('/api/channels', async (req, res) => {
    try {
      const channels = await storage.getChannels();
      res.json(channels);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching channels' });
    }
  });
  
  app.post('/api/channels', async (req, res) => {
    try {
      const validatedData = insertChannelSchema.parse(req.body);
      
      // Check if channel already exists
      const existingChannel = await storage.getChannelByName(validatedData.name);
      if (existingChannel) {
        return res.status(400).json({ message: 'Channel already exists' });
      }
      
      const channel = await storage.createChannel(validatedData);
      
      // If the channel should be tracked, connect to it
      if (validatedData.isTracking) {
        await kickChatClient.connectToChannel(validatedData.name);
      }
      
      res.status(201).json(channel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid channel data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Error creating channel' });
      }
    }
  });
  
  app.patch('/api/channels/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const channel = await storage.getChannel(id);
      
      if (!channel) {
        return res.status(404).json({ message: 'Channel not found' });
      }
      
      const updates = req.body;
      const updatedChannel = await storage.updateChannel(id, updates);
      
      // Handle tracking status changes
      if (updates.isTracking !== undefined) {
        if (updates.isTracking) {
          await kickChatClient.connectToChannel(channel.name);
        } else {
          await kickChatClient.disconnectFromChannel(channel.name);
        }
      }
      
      res.json(updatedChannel);
    } catch (error) {
      res.status(500).json({ message: 'Error updating channel' });
    }
  });
  
  // Chat message routes
  app.get('/api/messages', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const channelId = req.query.channelId ? parseInt(req.query.channelId as string) : undefined;
      
      let messages;
      let totalCount;
      
      if (channelId) {
        messages = await storage.getChatMessagesByChannel(channelId, limit, offset);
        totalCount = await storage.getChatMessageCountByChannel(channelId);
      } else {
        messages = await storage.getChatMessages(limit, offset);
        totalCount = await storage.getChatMessageCount();
      }
      
      res.json({
        messages,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + messages.length < totalCount
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching messages' });
    }
  });
  
  app.post('/api/messages', async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      
      // Check if channel exists
      const channel = await storage.getChannel(validatedData.channelId);
      if (!channel) {
        return res.status(400).json({ message: 'Channel does not exist' });
      }
      
      const message = await storage.createChatMessage(validatedData);
      
      // Broadcast the new message to all connected clients
      const broadcastData = {
        type: 'new_message',
        message
      };
      broadcastUpdate(broadcastData);
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid message data', errors: error.errors });
      } else {
        console.error('Error creating message:', error);
        res.status(500).json({ message: 'Error creating message' });
      }
    }
  });
  
  // Connection management routes
  app.post('/api/connection', async (req, res) => {
    try {
      const { channelName } = req.body;
      
      if (!channelName) {
        return res.status(400).json({ message: 'Channel name is required' });
      }
      
      const success = await kickChatClient.connectToChannel(channelName);
      
      if (success) {
        res.json({ message: 'Connection established' });
      } else {
        res.status(500).json({ message: 'Failed to establish connection' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error establishing connection' });
    }
  });
  
  app.delete('/api/connection/:channelName', async (req, res) => {
    try {
      const { channelName } = req.params;
      
      const success = await kickChatClient.disconnectFromChannel(channelName);
      
      if (success) {
        res.json({ message: 'Disconnected from channel' });
      } else {
        res.status(404).json({ message: 'Channel not found or already disconnected' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error disconnecting from channel' });
    }
  });
  
  // Statistics routes
  app.get('/api/statistics', async (req, res) => {
    try {
      const channelId = req.query.channelId ? parseInt(req.query.channelId as string) : 0;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default to 7 days ago
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
      
      if (channelId === 0) {
        return res.status(400).json({ message: 'Channel ID is required' });
      }
      
      const statistics = await storage.getStatistics(channelId, startDate, endDate);
      
      res.json(statistics);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching statistics' });
    }
  });

  // Message moderation routes
  app.post('/api/messages/moderate', async (req, res) => {
    try {
      const validatedData = moderationActionSchema.parse(req.body);
      const updatedMessage = await storage.moderateMessage(validatedData);
      
      // Broadcast the moderation action to all connected clients
      const broadcastData = {
        type: 'moderation_update',
        message: updatedMessage
      };
      broadcastUpdate(broadcastData);
      
      res.json(updatedMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid moderation data', errors: error.errors });
      } else {
        console.error('Error moderating message:', error);
        res.status(500).json({ message: 'Error moderating message' });
      }
    }
  });

  app.get('/api/messages/flagged', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const messages = await storage.getFlaggedMessages(limit, offset);
      
      res.json({
        messages,
        pagination: {
          limit,
          offset,
          hasMore: messages.length === limit
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching flagged messages' });
    }
  });

  app.get('/api/messages/search', async (req, res) => {
    try {
      const searchTerm = req.query.term as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      if (!searchTerm) {
        return res.status(400).json({ message: 'Search term is required' });
      }
      
      const messages = await storage.getMessagesByContent(searchTerm, limit, offset);
      
      res.json({
        messages,
        pagination: {
          limit,
          offset,
          hasMore: messages.length === limit
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error searching messages' });
    }
  });

  // Content filter routes
  app.get('/api/filters', async (req, res) => {
    try {
      const filters = await storage.getContentFilters();
      res.json(filters);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching content filters' });
    }
  });

  app.post('/api/filters', async (req, res) => {
    try {
      const validatedData = insertContentFilterSchema.parse(req.body);
      const filter = await storage.createContentFilter(validatedData);
      res.status(201).json(filter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid filter data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Error creating filter' });
      }
    }
  });

  app.patch('/api/filters/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const filter = await storage.getContentFilter(id);
      
      if (!filter) {
        return res.status(404).json({ message: 'Filter not found' });
      }
      
      const updates = req.body;
      const updatedFilter = await storage.updateContentFilter(id, updates);
      
      res.json(updatedFilter);
    } catch (error) {
      res.status(500).json({ message: 'Error updating filter' });
    }
  });

  app.delete('/api/filters/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteContentFilter(id);
      
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: 'Filter not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error deleting filter' });
    }
  });

  app.post('/api/filters/apply', async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: 'Message content is required' });
      }
      
      const result = await storage.applyContentFilters(message);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error applying content filters' });
    }
  });

  return httpServer;
}
