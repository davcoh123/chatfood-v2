import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { TrendingUp, Building2, Sparkles, Lock, ArrowRight, LifeBuoy } from 'lucide-react';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetPlan: 'pro' | 'premium';
  currentPlan: string;
  feature?: 'catalogue' | 'analytics' | 'promotions' | 'multi-restaurant';
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ 
  open, 
  onOpenChange, 
  targetPlan,
  currentPlan,
  feature
}) => {
  const navigate = useNavigate();

  const planDetails = {
    pro: {
      name: 'Pro',
      color: 'from-blue-500 to-cyan-500',
      features: [
        { icon: TrendingUp, text: 'Analytics avancés (revenus, commandes, clients)' },
        { icon: Sparkles, text: 'Promotions et campagnes marketing' },
        { icon: TrendingUp, text: 'Rapports de performance détaillés' },
      ],
      route: '/offres/pro'
    },
    premium: {
      name: 'Premium',
      color: 'from-amber-500 to-yellow-500',
      features: [
        { icon: Building2, text: 'Gestion multi-restaurants illimitée' },
        { icon: Sparkles, text: 'IA avancée avec suggestions automatiques' },
        { icon: TrendingUp, text: 'Rapports personnalisés et exports avancés' },
      ],
      route: '/offres/premium'
    }
  };

  const details = planDetails[targetPlan];

  const handleUpgrade = () => {
    navigate(details.route);
    onOpenChange(false);
  };

  const handleSupport = () => {
    navigate('/support');
    onOpenChange(false);
  };

  // Configuration spécifique pour le catalogue
  if (feature === 'catalogue') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Lock className="h-8 w-8 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              Sauvegarde du Catalogue
            </DialogTitle>
            <DialogDescription className="text-center">
              Pour sauvegarder vos modifications, choisissez une option :
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-4 py-4">
            {/* Option 1: Plan Pro */}
            <Card className="p-4 space-y-3 hover:border-primary transition-colors cursor-pointer" onClick={handleUpgrade}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Plan Pro</h3>
                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs">
                    RECOMMANDÉ
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Autonomie totale sur votre catalogue + Analytics avancés
              </p>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90">
                Passer au plan Pro
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>

            {/* Option 2: Support Gratuit */}
            <Card className="p-4 space-y-3 hover:border-primary transition-colors cursor-pointer" onClick={handleSupport}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                  <LifeBuoy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Support Gratuit</h3>
                  <Badge variant="outline" className="text-xs">
                    TOUJOURS INCLUS
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Notre équipe modifie le catalogue pour vous gratuitement
              </p>
              <Button variant="outline" className="w-full">
                Contacter le support
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
          </div>

          <div className="pt-2 space-y-3">
            <Button 
              onClick={() => onOpenChange(false)} 
              variant="ghost" 
              className="w-full"
            >
              Retour au catalogue
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Votre plan actuel : <span className="font-medium">{currentPlan.toUpperCase()}</span>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Modal par défaut pour les autres features
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${details.color} flex items-center justify-center`}>
              <Lock className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Fonctionnalité {details.name} 
          </DialogTitle>
          <DialogDescription className="text-center">
            Cette fonctionnalité nécessite un abonnement{' '}
            <Badge className={`bg-gradient-to-r ${details.color} text-white`}>
              {details.name.toUpperCase()}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <p className="text-sm font-medium">Avec le plan {details.name}, vous débloquez :</p>
            {details.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <feature.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 space-y-3">
            <Button onClick={handleUpgrade} className="w-full" size="lg">
              Découvrir le plan {details.name}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              onClick={() => onOpenChange(false)} 
              variant="ghost" 
              className="w-full"
            >
              Retour au dashboard
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Votre plan actuel : <span className="font-medium">{currentPlan.toUpperCase()}</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
