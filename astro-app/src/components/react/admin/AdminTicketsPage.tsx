import { useAdminTickets } from '@/hooks/useAdminTickets';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, MessageSquare, Clock, CheckCircle, AlertCircle, Send, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

export default function AdminTicketsPage() {
  const { 
    tickets, 
    loading, 
    selectedTicket, 
    messages, 
    messagesLoading,
    selectTicket, 
    sendMessage, 
    updateTicketStatus,
    refreshTickets 
  } = useAdminTickets();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('open');
  const [newMessage, setNewMessage] = useState('');

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = !searchQuery || 
      ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user_email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
      open: { color: 'bg-blue-100 text-blue-700', label: 'Ouvert', icon: Clock },
      awaiting_admin: { color: 'bg-orange-100 text-orange-700', label: 'En attente', icon: AlertCircle },
      awaiting_user: { color: 'bg-yellow-100 text-yellow-700', label: 'Répondu', icon: MessageSquare },
      in_progress: { color: 'bg-purple-100 text-purple-700', label: 'En cours', icon: Clock },
      resolved: { color: 'bg-green-100 text-green-700', label: 'Résolu', icon: CheckCircle },
      closed: { color: 'bg-gray-100 text-gray-700', label: 'Fermé', icon: CheckCircle },
    };
    
    const config = statusConfig[status] || statusConfig.open;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    
    const success = await sendMessage(selectedTicket.id, newMessage);
    if (success) {
      setNewMessage('');
      toast.success('Message envoyé');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicket) return;
    
    const success = await updateTicketStatus(selectedTicket.id, newStatus);
    if (success) {
      toast.success('Statut mis à jour');
    }
  };

  // Ticket detail view
  if (selectedTicket) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => selectTicket(null)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour aux tickets
        </Button>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Ticket Info */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Utilisateur</p>
                <p className="font-medium">{selectedTicket.user_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium capitalize">{selectedTicket.ticket_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Priorité</p>
                <Badge className={selectedTicket.priority === 'high' ? 'bg-red-100 text-red-700' : ''}>
                  {selectedTicket.priority === 'high' ? 'Haute' : 'Normale'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <Select value={selectedTicket.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Ouvert</SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
                    <SelectItem value="awaiting_user">En attente utilisateur</SelectItem>
                    <SelectItem value="resolved">Résolu</SelectItem>
                    <SelectItem value="closed">Fermé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm text-gray-500">Créé le</p>
                <p className="font-medium">
                  {format(new Date(selectedTicket.created_at), 'd MMMM yyyy HH:mm', { locale: fr })}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Conversation */}
          <Card className="md:col-span-2">
            <CardHeader className="border-b">
              <CardTitle>{selectedTicket.subject}</CardTitle>
              <CardDescription>{selectedTicket.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16 ml-auto w-3/4" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Pas de messages</p>
                ) : (
                  messages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.sender_type === 'admin' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-100'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.sender_type === 'admin' ? 'text-green-100' : 'text-gray-400'}`}>
                          {format(new Date(msg.created_at), 'HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Reply Input */}
              {selectedTicket.status !== 'closed' && (
                <div className="border-t p-4 flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Votre réponse..."
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
        </div>
      </div>
    );
  }

  // Tickets list
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tickets Support</h1>
        <p className="text-gray-500">
          {filteredTickets.filter(t => t.status === 'open' || t.status === 'awaiting_admin').length} tickets en attente
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="open">Ouverts</SelectItem>
                <SelectItem value="awaiting_admin">En attente</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="resolved">Résolus</SelectItem>
                <SelectItem value="closed">Fermés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Aucun ticket trouvé
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sujet</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow 
                    key={ticket.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => selectTicket(ticket)}
                  >
                    <TableCell>
                      <p className="font-medium">{ticket.subject}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {ticket.description}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">{ticket.user_email}</TableCell>
                    <TableCell className="capitalize text-sm">{ticket.ticket_type}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {format(new Date(ticket.created_at), 'd MMM', { locale: fr })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
