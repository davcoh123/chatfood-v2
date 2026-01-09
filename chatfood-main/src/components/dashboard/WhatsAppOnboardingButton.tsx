import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// ========================================
// CONFIGURATION META/FACEBOOK
// ========================================
const META_CONFIG = {
  APP_ID: '793709276646237',
  CONFIG_ID: '1741873360550446',
  API_VERSION: 'v24.0',
  SDK_URL: 'https://connect.facebook.net/en_US/sdk.js', // Conforme à la doc officielle Meta
};

// Timeout de sécurité (60 secondes - assez de temps pour l'utilisateur)
const LOGIN_TIMEOUT_MS = 60000;

// ========================================
// TYPES
// ========================================
interface SignupData {
  phone_number_id: string;
  waba_id: string;
  business_id?: string;
}

interface Props {
  existingIntegration?: { 
    waba_id: string; 
    phone_number_id: string; 
    display_phone_number?: string | null; 
    verified_name?: string | null; 
    status?: string 
  } | null;
  onSuccess?: (data: { waba_id: string; phone_number_id: string; display_phone_number?: string; verified_name?: string }) => void;
  onError?: (error: Error) => void;
}

// ========================================
// COMPOSANT PRINCIPAL
// ========================================
export function WhatsAppOnboardingButton({ existingIntegration, onSuccess, onError }: Props) {
  const { toast } = useToast();
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ref pour stocker les données signup reçues via postMessage (plus fiable que state pour le timing)
  const pendingSignupDataRef = useRef<SignupData | null>(null);

  // Si déjà connecté, afficher l'état success
  useEffect(() => {
    if (existingIntegration && existingIntegration.status === 'active') {
      setStatus('success');
    }
  }, [existingIntegration]);

  // ----------------------------------------
  // Cleanup timeout on unmount
  // ----------------------------------------
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // ----------------------------------------
  // Chargement asynchrone du SDK Facebook (pattern officiel Meta)
  // ----------------------------------------
  useEffect(() => {
    // Vérifier si déjà chargé (par ID comme dans la doc officielle)
    if (document.getElementById('facebook-jssdk')) {
      console.log('[WhatsApp Onboarding] SDK déjà présent dans le DOM');
      if (window.FB) {
        setSdkLoaded(true);
      }
      return;
    }

    // Callback d'initialisation (conforme à la doc officielle Meta)
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: META_CONFIG.APP_ID,
        cookie: true,           // AJOUT - Active les cookies pour le login (doc officielle)
        autoLogAppEvents: true, // Requis par la doc
        xfbml: true,            // Requis par la doc
        version: META_CONFIG.API_VERSION,
      });
      
      // Requis par la doc officielle Meta
      window.FB.AppEvents.logPageView();
      
      console.log('[WhatsApp Onboarding] SDK Facebook initialisé avec succès');
      setSdkLoaded(true);
    };

    // Pattern officiel de chargement (conforme à la doc Meta)
    const script = document.createElement('script');
    script.id = 'facebook-jssdk'; // ID officiel pour éviter le double-chargement
    script.src = META_CONFIG.SDK_URL;
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    
    // Insertion selon le pattern officiel
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
    
    console.log('[WhatsApp Onboarding] Script SDK Facebook ajouté au DOM');
  }, []);

  // ----------------------------------------
  // Écoute des messages de l'iframe Facebook
  // ----------------------------------------
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // SÉCURITÉ : Vérifier l'origine du message (selon doc officielle Meta)
      if (!event.origin.endsWith('facebook.com')) {
        return;
      }
      
      console.log('[WhatsApp Onboarding] Message reçu de Facebook:', event.origin);

      try {
        const data = typeof event.data === 'string' 
          ? JSON.parse(event.data) 
          : event.data;

        // Écouter l'événement WA_EMBEDDED_SIGNUP
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          // IMPORTANT: Cancel timeout as soon as we receive ANY Facebook message
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          
          if (data.event === 'FINISH') {
            console.log('[WhatsApp Onboarding] Signup terminé:', {
              phone_number_id: data.data?.phone_number_id,
              waba_id: data.data?.waba_id,
              business_id: data.data?.business_id,
            });
            // Stocker dans la ref pour utilisation dans processAuthCode
            pendingSignupDataRef.current = {
              phone_number_id: data.data?.phone_number_id || '',
              waba_id: data.data?.waba_id || '',
              business_id: data.data?.business_id,
            };
            console.log('[WhatsApp Onboarding] Données signup stockées dans ref:', pendingSignupDataRef.current);
          } else if (data.event === 'CANCEL') {
            console.log('[WhatsApp Onboarding] Signup annulé par l\'utilisateur');
            pendingSignupDataRef.current = null;
            setIsLoading(false);
            toast({
              title: 'Inscription annulée',
              description: 'Vous avez fermé la fenêtre d\'inscription WhatsApp.',
              variant: 'default',
            });
          } else if (data.event === 'ERROR') {
            console.error('[WhatsApp Onboarding] Erreur:', data.data);
            pendingSignupDataRef.current = null;
            setIsLoading(false);
          }
        }
      } catch {
        // Ignorer les messages non-JSON
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [toast]);

  // ----------------------------------------
  // Envoi du code à l'Edge Function
  // ----------------------------------------
  const exchangeCodeForToken = async (code: string, wabaId: string, phoneNumberId: string) => {
    console.log('[WhatsApp Onboarding] Échange du code contre le token...');
    
    const { data, error } = await supabase.functions.invoke('exchange-meta-token', {
      body: {
        code,
        waba_id: wabaId,
        phone_number_id: phoneNumberId,
      },
    });

    if (error) {
      throw new Error(error.message || 'Erreur lors de l\'échange du token');
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Erreur inconnue');
    }

    return data;
  };

  // ----------------------------------------
  // Fonction pour attendre les données signup du postMessage
  // ----------------------------------------
  const waitForSignupData = useCallback((): Promise<SignupData | null> => {
    return new Promise((resolve) => {
      // Si déjà disponible dans la ref, retourner immédiatement
      if (pendingSignupDataRef.current) {
        console.log('[WhatsApp Onboarding] Données signup déjà disponibles dans ref');
        resolve(pendingSignupDataRef.current);
        return;
      }
      
      // Sinon attendre max 5 secondes
      let attempts = 0;
      const maxAttempts = 50; // 50 * 100ms = 5 secondes
      
      const interval = setInterval(() => {
        attempts++;
        
        if (pendingSignupDataRef.current) {
          clearInterval(interval);
          console.log('[WhatsApp Onboarding] Données signup reçues après', attempts * 100, 'ms');
          resolve(pendingSignupDataRef.current);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          console.warn('[WhatsApp Onboarding] Timeout: données signup non reçues après 5s');
          resolve(null);
        }
      }, 100);
    });
  }, []);

  // ----------------------------------------
  // Traitement async du code d'autorisation (séparé du callback FB.login)
  // ----------------------------------------
  const processAuthCode = useCallback(async (code: string) => {
    try {
      console.log('[WhatsApp Onboarding] Code reçu, attente des données signup...');

      // Attendre que les données signup arrivent via postMessage
      const signupInfo = await waitForSignupData();

      if (!signupInfo || !signupInfo.waba_id || !signupInfo.phone_number_id) {
        throw new Error('Données WhatsApp Business non reçues. Veuillez réessayer.');
      }

      console.log('[WhatsApp Onboarding] Données signup reçues:', signupInfo);
      console.log('[WhatsApp Onboarding] Échange du code contre le token...');

      // Échanger le code contre le token via Edge Function
      const result = await exchangeCodeForToken(
        code,
        signupInfo.waba_id,
        signupInfo.phone_number_id
      );

      // Réinitialiser la ref
      pendingSignupDataRef.current = null;

      setStatus('success');
      toast({
        title: 'Connexion réussie !',
        description: 'Votre compte WhatsApp Business est maintenant connecté.',
      });

      onSuccess?.({
        waba_id: result.waba_id,
        phone_number_id: result.phone_number_id,
        display_phone_number: result.display_phone_number,
        verified_name: result.verified_name,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      console.error('[WhatsApp Onboarding] Erreur:', error);
      pendingSignupDataRef.current = null;
      setStatus('error');
      toast({
        title: 'Erreur de connexion',
        description: errorMessage,
        variant: 'destructive',
      });
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [waitForSignupData, toast, onSuccess, onError]);

  // ----------------------------------------
  // Lancement du flux d'inscription
  // ----------------------------------------
  const launchWhatsAppSignup = useCallback(() => {
    console.log('[WhatsApp Onboarding] Bouton cliqué, SDK chargé:', !!window.FB);
    
    if (!window.FB) {
      toast({
        title: 'Erreur',
        description: 'Le SDK Facebook n\'est pas encore chargé. Réessayez.',
        variant: 'destructive',
      });
      return;
    }
    
    console.log('[WhatsApp Onboarding] Lancement du flux d\'inscription...');

    setIsLoading(true);
    setStatus('idle');
    pendingSignupDataRef.current = null;

    // SÉCURITÉ : Timeout si le callback ne se déclenche pas (popup bloquée)
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Popup bloquée ?',
        description: 'Vérifiez que les popups ne sont pas bloquées par votre navigateur, puis réessayez.',
        variant: 'destructive',
      });
    }, LOGIN_TIMEOUT_MS);

    // Callback SYNCHRONE pour FB.login (conforme à la doc officielle Meta v4)
    // NE PAS utiliser async ici - FB.login n'accepte que des fonctions synchrones
    const fbLoginCallback = (response: {
      authResponse?: {
        code?: string;
        accessToken?: string;
        userID?: string;
      };
      status?: string;
    }) => {
      console.log('[WhatsApp Onboarding] Callback FB.login reçu:', response);
      
      // Clear le timeout car le callback a été appelé
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Vérifier si l'utilisateur a fermé la popup
      if (!response.authResponse) {
        console.log('[WhatsApp Onboarding] Popup fermée ou accès refusé');
        setIsLoading(false);
        return;
      }

      // CRUCIAL : On récupère le CODE (pas un token client)
      const { code } = response.authResponse;
      
      if (!code) {
        console.error('[WhatsApp Onboarding] Aucun code d\'autorisation reçu');
        setIsLoading(false);
        toast({
          title: 'Erreur',
          description: 'Aucun code d\'autorisation reçu de Facebook',
          variant: 'destructive',
        });
        return;
      }

      console.log('[WhatsApp Onboarding] Code reçu:', code.substring(0, 20) + '...');

      // Appeler la fonction async SÉPARÉMENT (hors du callback FB)
      processAuthCode(code);
    };

    // Appel FB.login avec les paramètres requis (doc officielle Meta v4)
    window.FB.login(fbLoginCallback, {
      config_id: META_CONFIG.CONFIG_ID,
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        setup: {},
      },
    });
    
    console.log('[WhatsApp Onboarding] FB.login() appelé avec config_id:', META_CONFIG.CONFIG_ID);
  }, [toast, processAuthCode]);

  // Si déjà connecté, afficher le statut
  if (existingIntegration && status === 'success') {
    return (
      <Button
        variant="outline"
        className="w-full"
        disabled
      >
        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
        WhatsApp connecté
      </Button>
    );
  }

  // ----------------------------------------
  // Rendu
  // ----------------------------------------
  return (
    <Button
      onClick={launchWhatsAppSignup}
      disabled={!sdkLoaded || isLoading}
      className="w-full"
      variant={status === 'success' ? 'outline' : 'default'}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connexion en cours...
        </>
      ) : status === 'success' ? (
        <>
          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
          WhatsApp connecté
        </>
      ) : status === 'error' ? (
        <>
          <AlertCircle className="mr-2 h-4 w-4 text-destructive" />
          Réessayer la connexion
        </>
      ) : (
        <>
          <MessageCircle className="mr-2 h-4 w-4" />
          {sdkLoaded ? 'Connecter WhatsApp Business' : 'Chargement...'}
        </>
      )}
    </Button>
  );
}

// ========================================
// TYPES GLOBAUX (pour TypeScript)
// ========================================
declare global {
  interface Window {
    FB: {
      init: (params: {
        appId: string;
        cookie?: boolean;
        autoLogAppEvents?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: {
          authResponse?: {
            code?: string;
            accessToken?: string;
            userID?: string;
          };
          status?: string;
        }) => void,
        options?: {
          config_id?: string;
          response_type?: string;
          override_default_response_type?: boolean;
          extras?: {
            setup?: Record<string, unknown>;
            sessionInfoVersion?: number;
            version?: string;
            featureType?: string;
          };
        }
      ) => void;
      AppEvents: {
        logPageView: () => void;
      };
    };
    fbAsyncInit: () => void;
  }
}
