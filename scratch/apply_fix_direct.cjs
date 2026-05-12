const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const SQL_FILE = path.join(__dirname, '..', 'migrations', '20260426160000_fix_signup_grade.sql');
const HOST = 'db.uaowjueunmmjnggddaej.supabase.co';
const PROJECT_REF = 'uaowjueunmmjnggddaej';
const PASSWORD = 'pathfinder-compass-76-476b6945';

async function tryConnect() {
  const connectionString = `postgresql://postgres:${PASSWORD}@${HOST}:5432/postgres`;
  console.log(`Trying ${HOST}:5432...`);
  
  const client = new Client({ 
    connectionString, 
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000 
  });
  
  try {
    await client.connect();
    console.log(`✅ Connected successfully to ${HOST}!`);
    
    const sql = fs.readFileSync(SQL_FILE, 'utf8');
    console.log(`Running migration...`);
    await client.query(sql);
    console.log('SUCCESS: Migration applied.');
    
    await client.end();
    return true;
  } catch (err) {
    console.log(`   Failed: ${err.message}`);
    await client.end().catch(() => {});
  }
  return false;
}

tryConnect().then(success => {
  if (!success) {
    console.log('❌ Could not connect to the direct DB host.');
    process.exit(1);
  }
});
