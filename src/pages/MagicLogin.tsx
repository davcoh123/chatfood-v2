import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function MagicLogin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const validateAndLogin = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setErrorMessage('Token manquant dans l\'URL');
        return;
      }

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
            navigate('/dashboard');
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
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                Connexion en cours...
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                Connexion réussie
              </>
            )}
            {status === 'error' && (
              <>
                <AlertCircle className="h-6 w-6 text-destructive" />
                Erreur de connexion
              </>
            )}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Validation de votre lien de connexion...'}
            {status === 'success' && 'Vous allez être redirigé vers le tableau de bord.'}
            {status === 'error' && errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {status === 'error' && (
            <Button onClick={() => navigate('/login')} variant="outline">
              Retourner à la page de connexion
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
