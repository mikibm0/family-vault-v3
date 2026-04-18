import { createClient } from '@supabase/supabase-js';

// Server client â used in Server Components and API routes.
// Uses service role key for unrestricted access.
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey =
    process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}
