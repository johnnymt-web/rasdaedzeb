const { Client } = require('pg');

const PROJECT_REF = 'sebpxbattjpwrfbipctq';
const PASSWORD = 'Shervashidze#34';

async function healSchoolsTable() {
  console.log("Starting schools table schema update on direct connection...");
  
  const hosts = [
    `db.${PROJECT_REF}.supabase.co`,
    `aws-0-eu-central-1.pooler.supabase.com`
  ];
  
  for (const host of hosts) {
    for (const port of [5432, 6543]) {
      // For pooler, username is postgres.sebpxbattjpwrfbipctq. For direct host, username is postgres.
      const username = host.includes('pooler') ? `postgres.${PROJECT_REF}` : 'postgres';
      const connectionString = `postgresql://${username}:${encodeURIComponent(PASSWORD)}@${host}:${port}/postgres`;
      console.log(`Trying connection to ${host}:${port} as ${username}...`);
      
      const client = new Client({ 
        connectionString, 
        ssl: { rejectUnauthorized: false }, 
        connectionTimeoutMillis: 5000 
      });
      
      try {
        await client.connect();
        console.log(`✅ Connected successfully to database at ${host}:${port}`);
        
        console.log("Checking and altering schools table to add address and contact_email columns...");
        await client.query(`
          ALTER TABLE public.schools 
          ADD COLUMN IF NOT EXISTS address TEXT,
          ADD COLUMN IF NOT EXISTS contact_email TEXT;
        `);
        console.log("✅ Columns added successfully.");

        console.log("Reloading schema cache for PostgREST...");
        await client.query(`NOTIFY pgrst, 'reload schema';`);
        console.log("✅ PostgREST schema cache reloaded successfully.");

        await client.end();
        console.log("🎉 Database schools schema healed successfully!");
        return true;
      } catch (err) {
        console.log(`   Failed to connect/execute at ${host}:${port}: ${err.message}`);
        await client.end().catch(() => {});
      }
    }
  }
  console.log("❌ All connection attempts failed.");
  return false;
}

healSchoolsTable();
