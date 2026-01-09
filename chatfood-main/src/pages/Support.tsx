import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LifeBuoy, Send, Clock, CheckCircle2, AlertCircle, MessageCircle, Star } from 'lucide-react';
import { createTicketSchema, CreateTicketInput, ticketTypes } from '@/schemas/support';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { useTicketMessages } from '@/hooks/useTicketMessages';
import { useTicketReviews } from '@/hooks/useTicketReviews';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { TicketConversation } from '@/components/support/TicketConversation';
import { ReviewDialog } from '@/components/support/ReviewDialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Support() {
  const { tickets, loading, unreadCount, createTicket, refreshTickets } = useSupportTickets();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  
  const { messages, loading: messagesLoading, sendMessage } = useTicketMessages(selectedTicket?.id);
  const { submitReview, reopenTicket } = useTicketReviews();

  const form = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      ticket_type: '',
      subject: '',
      description: '',
      priority: 'normal'
    }
  });

  const onSubmit = async (data: CreateTicketInput) => {
    try {
      const success = await createTicket(data);
      if (success) {
        form.reset();
      }
    } catch (error: any) {
      console.error('[Support] Unexpected error in onSubmit:', error);
      // createTicket already shows toast, but ensure form isn't stuck
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    
    const success = await sendMessage(newMessage, 'user');
    if (success) {
      setNewMessage('');
    }
  };

  const handleCloseTicket = () => {
    if (selectedTicket?.awaiting_review) {
      setShowReviewDialog(true);
    } else {
      setSelectedTicket(null);
    }
  };

  const getStatusBadge = (status: string, awaitingReview: boolean) => {
    if (awaitingReview) {
      return (
        <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600">
          <Star className="h-3 w-3" />
          En attente d'évaluation
        </Badge>
      );
    }

    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      open: { variant: 'default', icon: Clock, label: 'Ouvert' },
      awaiting_admin: { variant: 'default', icon: Clock, label: 'En attente' },
      awaiting_user: { variant: 'destructive', icon: MessageCircle, label: '🔴 Nouvelle réponse' },
      in_progress: { variant: 'secondary', icon: AlertCircle, label: 'En cours' },
      resolved: { variant: 'outline', icon: CheckCircle2, label: 'Résolu' },
      closed: { variant: 'outline', icon: CheckCircle2, label: 'Fermé' }
    };
    const config = variants[status] || variants.open;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    return priority === 'high' ? (
      <Badge variant="destructive">Haute</Badge>
    ) : (
      <Badge variant="secondary">Normale</Badge>
    );
  };

  const getTicketTypeLabel = (type: string) => {
    return ticketTypes.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="container mx-auto py-4 md:py-8 px-4 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-lg">
            <LifeBuoy className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Besoin d'aide ?</h1>
            <p className="text-sm md:text-base text-muted-foreground">Contactez notre équipe support</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="md:ml-auto w-fit">
            {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
          </Badge>
        )}
      </div>

      <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
        {/* Create Ticket Form */}
        <Card>
          <CardHeader>
            <CardTitle>Créer un nouveau ticket</CardTitle>
            <CardDescription>
              Décrivez votre problème en détail. Notre équipe vous répondra rapidement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                <FormField
                  control={form.control}
                  name="ticket_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de problème</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ticketTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sujet</FormLabel>
                      <FormControl>
                        <Input placeholder="Résumé court de votre problème" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description détaillée</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez votre problème en détail. Plus vous donnez d'informations, plus vite nous pourrons vous aider !"
                          className="min-h-[150px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className={field.value.length > 0 && field.value.length < 20 ? "text-destructive font-medium" : ""}>
                        Minimum 20 caractères - Soyez le plus précis possible
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priorité</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="normal">Normale</SelectItem>
                          <SelectItem value="high">Haute (urgent)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                  <Send className="mr-2 h-4 w-4" />
                  {form.formState.isSubmitting ? 'Envoi en cours...' : 'Envoyer le ticket'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* My Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>Mes tickets</CardTitle>
            <CardDescription>
              Historique de vos demandes de support
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Chargement...
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <LifeBuoy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun ticket pour le moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-3 md:p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {getStatusBadge(ticket.status, ticket.awaiting_review)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                        <h4 className="font-medium truncate">{ticket.subject}</h4>
                        <p className="text-sm text-muted-foreground">
                          {getTicketTypeLabel(ticket.ticket_type)}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground sm:text-right whitespace-nowrap">
                        {format(new Date(ticket.last_message_at || ticket.created_at), 'dd MMM yyyy', { locale: fr })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ticket Conversation Dialog */}
      <Dialog open={!!selectedTicket && !showReviewDialog} onOpenChange={handleCloseTicket}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Conversation - {selectedTicket?.subject}</DialogTitle>
            <DialogDescription>
              Ticket #{selectedTicket?.id.slice(0, 8)} • {getTicketTypeLabel(selectedTicket?.ticket_type)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="flex-1 flex flex-col gap-4 min-h-0">
              <div className="flex gap-2">
                {getStatusBadge(selectedTicket.status, selectedTicket.awaiting_review)}
                {getPriorityBadge(selectedTicket.priority)}
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-1">Description initiale</h4>
                <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              <div className="flex-1 min-h-0 border rounded-lg bg-background">
                <TicketConversation messages={messages} loading={messagesLoading} />
              </div>

              {!selectedTicket.awaiting_review && selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                <DialogFooter className="flex-row gap-2 sm:gap-2">
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Écrivez votre message..."
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </DialogFooter>
              )}

              {selectedTicket.awaiting_review && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3 text-center">
                    Notre équipe a marqué ce ticket comme résolu
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => setShowReviewDialog(true)} size="sm">
                      <Star className="h-4 w-4 mr-2" />
                      Évaluer le support
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        const success = await reopenTicket(selectedTicket.id);
                        if (success) {
                          setSelectedTicket(null);
                          await refreshTickets();
                        }
                      }}
                    >
                      Rouvrir la discussion
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      {selectedTicket && (
        <ReviewDialog
          open={showReviewDialog}
          onClose={() => {
            setShowReviewDialog(false);
            setSelectedTicket(null);
          }}
          onSubmit={async (rating, comment) => {
            const success = await submitReview(selectedTicket.id, rating, comment);
            if (success) {
              setShowReviewDialog(false);
              setSelectedTicket(null);
              await refreshTickets();
            }
          }}
        />
      )}
    </div>
  );
}
