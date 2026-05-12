const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const SQL_FILE = path.join(__dirname, '20260419100000_critical_security_fixes.sql');
const PROJECT_REF = 'uaowjueunmmjnggddaej';
const PASSWORD = 'pathfinder-compass-76-476b6945';

const regions = [
  'us-east-1', 'us-west-1', 'eu-central-1', 'eu-west-1', 'eu-west-2',
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
  'ap-south-1', 'sa-east-1', 'ca-central-1'
];

async function tryConnect() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const connectionString = `postgresql://postgres.${PROJECT_REF}:${PASSWORD}@${host}:5432/postgres`;
    console.log(`Trying ${host}...`);
    
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      console.log(`✅ Connected successfully to ${host}!`);
      
      const sql = fs.readFileSync(SQL_FILE, 'utf8');
      console.log(`Running migration (${sql.length} bytes)...`);
      await client.query(sql);
      console.log('SUCCESS: Migration applied.');
      
      await client.end();
      return true;
    } catch (err) {
      if (err.code === 'ENOTFOUND' || err.message.includes('Tenant or user not found')) {
        // Not this region
        // console.log(`   Failed: ${err.message}`);
      } else {
        console.error(`   Failed with other error: ${err.message}`);
      }
      await client.end().catch(() => {});
    }
  }
  console.log('❌ Could not connect to any region. Password or project ref might be wrong.');
  return false;
}

tryConnect().then(success => {
  if (!success) process.exit(1);
});
