import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, PackageOpen, Bell, BellOff } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useOrderNotification } from '@/hooks/useOrderNotification';
import { OrderCard } from './OrderCard';
import { OrdersHistory } from './OrdersHistory';
import { OrdersStats } from './OrdersStats';
import { CustomerReviewsCard } from './CustomerReviewsCard';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';
import { useWhatsAppIntegration } from '@/hooks/useWhatsAppIntegration';
import { useSubscription } from '@/hooks/useSubscription';

interface OrdersPanelProps {
  userId: string;
  userPlan?: string;
}

export const OrdersPanel: React.FC<OrdersPanelProps> = ({ userId, userPlan }) => {
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'stats' | 'reviews'>('current');
  const effectiveUserId = userId;
  
  const { canAccessOrderStats, canAccessCustomerReviews } = useSubscription(userPlan);
  
  const {
    isLoading,
    products,
    getPendingOrders,
    getTodayOrders,
    getOrdersHistory,
    getTodayRevenue,
    getAveragePreparationTime,
    updateOrderStatus,
    isUpdating,
  } = useOrders(effectiveUserId);

  const { settings } = useRestaurantSettings(effectiveUserId);
  const { integration } = useWhatsAppIntegration(effectiveUserId);

  const pendingOrders = getPendingOrders();
  const allOrders = [...getPendingOrders(), ...getOrdersHistory()];
  
  // Notification sonore pour nouvelles commandes
  const { notificationEnabled, toggleNotification } = useOrderNotification(allOrders);
  const todayOrders = getTodayOrders();
  const historyOrders = getOrdersHistory();
  const todayRevenue = getTodayRevenue();
  const avgPrepTime = getAveragePreparationTime();

  // Calculate number of tabs for grid layout
  const tabCount = 2 + (canAccessOrderStats ? 1 : 0) + (canAccessCustomerReviews ? 1 : 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <TabsList className={`flex flex-wrap h-auto gap-1 w-full sm:max-w-lg sm:flex-nowrap ${tabCount === 2 ? 'sm:grid sm:grid-cols-2' : tabCount === 3 ? 'sm:grid sm:grid-cols-3' : 'sm:grid sm:grid-cols-4'}`}>
            <TabsTrigger value="current" className="relative text-sm">
              <span className="hidden sm:inline">En cours</span>
              <span className="sm:hidden">En cours</span>
              {pendingOrders.length > 0 && (
                <Badge className="ml-1 sm:ml-2 bg-primary text-xs" variant="default">
                  {pendingOrders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="text-sm">
              Historique
            </TabsTrigger>
            {canAccessOrderStats && (
              <TabsTrigger value="stats" className="text-sm">
                <span className="hidden sm:inline">Statistiques</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
            )}
            {canAccessCustomerReviews && (
              <TabsTrigger value="reviews" className="text-sm">
                <span className="hidden sm:inline">Avis Clients</span>
                <span className="sm:hidden">Avis</span>
              </TabsTrigger>
            )}
          </TabsList>
        
          <Button
            variant="outline"
            size="sm"
            onClick={toggleNotification}
            className="shrink-0 w-full sm:w-auto"
            title={notificationEnabled ? 'Désactiver les notifications sonores' : 'Activer les notifications sonores'}
          >
            {notificationEnabled ? (
              <><Bell className="h-4 w-4 mr-1" /> <span>Son activé</span></>
            ) : (
              <><BellOff className="h-4 w-4 mr-1" /> <span>Son désactivé</span></>
            )}
          </Button>
        </div>

        <TabsContent value="current" className="space-y-4 mt-6">
          {pendingOrders.length === 0 ? (
            <div className="text-center py-12">
              <PackageOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune commande en cours</h3>
              <p className="text-muted-foreground">
                Les nouvelles commandes apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={(orderId, newStatus) => updateOrderStatus({ orderId, newStatus })}
                  isUpdating={isUpdating}
                  manualOrderConfirmation={settings?.manual_order_confirmation ?? false}
                  restaurantName={settings?.restaurant_name ?? ''}
                  restaurantPhone={integration?.display_phone_number ?? ''}
                  phoneNumberId={integration?.phone_number_id ?? settings?.phone_number_id ?? ''}
                  whatsappBusinessId={integration?.waba_id ?? settings?.whatsapp_business_id ?? ''}
                  accessToken={integration?.access_token ?? settings?.whatsapp_access_token ?? ''}
                  userId={effectiveUserId ?? ''}
                  products={products}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <OrdersHistory orders={historyOrders} />
        </TabsContent>

        {canAccessOrderStats && (
          <TabsContent value="stats" className="mt-6">
            <OrdersStats
              todayOrders={todayOrders}
              todayRevenue={todayRevenue}
              averagePreparationTime={avgPrepTime}
            />
          </TabsContent>
        )}

        {canAccessCustomerReviews && (
          <TabsContent value="reviews" className="mt-6">
            <CustomerReviewsCard userId={effectiveUserId} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
