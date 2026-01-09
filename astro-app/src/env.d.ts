/// <reference path="../.astro/types.d.ts" />

interface UserWithProfile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'user';
  plan: 'starter' | 'pro' | 'premium';
}

declare namespace App {
  interface Locals {
    user: UserWithProfile | null;
    supabase: import('@supabase/supabase-js').SupabaseClient;
  }
}
