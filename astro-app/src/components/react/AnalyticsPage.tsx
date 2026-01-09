import { useRevenueAnalytics } from '@/hooks/useRevenueAnalytics';
import { useOrdersAnalytics } from '@/hooks/useOrdersAnalytics';
import { useCustomerAnalytics } from '@/hooks/useCustomerAnalytics';
import { useSatisfactionAnalytics } from '@/hooks/useSatisfactionAnalytics';
import { useAnalyticsInsights } from '@/hooks/useAnalyticsInsights';
import { useAnalyticsExport } from '@/hooks/useAnalyticsExport';
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
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

const insightIcons: Record<string, any> = {
  TrendingUp,
  Clock,
  Star,
  Users,
  ShoppingCart
};

export default function AnalyticsPage() {
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
      route: '/dashboard/analytics/revenue',
      metrics: ['Revenu hebdomadaire', 'Revenu par catégorie', 'Croissance'],
      color: 'bg-gradient-to-br from-green-500 to-emerald-600'
    },
    {
      title: 'Commandes & Produits',
      description: 'Analyse des commandes et produits populaires',
      icon: ShoppingCart,
      route: '/dashboard/analytics/orders',
      metrics: ['Jours de pointe', 'Produits les plus vendus', 'Volume'],
      color: 'bg-gradient-to-br from-blue-500 to-cyan-600'
    },
    {
      title: 'Métriques Client',
      description: 'Rétention, satisfaction et comportement',
      icon: Users,
      route: '/dashboard/analytics/customers',
      metrics: ['Taux de rétention', 'Satisfaction client', 'Temps de conversion'],
      color: 'bg-gradient-to-br from-purple-500 to-violet-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header with export buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Analytics <span className="text-green-600">Dashboard</span>
          </h1>
          <p className="text-gray-500 mt-1">
            Découvrez les performances de votre restaurant
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={exportPDF} 
            disabled={isExporting}
            variant="outline"
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            PDF
          </Button>
          <Button 
            onClick={exportExcel} 
            disabled={isExporting}
            variant="outline"
            className="gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Revenus ce mois</p>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            {revenueLoading ? (
              <Skeleton className="h-8 w-24 mt-2" />
            ) : (
              <p className="text-2xl font-bold text-green-600 mt-1">
                {revenueThisMonth.toLocaleString('fr-FR')}€
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {growthPercentage >= 0 ? '+' : ''}{growthPercentage}% vs dernier mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Commandes</p>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </div>
            {ordersLoading ? (
              <Skeleton className="h-8 w-24 mt-2" />
            ) : (
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {ordersThisMonth}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {ordersGrowth >= 0 ? '+' : ''}{ordersGrowth}% vs dernier mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Rétention</p>
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            {customerLoading ? (
              <Skeleton className="h-8 w-24 mt-2" />
            ) : (
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {retentionRate}%
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">Clients fidèles</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Satisfaction</p>
              <Star className="h-4 w-4 text-amber-500" />
            </div>
            {satisfactionLoading ? (
              <Skeleton className="h-8 w-24 mt-2" />
            ) : (
              <p className="text-2xl font-bold text-amber-500 mt-1">
                {averageRating}/5
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">Note moyenne</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {analyticsCards.map((card) => (
          <Card key={card.route} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
            <a href={card.route}>
              <div className={`h-2 ${card.color}`} />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${card.color} text-white`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {card.metrics.map((metric) => (
                    <span 
                      key={metric} 
                      className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
                <div className="flex items-center text-green-600 font-medium group-hover:gap-2 transition-all">
                  Voir les détails 
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </a>
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Insights intelligents
          </CardTitle>
          <CardDescription>
            Recommandations personnalisées basées sur vos données
          </CardDescription>
        </CardHeader>
        <CardContent>
          {insightsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : insights.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Pas encore assez de données pour générer des insights
            </p>
          ) : (
            <div className="space-y-3">
              {insights.map((insight, index) => {
                const Icon = insightIcons[insight.icon] || Info;
                const bgColor = 
                  insight.type === 'success' ? 'bg-green-50 border-green-200' :
                  insight.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                  'bg-blue-50 border-blue-200';
                const iconColor = 
                  insight.type === 'success' ? 'text-green-600' :
                  insight.type === 'warning' ? 'text-amber-600' :
                  'text-blue-600';
                  
                return (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${bgColor} flex items-start gap-3`}
                  >
                    <Icon className={`h-5 w-5 ${iconColor} mt-0.5`} />
                    <div>
                      <p className="font-medium">{insight.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
