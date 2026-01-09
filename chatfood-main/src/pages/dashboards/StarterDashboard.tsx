import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Calendar, TrendingUp, Sparkles, ShoppingCart, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DynamicMetricCard } from '@/components/dashboard/DynamicMetricCard';
import { ReservationsCalendar } from '@/components/dashboard/ReservationsCalendar';
import { OnboardingWidget } from '@/components/dashboard/OnboardingWidget';

export default function StarterDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
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
            Bonjour, {profile?.first_name || 'Utilisateur'} 👋
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Bienvenue sur votre tableau de bord ChatFood
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm md:text-base px-3 py-1 md:px-4 md:py-2 w-fit self-start md:self-center shadow-md">
          STARTER
        </Badge>
      </div>

      {/* Onboarding Widget */}
      <OnboardingWidget className="mb-2" />

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

        {/* Calendrier de réservations - Verrouillé */}
        <div className="relative overflow-hidden rounded-xl border bg-background shadow-sm">
          <div className="pointer-events-none blur-[2px] opacity-40 p-4">
            <ReservationsCalendar />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px] p-4">
            <Card className="w-full max-w-md shadow-lg border-primary/20 animate-in fade-in zoom-in duration-500">
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-primary/10 p-3 md:p-4 ring-1 ring-primary/20">
                    <Lock className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-lg md:text-xl">Calendrier de réservations</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Débloquez le calendrier en passant à Premium pour gérer vos réservations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-3 bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">Visualisation des réservations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">Gestion du planning</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">Notifications automatiques</span>
                  </div>
                </div>
                <Button onClick={() => navigate('/offres/premium')} className="w-full font-semibold shadow-sm" size="lg">
                  Passer à Premium
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
