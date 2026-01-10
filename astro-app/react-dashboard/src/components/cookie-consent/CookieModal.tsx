import React, { useEffect, useState } from 'react';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';

const CookieModal = () => {
  const { isModalOpen, closeModal, consent, saveConsent, acceptAll, rejectAll } = useCookieConsent();
  
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // Sync local state with global consent when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setAnalytics(consent?.analytics ?? false);
      setMarketing(consent?.marketing ?? false);
    }
  }, [isModalOpen, consent]);

  const handleSave = () => {
    saveConsent({ analytics, marketing });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // If closing without saving, treat as refusal if no consent exists, 
      // or just close if consent already exists (but user didn't click save).
      // The prompt says: "Fermeture (X / overlay / ESC) → applique “Tout refuser”."
      // This usually applies to the initial banner/modal flow. 
      // If the user is just editing preferences, closing should probably keep old prefs or cancel.
      // However, to be safe and strictly follow "Fermeture ... doit être considérée comme un REFUS",
      // we will interpret closing the modal (if it's the first interaction) as refusal.
      // But if consent exists, it's just a "Cancel edit".
      
      if (!consent) {
        rejectAll();
      } else {
        closeModal();
      }
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Personnaliser vos choix</DialogTitle>
          <DialogDescription>
            Gérez vos préférences en matière de cookies. Vous pouvez modifier ces choix à tout moment via le lien en bas de page.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Necessary */}
          <div className="flex items-start justify-between space-x-4">
            <div className="space-y-1">
              <Label htmlFor="necessary" className="text-base font-medium">
                Strictement nécessaires
              </Label>
              <p className="text-sm text-muted-foreground">
                Ces cookies sont indispensables au bon fonctionnement du site (authentification, sécurité, mémorisation de votre choix). Ils ne peuvent pas être désactivés.
              </p>
            </div>
            <Switch id="necessary" checked={true} disabled aria-label="Strictement nécessaires (toujours activé)" />
          </div>

          {/* Analytics */}
          <div className="flex items-start justify-between space-x-4">
            <div className="space-y-1">
              <Label htmlFor="analytics" className="text-base font-medium">
                Mesure d’audience
              </Label>
              <p className="text-sm text-muted-foreground">
                Nous permettent de générer des statistiques de fréquentation anonymes pour améliorer le site.
              </p>
            </div>
            <Switch 
              id="analytics" 
              checked={analytics} 
              onCheckedChange={setAnalytics}
            />
          </div>

          {/* Marketing */}
          <div className="flex items-start justify-between space-x-4">
            <div className="space-y-1">
              <Label htmlFor="marketing" className="text-base font-medium">
                Marketing / Publicité
              </Label>
              <p className="text-sm text-muted-foreground">
                Permettent de vous proposer des contenus adaptés à vos centres d'intérêt.
              </p>
            </div>
            <Switch 
              id="marketing" 
              checked={marketing} 
              onCheckedChange={setMarketing}
            />
          </div>

          <div className="text-xs text-muted-foreground pt-2">
            Pour plus de détails, consultez notre <Link to="/privacy" className="text-primary hover:underline" onClick={closeModal}>Politique de confidentialité</Link>.
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:justify-between">
             <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={rejectAll} className="flex-1 sm:flex-none">
                  Tout refuser
                </Button>
                <Button variant="outline" onClick={acceptAll} className="flex-1 sm:flex-none">
                  Tout accepter
                </Button>
             </div>
             <Button onClick={handleSave} className="w-full sm:w-auto">
               Enregistrer mes choix
             </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CookieModal;
