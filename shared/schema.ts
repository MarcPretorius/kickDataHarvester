import { pgTable, text, serial, integer, boolean, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// User schema for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Channel schema for tracking Kick.com channels
export const channels = pgTable("channels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  status: text("status").notNull().default("inactive"), // active, inactive, paused
  messageCount: integer("message_count").notNull().default(0),
  lastActive: timestamp("last_active"),
  isTracking: boolean("is_tracking").notNull().default(false),
});

export const insertChannelSchema = createInsertSchema(channels).pick({
  name: true,
  status: true,
  isTracking: true,
});

export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type Channel = typeof channels.$inferSelect;

// Chat message schema for storing messages from Kick.com
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  channelId: integer("channel_id").notNull().references(() => channels.id),
  userId: text("user_id").notNull(),
  username: text("username").notNull(),
  userType: text("user_type").notNull().default("regular"), // regular, subscriber, moderator
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  // Moderation fields
  isHidden: boolean("is_hidden").notNull().default(false),
  isFlagged: boolean("is_flagged").notNull().default(false),
  moderationReason: text("moderation_reason"),
  moderatedBy: text("moderated_by"),
  moderatedAt: timestamp("moderated_at"),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  channelId: true,
  userId: true,
  username: true,
  userType: true,
  message: true,
  timestamp: true,
});

// Schema for moderation actions
export const moderationActionSchema = z.object({
  messageId: z.number(),
  action: z.enum(['hide', 'flag', 'unhide', 'unflag']),
  reason: z.string().optional(),
  moderatedBy: z.string(),
});

export type ModerationAction = z.infer<typeof moderationActionSchema>;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Statistics schema for tracking analytics
export const statistics = pgTable("statistics", {
  id: serial("id").primaryKey(),
  channelId: integer("channel_id").notNull().references(() => channels.id),
  date: timestamp("date").notNull(),
  messageCount: integer("message_count").notNull().default(0),
  userCount: integer("user_count").notNull().default(0),
});

export const insertStatisticsSchema = createInsertSchema(statistics).pick({
  channelId: true,
  date: true,
  messageCount: true,
  userCount: true,
});

export type InsertStatistics = z.infer<typeof insertStatisticsSchema>;
export type Statistics = typeof statistics.$inferSelect;

// Content filter keywords table
export const contentFilters = pgTable("content_filters", {
  id: serial("id").primaryKey(),
  keyword: text("keyword").notNull(),
  type: text("type").notNull().default("block"), // block, flag, replace
  replacement: text("replacement"), // Used when type is 'replace'
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: text("created_by"),
});

export const insertContentFilterSchema = createInsertSchema(contentFilters).pick({
  keyword: true,
  type: true,
  replacement: true,
  isActive: true,
  createdBy: true,
});

export type InsertContentFilter = z.infer<typeof insertContentFilterSchema>;
export type ContentFilter = typeof contentFilters.$inferSelect;

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  messages: many(chatMessages)
}));

export const channelsRelations = relations(channels, ({ many }) => ({
  messages: many(chatMessages),
  stats: many(statistics)
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  channel: one(channels, {
    fields: [chatMessages.channelId],
    references: [channels.id]
  })
}));

export const statisticsRelations = relations(statistics, ({ one }) => ({
  channel: one(channels, {
    fields: [statistics.channelId],
    references: [channels.id]
  })
}));
