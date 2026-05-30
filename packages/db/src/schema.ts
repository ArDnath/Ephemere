import { pgTable, text, timestamp, boolean, integer, pgEnum, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

export const authProviderEnum = pgEnum('auth_provider', ['EMAIL', 'GOOGLE', 'GITHUB']);

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  image: text('image'),
  subscriptionId: text('subscription_id').unique(),
  roomsCount: integer('rooms_count').default(0).notNull(),
  savedRoomsCount: integer('saved_rooms_count').default(0).notNull(),
  provider: authProviderEnum('provider').default('EMAIL').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

export const plans = pgTable('plans', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  maxUsers: integer('max_users').default(100).notNull(),
  maxTimeLimit: integer('max_time_limit').default(60).notNull(),
  maxRooms: integer('max_rooms').notNull(),
  maxSavedRooms: integer('max_saved_rooms').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  price: integer('price').default(10).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  planId: text('plan_id').notNull().references(() => plans.id, { onDelete: 'cascade' }),
  isPro: boolean('is_pro').default(false).notNull(),
  startDate: timestamp('start_date', { mode: 'date' }).defaultNow().notNull(),
  endDate: timestamp('end_date', { mode: 'date' }),
  isMonthly: boolean('is_monthly').default(true).notNull(),
  autoRenew: boolean('auto_renew').default(true).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

export const purchases = pgTable('purchases', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  razorpayOrderId: text('razorpay_order_id').notNull().unique(),
  razorpayPaymentId: text('razorpay_payment_id').unique(),
  razorpaySignature: text('razorpay_signature').unique(),
  amount: integer('amount').notNull(),
  currency: text('currency').default('INR').notNull(),
  status: text('status').default('created').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  planId: text('plan_id').notNull(),
  subscriptionId: text('subscription_id').references(() => subscriptions.id),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

export const rooms = pgTable('rooms', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  isTemporary: boolean('is_temporary').default(true).notNull(),
  maxTimeLimit: integer('max_time_limit').notNull(),
  maxUsers: integer('max_users').notNull(),
  createdById: text('created_by_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  closedAt: timestamp('closed_at', { mode: 'date' }),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
}, (table) => {
  return {
    createdByCreatedAtIndex: index('created_by_created_at_idx').on(table.createdById, table.createdAt),
  };
});

export const roomParticipants = pgTable('room_participants', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  roomId: text('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  tempUsername: text('temp_username'),
  tempUserId: text('temp_user_id'),
  tempUserImage: text('temp_user_image'),
  joinedAt: timestamp('joined_at', { mode: 'date' }).defaultNow().notNull(),
  leftAt: timestamp('left_at', { mode: 'date' }),
});

export const messages = pgTable('messages', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  content: text('content').notNull(),
  image: text('image'),
  sentAt: timestamp('sent_at', { mode: 'date' }).defaultNow().notNull(),
  roomId: text('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  senderId: text('sender_id').notNull().references(() => roomParticipants.id, { onDelete: 'cascade' }),
});

export const reactions = pgTable('reactions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  emoji: text('emoji').notNull(),
  sentAt: timestamp('sent_at', { mode: 'date' }).defaultNow().notNull(),
  messageId: text('message_id').notNull().references(() => messages.id, { onDelete: 'cascade' }),
  senderId: text('sender_id').notNull().references(() => roomParticipants.id),
  roomId: text('room_id').references(() => rooms.id, { onDelete: 'cascade' }),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
}, (table) => {
  return {
    emojiMessageSenderUnique: unique('emoji_message_sender_unique').on(table.emoji, table.messageId, table.senderId),
  };
});

export const emailVerificationTokens = pgTable('email_verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (table) => {
  return {
    identifierTokenUnique: unique('email_verification_identifier_token_unique').on(table.identifier, table.token),
  };
});

export const passwordResetTokens = pgTable('password_reset_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (table) => {
  return {
    identifierTokenUnique: unique('password_reset_identifier_token_unique').on(table.identifier, table.token),
  };
});

export const usersRelations = relations(users, ({ one, many }) => ({
  subscription: one(subscriptions, {
    fields: [users.subscriptionId],
    references: [subscriptions.id],
  }),
  rooms: many(rooms, { relationName: 'RoomCreator' }),
  participants: many(roomParticipants),
  purchases: many(purchases),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
  purchases: many(purchases),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id],
  }),
  subscription: one(subscriptions, {
    fields: [purchases.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [rooms.createdById],
    references: [users.id],
    relationName: 'RoomCreator',
  }),
  participants: many(roomParticipants),
  messages: many(messages, { relationName: 'RoomMessages' }),
  reactions: many(reactions),
}));

export const roomParticipantsRelations = relations(roomParticipants, ({ one, many }) => ({
  user: one(users, {
    fields: [roomParticipants.userId],
    references: [users.id],
  }),
  room: one(rooms, {
    fields: [roomParticipants.roomId],
    references: [rooms.id],
  }),
  messages: many(messages),
  reactions: many(reactions),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  room: one(rooms, {
    fields: [messages.roomId],
    references: [rooms.id],
    relationName: 'RoomMessages',
  }),
  sender: one(roomParticipants, {
    fields: [messages.senderId],
    references: [roomParticipants.id],
  }),
  reactions: many(reactions, { relationName: 'MessageReactions' }),
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
  message: one(messages, {
    fields: [reactions.messageId],
    references: [messages.id],
    relationName: 'MessageReactions',
  }),
  sender: one(roomParticipants, {
    fields: [reactions.senderId],
    references: [roomParticipants.id],
  }),
  room: one(rooms, {
    fields: [reactions.roomId],
    references: [rooms.id],
  }),
}));
