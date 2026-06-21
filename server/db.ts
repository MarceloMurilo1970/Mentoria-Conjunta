import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

// Load .env file (Dokploy createEnvFile places it in working dir)
import { config as dotenvConfig } from "dotenv";
dotenvConfig();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("FATAL: DATABASE_URL not set after dotenv load.");
  console.error("CWD:", process.cwd());
  console.error("ENV keys:", Object.keys(process.env).sort().join(', '));
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
