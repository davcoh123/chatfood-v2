/**
 * Supabase SSR Client for Astro
 * 
 * This module provides server-side Supabase client with cookie-based auth
 * for SSR pages and API routes.
 */

import { createServerClient, type CookieOptionsWithName } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

// Environment variables (set in .env)
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'https://dcwfgxbwpecnjbhrhrib.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjd2ZneGJ3cGVjbmpiaHJocmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDc3NjMsImV4cCI6MjA3MjQ4Mzc2M30.ACjXdQxukmbAvokW8Py7TwfNQrhjy1jQAFbLLap98-w';

/**
 * Creates a Supabase client for server-side rendering
 * with cookie-based session management
 */
export function createSupabaseServerClient(cookies: AstroCookies) {
  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookies.headers().toString()
            .split('; ')
            .filter(Boolean)
            .map((cookie) => {
              const [name, ...valueParts] = cookie.split('=');
              return {
                name: name || '',
                value: valueParts.join('=') || '',
              };
            });
        },
        setAll(cookiesToSet: CookieOptionsWithName[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookies.set(name, value, {
              path: '/',
              secure: import.meta.env.PROD,
              httpOnly: true,
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7, // 1 week
              ...options,
            });
          });
        },
      },
    }
  );
}

/**
 * Creates a Supabase client for API routes
 * Handles both Request/Response cookie pattern
 */
export function createSupabaseAPIClient(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies: { name: string; value: string }[] = [];
  const responseCookies: string[] = [];

  // Parse existing cookies
  cookieHeader.split('; ').filter(Boolean).forEach((cookie) => {
    const [name, ...valueParts] = cookie.split('=');
    if (name) {
      cookies.push({ name, value: valueParts.join('=') || '' });
    }
  });

  return {
    client: createServerClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookies;
          },
          setAll(cookiesToSet: CookieOptionsWithName[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              const cookieString = `${name}=${value}; Path=${options?.path || '/'}; ${options?.httpOnly ? 'HttpOnly; ' : ''}${options?.secure ? 'Secure; ' : ''}SameSite=${options?.sameSite || 'Lax'}; Max-Age=${options?.maxAge || 604800}`;
              responseCookies.push(cookieString);
            });
          },
        },
      }
    ),
    getResponseCookies: () => responseCookies,
  };
}

/**
 * Gets the current user from server-side context
 */
export async function getUser(cookies: AstroCookies) {
  const supabase = createSupabaseServerClient(cookies);
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

/**
 * Gets user with full profile (role, plan, etc.)
 */
export async function getUserWithProfile(cookies: AstroCookies) {
  const supabase = createSupabaseServerClient(cookies);
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }

  // Fetch profile data
  const [profileResult, roleResult, subscriptionResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('user_roles').select('role').eq('user_id', user.id).single(),
    supabase.from('user_subscriptions').select('plan').eq('user_id', user.id).single(),
  ]);

  return {
    ...user,
    profile: profileResult.data,
    role: roleResult.data?.role || 'user',
    plan: subscriptionResult.data?.plan || 'starter',
  };
}

export { SUPABASE_URL, SUPABASE_ANON_KEY };
