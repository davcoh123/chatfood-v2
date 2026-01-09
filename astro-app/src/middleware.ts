/**
 * Astro Middleware for Authentication
 * 
 * Handles:
 * - Session refresh on each request
 * - Protected route redirection
 * - User injection into locals for SSR pages
 */

import { defineMiddleware } from 'astro:middleware';
import { createServerClient } from '@supabase/ssr';

const SUPABASE_URL = 'https://dcwfgxbwpecnjbhrhrib.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjd2ZneGJ3cGVjbmpiaHJocmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDc3NjMsImV4cCI6MjA3MjQ4Mzc2M30.ACjXdQxukmbAvokW8Py7TwfNQrhjy1jQAFbLLap98-w';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/orders',
  '/catalogue',
  '/conversations',
  '/analytics',
  '/payments',
  '/support',
  '/public-profile',
  '/settings',
  '/onboarding',
  '/admin',
];

// Routes that require admin role
const ADMIN_ROUTES = ['/admin'];

// Public routes (no auth needed)
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/magic-login',
  '/offres',
  '/contact',
  '/demo',
  '/legal',
  '/privacy',
  '/terms',
  '/cookies',
  '/data-deletion',
  '/maintenance',
];

export const onRequest = defineMiddleware(async (context, next) => {
  const { cookies, url, redirect, locals, request } = context;
  const pathname = url.pathname;

  // Skip middleware for static assets
  if (pathname.startsWith('/_astro') || pathname.startsWith('/favicon') || pathname.includes('.')) {
    return next();
  }

  // Parse cookies from request header (most reliable method)
  const cookieHeader = request.headers.get('cookie') || '';
  const parsedCookies: { name: string; value: string }[] = [];
  
  cookieHeader.split(';').forEach(cookie => {
    const trimmed = cookie.trim();
    if (trimmed) {
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const name = trimmed.substring(0, eqIndex);
        const value = trimmed.substring(eqIndex + 1);
        parsedCookies.push({
          name: decodeURIComponent(name),
          value: decodeURIComponent(value),
        });
      }
    }
  });

  // Create Supabase client with proper cookie handling
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
              httpOnly: false, // Allow JS to read for client sync
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7,
              ...options,
            });
          });
        },
      },
    }
  );
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Store supabase client in locals for page use
  (locals as any).supabase = supabase;

  // Inject user into locals for SSR pages
  if (user) {
    // Get profile, role and subscription if user exists
    let profile = null;
    let role = 'user';
    let plan = 'starter';
    
    try {
      const [profileResult, roleResult, subResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('user_roles').select('role').eq('user_id', user.id).single(),
        supabase.from('user_subscriptions').select('plan').eq('user_id', user.id).single(),
      ]);
      
      profile = profileResult.data;
      role = roleResult.data?.role || 'user';
      plan = subResult.data?.plan || 'starter';
    } catch (e) {
      // Profile might not exist yet
    }
    
    (locals as any).user = {
      id: user.id,
      email: user.email,
      role,
      plan,
      ...profile,
    };
  } else {
    (locals as any).user = null;
  }

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));
  const isPublicRestaurant = pathname.startsWith('/r/');

  // Public restaurant routes - no auth required
  if (isPublicRestaurant) {
    return next();
  }

  // Check authentication for protected routes
  if (isProtectedRoute && !user) {
    // Store the intended destination for redirect after login
    const redirectUrl = new URL('/login', url.origin);
    redirectUrl.searchParams.set('redirect', pathname);
    return redirect(redirectUrl.toString());
  }

  // Check admin role for admin routes
  if (isAdminRoute && (locals as any).user?.role !== 'admin') {
    return redirect('/dashboard');
  }

  // Check maintenance mode
  if (isProtectedRoute && !isAdminRoute) {
    try {
      const { data: maintenanceSettings } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'maintenance_mode')
        .single();

      const isMaintenanceMode = maintenanceSettings?.setting_value?.enabled === true;
      
      if (isMaintenanceMode && (locals as any).user?.role !== 'admin') {
        return redirect('/maintenance');
      }
    } catch {
      // Continue if we can't check maintenance mode
    }
  }

  // Redirect logged-in users away from login page
  if (pathname === '/login' && user) {
    return redirect('/dashboard');
  }

  return next();
});
