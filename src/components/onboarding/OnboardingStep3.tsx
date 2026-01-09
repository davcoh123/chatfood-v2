import React, { useState } from 'react';
import { CheckCircle, MessageCircle, Loader2 } from 'lucide-react';
import { WhatsAppOnboardingButton } from '@/components/dashboard/WhatsAppOnboardingButton';
import { useWhatsAppIntegration } from '@/hooks/useWhatsAppIntegration';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const OnboardingStep3: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { integration, isLoading, refetch } = useWhatsAppIntegration();
  const isConnected = integration?.status === 'active';
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    if (!user?.id) return;
    
    setIsDisconnecting(true);
    try {
      // Set integration status to inactive (keep all data)
      await supabase
        .from('whatsapp_integrations')
        .update({ status: 'inactive' })
        .eq('user_id', user.id);
      
      // Only disable chatbot, keep all tokens/data in restaurant_settings
      await supabase
        .from('restaurant_settings')
        .update({ chatbot_active: false })
        .eq('user_id', user.id);
      
      refetch();
      toast({
        title: "WhatsApp déconnecté",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de déconnecter WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Connexion WhatsApp</h2>
        <p className="text-muted-foreground mt-2">
          Connectez votre compte WhatsApp Business pour recevoir les commandes.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-8">
        {isLoading ? (
          <div className="animate-pulse h-12 w-48 bg-muted rounded-lg" />
        ) : isConnected ? (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-8 w-8" />
              <span className="text-lg font-medium">WhatsApp connecté !</span>
            </div>
            <p className="text-muted-foreground">
              {integration?.display_phone_number || integration?.verified_name || 'Votre compte WhatsApp Business est prêt.'}
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="text-destructive hover:text-destructive"
            >
              {isDisconnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Déconnecter
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <MessageCircle className="h-10 w-10 text-green-600" />
            </div>
            
            <WhatsAppOnboardingButton />
            
            <p className="text-sm text-muted-foreground max-w-md">
              Vous pouvez aussi passer cette étape et configurer WhatsApp plus tard dans les paramètres.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingStep3;
