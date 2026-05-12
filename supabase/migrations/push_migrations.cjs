const { Client } = require('pg');
const { execSync } = require('child_process');

const PROJECT_REF = 'sebpxbattjpwrfbipctq';
const PASSWORD = 'Shervashidze#34';

const regions = [
  'us-east-1', 'us-west-1', 'eu-central-1', 'eu-west-1', 'eu-west-2',
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
  'ap-south-1', 'sa-east-1', 'ca-central-1'
];

async function findRegionAndPush() {
  for (const region of regions) {
    // 6543 is for the connection pooler (IPv4 compatible)
    const host = `aws-0-${region}.pooler.supabase.com`;
    const connectionString = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(PASSWORD)}@${host}:6543/postgres`;
    console.log(`Trying ${host}...`);
    
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      console.log(`✅ Successfully connected to region: ${region}`);
      await client.end();
      
      console.log('Pushing database migrations to new project...');
      // Execute the supabase db push command
      execSync(`npx supabase db push --db-url "${connectionString}"`, { stdio: 'inherit' });
      
      console.log('🎉 Migrations successfully applied!');
      return true;
    } catch (err) {
      // Discard expected connection errors
      await client.end().catch(() => {});
    }
  }
  console.log('❌ Could not connect to any region. The password might be wrong.');
  return false;
}

findRegionAndPush().then(success => {
  if (!success) process.exit(1);
});
