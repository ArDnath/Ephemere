# Echo-Chat Clone Guide: Drizzle ORM & Neon PostgreSQL Setup
This guide provides an end-to-end blueprint for building a clone of **Echo-Chat** in your style using a premium tech stack: **Drizzle ORM** (relational query builder) and **Neon Database** (Serverless PostgreSQL).

It contains everything you need to reconstruct the monorepo structure, build the shared database package, map Prisma schemas to Drizzle tables, and convert core server and socket queries.

---

## 🏗️ 1. Architecture Overview & Monorepo Setup

The project uses a standard **pnpm monorepo** managed with **Turborepo** for optimal scaling, fast local builds, and seamless sharing of database entities between your services.

### Directory Structure
```text
echo-chat-clone/
├── apps/
│   ├── server/             # Express.js REST API
│   ├── ws/                 # WebSocket real-time server
│   └── www/                # Next.js 15 App (Frontend & Server Actions)
├── packages/
│   ├── db/                 # Shared Drizzle ORM schema & client package
│   ├── eslint-config/      # Shared ESLint lint rules
│   ├── tailwind-config/    # Shared Tailwind configurations
│   ├── typescript-config/  # Shared tsconfig rules
│   ├── ui/                 # Shared React UI components (shadcn/Radix)
│   └── utils/              # Shared helper functions
├── package.json            # Monorepo root packages & scripts
├── pnpm-workspace.yaml     # pnpm workspace definition
└── turbo.json              # Turborepo task pipeline config
```

### Initialize Monorepo Workspaces
In your root `pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

In your root `package.json`:
```json
{
  "name": "echo-chat-clone",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "format": "prettier --write './**/*.{js,jsx,ts,tsx,css,md,json}'"
  },
  "devDependencies": {
    "turbo": "^2.2.3",
    "typescript": "^5.5.4",
    "prettier": "^3.3.3"
  },
  "packageManager": "pnpm@8.15.9"
}
```

---

## ⚡ 2. Neon Database Provisioning

**Neon** is a fully-managed, serverless PostgreSQL database featuring instant branch syncing, autoscaling, and connection pooling.

### Setup Instructions
1. **Create a Neon Project**:
   - Go to [neon.tech](https://neon.tech/) and sign up.
   - Create a new project called `echo-chat`.
   - Select your preferred region (e.g., US East, Europe Central) and choose **PostgreSQL 16**.
2. **Fetch Database Connection Strings**:
   - In your Neon console dashboard, copy the database connection string.
   - There are two connection strings provided:
     1. **Pooled Connection String** (marked with `-pooler`): Uses PgBouncer. Recommended for serverless environments (Next.js server actions/edge functions) to prevent running out of database connections.
     2. **Direct Connection String**: Bypasses the pooler. Needed for running migrations (Drizzle-Kit) or long-running websocket servers that handle connections directly.
3. **Configure Environment Variables**:
   In your shared packages/services, define `DATABASE_URL`:
   ```bash
   # Use pooled URI for standard operations
   DATABASE_URL="postgresql://[user]:[password]@[neon-host]-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
   # Keep a separate direct URL for database migrations
   DIRECT_URL="postgresql://[user]:[password]@[neon-host].us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

---

## 📦 3. Rebuilding the `@echo/db` Package (Drizzle Migration)

The `@echo/db` package is a shared workspace package dependency. We'll set it up from scratch to compile Drizzle schema definitions and export a global Drizzle client instance.

### `packages/db/package.json`
```json
{
  "name": "@echo/db",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "exports": {
    "./src": "./src/index.ts",
    "./schema": "./src/schema.ts"
  },
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.9.3",
    "@paralleldrive/cuid2": "^2.2.2",
    "dotenv": "^16.4.5",
    "drizzle-orm": "^0.30.10"
  },
  "devDependencies": {
    "drizzle-kit": "^0.22.8",
    "typescript": "^5.5.4"
  }
}
```

### `packages/db/drizzle.config.ts`
```typescript
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' }); // Adjust relative path based on workspace location

export default defineConfig({
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // Migrations MUST use the direct, non-pooled connection URL
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
});
```

---

## 🗃️ 4. The 1:1 Schema Definition (`packages/db/src/schema.ts`)

Here is the exact mapping of your Prisma schemas translated to **Drizzle PostgreSQL schema definitions**, including standard relations utilizing Drizzle's relational query API (`relations`).

