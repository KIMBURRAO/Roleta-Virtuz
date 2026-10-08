import postgres from 'postgres';

const sql = postgres('postgresql://postgres:Comitatunaroca%402024@db.sgrfhixeqgbhvyudihsc.supabase.co:5432/postgres', { ssl: 'require' });

async function main() {
  try {
    const tables = await sql`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`;
    console.log('--- TABLES IN PUBLIC SCHEMA ---');
    console.log(tables.map(t => t.tablename).join('\n'));
    
    const settings = await sql`SELECT * FROM public.app_settings LIMIT 1`;
    console.log('\n--- APP SETTINGS ---');
    console.log(settings);

  } catch (err) {
    console.error('Error connecting to DB:', err);
  } finally {
    await sql.end();
  }
}

main();
