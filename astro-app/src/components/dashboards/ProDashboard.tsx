import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, TrendingUp, ShoppingCart, Users, Star, Bot, LifeBuoy, ArrowRight } from 'lucide-react';
import { useRevenueAnalytics } from '@/hooks/useRevenueAnalytics';
import { useOrdersAnalytics } from '@/hooks/useOrdersAnalytics';
import { useCustomerAnalytics } from '@/hooks/useCustomerAnalytics';
import { useSatisfactionAnalytics } from '@/hooks/useSatisfactionAnalytics';
import { OnboardingWidget } from '@/components/dashboard/OnboardingWidget';

interface ProDashboardProps {
  userId: string;
  firstName: string;
}

export default function ProDashboard({ userId, firstName }: ProDashboardProps) {
  const navigate = (path: string) => window.location.href = path;

  const { revenueThisMonth, growthPercentage, isLoading: revenueLoading } = useRevenueAnalytics();
  const { ordersThisMonth, ordersGrowth, isLoading: ordersLoading } = useOrdersAnalytics();
  const { activeCustomers, newCustomersPercentage, isLoading: customerLoading } = useCustomerAnalytics();
  const { averageRating, totalReviews, isLoading: satisfactionLoading } = useSatisfactionAnalytics();

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Bonjour, {firstName || 'Utilisateur'} 
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Gérez votre restaurant et suivez vos performances
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/analytics/revenue')}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Voir les Analytics
          </Button>
          <Badge className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm px-4 py-1.5 shadow-lg shadow-blue-500/20">
            PLAN PRO
          </Badge>
        </div>
      </div>

      {/* Onboarding Widget */}
      <OnboardingWidget className="mb-2" userId={userId} />

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/10 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenus (Mois)</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-primary">€{revenueThisMonth.toLocaleString('fr-FR')}</div>
            )}
            <span className="text-xs text-muted-foreground mt-1 flex items-center">
              {revenueLoading ? (
                <Skeleton className="h-3 w-20" />
              ) : (
                <>
                  <span className={`font-medium mr-1 ${growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {growthPercentage >= 0 ? '+' : ''}{growthPercentage}%
                  </span> 
                  vs mois dernier
                </>
              )}
            </span>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/10 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">{ordersThisMonth.toLocaleString('fr-FR')}</div>
            )}
            <span className="text-xs text-muted-foreground mt-1 flex items-center">
              {ordersLoading ? (
                <Skeleton className="h-3 w-20" />
              ) : (
                <>
                  <span className={`font-medium mr-1 ${ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {ordersGrowth >= 0 ? '+' : ''}{ordersGrowth}%
                  </span> 
                  vs mois dernier
                </>
              )}
            </span>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/10 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clients Actifs</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {customerLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-purple-600">{activeCustomers.toLocaleString('fr-FR')}</div>
            )}
            <span className="text-xs text-muted-foreground mt-1 flex items-center">
              {customerLoading ? (
                <Skeleton className="h-3 w-20" />
              ) : (
                <>
                  <span className="text-green-600 font-medium mr-1">+{newCustomersPercentage}%</span> 
                  nouveaux
                </>
              )}
            </span>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-orange-500/10 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Note Moyenne</CardTitle>
            <Star className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {satisfactionLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-orange-600">{averageRating.toFixed(1)}/5</div>
            )}
            <span className="text-xs text-muted-foreground mt-1 block">
              {satisfactionLoading ? (
                <Skeleton className="h-3 w-24" />
              ) : (
                <>Basé sur {totalReviews} avis</>
              )}
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column: Analytics Summary */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <CardTitle>Débloquez Premium</CardTitle>
              </div>
              <CardDescription>
                Passez au plan Premium pour accéder aux fonctionnalités avancées
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                  <span>Analytics avancées et insights IA</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                  <span>Support premium 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                  <span>Intégrations avancées</span>
                </div>
              </div>
              <Button onClick={() => navigate('/offres/premium')} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                Passer à Premium
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Support Card */}
          <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <LifeBuoy className="h-5 w-5 text-blue-600" />
                Support Prioritaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                En tant que membre Pro, vos demandes sont traitées en priorité par notre équipe dédiée.
              </p>
              <Button 
                variant="outline" 
                className="w-full border-blue-500/20 hover:bg-blue-500/10 text-blue-600 hover:text-blue-700"
                onClick={() => navigate('/support')}
              >
                Contacter le support
              </Button>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Raccourcis</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button variant="ghost" className="justify-start h-auto py-3" onClick={() => navigate('/catalogue')}>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Catalogue</div>
                    <div className="text-xs text-muted-foreground">Gérer vos produits</div>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </div>
              </Button>
              <Button variant="ghost" className="justify-start h-auto py-3" onClick={() => navigate('/settings')}>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Paramètres</div>
                    <div className="text-xs text-muted-foreground">Configuration générale</div>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
