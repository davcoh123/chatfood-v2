import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';

const SUPABASE_URL = 'https://dcwfgxbwpecnjbhrhrib.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjd2ZneGJ3cGVjbmpiaHJocmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDc3NjMsImV4cCI6MjA3MjQ4Mzc2M30.ACjXdQxukmbAvokW8Py7TwfNQrhjy1jQAFbLLap98-w';

export const GET: APIRoute = async ({ cookies, redirect, request }) => {
  // Parse cookies from request
  const cookieHeader = request.headers.get('cookie') || '';
  const parsedCookies: { name: string; value: string }[] = [];
  
  cookieHeader.split(';').forEach(cookie => {
    const trimmed = cookie.trim();
    if (trimmed) {
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        parsedCookies.push({
          name: trimmed.substring(0, eqIndex),
          value: trimmed.substring(eqIndex + 1),
        });
      }
    }
  });

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parsedCookies;
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookies.set(name, value, {
              path: '/',
              secure: true,
              httpOnly: false,
              sameSite: 'lax',
              maxAge: 0, // Delete cookie
              ...options,
            });
          });
        },
      },
    }
  );
  
  await supabase.auth.signOut();
  
  // Clear all auth cookies
  const authCookieNames = [
    'sb-dcwfgxbwpecnjbhrhrib-auth-token',
    'sb-dcwfgxbwpecnjbhrhrib-auth-token.0',
    'sb-dcwfgxbwpecnjbhrhrib-auth-token.1',
  ];
  
  authCookieNames.forEach(name => {
    cookies.delete(name, { path: '/' });
  });
  
  return redirect('/login');
};

export const POST: APIRoute = GET;
