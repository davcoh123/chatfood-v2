/**
 * Supabase Browser Client
 * 
 * For use in React islands and client-side code only.
 * Uses the same credentials as the SSR client.
 */

import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'https://dcwfgxbwpecnjbhrhrib.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjd2ZneGJ3cGVjbmpiaHJocmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU5MjA4ODAsImV4cCI6MjA0MTQ5Njg4MH0.YA6bCcTMwrzX8tEOlIq2xKVPGdXLJEPdGrGNDL_7g6g';

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Creates or returns singleton Supabase browser client
 */
export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return browserClient;
}

export { SUPABASE_URL, SUPABASE_ANON_KEY };
