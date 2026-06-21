/**
 * Script de migração de dados do Neon (Replit) para o banco DEV
 * Respeita a ordem de foreign keys
 * Serializa campos JSONB corretamente
 * Busca todos os dados primeiro, depois insere (evita timeout do Neon)
 */
import pg from 'pg';

const SOURCE_URL = 'postgresql://neondb_owner:npg_knR2jhidQM5N@ep-sweet-hat-a6yw03bk.us-west-2.aws.neon.tech/neondb?sslmode=require';
const TARGET_URL = 'postgresql://mentoria_conjunta_usr:Mc9xPq4rVt7nWs2bKd8hNj3cFe6gYu1w@bd-teste-xyhey467dk.boardmanager.com.br:5432/mentoria_conjunta_db';

// Tables in order of dependencies (parents first)
const TABLES_IN_ORDER = [
  'turma_configs',
  'users',
  'vendors',
  'leads',
  'registrations',
  'lead_activities',
  'lead_follow_ups',
  'page_views',
  'vendor_activity_log',
  'commission_payments',
  'commission_payment_history',
];

async function fetchAllData(sourceUrl) {
  console.log('=== PHASE 1: Fetching all data from Neon ===');
  const allData = {};
  
  const source = new pg.Client({ connectionString: sourceUrl, ssl: { rejectUnauthorized: false } });
  await source.connect();
  console.log('Connected to source (Neon)');
  
  for (const table of TABLES_IN_ORDER) {
    const res = await source.query(`SELECT * FROM "${table}"`);
    allData[table] = res.rows;
    console.log(`  Fetched ${table}: ${res.rows.length} rows`);
  }
  
  await source.end();
  console.log('Source connection closed\n');
  return allData;
}

async function getJsonbColumns(client, tableName) {
  const res = await client.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = $1 AND table_schema = 'public' AND data_type = 'jsonb'
  `, [tableName]);
  return res.rows.map(r => r.column_name);
}

async function insertAllData(targetUrl, allData) {
  console.log('=== PHASE 2: Inserting data into DEV ===');
  const target = new pg.Client({ connectionString: targetUrl });
  await target.connect();
  console.log('Connected to target (DEV)');
  
  for (const table of TABLES_IN_ORDER) {
    const rows = allData[table];
    if (!rows || rows.length === 0) {
      console.log(`  ${table}: 0 rows (empty)`);
      continue;
    }
    
    const jsonbCols = await getJsonbColumns(target, table);
    const columns = Object.keys(rows[0]);
    const colList = columns.map(c => `"${c}"`).join(', ');
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    
    // Clear existing data
    await target.query(`DELETE FROM "${table}"`);
    
    let inserted = 0;
    let errors = 0;
    
    for (const row of rows) {
      const values = columns.map(c => {
        const val = row[c];
        if (val !== null && typeof val === 'object' && !(val instanceof Date) && jsonbCols.includes(c)) {
          return JSON.stringify(val);
        }
        return val;
      });
      
      try {
        await target.query(
          `INSERT INTO "${table}" (${colList}) VALUES (${placeholders})`,
          values
        );
        inserted++;
      } catch (err) {
        errors++;
        if (errors <= 2) {
          console.error(`    ERROR [${table}]: ${err.message.slice(0, 100)}`);
        }
      }
    }
    
    if (errors > 2) console.log(`    ... and ${errors - 2} more errors`);
    console.log(`  ${table}: ${inserted}/${rows.length} rows migrated${errors > 0 ? ` (${errors} errors)` : ''}`);
  }
  
  // Reset sequences
  console.log('\n=== PHASE 3: Resetting sequences ===');
  const seqRes = await target.query(`
    SELECT c.relname AS seq_name, 
           t.relname AS table_name,
           a.attname AS column_name
    FROM pg_class c
    JOIN pg_depend d ON d.objid = c.oid
    JOIN pg_class t ON d.refobjid = t.oid
    JOIN pg_attribute a ON (a.attrelid = t.oid AND a.attnum = d.refobjsubid)
    WHERE c.relkind = 'S'
  `);

  for (const seq of seqRes.rows) {
    try {
      const maxRes = await target.query(
        `SELECT COALESCE(MAX("${seq.column_name}"), 0) AS max_val FROM "${seq.table_name}"`
      );
      const maxVal = maxRes.rows[0].max_val;
      if (maxVal > 0) {
        await target.query(`SELECT setval('"${seq.seq_name}"', ${maxVal})`);
        console.log(`  Reset ${seq.seq_name} → ${maxVal}`);
      }
    } catch (err) {
      // Skip non-numeric columns
    }
  }
  
  await target.end();
  console.log('\nTarget connection closed');
}

async function main() {
  const allData = await fetchAllData(SOURCE_URL);
  await insertAllData(TARGET_URL, allData);
  console.log('\n✓ Migration complete!');
}

main().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
