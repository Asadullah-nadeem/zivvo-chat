import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * 1. Users Table
 */
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    username: varchar('username', { length: 255 }).notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    lastLogin: timestamp('last_login', { withTimezone: true }).defaultNow()
}, (table) => [
    index('idx_users_username').on(table.username)
]);

/**
 * 2. Secure Room URLs Table (Connected to Users)
 */
export const roomUrls = pgTable('room_urls', {
    id: uuid('id').primaryKey().defaultRandom(),
    roomToken: varchar('room_token', { length: 128 }).notNull().unique(),
    roomName: varchar('room_name', { length: 255 }).notNull(),
    createdById: uuid('created_by_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true })
}, (table) => [
    index('idx_room_urls_token').on(table.roomToken)
]);

/**
 * 3. Chat Sessions Table (Connected to Room URLs & Users)
 */
export const chatSessions = pgTable('chat_sessions', {
    id: uuid('id').primaryKey().defaultRandom(),
    roomToken: varchar('room_token', { length: 128 }).notNull(),
    roomUrlId: uuid('room_url_id').references(() => roomUrls.id, { onDelete: 'set null' }),
    roomName: varchar('room_name', { length: 255 }).notNull(),
    user1Name: varchar('user1_name', { length: 255 }).notNull(),
    user2Name: varchar('user2_name', { length: 255 }).notNull(),
    user1Id: uuid('user1_id').references(() => users.id, { onDelete: 'set null' }),
    user2Id: uuid('user2_id').references(() => users.id, { onDelete: 'set null' }),
    startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
    endedAt: timestamp('ended_at', { withTimezone: true })
}, (table) => [
    index('idx_chat_sessions_room').on(table.roomName),
    index('idx_chat_sessions_token').on(table.roomToken)
]);

/**
 * 4. Call Timestamps & Mute Logs Table (Connected to Sessions & Users)
 */
export const callTimestamps = pgTable('call_timestamps', {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id').references(() => chatSessions.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    userName: varchar('user_name', { length: 255 }).notNull(),
    eventType: varchar('event_type', { length: 100 }).notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow()
}, (table) => [
    index('idx_call_timestamps_session').on(table.sessionId)
]);

/**
 * 5. Media & Chat Streams Table (Connected to Sessions & Users)
 */
export const chatMessages = pgTable('chat_messages', {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id').references(() => chatSessions.id, { onDelete: 'cascade' }),
    senderId: uuid('sender_id').references(() => users.id, { onDelete: 'set null' }),
    sender: varchar('sender', { length: 255 }).notNull(),
    messageText: text('message_text').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
}, (table) => [
    index('idx_chat_messages_session').on(table.sessionId),
    index('idx_chat_messages_created').on(table.createdAt)
]);

/**
 * 6. Session Analytics & JSON Metrics Table (Connected to Sessions)
 */
export const sessionAnalytics = pgTable('session_analytics', {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id').references(() => chatSessions.id, { onDelete: 'cascade' }),
    roomToken: varchar('room_token', { length: 128 }).notNull(),
    participantJson: jsonb('participant_json').default(sql`'{}'::jsonb`),
    metricsJson: jsonb('metrics_json').default(sql`'{}'::jsonb`),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

/**
 * 7. Room Token Security Logs Table (Tracks roomToken with IP & Name for Rate Limiting)
 */
export const roomTokenLogs = pgTable('room_token_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    roomToken: varchar('room_token', { length: 128 }).notNull().unique(),
    ipAddress: varchar('ip_address', { length: 64 }).notNull(),
    userName: varchar('user_name', { length: 255 }).notNull(),
    isExpired: boolean('is_expired').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true })
}, (table) => [
    index('idx_room_token_logs_ip').on(table.ipAddress),
    index('idx_room_token_logs_token').on(table.roomToken),
    index('idx_room_token_logs_user').on(table.userName)
]);
