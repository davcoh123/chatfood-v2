import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const POST: APIRoute = async (context) => {
  const supabase = createSupabaseServerClient(context.cookies);
  
  await supabase.auth.signOut();
  
  // Clear all auth cookies
  context.cookies.delete('sb-dcwfgxbwpecnjbhrhrib-auth-token', { path: '/' });
  context.cookies.delete('sb-dcwfgxbwpecnjbhrhrib-auth-token.0', { path: '/' });
  context.cookies.delete('sb-dcwfgxbwpecnjbhrhrib-auth-token.1', { path: '/' });
  
  return context.redirect('/login');
};
