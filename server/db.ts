import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  max: 10,
};

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected pool error:', err.message);
});

export const db = drizzle({ client: pool, schema });

export async function ensureConnection(): Promise<boolean> {
  const maxRetries = 5;
  const baseDelay = 1000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('Database connection established');
      return true;
    } catch (error: any) {
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Database connection attempt ${attempt}/${maxRetries} failed: ${error.message}`);
      if (attempt < maxRetries) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  console.error('Failed to establish database connection after all retries');
  return false;
}
