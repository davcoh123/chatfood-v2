import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TrendingUp, Euro, Calendar, PieChart, FileText, FileSpreadsheet } from 'lucide-react';
import { RevenueWeeklyChart } from '@/components/analytics/RevenueWeeklyChart';
import { RevenueCategoryChart } from '@/components/analytics/RevenueCategoryChart';
import { RevenueGrowthChart } from '@/components/analytics/RevenueGrowthChart';
import { useRevenueAnalytics } from '@/hooks/useRevenueAnalytics';
import { useAnalyticsExport } from '@/hooks/useAnalyticsExport';

const Revenue = () => {
  const { 
    revenueThisMonth, growthPercentage, averageWeeklyRevenue, bestCategory, bestCategoryPercentage,
    weeklyRevenue, revenueByCategory, monthlyGrowth, averageGrowth, bestMonth, bestMonthGrowth, isLoading 
  } = useRevenueAnalytics();
  const { exportPDF, exportExcel, isExporting } = useAnalyticsExport();

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Analyse des Revenus</h1>
          <p className="text-muted-foreground">Suivez vos performances financières en temps réel</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportPDF} disabled={isExporting}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={exportExcel} disabled={isExporting}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up">
        <Card className="border-primary/10 bg-gradient-to-br from-green-500/5 to-green-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus ce mois</CardTitle>
            <Euro className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{revenueThisMonth.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{growthPercentage >= 0 ? '+' : ''}{growthPercentage}% vs mois dernier</p>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moyenne/semaine</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">€{averageWeeklyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Sur les 12 dernières semaines</p>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meilleure catégorie</CardTitle>
            <PieChart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{bestCategory}</div>
            <p className="text-xs text-muted-foreground">{bestCategoryPercentage}% du chiffre d'affaires</p>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-gradient-to-br from-orange-500/5 to-orange-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Croissance</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{growthPercentage >= 0 ? '+' : ''}{growthPercentage}%</div>
            <p className="text-xs text-muted-foreground">Croissance mensuelle</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="weekly" className="animate-slide-up animation-delay-200">
        <TabsList className="h-auto flex flex-col md:grid w-full md:grid-cols-3 gap-2 md:gap-0">
          <TabsTrigger value="weekly" className="w-full">Revenus Hebdomadaires</TabsTrigger>
          <TabsTrigger value="category" className="w-full">Par Catégorie</TabsTrigger>
          <TabsTrigger value="growth" className="w-full">Croissance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="weekly" className="space-y-4 animate-tab-content mt-4 md:mt-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenus par Semaine</CardTitle>
              <CardDescription>Évolution de vos revenus semaine par semaine</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueWeeklyChart weeklyData={weeklyRevenue} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="category" className="space-y-4 animate-tab-content">
          <Card>
            <CardHeader>
              <CardTitle>Revenus par Catégorie de Produits</CardTitle>
              <CardDescription>Répartition de vos revenus par type de produit</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueCategoryChart categoryData={revenueByCategory} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="growth" className="space-y-4 animate-tab-content">
          <Card>
            <CardHeader>
              <CardTitle>Tendance de Croissance</CardTitle>
              <CardDescription>Analyse de la croissance de vos revenus</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueGrowthChart 
                growthData={monthlyGrowth} 
                averageGrowth={averageGrowth}
                bestMonth={bestMonth}
                bestMonthGrowth={bestMonthGrowth}
                isLoading={isLoading} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Revenue;
