import { drizzle } from 'drizzle-orm/neon-serverless';
import { users, items } from './schema';

// Initialize the database connection using Neon serverless driver
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const db = drizzle({
  connection: databaseUrl,
  schema: {
    users,
    items,
  },
});
