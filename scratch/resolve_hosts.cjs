const dns = require('dns');

const PROJECT_REF = 'uaowjueunmmjnggddaej';
const regions = [
  'us-east-1', 'us-west-1', 'eu-central-1', 'eu-west-1', 'eu-west-2',
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
  'ap-south-1', 'sa-east-1', 'ca-central-1'
];

async function check() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    try {
      const addresses = await dns.promises.resolve4(host);
      console.log(`✅ ${host} resolved to ${addresses.join(', ')}`);
    } catch (err) {
      // console.log(`❌ ${host} could not be resolved`);
    }
  }
}

check();
