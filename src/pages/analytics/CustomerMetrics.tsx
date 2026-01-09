import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Users, Star, Clock, Heart, FileText, FileSpreadsheet } from 'lucide-react';
import { RetentionChart } from '@/components/analytics/RetentionChart';
import { SatisfactionChart } from '@/components/analytics/SatisfactionChart';
import { ConversionTimeChart } from '@/components/analytics/ConversionTimeChart';
import { useCustomerAnalytics } from '@/hooks/useCustomerAnalytics';
import { useSatisfactionAnalytics } from '@/hooks/useSatisfactionAnalytics';
import { useConversionTimeAnalytics } from '@/hooks/useConversionTimeAnalytics';
import { useAnalyticsExport } from '@/hooks/useAnalyticsExport';

const CustomerMetrics = () => {
  const { retentionRate, loyalCustomers, segments, retentionData, isLoading: customersLoading } = useCustomerAnalytics();
  const { averageRating, ratingChange, ratingsDistribution, isLoading: satisfactionLoading } = useSatisfactionAnalytics();
  const { conversionTimeData, metrics: conversionMetrics, isLoading: conversionLoading } = useConversionTimeAnalytics();
  const { exportPDF, exportExcel, isExporting } = useAnalyticsExport();

  const vipSegment = segments.find(s => s.type === 'vip');
  const regularSegment = segments.find(s => s.type === 'regular');
  const newSegment = segments.find(s => s.type === 'new');

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Métriques Client</h1>
          <p className="text-muted-foreground">Analysez le comportement et la satisfaction de vos clients</p>
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
        <Card className="border-primary/10 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de rétention</CardTitle>
            <Heart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{retentionRate}%</div>
            <p className="text-xs text-muted-foreground">Clients récurrents</p>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-gradient-to-br from-orange-500/5 to-orange-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction moyenne</CardTitle>
            <Star className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{averageRating}/5</div>
            <p className="text-xs text-muted-foreground">{ratingChange >= 0 ? '+' : ''}{ratingChange} vs mois dernier</p>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps conversion</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {conversionLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">
                {conversionMetrics.averageConversionTime > 0 
                  ? `~${Math.round(conversionMetrics.averageConversionTime)}min`
                  : 'N/A'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Premier message → commande</p>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-gradient-to-br from-green-500/5 to-green-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients fidèles</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{loyalCustomers}</div>
            <p className="text-xs text-muted-foreground">3+ commandes</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="retention" className="animate-slide-up animation-delay-200">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="retention">Rétention Client</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
          <TabsTrigger value="conversion">Temps de Conversion</TabsTrigger>
        </TabsList>
        
        <TabsContent value="retention" className="space-y-4 animate-tab-content">
          <Card>
            <CardHeader>
              <CardTitle>Taux de Rétention Client</CardTitle>
              <CardDescription>Évolution de la fidélité de vos clients</CardDescription>
            </CardHeader>
            <CardContent>
              <RetentionChart retentionData={retentionData} isLoading={customersLoading} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="satisfaction" className="space-y-4 animate-tab-content">
          <Card>
            <CardHeader>
              <CardTitle>Taux de Satisfaction Client</CardTitle>
              <CardDescription>Distribution des notes de satisfaction</CardDescription>
            </CardHeader>
            <CardContent>
              <SatisfactionChart satisfactionData={ratingsDistribution} isLoading={satisfactionLoading} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="conversion" className="space-y-4 animate-tab-content">
          <Card>
            <CardHeader>
              <CardTitle>Temps de Conversion</CardTitle>
              <CardDescription>Temps entre premier message et commande</CardDescription>
            </CardHeader>
            <CardContent>
              <ConversionTimeChart data={conversionTimeData} isLoading={conversionLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Customer Segments */}
      <Card className="animate-slide-up animation-delay-300">
        <CardHeader>
          <CardTitle>Segments Clients</CardTitle>
          <CardDescription>Classification par comportement d'achat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-200 dark:border-green-800">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h4 className="font-semibold text-green-700 dark:text-green-300">Clients VIP</h4>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-green-600">{vipSegment?.count || 0}</p>
                  <p className="text-sm text-muted-foreground">10+ commandes, dépense moy: €{vipSegment?.averageSpend || 0}</p>
                  <p className="text-xs text-green-600">{vipSegment?.percentageOfCustomers || 0}% clients, {vipSegment?.percentageOfRevenue || 0}% CA</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-lg border bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-200 dark:border-blue-800">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300">Clients Réguliers</h4>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-blue-600">{regularSegment?.count || 0}</p>
                  <p className="text-sm text-muted-foreground">3-9 commandes, dépense moy: €{regularSegment?.averageSpend || 0}</p>
                  <p className="text-xs text-blue-600">{regularSegment?.percentageOfCustomers || 0}% clients, {regularSegment?.percentageOfRevenue || 0}% CA</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-lg border bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-orange-200 dark:border-orange-800">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <h4 className="font-semibold text-orange-700 dark:text-orange-300">Nouveaux Clients</h4>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-orange-600">{newSegment?.count || 0}</p>
                  <p className="text-sm text-muted-foreground">1-2 commandes, dépense moy: €{newSegment?.averageSpend || 0}</p>
                  <p className="text-xs text-orange-600">{newSegment?.percentageOfCustomers || 0}% clients, {newSegment?.percentageOfRevenue || 0}% CA</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerMetrics;
