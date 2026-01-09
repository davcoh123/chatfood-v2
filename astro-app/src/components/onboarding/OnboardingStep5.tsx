import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Building2, XCircle, Loader2 } from 'lucide-react';

interface OnboardingStep5Props {
  data: string;
  onChange: (siret: string) => void;
}

const OnboardingStep5: React.FC<OnboardingStep5Props> = ({ data, onChange }) => {
  const siretClean = data?.replace(/\s/g, '') || '';
  const isFormatValid = siretClean.length === 14 && /^\d+$/.test(siretClean);
  
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [companyInfo, setCompanyInfo] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const validateSiret = async (cleanValue: string) => {
    if (cleanValue.length !== 14 || !/^\d{14}$/.test(cleanValue)) {
      setIsValid(null);
      setCompanyInfo(null);
      return;
    }
    
    setIsValidating(true);
    try {
      const response = await fetch('https://n8n.chatfood.fr/webhook/check-siret-0b2e9a5584c0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siret: cleanValue })
      });
      const responseData = await response.json();
      
      if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].existe === true) {
        setIsValid(true);
        setCompanyInfo(responseData[0].nom_commercial || responseData[0].adresse_complete || null);
      } else {
        setIsValid(false);
        setCompanyInfo(null);
      }
    } catch (error) {
      console.error('SIRET validation error:', error);
      setIsValid(false);
      setCompanyInfo(null);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    if (isFormatValid) {
      debounceRef.current = setTimeout(() => {
        validateSiret(siretClean);
      }, 500);
    } else {
      setIsValid(null);
      setCompanyInfo(null);
    }
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [siretClean, isFormatValid]);

  const formatSiret = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    const parts = [];
    if (digits.length > 0) parts.push(digits.slice(0, 3));
    if (digits.length > 3) parts.push(digits.slice(3, 6));
    if (digits.length > 6) parts.push(digits.slice(6, 9));
    if (digits.length > 9) parts.push(digits.slice(9, 14));
    return parts.join(' ');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSiret(e.target.value);
    onChange(formatted);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Numéro SIRET</h2>
        <p className="text-muted-foreground mt-2">
          Dernière étape ! Votre numéro SIRET pour la facturation.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-full max-w-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Building2 className="h-8 w-8 text-primary" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siret">Numéro SIRET (14 chiffres)</Label>
            <div className="relative">
              <Input
                id="siret"
                placeholder="XXX XXX XXX XXXXX"
                value={data || ''}
                onChange={handleChange}
                className={`pr-10 ${isValid === true ? 'border-green-500' : isValid === false ? 'border-destructive' : ''}`}
              />
              {isValidating && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
              )}
              {!isValidating && isValid === true && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
              )}
              {!isValidating && isValid === false && (
                <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {siretClean.length}/14 chiffres
            </p>
            {isValid === true && companyInfo && (
              <p className="text-sm text-green-600 font-medium">{companyInfo}</p>
            )}
            {isValid === false && isFormatValid && (
              <p className="text-sm text-destructive">SIRET non trouvé ou invalide</p>
            )}
          </div>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Ce champ est optionnel. Vous pourrez le renseigner plus tard dans les paramètres.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep5;
