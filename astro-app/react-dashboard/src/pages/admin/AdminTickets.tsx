import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useTicketMessages } from '@/hooks/useTicketMessages';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { LifeBuoy, Eye, CheckCircle2, Clock, AlertCircle, MessageCircle, Send, Star } from 'lucide-react';
import { TicketConversation } from '@/components/support/TicketConversation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ticketTypes } from '@/schemas/support';
import { SupportTicket } from '@/hooks/useSupportTickets';

export default function AdminTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { messages, loading: messagesLoading, sendMessage } = useTicketMessages(selectedTicket?.id);

  useEffect(() => {
    fetchTickets();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('admin-tickets')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets'
        },
        () => {
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les tickets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    
    const success = await sendMessage(newMessage, 'admin');
    if (success) {
      setNewMessage('');
    }
  };

  const closeConversation = async () => {
    if (!selectedTicket || !user) return;

    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          status: 'awaiting_review',
          awaiting_review: true,
          resolved_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTicket.id);

      if (error) throw error;

      toast({
        title: "Conversation fermée",
        description: "L'utilisateur va recevoir une demande d'évaluation"
      });

      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      console.error('Error closing conversation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de fermer la conversation",
        variant: "destructive"
      });
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
      open: { variant: 'default', icon: Clock, label: 'Nouveau' },
      awaiting_admin: { variant: 'destructive', icon: MessageCircle, label: '🔴 Réponse requise' },
      awaiting_user: { variant: 'secondary', icon: Clock, label: 'En attente user' },
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
    ) : priority === 'urgent' ? (
      <Badge variant="destructive" className="animate-pulse">Urgent</Badge>
    ) : (
      <Badge variant="secondary">Normale</Badge>
    );
  };

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      starter: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      pro: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      premium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    };
    return (
      <Badge variant="outline" className={colors[plan] || ''}>
        {plan.toUpperCase()}
      </Badge>
    );
  };

  const getTicketTypeLabel = (type: string) => {
    return ticketTypes.find(t => t.value === type)?.label || type;
  };

  const filteredTickets = statusFilter === 'all' 
    ? tickets 
    : statusFilter === 'awaiting_admin'
    ? tickets.filter(t => t.status === 'awaiting_admin' || t.status === 'open')
    : tickets.filter(t => t.status === statusFilter);

  const awaitingAdminCount = tickets.filter(t => t.status === 'awaiting_admin' || t.status === 'open').length;

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-lg">
            <LifeBuoy className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Gestion des Tickets</h1>
            <p className="text-muted-foreground">Support client</p>
          </div>
          {awaitingAdminCount > 0 && (
            <Badge variant="destructive" className="ml-4">
              {awaitingAdminCount} en attente
            </Badge>
          )}
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les tickets</SelectItem>
            <SelectItem value="awaiting_admin">🔴 Réponse requise</SelectItem>
            <SelectItem value="awaiting_user">En attente user</SelectItem>
            <SelectItem value="resolved">Résolus</SelectItem>
            <SelectItem value="closed">Fermés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tickets de support ({filteredTickets.length})</CardTitle>
          <CardDescription>
            Gérez les demandes de support des utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun ticket à afficher
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sujet</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Dernier message</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} className={ticket.status === 'awaiting_admin' ? 'bg-destructive/5' : ''}>
                      <TableCell className="font-medium">
                        {ticket.user_email}
                      </TableCell>
                      <TableCell>
                        {getPlanBadge(ticket.user_plan)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {getTicketTypeLabel(ticket.ticket_type)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">
                          {ticket.subject}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(ticket.priority)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(ticket.status, ticket.awaiting_review)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(ticket.last_message_at || ticket.created_at), 'dd/MM/yy HH:mm', { locale: fr })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Conversation Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Conversation - {selectedTicket?.subject}</DialogTitle>
            <DialogDescription>
              Ticket #{selectedTicket?.id.slice(0, 8)} • {selectedTicket?.user_email}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="flex-1 flex flex-col gap-4 min-h-0">
              <div className="flex gap-2 flex-wrap">
                {getStatusBadge(selectedTicket.status, selectedTicket.awaiting_review)}
                {getPriorityBadge(selectedTicket.priority)}
                {getPlanBadge(selectedTicket.user_plan)}
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-1 text-sm">Description initiale</h4>
                <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              <div className="flex-1 min-h-0 border rounded-lg bg-background">
                <TicketConversation messages={messages} loading={messagesLoading} />
              </div>

              {!selectedTicket.awaiting_review && selectedTicket.status !== 'resolved' && (
                <DialogFooter className="flex-col sm:flex-col gap-2">
                  <div className="flex gap-2 w-full">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Répondre à l'utilisateur..."
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    onClick={closeConversation} 
                    variant="outline" 
                    className="w-full"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Fermer la conversation (demander évaluation)
                  </Button>
                </DialogFooter>
              )}

              {selectedTicket.awaiting_review && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    En attente de l'évaluation de l'utilisateur
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
