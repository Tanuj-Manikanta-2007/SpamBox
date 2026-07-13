import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedBrowserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  if (!cachedBrowserClient) {
    cachedBrowserClient = createClient(url, anonKey);
  }

  return cachedBrowserClient;
}