```typescript
import { pgTable, text, timestamp, boolean, integer, pgEnum, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// ----------------------------------------------------
// ENUMS
// ----------------------------------------------------
export const authProviderEnum = pgEnum('auth_provider', ['EMAIL', 'GOOGLE', 'GITHUB']);

// ----------------------------------------------------
// TABLES
// ----------------------------------------------------

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

// ----------------------------------------------------
// RELATIONS
// ----------------------------------------------------

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
```

---

## 🧰 5. Drizzle Client Initializer (`packages/db/src/index.ts`)

In serverless architectures (like Next.js on Vercel), pool connections can grow unbounded due to rapid scaling. We must initialize a dynamic connection:
1. **Edge/Serverless environments**: Use the HTTP `@neondatabase/serverless` connection.
2. **Traditional environments (Express/WebSocket)**: Use pooled connections to optimize round-trips.

```typescript
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import * as schema from './schema';

// Required for compatibility in serverless and browser-like environments
if (typeof window === 'undefined') {
  neonConfig.webSocketConstructor = require('ws');
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is missing.');
}

// Keep connection pools singleton in development to prevent hot reload leaks
const globalForDrizzle = globalThis as unknown as {
  pool: Pool | undefined;
};

const pool = globalForDrizzle.pool ?? new Pool({ connectionString });
if (process.env.NODE_ENV !== 'production') globalForDrizzle.pool = pool;

export const db = drizzle(pool, { schema });
export default db;
```

---

## 🔄 6. Prisma vs Drizzle Query Comparison Cheat Sheet

### Basic Query Operations

| Operation | Prisma Syntax | Drizzle ORM Syntax |
| :--- | :--- | :--- |
| **Select All** | `client.user.findMany()` | `db.select().from(users)` |
| **Select Unique** | `client.user.findUnique({ where: { id } })` | `db.select().from(users).where(eq(users.id, id))` |
| **Insert One** | `client.user.create({ data: { name, email } })` | `db.insert(users).values({ name, email })` |
| **Update One** | `client.user.update({ where: { id }, data: { name } })` | `db.update(users).set({ name }).where(eq(users.id, id))` |
| **Delete One** | `client.user.delete({ where: { id } })` | `db.delete(users).where(eq(users.id, id))` |

---

## 🧩 7. Live Code Transformations from Echo-Chat

We reviewed your active codebase. Here are the exact transformations from Prisma queries to Drizzle.

### 📍 Example A: Express `userController.ts` Migration

#### Original Prisma Code:
```typescript
export const getStats = async (req: Request, res: Response) => {
  const stats = await client.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      subscription: {
        select: {
          plan: {
            select: {
              maxRooms: true,
              maxSavedRooms: true,
              maxTimeLimit: true,
              maxUsers: true,
            },
          },
        },
      },
      savedRoomsCount: true,
      roomsCount: true,
    },
  });
  // ...
};

export const updateProfile = async (req: Request, res: Response) => {
  const updatedUser = await client.user.update({
    where: { id: req.user!.userId },
    data: updateData,
    select: { id: true, name: true, image: true },
  });
  res.json(updatedUser);
};
```

#### Drizzle ORM Equivalent:
```typescript
import { eq } from 'drizzle-orm';
import { db } from '@echo/db/src';
import { users } from '@echo/db/src/schema';

export const getStats = async (req: Request, res: Response) => {
  try {
    // Utilizing Drizzle's ultra-powerful Relational Query Builder API
    const stats = await db.query.users.findFirst({
      where: eq(users.id, req.user!.userId),
      columns: {
        savedRoomsCount: true,
        roomsCount: true,
      },
      with: {
        subscription: {
          with: {
            plan: {
              columns: {
                maxRooms: true,
                maxSavedRooms: true,
                maxTimeLimit: true,
                maxUsers: true,
              },
            },
          },
        },
      },
    });

    if (!stats) {
      res.status(404).json({ message: 'User stats not found' });
      return;
    }

    res.json({
      totalRooms: stats.roomsCount,
      savedRooms: stats.savedRoomsCount,
      temporaryRooms: stats.roomsCount - stats.savedRoomsCount,
      limits: {
        maxRooms: stats.subscription?.plan?.maxRooms ?? 0,
        maxSavedRooms: stats.subscription?.plan?.maxSavedRooms ?? 0,
        maxTimeLimit: stats.subscription?.plan?.maxTimeLimit ?? 0,
        maxUsers: stats.subscription?.plan?.maxUsers ?? 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user stats' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    // ... validate input via Zod ...
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, req.user!.userId))
      .returning({
        id: users.id,
        name: users.name,
        image: users.image,
      });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
};
```

