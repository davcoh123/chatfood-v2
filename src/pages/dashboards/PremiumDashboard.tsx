import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, ShoppingCart, Users, Building2, Sparkles, ArrowRight, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DynamicMetricCard } from '@/components/dashboard/DynamicMetricCard';
import { ReservationsCalendar } from '@/components/dashboard/ReservationsCalendar';
import { OnboardingWidget } from '@/components/dashboard/OnboardingWidget';

export default function PremiumDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [selectedRestaurant, setSelectedRestaurant] = useState("restaurant-1");

  const restaurants = [
    { id: "restaurant-1", name: "Restaurant Centre-Ville" },
    { id: "restaurant-2", name: "Restaurant Quartier Nord" },
    { id: "restaurant-3", name: "Restaurant Zone Sud" }
  ];

  const quickActions = [
    {
      title: "Revenus & Performance",
      description: "Analyse détaillée tous restaurants",
      icon: TrendingUp,
      route: "/analytics/revenue",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: "Commandes & Produits",
      description: "Vue consolidée des commandes",
      icon: ShoppingCart,
      route: "/analytics/orders",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Métriques Clients",
      description: "Analyse cross-restaurant",
      icon: Users,
      route: "/analytics/customers",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  const todayStats = [
    {
      id: "revenue",
      label: "Revenu du jour",
      icon: TrendingUp,
    },
    {
      id: "orders",
      label: "Commandes",
      icon: ShoppingCart,
    },
    {
      id: "whatsapp_messages",
      label: "Messages",
      icon: Users,
    },
    {
      id: "reservations",
      label: "Réservations",
      icon: Building2,
    }
  ];

  const aiSuggestions = [
    "Le plat 'Burger Premium' performe +45% aujourd'hui. Pensez à le mettre en avant.",
    "Affluence prévue forte demain soir (19h-21h). Suggérez des réservations anticipées.",
    "Client régulier 'Marie D.' n'a pas commandé depuis 15 jours. Envoyez une offre personnalisée."
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Welcome Section with Restaurant Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-8">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Bonjour, {profile?.first_name || 'Utilisateur'} 👋
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Vue d'ensemble de vos restaurants
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto bg-muted/30 p-2 rounded-lg border">
          <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
            <SelectTrigger className="w-full sm:w-[240px] bg-background border-muted-foreground/20">
              <SelectValue placeholder="Sélectionner un restaurant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les restaurants</SelectItem>
              {restaurants.map(resto => (
                <SelectItem key={resto.id} value={resto.id}>{resto.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-sm md:text-base px-3 py-1.5 w-fit whitespace-nowrap shadow-sm">
            PREMIUM
          </Badge>
        </div>
      </div>

      {/* Onboarding Widget */}
      <OnboardingWidget className="mb-2" />

      <div className="space-y-6">
        {/* AI Suggestions */}
        <Card className="border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-background">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg md:text-xl">Suggestions IA Avancée</CardTitle>
            </div>
            <CardDescription>Optimisations automatiques basées sur vos données</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border">
                  <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats du jour */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {todayStats.map((stat) => (
            <DynamicMetricCard
              key={stat.id}
              sectionId={stat.id}
              defaultTitle={stat.label}
              defaultIcon={stat.icon}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Accès Rapide Analytics
          </h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {quickActions.map((action) => (
              <Card 
                key={action.title}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 group border-muted/60 hover:border-primary/20"
                onClick={() => navigate(action.route)}
              >
                <CardHeader className="flex flex-row sm:flex-col items-center sm:items-start gap-4 space-y-0 sm:space-y-2">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform shrink-0`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="flex items-center justify-between text-base font-semibold truncate">
                      {action.title}
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform hidden sm:block" />
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs sm:text-sm line-clamp-2">
                      {action.description}
                    </CardDescription>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground sm:hidden" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Multi-Restaurant Management */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Gestion Multi-Restaurants
            </CardTitle>
            <CardDescription>Vue consolidée de tous vos établissements</CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="grid gap-0 sm:gap-3 divide-y sm:divide-y-0">
              {restaurants.map(resto => (
                <div key={resto.id} className="flex items-center justify-between p-4 sm:p-3 sm:rounded-lg sm:border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium truncate">{resto.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0 ml-2 hover:bg-primary/10 hover:text-primary">
                    <span className="hidden sm:inline">Voir détails</span>
                    <ArrowRight className="h-4 w-4 sm:ml-2" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Calendrier de réservations */}
        <ReservationsCalendar />
      </div>
    </div>
  );
}
