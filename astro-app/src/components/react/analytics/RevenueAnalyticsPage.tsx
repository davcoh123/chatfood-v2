import { useRevenueAnalytics } from '@/hooks/useRevenueAnalytics';
import { useAnalyticsExport } from '@/hooks/useAnalyticsExport';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Euro, Calendar, PieChart, FileText, FileSpreadsheet, ArrowLeft } from 'lucide-react';
import { RevenueWeeklyChart } from '@/components/analytics/RevenueWeeklyChart';
import { RevenueCategoryChart } from '@/components/analytics/RevenueCategoryChart';
import { RevenueGrowthChart } from '@/components/analytics/RevenueGrowthChart';

export default function RevenueAnalyticsPage() {
  const { 
    revenueThisMonth, growthPercentage, averageWeeklyRevenue, bestCategory, bestCategoryPercentage,
    weeklyRevenue, revenueByCategory, monthlyGrowth, averageGrowth, bestMonth, bestMonthGrowth, isLoading 
  } = useRevenueAnalytics();
  const { exportPDF, exportExcel, isExporting } = useAnalyticsExport();

  return (
    <div className="space-y-6">
      {/* Back button */}
      <a href="/dashboard/analytics" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" />
        Retour aux analytics
      </a>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analyse des Revenus</h1>
          <p className="text-gray-500">Suivez vos performances financières en temps réel</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportPDF} disabled={isExporting}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={exportExcel} disabled={isExporting}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Revenus ce mois</p>
              <Euro className="h-4 w-4 text-green-600" />
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold text-green-600">
                {revenueThisMonth.toLocaleString('fr-FR')}€
              </p>
            )}
            <p className="text-xs text-gray-400">
              {growthPercentage >= 0 ? '+' : ''}{growthPercentage}% vs dernier mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Moyenne/semaine</p>
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold text-blue-600">
                {averageWeeklyRevenue.toLocaleString('fr-FR')}€
              </p>
            )}
            <p className="text-xs text-gray-400">12 dernières semaines</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Top catégorie</p>
              <PieChart className="h-4 w-4 text-purple-600" />
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold text-purple-600 truncate">
                {bestCategory || 'N/A'}
              </p>
            )}
            <p className="text-xs text-gray-400">{bestCategoryPercentage}% du CA</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Croissance</p>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className={`text-2xl font-bold ${growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growthPercentage >= 0 ? '+' : ''}{growthPercentage}%
              </p>
            )}
            <p className="text-xs text-gray-400">Mensuelle</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weekly">Hebdomadaire</TabsTrigger>
          <TabsTrigger value="category">Par catégorie</TabsTrigger>
          <TabsTrigger value="growth">Croissance</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle>Revenus par semaine</CardTitle>
              <CardDescription>Évolution sur les 12 dernières semaines</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <RevenueWeeklyChart weeklyData={weeklyRevenue} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category">
          <Card>
            <CardHeader>
              <CardTitle>Revenus par catégorie</CardTitle>
              <CardDescription>Répartition des ventes par type de produit</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <RevenueCategoryChart categoryData={revenueByCategory} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth">
          <Card>
            <CardHeader>
              <CardTitle>Croissance mensuelle</CardTitle>
              <CardDescription>Évolution de la croissance mois par mois</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <RevenueGrowthChart growthData={monthlyGrowth} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
