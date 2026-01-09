import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface MagicLoginHandlerProps {
  supabaseUrl: string;
  supabaseAnonKey: string;
  token: string | null;
}

export default function MagicLoginHandler({ supabaseUrl, supabaseAnonKey, token }: MagicLoginHandlerProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const validateAndLogin = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage("Token manquant dans l'URL");
        return;
      }

      const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

      try {
        // Appeler l'edge function pour valider le token
        const { data, error } = await supabase.functions.invoke('validate-login-token', {
          body: { token }
        });

        if (error || data?.error) {
          console.error('Token validation error:', error || data?.error);
          setStatus('error');
          setErrorMessage(data?.error || 'Erreur lors de la validation du token');
          return;
        }

        if (!data?.hashed_token) {
          setStatus('error');
          setErrorMessage('Réponse invalide du serveur');
          return;
        }

        // Utiliser verifyOtp pour créer la session
        const { data: sessionData, error: otpError } = await supabase.auth.verifyOtp({
          token_hash: data.hashed_token,
          type: 'email',
        });

        if (otpError) {
          console.error('OTP verification error:', otpError);
          setStatus('error');
          setErrorMessage('Erreur lors de la connexion');
          return;
        }

        if (sessionData?.session) {
          setStatus('success');
          // Rediriger vers le dashboard après un court délai
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
        } else {
          setStatus('error');
          setErrorMessage('Session non créée');
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setStatus('error');
        setErrorMessage('Une erreur inattendue est survenue');
      }
    };

    validateAndLogin();
  }, [token, supabaseUrl, supabaseAnonKey]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold flex items-center justify-center gap-2 text-gray-900">
            {status === 'loading' && (
              <>
                <svg className="animate-spin h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion en cours...
              </>
            )}
            {status === 'success' && (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
                Connexion réussie
              </>
            )}
            {status === 'error' && (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" x2="12" y1="8" y2="12"></line>
                  <line x1="12" x2="12.01" y1="16" y2="16"></line>
                </svg>
                Erreur de connexion
              </>
            )}
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            {status === 'loading' && 'Validation de votre lien de connexion...'}
            {status === 'success' && 'Vous allez être redirigé vers le tableau de bord.'}
            {status === 'error' && errorMessage}
          </p>
        </div>
        <div className="px-6 pb-6 flex justify-center">
          {status === 'error' && (
            <a
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Retourner à la page de connexion
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
