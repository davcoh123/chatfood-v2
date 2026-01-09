import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  from_number: string;
  to_number: string;
  customer_name: string;
  created_at: string;
  message_type: string;
  body: string;
  status: 'send' | 'receive';
}

export interface Conversation {
  number: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  messages: Message[];
}

export const useConversations = (passedUserId?: string) => {
  const { toast } = useToast();
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!passedUserId) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) setAuthUserId(data.user.id);
      });
    }
  }, [passedUserId]);

  const userId = passedUserId || authUserId || '';

  const { data, isLoading, error, refetch } = useQuery<{ conversations: Conversation[] }>({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      if (!userId) return { conversations: [] };

      const { data: messages, error } = await supabase
        .from('chatbot_messages')
        .select('id, from_number, to_number, customer_name, created_at, message_type, body, status')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }

      if (!messages || messages.length === 0) return { conversations: [] };

      // Group messages by customer phone number using status field
      const conversationsMap: Record<string, {
        customerPhone: string;
        customerName: string;
        messages: Message[];
      }> = {};

      for (const msg of messages) {
        // Use status field to determine direction:
        // - status: "send" → message sent BY the bot (customer is in to_number)
        // - status: "receive" → message received FROM the client (customer is in from_number)
        const isSentByBot = msg.status === 'send';
        const customerPhone = isSentByBot ? msg.to_number : msg.from_number;

        if (!conversationsMap[customerPhone]) {
          conversationsMap[customerPhone] = {
            customerPhone,
            customerName: 'Client',
            messages: [],
          };
        }

        conversationsMap[customerPhone].messages.push({
          id: msg.id,
          from_number: msg.from_number,
          to_number: msg.to_number,
          customer_name: msg.customer_name || 'Client',
          created_at: msg.created_at,
          message_type: msg.message_type,
          body: msg.body || '',
          status: (msg.status === 'send' ? 'send' : 'receive') as 'send' | 'receive',
        });

        // Update customer name ONLY from received messages (messages FROM the client)
        // and ignore names containing "chatfood" (which are bot sender names)
        if (!isSentByBot && msg.customer_name && !msg.customer_name.toLowerCase().includes('chatfood')) {
          conversationsMap[customerPhone].customerName = msg.customer_name;
        }
      }

      // Convert to conversation list
      const conversationsList = Object.values(conversationsMap).map((conv) => {
        const lastMsg = conv.messages[conv.messages.length - 1];
        return {
          number: conv.customerPhone,
          name: conv.customerName,
          lastMessage: lastMsg?.body || '',
          lastMessageTime: lastMsg?.created_at || '',
          messages: conv.messages,
        };
      });

      // Sort by last message (most recent first)
      const sortedConversations = conversationsList.sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

      return { conversations: sortedConversations };
    },
    enabled: !!userId,
    refetchInterval: 30000,
  });

  return {
    conversations: data?.conversations ?? [],
    isLoading,
    isRefreshing: false,
    error,
    refetch,
  };
};
