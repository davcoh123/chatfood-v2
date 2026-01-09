import { useOrdersAnalytics } from '@/hooks/useOrdersAnalytics';
import { useProductsAnalytics } from '@/hooks/useProductsAnalytics';
import { useAnalyticsExport } from '@/hooks/useAnalyticsExport';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, TrendingUp, Package, Calendar, FileText, FileSpreadsheet, ArrowLeft } from 'lucide-react';

export default function OrdersAnalyticsPage() {
  const { 
    ordersThisMonth, ordersGrowth, averageOrderValue, peakDay, peakHour,
    ordersByDay, ordersByHour, isLoading 
  } = useOrdersAnalytics();
  const { topProducts, isLoading: productsLoading } = useProductsAnalytics();
  const { exportPDF, exportExcel, isExporting } = useAnalyticsExport();

  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  return (
    <div className="space-y-6">
      <a href="/dashboard/analytics" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" />
        Retour aux analytics
      </a>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Commandes & Produits</h1>
          <p className="text-gray-500">Analysez vos ventes et produits populaires</p>
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
              <p className="text-sm text-gray-500">Commandes ce mois</p>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </div>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <p className="text-2xl font-bold text-blue-600">{ordersThisMonth}</p>
            )}
            <p className="text-xs text-gray-400">
              {ordersGrowth >= 0 ? '+' : ''}{ordersGrowth}% vs dernier mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Panier moyen</p>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <p className="text-2xl font-bold text-green-600">{averageOrderValue}€</p>
            )}
            <p className="text-xs text-gray-400">Par commande</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Jour de pointe</p>
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
            {isLoading ? <Skeleton className="h-8 w-24" /> : (
              <p className="text-2xl font-bold text-purple-600">{dayNames[peakDay] || 'N/A'}</p>
            )}
            <p className="text-xs text-gray-400">Le plus actif</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Heure de pointe</p>
              <Package className="h-4 w-4 text-orange-600" />
            </div>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <p className="text-2xl font-bold text-orange-600">{peakHour}h</p>
            )}
            <p className="text-xs text-gray-400">Le plus actif</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="byDay" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="byDay">Par jour</TabsTrigger>
          <TabsTrigger value="byHour">Par heure</TabsTrigger>
          <TabsTrigger value="products">Top produits</TabsTrigger>
        </TabsList>

        <TabsContent value="byDay">
          <Card>
            <CardHeader>
              <CardTitle>Commandes par jour</CardTitle>
              <CardDescription>Répartition des commandes sur la semaine</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-8" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {ordersByDay?.map((day: any, index: number) => (
                    <div key={index} className="flex items-center gap-4">
                      <span className="w-24 text-sm text-gray-500">{dayNames[index]}</span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.max(5, (day.count / Math.max(...ordersByDay.map((d: any) => d.count || 1))) * 100)}%` }}
                        />
                      </div>
                      <span className="w-12 text-right font-medium">{day.count || 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="byHour">
          <Card>
            <CardHeader>
              <CardTitle>Commandes par heure</CardTitle>
              <CardDescription>Distribution horaire des commandes</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-6" />)}
                </div>
              ) : (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {ordersByHour?.slice(8, 23).map((hour: any, index: number) => {
                    const maxCount = Math.max(...ordersByHour.map((h: any) => h.count || 1));
                    const intensity = (hour.count || 0) / maxCount;
                    return (
                      <div 
                        key={index}
                        className="text-center p-3 rounded-lg"
                        style={{ 
                          backgroundColor: `rgba(59, 130, 246, ${Math.max(0.1, intensity)})`,
                          color: intensity > 0.5 ? 'white' : 'inherit'
                        }}
                      >
                        <p className="text-xs font-medium">{index + 8}h</p>
                        <p className="text-lg font-bold">{hour.count || 0}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Produits les plus vendus</CardTitle>
              <CardDescription>Top 10 de vos best-sellers</CardDescription>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : topProducts?.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Pas encore de données</p>
              ) : (
                <div className="space-y-3">
                  {topProducts?.slice(0, 10).map((product: any, index: number) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{product.totalSold}</p>
                        <p className="text-sm text-gray-500">vendus</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
