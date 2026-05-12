const { Client } = require('pg');

const PROJECT_REF = 'uaowjueunmmjnggddaej';
const PASSWORD = 'Tbilisi2027$';
const host = 'aws-0-eu-central-1.pooler.supabase.com';

async function test() {
  const connectionString = `postgresql://postgres.${PROJECT_REF}:${PASSWORD}@${host}:5432/postgres`;
  console.log(`Trying ${host} with Tbilisi password...`);
  
  const client = new Client({ 
    connectionString, 
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000 
  });
  
  try {
    await client.connect();
    console.log(`✅ Connected!`);
    await client.end();
  } catch (err) {
    console.log(`   Failed: ${err.message}`);
    await client.end().catch(() => {});
  }
}

test();
