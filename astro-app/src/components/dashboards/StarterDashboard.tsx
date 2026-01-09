import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, TrendingUp, Sparkles, ShoppingCart } from 'lucide-react';
import { DynamicMetricCard } from '@/components/dashboard/DynamicMetricCard';
import { OnboardingWidget } from '@/components/dashboard/OnboardingWidget';

interface StarterDashboardProps {
  userId: string;
  firstName: string;
  onboardingCompleted?: boolean;
}

export default function StarterDashboard({ userId, firstName, onboardingCompleted }: StarterDashboardProps) {
  const navigate = (path: string) => window.location.href = path;
  
  const todayStats = [{
    id: "whatsapp_messages",
    label: "Messages WhatsApp",
    icon: MessageSquare,
    color: "text-green-600"
  }, {
    id: "orders",
    label: "Commandes du jour",
    icon: ShoppingCart,
    color: "text-orange-600"
  }];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Bonjour, {firstName || 'Utilisateur'} 👋
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Bienvenue sur votre tableau de bord ChatFood
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm md:text-base px-3 py-1 md:px-4 md:py-2 w-fit self-start md:self-center shadow-md">
          STARTER
        </Badge>
      </div>

      {/* Onboarding Widget - only if not completed */}
      {!onboardingCompleted && <OnboardingWidget className="mb-2" userId={userId} />}

      <div className="space-y-6">
        {/* Stats du jour */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {todayStats.map(stat => (
            <DynamicMetricCard 
              key={stat.id} 
              sectionId={stat.id} 
              defaultTitle={stat.label} 
              defaultIcon={stat.icon} 
              defaultColor={stat.color} 
            />
          ))}
        </div>

        {/* Upgrade CTA */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>Débloquez les Analytics</CardTitle>
            </div>
            <CardDescription>
              Passez au plan Pro pour accéder aux statistiques détaillées de votre restaurant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>Analyse des revenus et performance</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>Suivi des commandes et produits populaires</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>Métriques clients et fidélisation</span>
              </div>
            </div>
            <Button onClick={() => navigate('/offres/pro')} className="w-full">
              Passer à Pro
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
