const dns = require('dns');

async function check() {
  const host = 'db.uaowjueunmmjnggddaej.supabase.co';
  try {
    const addresses = await dns.promises.resolve4(host);
    console.log(`✅ ${host} resolved to ${addresses.join(', ')}`);
  } catch (err) {
    console.log(`❌ ${host} could not be resolved: ${err.message}`);
  }
}

check();
