import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'user';
  plan: 'starter' | 'pro' | 'premium';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  session: any | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: any | null;
  initialSession?: any | null;
  initialProfile?: Profile | null;
}

// Function to get client IP from edge function
const getClientIP = async (): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('auth-get-client-ip');
    if (error) throw error;
    return data?.ip || 'unknown';
  } catch (error) {
    console.error('Error fetching IP:', error);
    return 'unknown';
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  initialUser = null, 
  initialSession = null, 
  initialProfile = null 
}) => {
  const [user, setUser] = useState<any | null>(initialUser);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [session, setSession] = useState<any | null>(initialSession);
  const [loading, setLoading] = useState(!initialUser);
  
  // Debug logs
  console.log('[AuthContext] Initialized with:', {
    hasInitialUser: !!initialUser,
    hasInitialProfile: !!initialProfile,
    profileUserId: initialProfile?.user_id,
  });

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      // Fetch role from user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (roleError) throw roleError;

      // Fetch plan from user_subscriptions table
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('plan')
        .eq('user_id', userId)
        .single();

      if (subscriptionError) throw subscriptionError;

      // Combine all data
      setProfile({
        ...profileData,
        role: roleData.role,
        plan: subscriptionData.plan
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      // Normalize email to lowercase to prevent case sensitivity issues
      const normalizedEmail = email.trim().toLowerCase();
      console.log('🔐 [signIn] Starting login process for:', normalizedEmail);
      
      const clientIP = await getClientIP();
      console.log('🌐 [signIn] Client IP:', clientIP);

      // Check if account/IP is blocked
      console.log('🔍 [signIn] Checking if account/IP is blocked...');
      const { data: blockData, error: blockError } = await supabase
        .rpc('is_blocked', {
          check_email: normalizedEmail,
          check_ip: clientIP
        });

      if (blockError) {
        console.error('❌ [signIn] Error checking blocks:', blockError);
      }

      console.log('📊 [signIn] Block check result:', blockData);

      if (blockData && blockData.length > 0 && blockData[0].blocked) {
        const blockedUntil = new Date(blockData[0].blocked_until);
        const minutes = Math.ceil((blockedUntil.getTime() - Date.now()) / 60000);
        
        console.log('🚫 [signIn] Account is blocked until:', blockedUntil);
        console.log('📤 [signIn] Sending login_blocked_attempt webhook...');
        
        // Send notification for login attempt on already blocked account
        try {
          const webhookPayload = {
            eventType: 'login_blocked_attempt',
            email: normalizedEmail,
            ipAddress: clientIP,
            blockedUntil: blockData[0].blocked_until,
            reason: blockData[0].reason,
            triggeredBy: 'frontend',
            userAgent: navigator.userAgent
          };
          
          console.log('📦 [signIn] Webhook payload:', webhookPayload);
          
          const { data: webhookResult, error: webhookError } = await supabase.functions.invoke('notify-security', {
            body: webhookPayload
          });
          
          if (webhookError) {
            console.error('❌ [signIn] Webhook error:', webhookError);
          } else {
            console.log('✅ [signIn] Webhook sent successfully:', webhookResult);
          }
        } catch (notifyError) {
          console.error('❌ [signIn] Error sending blocked attempt notification:', notifyError);
        }
        
        return { 
          error: `Compte temporairement bloqué. Réessayez dans ${minutes} minute(s).` 
        };
      }

      console.log('🔑 [signIn] Attempting Supabase authentication...');
      
      // Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password,
      });

      console.log('📝 [signIn] Recording login attempt...');
      
      // Record login attempt
      const { data: attemptResult, error: recordError } = await supabase
        .rpc('record_login_attempt', {
          attempt_email: normalizedEmail,
          attempt_ip: clientIP,
          was_successful: !error
        });

      if (recordError) {
        console.error('❌ [signIn] Error recording login attempt:', recordError);
      }

      console.log('📊 [signIn] Attempt result:', attemptResult);
      console.log('📊 [signIn] Attempt result type:', typeof attemptResult);
      console.log('📊 [signIn] Is array?:', Array.isArray(attemptResult));

      if (error) {
        console.log('❌ [signIn] Login failed:', error.message);
        console.log('🔍 [signIn] Checking if account should be blocked...');
        
        // Check if the account was just blocked
        if (attemptResult && Array.isArray(attemptResult) && attemptResult.length > 0) {
          const blockInfo = attemptResult[0];
          console.log('📊 [signIn] Block info:', blockInfo);
          console.log('📊 [signIn] should_block:', blockInfo?.should_block);
          
          if (blockInfo && blockInfo.should_block === true) {
            console.log('🚨 [signIn] Account should be blocked! Sending account_blocked webhook...');
            
            const blockUntil = new Date(blockInfo.block_until);
            const minutesBlocked = Math.ceil((blockUntil.getTime() - Date.now()) / 60000);
            
            // Get settings to enrich the notification payload
            try {
              console.log('⚙️ [signIn] Fetching settings...');
              
              const { data: maxAttemptsData } = await supabase.rpc('get_setting', { 
                key: 'max_login_attempts' 
              });
              const { data: blockDurationData } = await supabase.rpc('get_setting', { 
                key: 'block_duration_minutes' 
              });

              console.log('⚙️ [signIn] Max attempts from settings:', maxAttemptsData);
              console.log('⚙️ [signIn] Block duration from settings:', blockDurationData);

              const maxAttempts = maxAttemptsData ? parseInt(String(maxAttemptsData)) : 5;
              const blockDurationMinutes = blockDurationData ? parseInt(String(blockDurationData)) : 15;

              const webhookPayload = {
                eventType: 'account_blocked',
                email: normalizedEmail,
                ipAddress: clientIP,
                blockType: 'both',
                blockedUntil: blockInfo.block_until,
                reason: 'Nombre maximum de tentatives atteint',
                failedAttempts: maxAttempts,
                maxAttempts: maxAttempts,
                blockDurationMinutes: blockDurationMinutes,
                triggeredBy: 'frontend',
                userAgent: navigator.userAgent
              };

              console.log('📦 [signIn] account_blocked webhook payload:', webhookPayload);

              // Send notification for account blocked
              const { data: webhookResult, error: webhookError } = await supabase.functions.invoke('notify-security', {
                body: webhookPayload
              });
              
              if (webhookError) {
                console.error('❌ [signIn] Webhook error:', webhookError);
              } else {
                console.log('✅ [signIn] account_blocked webhook sent successfully:', webhookResult);
              }
            } catch (notifyError) {
              console.error('❌ [signIn] Error sending account blocked notification:', notifyError);
            }
            
            return { 
              error: `Trop de tentatives échouées. Votre compte et adresse IP ont été bloqués pendant ${minutesBlocked} minute(s) pour des raisons de sécurité.` 
            };
          } else {
            console.log('ℹ️ [signIn] should_block is false or undefined');
          }
        } else {
          console.log('ℹ️ [signIn] attemptResult is empty, null, or not an array');
        }
        
        return { error: "Email ou mot de passe incorrect." };
      }

      console.log('✅ [signIn] Login successful!');
      return {};
    } catch (error) {
      console.error('❌ [signIn] Unexpected error:', error);
      return { error: "Une erreur inattendue s'est produite." };
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string): Promise<{ error?: string }> => {
    try {
      // Vérifier si les inscriptions sont autorisées via RPC (bypass RLS)
      const { data: allowRegistrationSetting } = await supabase.rpc('get_setting', { 
        key: 'allow_registration' 
      });

      // Si le paramètre existe et est explicitement false, bloquer les inscriptions
      // Sinon (paramètre non trouvé ou true), autoriser par défaut
      const allowRegistration = allowRegistrationSetting !== false && allowRegistrationSetting !== 'false';

      if (!allowRegistration) {
        return { error: "Les inscriptions sont temporairement désactivées." };
      }

      const redirectUrl = `${window.location.origin}/`;

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName || '',
            last_name: lastName || ''
          }
        }
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: "Une erreur inattendue s'est produite." };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      }

      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(async () => {
            await fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      refreshProfile();
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, [user]);

  const value = {
    user,
    profile,
    session,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};