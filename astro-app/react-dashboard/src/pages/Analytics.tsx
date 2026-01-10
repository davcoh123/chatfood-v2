import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  Users,
  ShoppingCart,
  Clock,
  Star,
  ArrowRight,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { useRevenueAnalytics } from '@/hooks/useRevenueAnalytics';
import { useOrdersAnalytics } from '@/hooks/useOrdersAnalytics';
import { useCustomerAnalytics } from '@/hooks/useCustomerAnalytics';
import { useSatisfactionAnalytics } from '@/hooks/useSatisfactionAnalytics';
import { useAnalyticsInsights, Insight } from '@/hooks/useAnalyticsInsights';
import { useAnalyticsExport } from '@/hooks/useAnalyticsExport';

const insightIcons = {
  TrendingUp,
  Clock,
  Star,
  Users,
  ShoppingCart
};

const insightStyles = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-600',
    titleColor: 'text-green-800 dark:text-green-200',
    descColor: 'text-green-600 dark:text-green-300'
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800 dark:text-blue-200',
    descColor: 'text-blue-600 dark:text-blue-300'
  },
  warning: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    iconColor: 'text-orange-600',
    titleColor: 'text-orange-800 dark:text-orange-200',
    descColor: 'text-orange-600 dark:text-orange-300'
  }
};

const Analytics = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const { revenueThisMonth, growthPercentage, isLoading: revenueLoading } = useRevenueAnalytics();
  const { ordersThisMonth, ordersGrowth, isLoading: ordersLoading } = useOrdersAnalytics();
  const { retentionRate, isLoading: customerLoading } = useCustomerAnalytics();
  const { averageRating, isLoading: satisfactionLoading } = useSatisfactionAnalytics();
  const { insights, isLoading: insightsLoading } = useAnalyticsInsights();
  const { exportPDF, exportExcel, isExporting } = useAnalyticsExport();

  const analyticsCards = [
    {
      title: 'Revenus & Performance',
      description: 'Revenus par semaine, par catégorie et tendances',
      icon: TrendingUp,
      route: '/analytics/revenue',
      metrics: ['Revenu hebdomadaire', 'Revenu par catégorie', 'Croissance'],
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Commandes & Produits',
      description: 'Analyse des commandes et produits populaires',
      icon: ShoppingCart,
      route: '/analytics/orders',
      metrics: ['Jours de pointe', 'Produits les plus vendus', 'Volume'],
      color: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'Métriques Client',
      description: 'Rétention, satisfaction et comportement',
      icon: Users,
      route: '/analytics/customers',
      metrics: ['Taux de rétention', 'Satisfaction client', 'Temps de conversion'],
      color: 'from-purple-500 to-violet-600'
    }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-4xl font-bold">
            Analytics{" "}
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Découvrez les performances de votre restaurant avec des analyses détaillées et interactives.
          </p>
        </div>
        <div className="flex gap-2 justify-center md:justify-end">
          <Button 
            onClick={exportPDF} 
            disabled={isExporting}
            variant="outline"
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
          <Button 
            onClick={exportExcel} 
            disabled={isExporting}
            variant="outline"
            className="gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up">
        <Card className="border-primary/10 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus ce mois</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-primary">
                €{revenueThisMonth.toLocaleString('fr-FR')}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {revenueLoading ? (
                <Skeleton className="h-3 w-20 mt-1" />
              ) : (
                <>{growthPercentage >= 0 ? '+' : ''}{growthPercentage}% vs mois dernier</>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">{ordersThisMonth.toLocaleString('fr-FR')}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {ordersLoading ? (
                <Skeleton className="h-3 w-20 mt-1" />
              ) : (
                <>{ordersGrowth >= 0 ? '+' : ''}{ordersGrowth}% vs mois dernier</>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rétention</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {customerLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-purple-600">{retentionRate}%</div>
            )}
            <p className="text-xs text-muted-foreground">Clients fidèles</p>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-gradient-to-br from-orange-500/5 to-orange-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {satisfactionLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-orange-600">{averageRating.toFixed(1)}/5</div>
            )}
            <p className="text-xs text-muted-foreground">Note moyenne</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up animation-delay-200">
        {analyticsCards.map((card, index) => (
          <Card 
            key={card.route}
            className="hover-lift cursor-pointer border-primary/10 hover:border-primary/20 transition-all duration-300 group"
            onClick={() => navigate(card.route)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${card.color} text-white`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <CardTitle className="text-xl">{card.title}</CardTitle>
              <CardDescription className="text-sm">
                {card.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {card.metrics.map((metric, metricIndex) => (
                  <div key={metricIndex} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary/60 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">{metric}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                Voir les détails
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Insights */}
      <Card className="animate-slide-up animation-delay-400">
        <CardHeader>
          <CardTitle>Insights récents</CardTitle>
          <CardDescription>
            Découvertes et tendances importantes basées sur vos données
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insightsLoading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : insights.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Pas assez de données pour générer des insights. Continuez à recevoir des commandes !
              </p>
            ) : (
              insights.map((insight, index) => {
                const IconComponent = insightIcons[insight.icon];
                const styles = insightStyles[insight.type];
                return (
                  <div 
                    key={index}
                    className={`flex items-start space-x-4 p-4 ${styles.bg} rounded-lg border ${styles.border}`}
                  >
                    <IconComponent className={`h-5 w-5 ${styles.iconColor} mt-0.5`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${styles.titleColor}`}>
                        {insight.title}
                      </p>
                      <p className={`text-xs ${styles.descColor}`}>
                        {insight.description}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;