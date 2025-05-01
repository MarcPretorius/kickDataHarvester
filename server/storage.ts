import { 
  User, InsertUser, users, 
  Channel, InsertChannel, channels,
  ChatMessage, InsertChatMessage, chatMessages,
  Statistics, InsertStatistics, statistics,
  ContentFilter, InsertContentFilter, contentFilters,
  ModerationAction
} from "@shared/schema";
import { db } from "./db";
import { eq, and, between, count, desc, gt, lt, sum, sql, like, or, inArray } from 'drizzle-orm';

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Channel operations
  getChannels(): Promise<Channel[]>;
  getChannel(id: number): Promise<Channel | undefined>;
  getChannelByName(name: string): Promise<Channel | undefined>;
  createChannel(channel: InsertChannel): Promise<Channel>;
  updateChannel(id: number, updates: Partial<Channel>): Promise<Channel | undefined>;
  
  // Chat message operations
  getChatMessages(limit?: number, offset?: number): Promise<ChatMessage[]>;
  getChatMessagesByChannel(channelId: number, limit?: number, offset?: number): Promise<ChatMessage[]>;
  getChatMessageCount(): Promise<number>;
  getChatMessageCountByChannel(channelId: number): Promise<number>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Moderation operations
  moderateMessage(action: ModerationAction): Promise<ChatMessage>;
  getFlaggedMessages(limit?: number, offset?: number): Promise<ChatMessage[]>;
  getMessagesByContent(searchTerm: string, limit?: number, offset?: number): Promise<ChatMessage[]>;
  
  // Content filter operations
  getContentFilters(): Promise<ContentFilter[]>;
  getContentFilter(id: number): Promise<ContentFilter | undefined>;
  createContentFilter(filter: InsertContentFilter): Promise<ContentFilter>;
  updateContentFilter(id: number, updates: Partial<ContentFilter>): Promise<ContentFilter | undefined>;
  deleteContentFilter(id: number): Promise<boolean>;
  applyContentFilters(message: string): Promise<{filteredMessage: string, hasBeenFiltered: boolean, flags: string[]}>;
  
  // Statistics operations
  getStatistics(channelId: number, startDate: Date, endDate: Date): Promise<Statistics[]>;
  createStatistics(stats: InsertStatistics): Promise<Statistics>;
  getActiveUserCount(): Promise<number>;
  getTrackedChannelCount(): Promise<number>;
  getDataStorageSize(): Promise<number>; // in bytes
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private channels: Map<number, Channel>;
  private chatMessages: Map<number, ChatMessage>;
  private statisticsData: Map<number, Statistics>;
  
  private userId: number;
  private channelId: number;
  private messageId: number;
  private statisticsId: number;
  
  private uniqueUsers: Set<string>; // To track unique users
  private dataSize: number; // To track data storage size in bytes

  constructor() {
    this.users = new Map();
    this.channels = new Map();
    this.chatMessages = new Map();
    this.statisticsData = new Map();
    
    this.userId = 1;
    this.channelId = 1;
    this.messageId = 1;
    this.statisticsId = 1;
    
    this.uniqueUsers = new Set();
    this.dataSize = 0;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Channel operations
  async getChannels(): Promise<Channel[]> {
    return Array.from(this.channels.values());
  }

  async getChannel(id: number): Promise<Channel | undefined> {
    return this.channels.get(id);
  }

  async getChannelByName(name: string): Promise<Channel | undefined> {
    return Array.from(this.channels.values()).find(
      (channel) => channel.name.toLowerCase() === name.toLowerCase(),
    );
  }

  async createChannel(insertChannel: InsertChannel): Promise<Channel> {
    const id = this.channelId++;
    const channel: Channel = { 
      ...insertChannel, 
      id, 
      messageCount: 0,
      lastActive: new Date(),
    };
    this.channels.set(id, channel);
    return channel;
  }

  async updateChannel(id: number, updates: Partial<Channel>): Promise<Channel | undefined> {
    const channel = this.channels.get(id);
    if (!channel) return undefined;
    
    const updatedChannel = { ...channel, ...updates };
    this.channels.set(id, updatedChannel);
    return updatedChannel;
  }

  // Chat message operations
  async getChatMessages(limit: number = 100, offset: number = 0): Promise<ChatMessage[]> {
    const messages = Array.from(this.chatMessages.values());
    // Sort by timestamp, newest first
    messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return messages.slice(offset, offset + limit);
  }

  async getChatMessagesByChannel(channelId: number, limit: number = 100, offset: number = 0): Promise<ChatMessage[]> {
    const messages = Array.from(this.chatMessages.values())
      .filter(message => message.channelId === channelId);
    // Sort by timestamp, newest first
    messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return messages.slice(offset, offset + limit);
  }

  async getChatMessageCount(): Promise<number> {
    return this.chatMessages.size;
  }

  async getChatMessageCountByChannel(channelId: number): Promise<number> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.channelId === channelId).length;
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.messageId++;
    const message: ChatMessage = { ...insertMessage, id };
    
    this.chatMessages.set(id, message);
    
    // Update channel message count and last active timestamp
    const channel = this.channels.get(message.channelId);
    if (channel) {
      channel.messageCount += 1;
      channel.lastActive = new Date(message.timestamp);
      this.channels.set(message.channelId, channel);
    }
    
    // Track unique users
    this.uniqueUsers.add(message.userId);
    
    // Update data size (rough estimate: 200 bytes per message)
    this.dataSize += 200;
    
    return message;
  }

  // Statistics operations
  async getStatistics(channelId: number, startDate: Date, endDate: Date): Promise<Statistics[]> {
    return Array.from(this.statisticsData.values())
      .filter(stat => 
        stat.channelId === channelId && 
        new Date(stat.date) >= startDate &&
        new Date(stat.date) <= endDate
      );
  }

  async createStatistics(insertStats: InsertStatistics): Promise<Statistics> {
    const id = this.statisticsId++;
    const stats: Statistics = { ...insertStats, id };
    this.statisticsData.set(id, stats);
    return stats;
  }

  async getActiveUserCount(): Promise<number> {
    return this.uniqueUsers.size;
  }

  async getTrackedChannelCount(): Promise<number> {
    return Array.from(this.channels.values())
      .filter(channel => channel.isTracking).length;
  }

  async getDataStorageSize(): Promise<number> {
    return this.dataSize;
  }

  // Moderation operations
  async moderateMessage(action: ModerationAction): Promise<ChatMessage> {
    const { messageId, action: actionType, reason, moderatedBy } = action;
    const message = this.chatMessages.get(messageId);
    if (!message) {
      throw new Error(`Message with ID ${messageId} not found`);
    }

    // Update message with moderation details
    const updatedMessage = { 
      ...message,
      moderatedBy,
      moderatedAt: new Date(),
      moderationReason: reason || null,
      isHidden: actionType === 'hide' ? true : actionType === 'unhide' ? false : message.isHidden || false,
      isFlagged: actionType === 'flag' ? true : actionType === 'unflag' ? false : message.isFlagged || false
    };

    this.chatMessages.set(messageId, updatedMessage);
    return updatedMessage;
  }

  async getFlaggedMessages(limit: number = 100, offset: number = 0): Promise<ChatMessage[]> {
    const messages = Array.from(this.chatMessages.values())
      .filter(message => message.isFlagged);
    
    // Sort by timestamp, newest first
    messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return messages.slice(offset, offset + limit);
  }

  async getMessagesByContent(searchTerm: string, limit: number = 100, offset: number = 0): Promise<ChatMessage[]> {
    const messages = Array.from(this.chatMessages.values())
      .filter(message => message.message.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Sort by timestamp, newest first
    messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return messages.slice(offset, offset + limit);
  }

  // Content filter operations
  private contentFilters: Map<number, ContentFilter> = new Map();
  private contentFilterId: number = 1;

  async getContentFilters(): Promise<ContentFilter[]> {
    return Array.from(this.contentFilters.values());
  }

  async getContentFilter(id: number): Promise<ContentFilter | undefined> {
    return this.contentFilters.get(id);
  }

  async createContentFilter(filter: InsertContentFilter): Promise<ContentFilter> {
    const id = this.contentFilterId++;
    const newFilter: ContentFilter = { 
      ...filter, 
      id,
      createdAt: new Date(),
      isActive: filter.isActive !== undefined ? filter.isActive : true
    };
    this.contentFilters.set(id, newFilter);
    return newFilter;
  }

  async updateContentFilter(id: number, updates: Partial<ContentFilter>): Promise<ContentFilter | undefined> {
    const filter = this.contentFilters.get(id);
    if (!filter) return undefined;
    
    const updatedFilter = { ...filter, ...updates };
    this.contentFilters.set(id, updatedFilter);
    return updatedFilter;
  }

  async deleteContentFilter(id: number): Promise<boolean> {
    return this.contentFilters.delete(id);
  }

  async applyContentFilters(message: string): Promise<{filteredMessage: string, hasBeenFiltered: boolean, flags: string[]}> {
    let filteredMessage = message;
    let hasBeenFiltered = false;
    const flags: string[] = [];

    // Get all active filters
    const filters = Array.from(this.contentFilters.values()).filter(f => f.isActive);

    // Apply each filter to the message
    for (const filter of filters) {
      // Create a case-insensitive regular expression
      const regex = new RegExp(filter.keyword, 'gi');
      
      if (regex.test(filteredMessage)) {
        // Word found in message
        if (filter.type === 'block') {
          // Add to flags for blocked content
          flags.push(filter.keyword);
          hasBeenFiltered = true;
        } else if (filter.type === 'flag') {
          // Add to flags but don't modify the message
          flags.push(filter.keyword);
          hasBeenFiltered = true;
        } else if (filter.type === 'replace' && filter.replacement) {
          // Replace the word with the specified replacement
          filteredMessage = filteredMessage.replace(regex, filter.replacement);
          hasBeenFiltered = true;
        }
      }
    }

    return { filteredMessage, hasBeenFiltered, flags };
  }
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Channel operations
  async getChannels(): Promise<Channel[]> {
    return await db.select().from(channels);
  }

  async getChannel(id: number): Promise<Channel | undefined> {
    const [channel] = await db.select().from(channels).where(eq(channels.id, id));
    return channel;
  }

  async getChannelByName(name: string): Promise<Channel | undefined> {
    const [channel] = await db.select().from(channels).where(
      eq(sql`LOWER(${channels.name})`, name.toLowerCase())
    );
    return channel;
  }

  async createChannel(insertChannel: InsertChannel): Promise<Channel> {
    const [channel] = await db.insert(channels).values({
      ...insertChannel,
      status: insertChannel.status || "active",
      isTracking: insertChannel.isTracking !== undefined ? insertChannel.isTracking : false,
      messageCount: 0,
      lastActive: new Date()
    }).returning();
    return channel;
  }

  async updateChannel(id: number, updates: Partial<Channel>): Promise<Channel | undefined> {
    const [updatedChannel] = await db.update(channels)
      .set(updates)
      .where(eq(channels.id, id))
      .returning();
    return updatedChannel;
  }

  // Chat message operations
  async getChatMessages(limit: number = 100, offset: number = 0): Promise<ChatMessage[]> {
    return await db.select()
      .from(chatMessages)
      .orderBy(desc(chatMessages.timestamp))
      .limit(limit)
      .offset(offset);
  }

  async getChatMessagesByChannel(channelId: number, limit: number = 100, offset: number = 0): Promise<ChatMessage[]> {
    return await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.channelId, channelId))
      .orderBy(desc(chatMessages.timestamp))
      .limit(limit)
      .offset(offset);
  }

  async getChatMessageCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(chatMessages);
    return Number(result.count);
  }

  async getChatMessageCountByChannel(channelId: number): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(chatMessages)
      .where(eq(chatMessages.channelId, channelId));
    return Number(result.count);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    // Ensure required fields are set
    const messageToInsert = {
      ...message,
      userType: message.userType || 'regular',
      timestamp: message.timestamp || new Date()
    };
    
    // Start a transaction to ensure data consistency
    return await db.transaction(async (tx) => {
      // Insert the message
      const [newMessage] = await tx.insert(chatMessages)
        .values(messageToInsert)
        .returning();
      
      // Update the channel message count and last active timestamp
      await tx.update(channels)
        .set({
          messageCount: sql`${channels.messageCount} + 1`,
          lastActive: new Date()
        })
        .where(eq(channels.id, message.channelId));
      
      return newMessage;
    });
  }

  // Statistics operations
  async getStatistics(channelId: number, startDate: Date, endDate: Date): Promise<Statistics[]> {
    return await db.select()
      .from(statistics)
      .where(
        and(
          eq(statistics.channelId, channelId),
          between(statistics.date, startDate, endDate)
        )
      );
  }

  async createStatistics(stats: InsertStatistics): Promise<Statistics> {
    // Ensure required fields have default values
    const statsToInsert = {
      ...stats,
      messageCount: stats.messageCount !== undefined ? stats.messageCount : 0,
      userCount: stats.userCount !== undefined ? stats.userCount : 0
    };
    
    const [newStats] = await db.insert(statistics)
      .values(statsToInsert)
      .returning();
    return newStats;
  }

  async getActiveUserCount(): Promise<number> {
    const [result] = await db.select({
      count: sql`COUNT(DISTINCT ${chatMessages.userId})`
    }).from(chatMessages);
    
    return Number(result.count);
  }

  async getTrackedChannelCount(): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(channels)
      .where(eq(channels.isTracking, true));
    return Number(result.count);
  }

  async getDataStorageSize(): Promise<number> {
    // Estimate storage based on message count (rough estimate: 200 bytes per message)
    const messageCount = await this.getChatMessageCount();
    return messageCount * 200;
  }

  // Moderation operations
  async moderateMessage(action: ModerationAction): Promise<ChatMessage> {
    const { messageId, action: actionType, reason, moderatedBy } = action;
    const updates: any = {
      moderatedBy,
      moderatedAt: new Date()
    };

    if (reason) {
      updates.moderationReason = reason;
    }

    // Set the appropriate flags based on the action type
    if (actionType === 'hide') {
      updates.isHidden = true;
    } else if (actionType === 'unhide') {
      updates.isHidden = false;
    } else if (actionType === 'flag') {
      updates.isFlagged = true;
    } else if (actionType === 'unflag') {
      updates.isFlagged = false;
    }

    // Update the message with moderation details
    const [updatedMessage] = await db.update(chatMessages)
      .set(updates)
      .where(eq(chatMessages.id, messageId))
      .returning();

    return updatedMessage;
  }

  async getFlaggedMessages(limit: number = 100, offset: number = 0): Promise<ChatMessage[]> {
    return await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.isFlagged, true))
      .orderBy(desc(chatMessages.timestamp))
      .limit(limit)
      .offset(offset);
  }

  async getMessagesByContent(searchTerm: string, limit: number = 100, offset: number = 0): Promise<ChatMessage[]> {
    return await db.select()
      .from(chatMessages)
      .where(like(chatMessages.message, `%${searchTerm}%`))
      .orderBy(desc(chatMessages.timestamp))
      .limit(limit)
      .offset(offset);
  }

  // Content filter operations
  async getContentFilters(): Promise<ContentFilter[]> {
    return await db.select().from(contentFilters);
  }

  async getContentFilter(id: number): Promise<ContentFilter | undefined> {
    const [filter] = await db.select()
      .from(contentFilters)
      .where(eq(contentFilters.id, id));
    return filter;
  }

  async createContentFilter(filter: InsertContentFilter): Promise<ContentFilter> {
    const [newFilter] = await db.insert(contentFilters)
      .values(filter)
      .returning();
    return newFilter;
  }

  async updateContentFilter(id: number, updates: Partial<ContentFilter>): Promise<ContentFilter | undefined> {
    const [updatedFilter] = await db.update(contentFilters)
      .set(updates)
      .where(eq(contentFilters.id, id))
      .returning();
    return updatedFilter;
  }

  async deleteContentFilter(id: number): Promise<boolean> {
    const result = await db.delete(contentFilters)
      .where(eq(contentFilters.id, id));
    return !!result.rowCount && result.rowCount > 0;
  }

  async applyContentFilters(message: string): Promise<{filteredMessage: string, hasBeenFiltered: boolean, flags: string[]}> {
    // Get all active filters
    const filters = await db.select()
      .from(contentFilters)
      .where(eq(contentFilters.isActive, true));
    
    let filteredMessage = message;
    let hasBeenFiltered = false;
    const flags: string[] = [];

    // Apply each filter to the message
    for (const filter of filters) {
      // Create a case-insensitive regular expression
      const regex = new RegExp(filter.keyword, 'gi');
      
      if (regex.test(filteredMessage)) {
        // Word found in message
        if (filter.type === 'block') {
          // Add to flags for blocked content
          flags.push(filter.keyword);
          hasBeenFiltered = true;
        } else if (filter.type === 'flag') {
          // Add to flags but don't modify the message
          flags.push(filter.keyword);
          hasBeenFiltered = true;
        } else if (filter.type === 'replace' && filter.replacement) {
          // Replace the word with the specified replacement
          filteredMessage = filteredMessage.replace(regex, filter.replacement);
          hasBeenFiltered = true;
        }
      }
    }

    return { filteredMessage, hasBeenFiltered, flags };
  }
}

// Use the database storage implementation
export const storage = new DatabaseStorage();
