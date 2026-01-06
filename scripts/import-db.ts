import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { vendors, leads, leadActivities, leadFollowUps, registrations } from "../shared/schema";
import * as fs from "fs";

const PRODUCTION_DATABASE_URL = process.env.PROD_DATABASE_URL;

if (!PRODUCTION_DATABASE_URL) {
  console.error("Erro: Defina a variável PROD_DATABASE_URL com a URL do banco de produção");
  console.log("\nExemplo de uso:");
  console.log("PROD_DATABASE_URL='postgresql://...' npx tsx scripts/import-db.ts db-export-2026-01-06.json");
  process.exit(1);
}

const filename = process.argv[2];
if (!filename) {
  console.error("Erro: Especifique o arquivo JSON para importar");
  console.log("\nExemplo de uso:");
  console.log("PROD_DATABASE_URL='postgresql://...' npx tsx scripts/import-db.ts db-export-2026-01-06.json");
  process.exit(1);
}

async function importDatabase() {
  console.log(`Importando dados de: ${filename}`);
  console.log("Para o banco de produção...\n");

  const sql = neon(PRODUCTION_DATABASE_URL!);
  const prodDb = drizzle(sql);

  const data = JSON.parse(fs.readFileSync(filename, "utf-8"));

  console.log("Dados a importar:");
  console.log(`- Vendedores: ${data.vendors?.length || 0}`);
  console.log(`- Leads: ${data.leads?.length || 0}`);
  console.log(`- Atividades: ${data.leadActivities?.length || 0}`);
  console.log(`- Follow-ups: ${data.leadFollowUps?.length || 0}`);
  console.log(`- Registros: ${data.registrations?.length || 0}`);
  console.log("");

  // Import vendors first (no dependencies)
  if (data.vendors?.length > 0) {
    console.log("Importando vendedores...");
    for (const vendor of data.vendors) {
      try {
        await prodDb.insert(vendors).values(vendor).onConflictDoNothing();
      } catch (e: any) {
        console.log(`  - Pulando vendor ${vendor.email}: ${e.message}`);
      }
    }
    console.log(`  ✓ Vendedores importados`);
  }

  // Import registrations (no dependencies)
  if (data.registrations?.length > 0) {
    console.log("Importando registros...");
    for (const reg of data.registrations) {
      try {
        await prodDb.insert(registrations).values(reg).onConflictDoNothing();
      } catch (e: any) {
        console.log(`  - Pulando registro ${reg.email}: ${e.message}`);
      }
    }
    console.log(`  ✓ Registros importados`);
  }

  // Import leads (depends on vendors)
  if (data.leads?.length > 0) {
    console.log("Importando leads...");
    let imported = 0;
    for (const lead of data.leads) {
      try {
        await prodDb.insert(leads).values(lead).onConflictDoNothing();
        imported++;
        if (imported % 100 === 0) {
          console.log(`  Progresso: ${imported}/${data.leads.length}`);
        }
      } catch (e: any) {
        console.log(`  - Pulando lead ${lead.email}: ${e.message}`);
      }
    }
    console.log(`  ✓ Leads importados: ${imported}`);
  }

  // Import activities (depends on leads and vendors)
  if (data.leadActivities?.length > 0) {
    console.log("Importando atividades...");
    for (const activity of data.leadActivities) {
      try {
        await prodDb.insert(leadActivities).values(activity).onConflictDoNothing();
      } catch (e: any) {
        console.log(`  - Pulando atividade: ${e.message}`);
      }
    }
    console.log(`  ✓ Atividades importadas`);
  }

  // Import follow-ups (depends on leads and vendors)
  if (data.leadFollowUps?.length > 0) {
    console.log("Importando follow-ups...");
    for (const followUp of data.leadFollowUps) {
      try {
        await prodDb.insert(leadFollowUps).values(followUp).onConflictDoNothing();
      } catch (e: any) {
        console.log(`  - Pulando follow-up: ${e.message}`);
      }
    }
    console.log(`  ✓ Follow-ups importados`);
  }

  console.log("\n✅ Importação concluída!");
  process.exit(0);
}

importDatabase().catch(console.error);
