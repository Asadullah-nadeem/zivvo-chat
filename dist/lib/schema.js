"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionAnalytics = exports.chatMessages = exports.callTimestamps = exports.chatSessions = exports.roomUrls = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
/**
 * 1. Users Table
 */
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    username: (0, pg_core_1.varchar)('username', { length: 255 }).notNull().unique(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    lastLogin: (0, pg_core_1.timestamp)('last_login', { withTimezone: true }).defaultNow()
}, (table) => [
    (0, pg_core_1.index)('idx_users_username').on(table.username)
]);
/**
 * 2. Secure Room URLs Table (Connected to Users)
 */
exports.roomUrls = (0, pg_core_1.pgTable)('room_urls', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    roomToken: (0, pg_core_1.varchar)('room_token', { length: 128 }).notNull().unique(),
    roomName: (0, pg_core_1.varchar)('room_name', { length: 255 }).notNull(),
    createdById: (0, pg_core_1.uuid)('created_by_id').references(() => exports.users.id, { onDelete: 'set null' }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at', { withTimezone: true })
}, (table) => [
    (0, pg_core_1.index)('idx_room_urls_token').on(table.roomToken)
]);
/**
 * 3. Chat Sessions Table (Connected to Room URLs & Users)
 */
exports.chatSessions = (0, pg_core_1.pgTable)('chat_sessions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    roomToken: (0, pg_core_1.varchar)('room_token', { length: 128 }).notNull(),
    roomUrlId: (0, pg_core_1.uuid)('room_url_id').references(() => exports.roomUrls.id, { onDelete: 'set null' }),
    roomName: (0, pg_core_1.varchar)('room_name', { length: 255 }).notNull(),
    user1Name: (0, pg_core_1.varchar)('user1_name', { length: 255 }).notNull(),
    user2Name: (0, pg_core_1.varchar)('user2_name', { length: 255 }).notNull(),
    user1Id: (0, pg_core_1.uuid)('user1_id').references(() => exports.users.id, { onDelete: 'set null' }),
    user2Id: (0, pg_core_1.uuid)('user2_id').references(() => exports.users.id, { onDelete: 'set null' }),
    startedAt: (0, pg_core_1.timestamp)('started_at', { withTimezone: true }).defaultNow(),
    endedAt: (0, pg_core_1.timestamp)('ended_at', { withTimezone: true })
}, (table) => [
    (0, pg_core_1.index)('idx_chat_sessions_room').on(table.roomName),
    (0, pg_core_1.index)('idx_chat_sessions_token').on(table.roomToken)
]);
/**
 * 4. Call Timestamps & Mute Logs Table (Connected to Sessions & Users)
 */
exports.callTimestamps = (0, pg_core_1.pgTable)('call_timestamps', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    sessionId: (0, pg_core_1.uuid)('session_id').references(() => exports.chatSessions.id, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id, { onDelete: 'set null' }),
    userName: (0, pg_core_1.varchar)('user_name', { length: 255 }).notNull(),
    eventType: (0, pg_core_1.varchar)('event_type', { length: 100 }).notNull(),
    timestamp: (0, pg_core_1.timestamp)('timestamp', { withTimezone: true }).defaultNow()
}, (table) => [
    (0, pg_core_1.index)('idx_call_timestamps_session').on(table.sessionId)
]);
/**
 * 5. Media & Chat Streams Table (Connected to Sessions & Users)
 */
exports.chatMessages = (0, pg_core_1.pgTable)('chat_messages', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    sessionId: (0, pg_core_1.uuid)('session_id').references(() => exports.chatSessions.id, { onDelete: 'cascade' }),
    senderId: (0, pg_core_1.uuid)('sender_id').references(() => exports.users.id, { onDelete: 'set null' }),
    sender: (0, pg_core_1.varchar)('sender', { length: 255 }).notNull(),
    messageText: (0, pg_core_1.text)('message_text').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow()
}, (table) => [
    (0, pg_core_1.index)('idx_chat_messages_session').on(table.sessionId),
    (0, pg_core_1.index)('idx_chat_messages_created').on(table.createdAt)
]);
/**
 * 6. Session Analytics & JSON Metrics Table (Connected to Sessions)
 */
exports.sessionAnalytics = (0, pg_core_1.pgTable)('session_analytics', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    sessionId: (0, pg_core_1.uuid)('session_id').references(() => exports.chatSessions.id, { onDelete: 'cascade' }),
    roomToken: (0, pg_core_1.varchar)('room_token', { length: 128 }).notNull(),
    participantJson: (0, pg_core_1.jsonb)('participant_json').default((0, drizzle_orm_1.sql) `'{}'::jsonb`),
    metricsJson: (0, pg_core_1.jsonb)('metrics_json').default((0, drizzle_orm_1.sql) `'{}'::jsonb`),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow()
});
