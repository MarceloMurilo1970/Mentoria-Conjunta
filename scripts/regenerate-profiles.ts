import { db } from "../server/db";
import { leads } from "../shared/schema";
import { calculateLeadScore } from "../server/googleSheets";
import { eq } from "drizzle-orm";

async function regenerateProfiles() {
  console.log("Starting profile regeneration...");
  
  const allLeads = await db.select().from(leads);
  let regenerated = 0;
  let skipped = 0;

  for (const lead of allLeads) {
    if (!lead.surveyResponses || Object.keys(lead.surveyResponses).length === 0) {
      skipped++;
      continue;
    }

    const { score, temperature, breakdown } = calculateLeadScore(lead.surveyResponses as Record<string, string>);
    const uniqueCategories = Array.from(new Set(breakdown.map(b => b.category)));
    const aiSummary = uniqueCategories.join(', ');

    await db.update(leads)
      .set({
        score,
        temperature,
        scoreBreakdown: breakdown,
        aiSummary,
      })
      .where(eq(leads.id, lead.id));
    
    regenerated++;
    if (regenerated % 50 === 0) {
      console.log(`Progress: ${regenerated}/${allLeads.length}`);
    }
  }

  console.log(`Done! Regenerated: ${regenerated}, Skipped: ${skipped}, Total: ${allLeads.length}`);
  process.exit(0);
}

regenerateProfiles().catch(console.error);
