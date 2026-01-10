import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { OrdersPanel } from '@/components/dashboard/OrdersPanel';

const Orders = () => {
  const { profile } = useAuth();
  
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Commandes</h1>
        <p className="text-muted-foreground mt-2">
          Gérez vos commandes
        </p>
      </div>
      
      <OrdersPanel userId={profile?.user_id} />
    </div>
  );
};

export default Orders;
