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
