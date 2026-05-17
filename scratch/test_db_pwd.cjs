const { Client } = require('pg');

const PROJECT_REF = 'uaowjueunmmjnggddaej';
const PASSWORD = 'pathfinder-compass-76-476b6945';
const regions = [
  'us-east-1', 'us-west-1', 'eu-central-1', 'eu-west-1', 'eu-west-2',
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
  'ap-south-1', 'sa-east-1', 'ca-central-1'
];

async function test() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const connectionString = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(PASSWORD)}@${host}:5432/postgres`;
    console.log(`Trying ${host}...`);
    
    const client = new Client({ 
      connectionString, 
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 3000 
    });
    
    try {
      await client.connect();
      console.log(`✅ Connected successfully to ${host}!`);
      await client.end();
      return;
    } catch (err) {
      console.log(`   Failed ${host}: ${err.message}`);
      await client.end().catch(() => {});
    }
  }
}

test();
