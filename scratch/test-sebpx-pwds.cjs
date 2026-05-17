const { Client } = require('pg');

const PROJECT_REF = 'sebpxbattjpwrfbipctq';
const passwords = ['Shervashidze#34', 'Tbilisi2027$', 'Tbilisi2026$', 'pathfinder-compass-76-476b6945'];
const regions = [
  'eu-central-1', 'eu-west-1', 'eu-west-2', 'us-east-1', 'us-west-1',
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
  'ap-south-1', 'sa-east-1', 'ca-central-1'
];

async function findMatch() {
  for (const password of passwords) {
    for (const region of regions) {
      const host = `aws-0-${region}.pooler.supabase.com`;
      const connectionString = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@${host}:5432/postgres`;
      
      const client = new Client({ 
        connectionString, 
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 2000 
      });
      
      try {
        await client.connect();
        console.log(`🎉 SUCCESS! Connected to ${host} using password: ${password}`);
        await client.end();
        return;
      } catch (err) {
        if (!err.message.includes('Tenant or user not found') && !err.message.includes('timeout') && !err.message.includes('ENOTFOUND')) {
          console.log(`   Response from ${host} with password ${password}: ${err.message}`);
        }
        await client.end().catch(() => {});
      }
    }
  }
  console.log("❌ Finished checking all region/password combinations.");
}

findMatch();
