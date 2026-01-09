import { useCustomerAnalytics } from '@/hooks/useCustomerAnalytics';
import { useSatisfactionAnalytics } from '@/hooks/useSatisfactionAnalytics';
import { useConversionTimeAnalytics } from '@/hooks/useConversionTimeAnalytics';
import { useAnalyticsExport } from '@/hooks/useAnalyticsExport';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Star, Clock, TrendingUp, FileText, FileSpreadsheet, ArrowLeft, UserCheck, UserX } from 'lucide-react';

export default function CustomersAnalyticsPage() {
  const { 
    totalCustomers, newCustomers, retentionRate, returningCustomers,
    customersByMonth, isLoading 
  } = useCustomerAnalytics();
  const { averageRating, totalReviews, ratingDistribution, isLoading: satisfactionLoading } = useSatisfactionAnalytics();
  const { averageConversionTime, conversionByHour, isLoading: conversionLoading } = useConversionTimeAnalytics();
  const { exportPDF, exportExcel, isExporting } = useAnalyticsExport();

  return (
    <div className="space-y-6">
      <a href="/dashboard/analytics" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" />
        Retour aux analytics
      </a>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Métriques Client</h1>
          <p className="text-gray-500">Rétention, satisfaction et comportement de vos clients</p>
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
              <p className="text-sm text-gray-500">Total clients</p>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <p className="text-2xl font-bold text-blue-600">{totalCustomers}</p>
            )}
            <p className="text-xs text-gray-400">+{newCustomers} ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Taux de rétention</p>
              <UserCheck className="h-4 w-4 text-green-600" />
            </div>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <p className="text-2xl font-bold text-green-600">{retentionRate}%</p>
            )}
            <p className="text-xs text-gray-400">{returningCustomers} clients fidèles</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Satisfaction</p>
              <Star className="h-4 w-4 text-amber-500" />
            </div>
            {satisfactionLoading ? <Skeleton className="h-8 w-16" /> : (
              <p className="text-2xl font-bold text-amber-500">{averageRating}/5</p>
            )}
            <p className="text-xs text-gray-400">{totalReviews} avis</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Temps conversion</p>
              <Clock className="h-4 w-4 text-purple-600" />
            </div>
            {conversionLoading ? <Skeleton className="h-8 w-16" /> : (
              <p className="text-2xl font-bold text-purple-600">{averageConversionTime}min</p>
            )}
            <p className="text-xs text-gray-400">En moyenne</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="retention" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="retention">Rétention</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        <TabsContent value="retention">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des clients</CardTitle>
              <CardDescription>Nouveaux clients vs clients fidèles par mois</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10" />)}
                </div>
              ) : customersByMonth?.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Pas encore de données</p>
              ) : (
                <div className="space-y-4">
                  {customersByMonth?.slice(-6).map((month: any, index: number) => (
                    <div key={index} className="flex items-center gap-4">
                      <span className="w-24 text-sm text-gray-500">{month.month}</span>
                      <div className="flex-1 flex gap-2">
                        <div 
                          className="h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs"
                          style={{ width: `${Math.max(20, month.newPercentage || 50)}%` }}
                        >
                          {month.new} nouveaux
                        </div>
                        <div 
                          className="h-8 bg-green-500 rounded flex items-center justify-center text-white text-xs"
                          style={{ width: `${Math.max(20, month.returningPercentage || 50)}%` }}
                        >
                          {month.returning} fidèles
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="satisfaction">
          <Card>
            <CardHeader>
              <CardTitle>Distribution des avis</CardTitle>
              <CardDescription>Répartition des notes clients</CardDescription>
            </CardHeader>
            <CardContent>
              {satisfactionLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = ratingDistribution?.[rating] || 0;
                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-4">
                        <div className="flex items-center gap-1 w-16">
                          {[...Array(rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-400 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-sm text-gray-500">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion">
          <Card>
            <CardHeader>
              <CardTitle>Temps de conversion par heure</CardTitle>
              <CardDescription>Durée moyenne entre première visite et commande</CardDescription>
            </CardHeader>
            <CardContent>
              {conversionLoading ? (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-16" />)}
                </div>
              ) : (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {conversionByHour?.slice(8, 23).map((hour: any, index: number) => {
                    const maxTime = Math.max(...(conversionByHour?.map((h: any) => h.avgTime) || [1]));
                    const intensity = (hour.avgTime || 0) / maxTime;
                    return (
                      <div 
                        key={index}
                        className="text-center p-3 rounded-lg"
                        style={{ 
                          backgroundColor: `rgba(147, 51, 234, ${Math.max(0.1, intensity)})`,
                          color: intensity > 0.5 ? 'white' : 'inherit'
                        }}
                      >
                        <p className="text-xs font-medium">{index + 8}h</p>
                        <p className="text-lg font-bold">{hour.avgTime || 0}min</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
