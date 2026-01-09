import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, X, AlertCircle } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
  onValidityChange?: (isValid: boolean) => void;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
  test: (pwd: string) => boolean;
}

export function PasswordStrengthIndicator({ 
  password, 
  showRequirements = true,
  onValidityChange
}: PasswordStrengthIndicatorProps) {
  
  const requirements: PasswordRequirement[] = useMemo(() => [
    {
      label: "Au moins 8 caractères",
      test: (pwd) => pwd.length >= 8,
      met: password.length >= 8
    },
    {
      label: "Une lettre minuscule",
      test: (pwd) => /[a-z]/.test(pwd),
      met: /[a-z]/.test(password)
    },
    {
      label: "Une lettre majuscule",
      test: (pwd) => /[A-Z]/.test(pwd),
      met: /[A-Z]/.test(password)
    },
    {
      label: "Un chiffre",
      test: (pwd) => /\d/.test(pwd),
      met: /\d/.test(password)
    },
    {
      label: "Un caractère spécial",
      test: (pwd) => /[@$!%*?&#+\-=<>{}[\]|~^.,;:_°]/.test(pwd),
      met: /[@$!%*?&#+\-=<>{}[\]|~^.,;:_°]/.test(password)
    }
  ], [password]);

  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-gray-300', textColor: 'text-gray-500', isValid: false };
    
    const metCount = requirements.filter(r => r.met).length;
    const isValid = metCount === requirements.length;
    
    // Chaque critère = 20% du score (5 critères × 20% = 100%)
    const score = (metCount / requirements.length) * 100;
    
    // Notifier le parent du changement de validité
    if (onValidityChange) {
      onValidityChange(isValid);
    }
    
    if (score < 50) {
      return { 
        score, 
        label: 'Faible', 
        color: 'bg-destructive', 
        textColor: 'text-destructive',
        icon: X,
        isValid 
      };
    } else if (score < 100) {
      return { 
        score, 
        label: 'Moyen', 
        color: 'bg-orange-500', 
        textColor: 'text-orange-500',
        icon: AlertCircle,
        isValid 
      };
    } else {
      return { 
        score, 
        label: 'Fort', 
        color: 'bg-green-500', 
        textColor: 'text-green-500',
        icon: Check,
        isValid 
      };
    }
  }, [password, requirements, onValidityChange]);

  const getMissingRequirements = useMemo(() => {
    if (!password) return [];
    
    const missing: string[] = [];
    
    if (password.length < 8) {
      missing.push("Ajoutez au moins 8 caractères à votre mot de passe");
    }
    if (!/[a-z]/.test(password)) {
      missing.push("Ajoutez des lettres minuscules (a-z)");
    }
    if (!/[A-Z]/.test(password)) {
      missing.push("Ajoutez des lettres majuscules (A-Z)");
    }
    if (!/\d/.test(password)) {
      missing.push("Ajoutez des chiffres (0-9)");
    }
    if (!/[@$!%*?&#+\-=<>{}[\]|~^.,;:_°]/.test(password)) {
      missing.push("Ajoutez des caractères spéciaux (!@#$%...)");
    }
    
    return missing;
  }, [password]);

  if (!password) return null;

  const Icon = strength.icon;

  return (
    <div className="space-y-3 bg-muted/30 p-3 rounded-lg border border-muted/50">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <Progress 
          value={strength.score} 
          className="h-2 flex-1"
          indicatorClassName={strength.color}
        />
        <div className={`flex items-center gap-1.5 text-sm font-medium ${strength.textColor} whitespace-nowrap`}>
          {Icon && <Icon className="h-4 w-4" />}
          <span>{strength.label}</span>
        </div>
      </div>
      
      {showRequirements && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {requirements.map((req, idx) => (
              <div 
                key={idx}
                className={`flex items-center gap-2 text-xs ${
                  req.met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                }`}
              >
                {req.met ? (
                  <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400 shrink-0" />
                ) : (
                  <X className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                )}
                <span>{req.label}</span>
              </div>
            ))}
          </div>
          
          {getMissingRequirements.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-border">
              {getMissingRequirements.map((message, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-2 text-xs text-destructive font-medium"
                >
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
