import { createDb } from './factory';

let _db: ReturnType<typeof createDb> | null = null;

export function getDb() {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set.');
    }
    _db = createDb(connectionString);
  }
  return _db;
}

// Lazy proxy — existing code that imports `db` directly keeps working
export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});

export { createDb } from './factory';
export * from './schema';

export default db;
