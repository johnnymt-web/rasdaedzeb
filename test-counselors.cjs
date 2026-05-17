import('@supabase/supabase-js').then(({ createClient }) => {
  const fs = require('fs');
  const env = fs.readFileSync('.env', 'utf8');
  const url = env.match(/VITE_SUPABASE_URL=\"?(.*?)\"?$/m)[1];
  const key = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY=\"?(.*?)\"?$/m)[1];
  const supabase = createClient(url, key);

  console.log('Testing login for j.mtsariashvili@ug.edu.ge...');
  supabase.auth.signInWithPassword({
    email: 'j.mtsariashvili@ug.edu.ge',
    password: 'Tbilisi2027$'
  }).then(({ data, error }) => {
    console.log('Login result:', { data, error });
  });
});
