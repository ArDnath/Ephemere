import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export function createDb(connectionString: string) {
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set.');
  }

  return drizzle(neon(connectionString), { schema });
}
