import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Reservation {
  id: string;
  title: string;
  start: Date;
  end: Date;
  customerName: string;
  numberOfPeople: number;
  phone?: string;
  email?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
}

type ViewType = 'day' | 'week' | 'month';

interface WebhookResponse {
  reservations: {
    id: string;
    customerName: string;
    datetime: string;
    duration: number;
    numberOfPeople: number;
    phone?: string;
    email?: string;
    status: 'confirmed' | 'pending' | 'cancelled';
    notes?: string;
  }[];
}

export const useReservationsConfig = (view: ViewType, passedUserId?: string) => {
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!passedUserId) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) setAuthUserId(data.user.id);
      });
    }
  }, [passedUserId]);

  const targetUserId = passedUserId || authUserId || '';

  // Hardcoded webhook URL for all reservations
  const webhookUrl = 'https://n8n.chatfood.fr/webhook/full-reservations-mois-chatfood-demo';

  // Fetch reservations from webhook
  const { data: reservations = [], isLoading, error, refetch } = useQuery({
    queryKey: ['reservations', targetUserId, view, webhookUrl],
    queryFn: async () => {
      if (!webhookUrl) return [];

      try {
        const response = await fetch(webhookUrl);
        if (!response.ok) {
          console.error('Webhook error:', response.status);
          return [];
        }

        const data = await response.json();
        console.log('📅 Webhook response:', data);
        console.log('📅 Is array?', Array.isArray(data));
        console.log('📅 Has start.dateTime?', (data as any)?.start?.dateTime);
        
        // Handle multiple formats: Google Calendar (single event or array), new format, old format
        let reservationsArray: any[] = [];
        // Case 1: Single Google Calendar event object
        if (data && !Array.isArray(data) && (data as any).start?.dateTime) {
          console.warn('Événement Google Calendar unique détecté - conversion automatique');
          reservationsArray = [data];
        } else if (Array.isArray(data)) {
          // Case 2: Array (could be Google Calendar events array or our standard format)
          reservationsArray = data;
        } else if (data.reservations && Array.isArray(data.reservations)) {
          // Case 3: { reservations: [...] }
          reservationsArray = data.reservations;
        } else {
          console.error('Format webhook invalide:', data);
          return [];
        }
        
        // Transform webhook response to Reservation format
        return reservationsArray
          .map((res: any) => {
            try {
              // Detect Google Calendar format (has start.dateTime)
              if (res.start?.dateTime) {
                console.warn('Format Google Calendar détecté - conversion automatique');
                
                const start = new Date(res.start.dateTime);
                const end = new Date(res.end?.dateTime || res.start.dateTime);
                
                // Validate dates
                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                  console.error('Invalid dates in reservation:', res);
                  return null;
                }
                
                const duration = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
                
                // Extract info from description
                const desc = res.description || '';
                const nameMatch = desc.match(/Client:\s*(.+?)(?:\s+Téléphone|$)/i);
                const phoneMatch = desc.match(/Téléphone:\s*([+\d][\d\s]+)/i);
                const peopleMatch = desc.match(/Personnes:\s*(\d+)/i);
                
                const customerName = nameMatch?.[1]?.trim() || 'Client';
                const phone = phoneMatch?.[1]?.trim();
                const numberOfPeople = parseInt(peopleMatch?.[1] || '2', 10);
                
                // Map status
                let status: 'confirmed' | 'pending' | 'cancelled' = 'pending';
                if (res.status === 'cancelled') {
                  status = 'cancelled';
                } else if (res.status === 'confirmed') {
                  status = 'confirmed';
                }
                
                return {
                  id: res.id,
                  title: `${customerName} (${numberOfPeople} pers.)`,
                  start,
                  end,
                  customerName,
                  numberOfPeople,
                  phone: phone || undefined,
                  email: res.creator?.email || undefined,
                  status,
                  notes: res.summary || undefined,
                } as Reservation;
              } 
              
              // Standard format (datetime/duration)
              if (res.datetime) {
                const start = new Date(res.datetime);
                const end = new Date(start.getTime() + (res.duration || 60) * 60000);
                
                // Validate dates
                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                  console.error('Invalid dates in reservation:', res);
                  return null;
                }

                return {
                  id: res.id,
                  title: `${res.customerName || 'Client'} (${res.numberOfPeople || 2} pers.)`,
                  start,
                  end,
                  customerName: res.customerName || 'Client',
                  numberOfPeople: res.numberOfPeople || 2,
                  phone: res.phone || undefined,
                  email: res.email || undefined,
                  status: res.status || 'pending',
                  notes: res.notes || undefined,
                } as Reservation;
              }
              
              console.error('Unknown reservation format:', res);
              return null;
            } catch (err) {
              console.error('Error transforming reservation:', err, res);
              return null;
            }
          })
          .filter((res): res is Reservation => res !== null);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        return [];
      }
    },
    enabled: !!webhookUrl && !!targetUserId,
  });

  return {
    reservations,
    isLoading,
    error,
    hasWebhook: !!webhookUrl,
    refetch,
  };
};
