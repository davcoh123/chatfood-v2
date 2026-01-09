import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Reservation {
  id: string;
  title: string;
  start: Date;
  end: Date;
  customerName: string;
  numberOfPeople: number;
  phone?: string;
  email?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no_show';
  notes?: string;
}

export const useReservations = (passedUserId?: string) => {
  const queryClient = useQueryClient();
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!passedUserId) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) setAuthUserId(data.user.id);
      });
    }
  }, [passedUserId]);

  const userId = passedUserId || authUserId || '';

  // Récupérer les réservations depuis Supabase
  const { data: reservations = [], isLoading, error, refetch } = useQuery({
    queryKey: ['reservations', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('chatbot_reservations')
        .select(`
          *,
          customers (
            name,
            phone
          )
        `)
        .eq('user_id', userId)
        .order('reservation_datetime', { ascending: true });

      if (error) {
        console.error('Error fetching reservations:', error);
        throw error;
      }

      return (data || []).map((res) => {
        const start = new Date(res.reservation_datetime);
        const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 heure par défaut

        return {
          id: res.id,
          title: `${res.customer_name} (${res.number_of_people} pers.)`,
          start,
          end,
          customerName: res.customer_name,
          numberOfPeople: res.number_of_people,
          phone: res.customer_phone,
          email: res.customer_email || undefined,
          status: res.status,
          notes: res.notes || res.special_requests || undefined,
        } as Reservation;
      });
    },
    enabled: !!userId,
    refetchInterval: 60000, // Refresh toutes les minutes
  });

  // Mutation pour créer une réservation via RPC
  const createMutation = useMutation({
    mutationFn: async (reservation: {
      customerName: string;
      customerPhone: string;
      reservationDatetime: string;
      numberOfPeople: number;
      customerEmail?: string;
      specialRequests?: string;
      notes?: string;
    }) => {
      if (!userId) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .rpc('create_reservation', {
          p_user_id: userId,
          p_customer_phone: reservation.customerPhone,
          p_customer_name: reservation.customerName,
          p_reservation_datetime: reservation.reservationDatetime,
          p_number_of_people: reservation.numberOfPeople,
          p_customer_email: reservation.customerEmail || null,
          p_special_requests: reservation.specialRequests || null,
          p_notes: reservation.notes || null,
        });

      if (error) throw error;
      
      const result = data as { success?: boolean; error?: string } | null;
      if (result && !result.success) {
        throw new Error(result.error || 'Erreur de création');
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Réservation créée');
      queryClient.invalidateQueries({ queryKey: ['reservations', userId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Mutation pour mettre à jour le statut via RPC
  const updateStatusMutation = useMutation({
    mutationFn: async ({ 
      reservationId, 
      newStatus 
    }: { 
      reservationId: string; 
      newStatus: Reservation['status'] 
    }) => {
      const { data, error } = await supabase
        .rpc('update_reservation_status', {
          p_reservation_id: reservationId,
          p_status: newStatus,
        });

      if (error) throw error;
      
      const result = data as { success?: boolean; error?: string } | null;
      if (result && !result.success) {
        throw new Error(result.error || 'Erreur de mise à jour');
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Statut mis à jour');
      queryClient.invalidateQueries({ queryKey: ['reservations', userId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    reservations,
    isLoading,
    error,
    hasWebhook: !!userId, // Pour rétrocompatibilité
    refetch,
    createReservation: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateReservationStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
  };
};