---

### 📍 Example B: WebSocket `User.ts` Room History Migration

#### Original Prisma Code:
```typescript
const room = await client.room.findUnique({
  where: { id: roomId },
  include: {
    messages: {
      select: {
        id: true,
        image: true,
        content: true,
        sender: {
          select: {
            user: { select: { id: true, name: true, image: true } },
            tempUserId: true,
            tempUsername: true,
            tempUserImage: true,
          },
        },
        reaction: {
          select: {
            emoji: true,
            sender: {
              select: {
                user: { select: { id: true, name: true, image: true } },
                tempUserId: true,
                tempUsername: true,
                tempUserImage: true,
              },
            },
          },
        },
        sentAt: true,
      },
    },
  },
});
```

#### Drizzle ORM Equivalent:
Here is how you handle complex recursive nested lookups in Drizzle ORM:
```typescript
import { eq } from 'drizzle-orm';
import { db } from '@echo/db/src';
import { rooms } from '@echo/db/src/schema';

const room = await db.query.rooms.findFirst({
  where: eq(rooms.id, roomId),
  with: {
    messages: {
      columns: {
        id: true,
        image: true,
        content: true,
        sentAt: true,
      },
      with: {
        sender: {
          columns: {
            tempUserId: true,
            tempUsername: true,
            tempUserImage: true,
          },
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        reactions: {
          columns: {
            emoji: true,
          },
          with: {
            sender: {
              columns: {
                tempUserId: true,
                tempUsername: true,
                tempUserImage: true,
              },
              with: {
                user: {
                  columns: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});
```

#### TypeScript Types from Dynamic Drizzle Query Results
Instead of importing complex Prisma return types, Drizzle leverages standard TypeScript return inference:
```typescript
// Infer type of the room query result
type RoomWithHistory = NonNullable<Awaited<ReturnType<typeof fetchRoom>>>;

// Infer single message type from that query
export type RoomMessage = RoomWithHistory['messages'][number];

// Helper database fetching function
async function fetchRoom(roomId: string) {
  return await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
    with: {
      messages: {
        with: {
          sender: { with: { user: true } },
          reactions: { with: { sender: { with: { user: true } } } }
        }
      }
    }
  });
}
```

---

## 🚀 8. Steps to Run Migrations & Connect
Once the schemas are created under `/packages/db/src/schema.ts`, use these commands inside `packages/db` to run migrations against Neon DB:

1. **Generate SQL Migrations**:
   ```bash
   pnpm db:generate
   ```
   This will inspect your schema files and generate a folder structure with standard PostgreSQL migration scripts.
2. **Execute Migrations on Neon Database**:
   ```bash
   pnpm db:migrate
   ```
   This will take the generated SQL commands and run them directly against Neon.
3. **Open Interactive Database Dashboard**:
   ```bash
   pnpm db:studio
   ```
   Fires up a local host database browser GUI (Drizzle Studio) to manage your tables.

---

## 🏆 Summary Checklist for Cloning the Project
- [ ] Set up Neon account & retrieve connection URLs (Pooled + Direct).
- [ ] Initialize the monorepo via `pnpm-workspace.yaml`.
- [ ] Set up packages: `@echo/db`, `@echo/typescript-config`, `@echo/tailwind-config`, `@echo/ui`.
- [ ] Install dependencies inside `@echo/db` (`drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`).
- [ ] Create the schema in `packages/db/src/schema.ts`.
- [ ] Configure `packages/db/drizzle.config.ts` and `packages/db/src/index.ts`.
- [ ] Run `pnpm db:generate` followed by `pnpm db:migrate` using the Neon direct URL.
- [ ] Implement backend server `apps/server` using `db` client instead of Prisma.
- [ ] Refactor real-time websocket server `apps/ws` using Drizzle relational queries.
- [ ] Reconstruct Next.js app in `apps/www` using React 19 / Next.js 15.
