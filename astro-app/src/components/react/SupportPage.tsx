import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LifeBuoy, Send, Clock, CheckCircle2, AlertCircle, MessageCircle, Star, Plus, ArrowLeft } from 'lucide-react';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { useTicketMessages } from '@/hooks/useTicketMessages';
import { useTicketReviews } from '@/hooks/useTicketReviews';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { TicketConversation } from '@/components/support/TicketConversation';
import { ReviewDialog } from '@/components/support/ReviewDialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { z } from 'zod';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

const ticketTypes = [
  { value: 'technical', label: 'Problème technique' },
  { value: 'billing', label: 'Facturation' },
  { value: 'feature', label: 'Suggestion de fonctionnalité' },
  { value: 'other', label: 'Autre' },
];

const createTicketSchema = z.object({
  ticket_type: z.string().min(1, 'Sélectionnez un type'),
  subject: z.string().min(3, 'Le sujet doit faire au moins 3 caractères'),
  description: z.string().min(10, 'La description doit faire au moins 10 caractères'),
  priority: z.enum(['normal', 'high']).default('normal'),
});

type CreateTicketInput = z.infer<typeof createTicketSchema>;

export default function SupportPage() {
  const { tickets, loading, unreadCount, createTicket, refreshTickets } = useSupportTickets();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  
  const { messages, loading: messagesLoading, sendMessage } = useTicketMessages(selectedTicket?.id);
  const { submitReview, reopenTicket } = useTicketReviews();

  // Form state
  const [formData, setFormData] = useState<CreateTicketInput>({
    ticket_type: '',
    subject: '',
    description: '',
    priority: 'normal',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      createTicketSchema.parse(formData);
      setIsSubmitting(true);
      const success = await createTicket(formData);
      if (success) {
        setFormData({ ticket_type: '', subject: '', description: '', priority: 'normal' });
        setShowNewTicketForm(false);
        toast.success('Ticket créé avec succès');
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    } finally {
      setIsSubmitting(false);
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
          Évaluation
        </Badge>
      );
    }

    const variants: Record<string, { className: string; icon: any; label: string }> = {
      open: { className: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Ouvert' },
      awaiting_admin: { className: 'bg-blue-100 text-blue-700', icon: Clock, label: 'En attente' },
      awaiting_user: { className: 'bg-red-100 text-red-700', icon: MessageCircle, label: 'Nouvelle réponse' },
      in_progress: { className: 'bg-yellow-100 text-yellow-700', icon: AlertCircle, label: 'En cours' },
      resolved: { className: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Résolu' },
      closed: { className: 'bg-gray-100 text-gray-700', icon: CheckCircle2, label: 'Fermé' }
    };
    const config = variants[status] || variants.open;
    const Icon = config.icon;
    return (
      <Badge className={`gap-1 ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Ticket detail view
  if (selectedTicket) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setSelectedTicket(null)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour aux tickets
        </Button>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                <CardDescription>
                  Ticket #{selectedTicket.id.slice(0, 8)} • 
                  {selectedTicket.created_at && format(new Date(selectedTicket.created_at), ' d MMMM yyyy', { locale: fr })}
                </CardDescription>
              </div>
              {getStatusBadge(selectedTicket.status, selectedTicket.awaiting_review)}
            </div>
          </CardHeader>
          <CardContent>
            <TicketConversation 
              ticket={selectedTicket}
              messages={messages}
              loading={messagesLoading}
            />
            
            {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
              <div className="mt-4 flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Votre message..."
                  rows={2}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {showReviewDialog && (
          <ReviewDialog
            ticketId={selectedTicket.id}
            onSubmit={async (rating, comment) => {
              await submitReview(selectedTicket.id, rating, comment);
              setShowReviewDialog(false);
              setSelectedTicket(null);
              refreshTickets();
            }}
            onReopen={async () => {
              await reopenTicket(selectedTicket.id);
              setShowReviewDialog(false);
              setSelectedTicket(null);
              refreshTickets();
            }}
            onClose={() => setShowReviewDialog(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total tickets</p>
            <p className="text-2xl font-bold">{tickets.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">En attente</p>
            <p className="text-2xl font-bold text-blue-600">
              {tickets.filter(t => t.status === 'open' || t.status === 'awaiting_admin').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Nouvelle réponse</p>
            <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Résolus</p>
            <p className="text-2xl font-bold text-green-600">
              {tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* New ticket form */}
      {showNewTicketForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Nouveau ticket</CardTitle>
            <CardDescription>Décrivez votre problème ou question</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Type de demande</Label>
                  <Select
                    value={formData.ticket_type}
                    onValueChange={(v) => setFormData(d => ({ ...d, ticket_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ticketTypes.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priorité</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(v: 'normal' | 'high') => setFormData(d => ({ ...d, priority: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normale</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Sujet</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData(d => ({ ...d, subject: e.target.value }))}
                  placeholder="Résumé de votre demande"
                />
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(d => ({ ...d, description: e.target.value }))}
                  placeholder="Décrivez votre problème en détail..."
                  rows={4}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'Envoi...' : 'Envoyer le ticket'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowNewTicketForm(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button 
          onClick={() => setShowNewTicketForm(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau ticket
        </Button>
      )}

      {/* Tickets list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5" />
            Mes tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Chargement...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8">
              <LifeBuoy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun ticket pour le moment</p>
              <p className="text-sm text-gray-400 mt-1">
                Créez un ticket si vous avez besoin d'aide
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{ticket.subject}</p>
                    <p className="text-sm text-gray-500 truncate">{ticket.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {ticket.created_at && format(new Date(ticket.created_at), 'd MMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  <div className="ml-4">
                    {getStatusBadge(ticket.status, ticket.awaiting_review)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
