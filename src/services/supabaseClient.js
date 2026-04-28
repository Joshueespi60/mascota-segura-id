import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("VITE_SUPABASE_URL exists:", Boolean(import.meta.env.VITE_SUPABASE_URL));
console.log("VITE_SUPABASE_ANON_KEY exists:", Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY));

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan variables de entorno de Supabase. Reinicia npm run dev y revisa .env.local en la raíz.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
