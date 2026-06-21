import { config } from "dotenv";
config(); // Load .env file if present (Dokploy createEnvFile)

import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const poolConfig: pg.PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  max: 10,
  // Use SSL only if the URL contains sslmode=require or is a cloud provider
  ssl: process.env.DATABASE_URL.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : undefined,
};

export const pool = new pg.Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected pool error:', err.message);
});

export const db = drizzle(pool, { schema });

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
