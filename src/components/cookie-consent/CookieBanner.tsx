import React from 'react';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

const CookieBanner = () => {
  const { isBannerOpen, acceptAll, rejectAll, openModal } = useCookieConsent();

  if (!isBannerOpen) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg p-4 md:p-6 animate-in slide-in-from-bottom duration-500"
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
    >
      <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-8">
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between lg:justify-start gap-2">
            <h2 id="cookie-banner-title" className="text-lg font-semibold">Gestion des cookies</h2>
            {/* Mobile close button acting as refusal */}
            <button 
              onClick={rejectAll} 
              className="lg:hidden p-1 text-muted-foreground hover:text-foreground"
              aria-label="Fermer et refuser"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p id="cookie-banner-desc" className="text-sm text-muted-foreground leading-relaxed">
            ChatFood utilise des cookies et autres traceurs pour (i) assurer le fonctionnement et la sécurité du site, et (ii) mesurer l’audience afin d’améliorer nos services. Vous pouvez accepter, refuser ou personnaliser vos choix. Votre choix est conservé pendant 6 mois et vous pouvez le modifier à tout moment via le lien « Gestion des cookies » en bas de page.
          </p>
          <div className="flex flex-wrap gap-4 text-xs">
            <Link to="/privacy" className="text-primary hover:underline">Politique de confidentialité</Link>
            <Link to="/cookies" className="text-primary hover:underline">Politique cookies</Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
          <Button onClick={acceptAll} className="w-full sm:w-auto">
            Tout accepter
          </Button>
          <Button onClick={rejectAll} variant="outline" className="w-full sm:w-auto">
            Tout refuser
          </Button>
          <Button onClick={openModal} variant="secondary" className="w-full sm:w-auto">
            Personnaliser
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
