import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";
import * as fs from "fs";

const { Pool } = pg;

const NEON_URL = "postgresql://neondb_owner:npg_owaVtm2HMcE0@ep-dark-bush-ac4w9l40-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require";

function parseDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
      return new Date(obj);
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(parseDates);
  }
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = parseDates(obj[key]);
    }
    return result;
  }
  return obj;
}

async function importToNeon() {
  console.log("Conectando ao banco Neon de produção...");
  
  const pool = new Pool({ connectionString: NEON_URL });
  const db = drizzle(pool, { schema });

  const exportFile = fs.readdirSync(".").filter(f => f.startsWith("db-export-")).sort().pop();
  if (!exportFile) {
    console.error("Nenhum arquivo de exportação encontrado!");
    process.exit(1);
  }

  console.log(`Importando de: ${exportFile}`);
  const rawData = JSON.parse(fs.readFileSync(exportFile, "utf-8"));
  const data = parseDates(rawData);

  console.log("\nImportando vendedores...");
  for (const vendor of data.vendors) {
    try {
      await db.insert(schema.vendors).values(vendor).onConflictDoNothing();
    } catch (e: any) {
      console.log(`  Vendedor ${vendor.name} já existe ou erro: ${e.message}`);
    }
  }
  console.log(`  ${data.vendors.length} vendedores processados`);

  console.log("\nImportando leads...");
  let leadCount = 0;
  for (const lead of data.leads) {
    try {
      await db.insert(schema.leads).values(lead).onConflictDoNothing();
      leadCount++;
    } catch (e: any) {
      // Silently skip duplicates
    }
  }
  console.log(`  ${leadCount} leads importados`);

  console.log("\nImportando atividades...");
  for (const activity of data.leadActivities) {
    try {
      await db.insert(schema.leadActivities).values(activity).onConflictDoNothing();
    } catch (e: any) {
      // Skip duplicates
    }
  }
  console.log(`  ${data.leadActivities.length} atividades processadas`);

  console.log("\nImportando follow-ups...");
  for (const followUp of data.leadFollowUps) {
    try {
      await db.insert(schema.leadFollowUps).values(followUp).onConflictDoNothing();
    } catch (e: any) {
      // Skip duplicates
    }
  }
  console.log(`  ${data.leadFollowUps.length} follow-ups processados`);

  console.log("\nImportando registros...");
  for (const registration of data.registrations) {
    try {
      await db.insert(schema.registrations).values(registration).onConflictDoNothing();
    } catch (e: any) {
      // Skip duplicates
    }
  }
  console.log(`  ${data.registrations.length} registros processados`);

  console.log("\n✅ Importação concluída!");
  
  await pool.end();
  process.exit(0);
}

importToNeon().catch(console.error);
