import('@supabase/supabase-js').then(({ createClient }) => {
  const fs = require('fs');
  const env = fs.readFileSync('.env', 'utf8');
  const url = env.match(/VITE_SUPABASE_URL=\"?(.*?)\"?$/m)[1];
  const key = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY=\"?(.*?)\"?$/m)[1];
  const supabase = createClient(url, key);
  supabase.from('assessments').insert({
    user_id: '00000000-0000-0000-0000-000000000000',
    does_not_exist: 'test',
    answers: {},
    results: []
  }).then(({error}) => {
    console.log('Insert Error:', JSON.stringify(error, null, 2));
  });
});
