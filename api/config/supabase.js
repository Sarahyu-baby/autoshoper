import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabasePublicKey = process.env.SUPABASE_PUBLIC_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabasePublicKey) {
  throw new Error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_PUBLIC_KEY.');
}

export const supabase = createClient(supabaseUrl, supabasePublicKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'x-application-name': 'autoshopping-app',
    },
  },
  db: {
    schema: 'public',
  },
});
export const supabaseAdmin = supabaseSecretKey ? createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'x-application-name': 'autoshopping-app-admin',
    },
  },
  db: {
    schema: 'public',
  },
}) : null;

export default supabase;