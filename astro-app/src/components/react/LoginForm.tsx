import { useState, useEffect, type FormEvent } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

interface LoginFormProps {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export default function LoginForm({ supabaseUrl, supabaseAnonKey }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Get the browser client (singleton)
  const supabase = getSupabaseBrowserClient();

  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength++;
    return Math.min(strength, 4);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!supabase) {
      setError('Client Supabase non disponible');
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Inscription
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (data.user) {
          setSuccess('Inscription réussie ! Redirection...');
          // Force a hard refresh to ensure cookies are read by the server
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
        }
      } else {
        // Connexion
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          if (signInError.message === 'Invalid login credentials') {
            setError('Email ou mot de passe incorrect');
          } else {
            setError(signInError.message);
          }
          return;
        }

        if (data.session) {
          setSuccess('Connexion réussie ! Redirection...');
          
          // Get redirect URL from query params or default to dashboard
          const urlParams = new URLSearchParams(window.location.search);
          const redirectTo = urlParams.get('redirect') || '/dashboard';
          
          // Force a hard navigation to ensure cookies are sent to server
          setTimeout(() => {
            window.location.href = redirectTo;
          }, 500);
        }
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setError(null);
    setSuccess(null);
  };

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['Faible', 'Moyen', 'Bon', 'Excellent'];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-2xl shadow-green-500/5 border border-green-500/10 overflow-hidden">
      {/* Card Header */}
      <div className="p-6 pb-4 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          {isSignUp ? 'Inscription' : 'Connexion'}
        </h2>
        <p className="text-gray-500 mt-2 text-sm">
          {isSignUp 
            ? 'Remplissez les informations ci-dessous'
            : 'Entrez vos identifiants pour continuer'
          }
        </p>
      </div>

      {/* Card Content */}
      <div className="p-6 pt-2 space-y-6">
        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jean"
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Dupont"
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nom@example.com"
              required
              className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
            />
            {isSignUp && password && (
              <div className="mt-2 space-y-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Force : {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Très faible'}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || (isSignUp && passwordStrength < 2)}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isSignUp ? 'Inscription...' : 'Connexion...'}
              </>
            ) : (
              isSignUp ? "S'inscrire" : 'Se connecter'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-gray-500 font-medium">
              {isSignUp ? 'Déjà un compte ?' : 'Pas encore de compte ?'}
            </span>
          </div>
        </div>

        {/* Toggle Mode Button */}
        <button
          type="button"
          onClick={toggleMode}
          className="w-full h-11 border border-gray-200 hover:border-green-500/30 hover:bg-green-50 text-gray-700 font-medium rounded-lg transition-all duration-200"
        >
          {isSignUp ? 'Se connecter' : 'Créer un compte'}
        </button>

        {/* Alternative Actions */}
        {!isSignUp && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="/contact"
              className="flex items-center justify-center h-11 border border-gray-200 hover:border-green-500/30 hover:bg-green-50 text-gray-700 font-medium rounded-lg transition-all duration-200"
            >
              Nous contacter
            </a>
            <a
              href="/demo"
              className="flex items-center justify-center h-11 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200"
            >
              Essayer la démo
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
