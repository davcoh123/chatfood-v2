import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Package, Truck, Home, CalendarClock, MessageCircle, Check, X } from 'lucide-react';
import { Order, OrderItem } from '@/hooks/useOrders';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CancelOrderDialog } from './CancelOrderDialog';
import { SendMessageDialog } from './SendMessageDialog';

interface ProductInfo {
  id: string;
  name: string;
  category: string;
}

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, newStatus: string) => void;
  isUpdating?: boolean;
  manualOrderConfirmation?: boolean;
  restaurantName?: string;
  restaurantPhone?: string;
  phoneNumberId?: string;
  whatsappBusinessId?: string;
  accessToken?: string;
  userId?: string;
  products?: ProductInfo[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'En attente', color: 'bg-yellow-500', icon: '🟡' },
  confirmed: { label: 'Confirmée', color: 'bg-green-500', icon: '🟢' },
  preparing: { label: 'En préparation', color: 'bg-blue-500', icon: '🔵' },
  ready: { label: 'Prête', color: 'bg-purple-500', icon: '🟣' },
  delivered: { label: 'Récupérée', color: 'bg-muted', icon: '✅' },
  cancelled: { label: 'Annulée', color: 'bg-red-500', icon: '🔴' },
};

const ORDER_TYPE_CONFIG: Record<string, { label: string; icon: typeof Truck }> = {
  scheduled_takeaway: { label: 'À emporter (programmé)', icon: Package },
  immediate_takeaway: { label: 'À emporter', icon: Package },
  delivery: { label: 'Livraison', icon: Truck },
  dine_in: { label: 'Sur place', icon: Home },
};

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onUpdateStatus,
  isUpdating,
  restaurantName = '',
  restaurantPhone = '',
  phoneNumberId = '',
  whatsappBusinessId = '',
  accessToken = '',
  userId = '',
  products = [],
}) => {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const orderTypeConfig = ORDER_TYPE_CONFIG[order.commande_type] || ORDER_TYPE_CONFIG.immediate_takeaway;
  const OrderTypeIcon = orderTypeConfig.icon;

  // Formater la date de commande
  const formatOrderDate = () => {
    try {
      return format(new Date(order.heure_de_commande), 'dd/MM à HH:mm', { locale: fr });
    } catch {
      return '';
    }
  };

  // Formater l'heure de récupération
  const formatPickupTime = () => {
    if (!order.horaire_recup) return null;
    try {
      return format(new Date(order.horaire_recup), 'HH:mm', { locale: fr });
    } catch {
      return null;
    }
  };

  // Récupérer la catégorie d'un produit
  const getProductCategory = (productId: string): string | null => {
    const product = products.find(p => p.id === productId);
    return product?.category || null;
  };

  // Formater l'affichage d'un item: "qty x Catégorie - Nom"
  const formatItemDisplay = (item: OrderItem): string => {
    const category = item.product_id ? getProductCategory(item.product_id) : null;
    if (category) {
      return `${item.qty}x ${category} - ${item.name}`;
    }
    return `${item.qty}x ${item.name}`;
  };

  const handleMarkAsDelivered = () => {
    onUpdateStatus(order.id, 'delivered');
  };

  const handleConfirmCancel = () => {
    onUpdateStatus(order.id, 'cancelled');
  };

  const pickupTimeFormatted = formatPickupTime();
  const orderDateFormatted = formatOrderDate();

  return (
    <>
      <Card className="border-2 hover:border-primary/30 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base sm:text-lg font-bold truncate">{order.name}</span>
                  <Badge className={`${statusConfig.color} text-xs sm:text-sm`}>
                    {statusConfig.icon} {statusConfig.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-muted-foreground">
                  <span>Commandé le {orderDateFormatted}</span>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right flex sm:block items-center justify-between sm:justify-start gap-2">
              <div className="text-xl sm:text-2xl font-bold text-primary">{order.price_total.toFixed(2)}€</div>
              <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground sm:justify-end">
                <OrderTypeIcon className="h-3 w-3" />
                <span>{orderTypeConfig.label}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Heure de récupération */}
          {pickupTimeFormatted && (
            <div className="flex items-center gap-2 text-sm bg-primary/10 rounded-lg p-2 font-medium">
              <CalendarClock className="h-4 w-4 text-primary" />
              <span>Récupération prévue : {pickupTimeFormatted}</span>
            </div>
          )}

          {/* Note */}
          {order.note && (
            <div className="text-sm bg-amber-500/10 rounded-lg p-2 text-amber-700 dark:text-amber-300">
              📝 {order.note}
            </div>
          )}

          {/* Client info */}
          <div className="flex items-center gap-2 text-sm">
            <div className="font-semibold">{order.name}</div>
            <a 
              href={`https://wa.me/${order.phone.replace('+', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <Phone className="h-3 w-3" />
              {order.phone}
            </a>
          </div>

          {/* Items */}
          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
            {order.commande_item.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{formatItemDisplay(item)}</span>
                  <span className="text-muted-foreground">{parseFloat(item.line_total).toFixed(2)}€</span>
                </div>
                {/* Addons */}
                {item.addons && item.addons.length > 0 && (
                  <div className="pl-4 text-xs text-muted-foreground">
                    {item.addons.map((addon, i) => (
                      <div key={i} className="flex justify-between">
                        <span>+ {addon.label}</span>
                        <span>+{parseFloat(addon.price).toFixed(2)}€</span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Menu choices */}
                {item.menu_choices && Object.values(item.menu_choices).some(v => v) && (
                  <div className="pl-4 text-xs text-muted-foreground">
                    {Object.entries(item.menu_choices).map(([key, value]) => (
                      value && <div key={key}>• Choix: {value}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions : Récupérée + Annuler + Message */}
          {!['delivered', 'cancelled'].includes(order.status) && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={handleMarkAsDelivered}
                disabled={isUpdating}
              >
                <Check className="h-4 w-4 mr-1" />
                Récupérée
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={() => setCancelDialogOpen(true)}
                disabled={isUpdating}
              >
                <X className="h-4 w-4 mr-1" />
                Annuler
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => setMessageDialogOpen(true)}
                title="Envoyer un message"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CancelOrderDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        customerName={order.name}
        customerPhone={order.phone}
        restaurantName={restaurantName}
        restaurantPhone={restaurantPhone}
        phoneNumberId={phoneNumberId}
        whatsappBusinessId={whatsappBusinessId}
        accessToken={accessToken}
        userId={userId}
        onConfirmCancel={handleConfirmCancel}
      />

      <SendMessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
        customerName={order.name}
        customerPhone={order.phone}
        restaurantPhone={restaurantPhone}
        phoneNumberId={phoneNumberId}
        whatsappBusinessId={whatsappBusinessId}
        accessToken={accessToken}
        userId={userId}
      />
    </>
  );
};
