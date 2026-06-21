import { config } from "dotenv";
import { resolve } from "path";

// Try loading .env from multiple locations (Dokploy may place it differently)
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve('/app', '.env') });
config({ path: resolve('/app/.env') });

import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("FATAL: DATABASE_URL not set. CWD:", process.cwd(), "ENV keys:", Object.keys(process.env).filter(k => k.startsWith('D') || k.startsWith('N') || k.startsWith('P')).join(','));
  process.exit(1);
}

const poolConfig: pg.PoolConfig = {
  connectionString: dbUrl,
  connectionTimeoutMillis: 10000,
  max: 10,
  // Use SSL only if the URL contains sslmode=require or is a cloud provider
  ssl: dbUrl.includes('sslmode=require')
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
