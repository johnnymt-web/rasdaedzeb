const { Client } = require('pg');

const PROJECT_REF = 'sebpxbattjpwrfbipctq';
const PASSWORD = 'Shervashidze#34';
const regions = [
  'us-east-1', 'us-west-1', 'eu-central-1', 'eu-west-1', 'eu-west-2',
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
  'ap-south-1', 'sa-east-1', 'ca-central-1'
];

async function healCounselor() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    // Try both 5432 and 6543
    for (const port of [5432, 6543]) {
      const connectionString = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(PASSWORD)}@${host}:${port}/postgres`;
      console.log(`Trying ${host}:${port}...`);
      
      const client = new Client({ connectionString, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 5000 });
      try {
        await client.connect();
        console.log(`✅ Connected successfully to: ${host}:${port}`);
        
        console.log("Confirming counselor email...");
        const emailUpdate = await client.query(`
          UPDATE auth.users
          SET email_confirmed_at = NOW(),
              confirmed_at = NOW()
          WHERE email = 'counselor@ug.edu.ge'
          RETURNING id;
        `);
        console.log("Email update results:", emailUpdate.rows);

        if (emailUpdate.rows.length > 0) {
          const userId = emailUpdate.rows[0].id;
          
          console.log("Upserting user role as counselor...");
          await client.query(`
            INSERT INTO public.user_roles (user_id, role)
            VALUES ($1, 'counselor')
            ON CONFLICT (user_id) DO UPDATE SET role = 'counselor';
          `, [userId]);
          console.log("Role upsert completed.");

          console.log("Upserting profile...");
          await client.query(`
            INSERT INTO public.profiles (id, full_name, grade)
            VALUES ($1, 'Counselor Maria', 'Staff')
            ON CONFLICT (id) DO UPDATE SET full_name = 'Counselor Maria', grade = 'Staff';
          `, [userId]);
          console.log("Profile upsert completed.");
        }

        await client.end();
        console.log("🎉 Counselor account healed successfully!");
        return true;
      } catch (err) {
        console.log(`   Failed ${host}:${port}: ${err.message}`);
        await client.end().catch(() => {});
      }
    }
  }
  return false;
}

healCounselor();
