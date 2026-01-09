import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Calendar,
  Trophy,
  Clock,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { OrdersTimeChart } from '@/components/analytics/OrdersTimeChart';
import { PopularProductsChart } from '@/components/analytics/PopularProductsChart';
import { OrdersVolumeChart } from '@/components/analytics/OrdersVolumeChart';
import { useOrdersAnalytics } from '@/hooks/useOrdersAnalytics';
import { useProductsAnalytics } from '@/hooks/useProductsAnalytics';
import { useAnalyticsExport } from '@/hooks/useAnalyticsExport';

const Orders = () => {
  const { 
    ordersThisMonth, ordersGrowth, peakDay, peakDayOrders, peakHour, peakHourOrders,
    ordersByDayOfWeek, ordersByHour, weeklyVolume, weekendVsWeekdayRatio, isLoading: ordersLoading 
  } = useOrdersAnalytics();
  
  const { topProducts, topProduct, categoryColors, isLoading: productsLoading } = useProductsAnalytics();
  const { exportPDF, exportExcel, isExporting } = useAnalyticsExport();

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Analyse des Commandes</h1>
          <p className="text-muted-foreground">
            Découvrez les tendances de commandes et les produits les plus populaires
          </p>
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
        <Card className="border-primary/10 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes ce mois</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{ordersThisMonth}</div>
            <p className="text-xs text-muted-foreground">{ordersGrowth >= 0 ? '+' : ''}{ordersGrowth}% vs mois dernier</p>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-gradient-to-br from-green-500/5 to-green-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jour de pointe</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{peakDay}</div>
            <p className="text-xs text-muted-foreground">{peakDayOrders} commandes/jour</p>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produit #1</CardTitle>
            <Trophy className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 truncate">{topProduct.name}</div>
            <p className="text-xs text-muted-foreground">{topProduct.sales} ventes ce mois</p>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-gradient-to-br from-orange-500/5 to-orange-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heure de pointe</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{peakHour}</div>
            <p className="text-xs text-muted-foreground">{peakHourOrders} commandes</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="timeline" className="animate-slide-up animation-delay-200">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">Jours de Commande</TabsTrigger>
          <TabsTrigger value="products">Produits Populaires</TabsTrigger>
          <TabsTrigger value="volume">Volume</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="space-y-4 animate-tab-content">
          <Card>
            <CardHeader>
              <CardTitle>Répartition des Commandes par Jour</CardTitle>
              <CardDescription>Découvrez les jours où vous recevez le plus de commandes</CardDescription>
            </CardHeader>
            <CardContent>
              <OrdersTimeChart 
                weeklyData={ordersByDayOfWeek}
                hourlyData={ordersByHour}
                peakDay={peakDay}
                peakDayOrders={peakDayOrders}
                peakHour={peakHour}
                peakHourOrders={peakHourOrders}
                weekendVsWeekdayRatio={weekendVsWeekdayRatio}
                isLoading={ordersLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4 animate-tab-content">
          <Card>
            <CardHeader>
              <CardTitle>Produits les Plus Vendus</CardTitle>
              <CardDescription>Classement de vos produits par nombre de ventes</CardDescription>
            </CardHeader>
            <CardContent>
              <PopularProductsChart 
                products={topProducts}
                categoryColors={categoryColors}
                isLoading={productsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="volume" className="space-y-4 animate-tab-content">
          <Card>
            <CardHeader>
              <CardTitle>Volume des Commandes</CardTitle>
              <CardDescription>Évolution du nombre de commandes dans le temps</CardDescription>
            </CardHeader>
            <CardContent>
              <OrdersVolumeChart volumeData={weeklyVolume} isLoading={ordersLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Orders;
