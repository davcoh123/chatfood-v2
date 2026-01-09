/**
 * Astro Middleware for Authentication
 * 
 * Handles:
 * - Session refresh on each request
 * - Protected route redirection
 * - User injection into locals for SSR pages
 */

import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient, getUserWithProfile } from '@/lib/supabase-server';

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
  const { cookies, url, redirect, locals } = context;
  const pathname = url.pathname;

  // Skip middleware for static assets
  if (pathname.startsWith('/_astro') || pathname.startsWith('/favicon') || pathname.includes('.')) {
    return next();
  }

  // Create Supabase client and refresh session
  const supabase = createSupabaseServerClient(cookies);
  
  // Try to get and refresh the session
  const { data: { session } } = await supabase.auth.getSession();

  // Inject user into locals for SSR pages
  if (session?.user) {
    const userWithProfile = await getUserWithProfile(cookies);
    locals.user = userWithProfile;
    locals.session = session;
  } else {
    locals.user = null;
    locals.session = null;
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
  if (isProtectedRoute && !session) {
    // Store the intended destination for redirect after login
    const redirectUrl = new URL('/login', url.origin);
    redirectUrl.searchParams.set('redirect', pathname);
    return redirect(redirectUrl.toString());
  }

  // Check admin role for admin routes
  if (isAdminRoute && locals.user?.role !== 'admin') {
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
      
      if (isMaintenanceMode && locals.user?.role !== 'admin') {
        return redirect('/maintenance');
      }
    } catch {
      // Continue if we can't check maintenance mode
    }
  }

  // Redirect logged-in users away from login page
  if (pathname === '/login' && session) {
    return redirect('/dashboard');
  }

  return next();
});
