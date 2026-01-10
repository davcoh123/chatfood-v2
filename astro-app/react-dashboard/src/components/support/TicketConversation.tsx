import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { TicketMessage } from '@/hooks/useTicketMessages';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface TicketConversationProps {
  messages: TicketMessage[];
  loading?: boolean;
}

export const TicketConversation = ({ messages, loading }: TicketConversationProps) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        Aucun message pour le moment
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 max-h-[400px] overflow-y-auto">
      {messages.map((message) => {
        const isOwnMessage = message.sender_id === user?.id;
        const isAdmin = message.sender_type === 'admin';

        return (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              isOwnMessage ? "flex-row-reverse" : "flex-row"
            )}
          >
            <Avatar className={cn(
              "h-8 w-8 shrink-0",
              isAdmin ? "bg-primary/10" : "bg-secondary"
            )}>
              <AvatarFallback className={cn(
                "text-xs",
                isAdmin ? "text-primary" : "text-secondary-foreground"
              )}>
                {isAdmin ? "AD" : "US"}
              </AvatarFallback>
            </Avatar>

            <div className={cn(
              "flex flex-col gap-1 max-w-[70%]",
              isOwnMessage ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "rounded-lg px-4 py-2",
                isOwnMessage 
                  ? "bg-primary text-primary-foreground" 
                  : isAdmin
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-foreground"
              )}>
                <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
              </div>
              
              <span className="text-xs text-muted-foreground px-2">
                {format(new Date(message.created_at), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
              </span>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
