import React, { useState, useEffect, useRef } from 'react';
import { useConversations } from '@/hooks/useConversations';
import { useAuth } from '@/contexts/AuthContext';
import { ConversationMessage } from './ConversationMessage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, Loader2, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConversationsWidgetProps {
  sectionId?: string;
}

export const ConversationsWidget: React.FC<ConversationsWidgetProps> = ({
  sectionId = 'conversations',
}) => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const userId = profile?.user_id || '';
  const { conversations, isLoading, isRefreshing, error, refetch } = useConversations();

  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<{
    id: string;
    body: string;
    created_at: string;
    to_number: string;
  }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-select first conversation on desktop only
  useEffect(() => {
    if (conversations.length > 0 && !selectedNumber && window.innerWidth >= 768) {
      setSelectedNumber(conversations[0].number);
    }
  }, [conversations, selectedNumber]);

  // Auto-scroll to bottom when conversation changes or pending messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedNumber, conversations, pendingMessages]);

  const selectedConversation = conversations.find(
    (conv) => conv.number === selectedNumber
  );

  // Get pending messages for the selected conversation
  const conversationPendingMessages = pendingMessages.filter(
    (pm) => pm.to_number === selectedNumber
  );

  const handleSelectConversation = (number: string) => {
    setSelectedNumber(number);
    setShowChatOnMobile(true);
  };

  const handleBackToList = () => {
    setShowChatOnMobile(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation || isSending) return;

    const sentText = messageInput.trim();
    const tempId = `pending-${Date.now()}`;

    // Create pending message for optimistic update
    const tempMessage = {
      id: tempId,
      body: sentText,
      created_at: new Date().toISOString(),
      to_number: selectedConversation.number,
    };
    // Immediately add to pending messages and clear input
    setPendingMessages(prev => [...prev, tempMessage]);
    setMessageInput('');

    setIsSending(true);
    try {
      // Fetch restaurant settings for webhook payload
      const { data: restaurantSettings } = await supabase
        .from('restaurant_settings')
        .select('phone_number_id, whatsapp_business_id, restaurant_name')
        .eq('user_id', effectiveUserId)
        .single();

      // Call n8n webhook with all required info
      const response = await fetch('https://n8n.chatfood.fr/webhook/send-whatsapp-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_number: selectedConversation.number,
          message: sentText,
          phone_number_id: restaurantSettings?.phone_number_id,
          whatsapp_business_id: restaurantSettings?.whatsapp_business_id,
          restaurant_name: restaurantSettings?.restaurant_name,
          user_id: effectiveUserId,
          customer_name: selectedConversation.name,
        }),
      });

      if (!response.ok) throw new Error('Erreur webhook');

      toast({ title: 'Message envoyé' });
      
      // Refresh conversations after 1.5s and remove pending message
      setTimeout(() => {
        refetch().then(() => {
          setPendingMessages(prev => prev.filter(m => m.id !== tempId));
        });
      }, 1500);
    } catch (err) {
      console.error('Send message error:', err);
      // Remove pending message and restore input on error
      setPendingMessages(prev => prev.filter(m => m.id !== tempId));
      setMessageInput(sentText);
      toast({ 
        title: 'Erreur', 
        description: "Impossible d'envoyer le message", 
        variant: 'destructive' 
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }


  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground text-center">
          Impossible de charger les conversations. Vérifiez la configuration.
        </p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-2" />
        <p className="text-muted-foreground">Aucune conversation pour le moment</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] border rounded-lg overflow-hidden bg-background w-full">
      {/* Conversations Panel */}
      <div className={`${showChatOnMobile ? 'hidden' : 'block'} w-full md:block md:w-[280px] lg:w-[320px] border-b md:border-b-0 md:border-r bg-background h-full`}>
        <div className="h-full overflow-y-auto">
          <div className="p-2 space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv.number}
                onClick={() => handleSelectConversation(conv.number)}
                className={`w-full text-left p-2 sm:p-3 rounded-lg transition-colors hover:bg-muted/50 overflow-hidden ${
                  selectedNumber === conv.number ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3 w-full">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold flex-shrink-0 text-sm sm:text-base">
                    {conv.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 grid gap-0.5">
                    <div className="flex justify-between items-center gap-2 w-full">
                      <p className="font-medium text-sm truncate">{conv.name}</p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                        {new Date(conv.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate block w-full">
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className={`${!showChatOnMobile ? 'hidden' : 'flex'} md:flex flex-col flex-1 h-full`}>
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-3 md:p-4 border-b bg-green-600 text-white">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden text-white hover:bg-white/20 -ml-2"
                  onClick={handleBackToList}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </Button>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 flex items-center justify-center font-semibold flex-shrink-0">
                    {selectedConversation.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{selectedConversation.name}</p>
                    <p className="text-xs text-white/80 flex items-center gap-1">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span className="truncate max-w-[120px] sm:max-w-none">
                        +{selectedConversation.number.toString().replace(/(\d{2})(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5 $6')}
                      </span>
                    </p>
                  </div>
                </div>
                {isRefreshing && (
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/80">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Actualisation...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
              <div className="space-y-2">
                {selectedConversation.messages.map((msg, idx) => (
                  <ConversationMessage
                    key={`${msg.id}-${idx}`}
                    message={msg.body}
                    time={msg.created_at}
                    status={msg.status}
                    name={selectedConversation.name}
                    messageType={msg.message_type}
                  />
                ))}
                {/* Pending messages (optimistic update) */}
                {conversationPendingMessages.map((pm) => (
                  <ConversationMessage
                    key={pm.id}
                    message={pm.body}
                    time={pm.created_at}
                    status="send"
                    name={selectedConversation.name}
                    messageType="text"
                    isPending
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input Footer */}
            <div className="p-3 border-t bg-background">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Écrire un message..."
                  className="flex-1"
                  disabled={isSending}
                />
                <Button 
                  type="submit" 
                  disabled={!messageInput.trim() || isSending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="hidden md:flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              Sélectionnez une conversation
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
