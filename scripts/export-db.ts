import { db } from "../server/db";
import { vendors, leads, leadActivities, leadFollowUps, registrations } from "../shared/schema";
import * as fs from "fs";

async function exportDatabase() {
  console.log("Exportando dados do banco de desenvolvimento...\n");

  const allVendors = await db.select().from(vendors);
  const allLeads = await db.select().from(leads);
  const allActivities = await db.select().from(leadActivities);
  const allFollowUps = await db.select().from(leadFollowUps);
  const allRegistrations = await db.select().from(registrations);

  const exportData = {
    exportedAt: new Date().toISOString(),
    vendors: allVendors,
    leads: allLeads,
    leadActivities: allActivities,
    leadFollowUps: allFollowUps,
    registrations: allRegistrations,
  };

  const filename = `db-export-${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));

  console.log(`Exportado com sucesso para: ${filename}`);
  console.log(`- Vendedores: ${allVendors.length}`);
  console.log(`- Leads: ${allLeads.length}`);
  console.log(`- Atividades: ${allActivities.length}`);
  console.log(`- Follow-ups: ${allFollowUps.length}`);
  console.log(`- Registros: ${allRegistrations.length}`);

  process.exit(0);
}

exportDatabase().catch(console.error);
