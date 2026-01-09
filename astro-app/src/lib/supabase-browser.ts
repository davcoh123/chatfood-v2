/**
 * Supabase Browser Client
 * 
 * For use in React islands and client-side code only.
 * Configured to properly sync cookies for SSR authentication.
 */

import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'https://dcwfgxbwpecnjbhrhrib.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjd2ZneGJ3cGVjbmpiaHJocmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDc3NjMsImV4cCI6MjA3MjQ4Mzc2M30.ACjXdQxukmbAvokW8Py7TwfNQrhjy1jQAFbLLap98-w';

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Creates or returns singleton Supabase browser client
 * Configured to use cookies for SSR compatibility
 */
export function getSupabaseBrowserClient() {
  if (typeof window === 'undefined') {
    // Return null on server side
    return null;
  }
  
  if (!browserClient) {
    browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return document.cookie.split('; ').filter(Boolean).map(cookie => {
            const [name, ...valueParts] = cookie.split('=');
            return {
              name: decodeURIComponent(name || ''),
              value: decodeURIComponent(valueParts.join('=') || ''),
            };
          });
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const encodedName = encodeURIComponent(name);
            const encodedValue = encodeURIComponent(value);
            let cookieString = `${encodedName}=${encodedValue}`;
            
            if (options?.path) cookieString += `; path=${options.path}`;
            else cookieString += '; path=/';
            
            if (options?.maxAge) cookieString += `; max-age=${options.maxAge}`;
            if (options?.domain) cookieString += `; domain=${options.domain}`;
            if (options?.secure) cookieString += '; secure';
            if (options?.sameSite) cookieString += `; samesite=${options.sameSite}`;
            
            document.cookie = cookieString;
          });
        },
      },
    });
  }
  return browserClient;
}

export { SUPABASE_URL, SUPABASE_ANON_KEY };
