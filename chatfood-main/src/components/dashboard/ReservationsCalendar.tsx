import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, momentLocalizer, Event } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Settings,
  User,
  Phone,
  Mail,
  Users,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useReservations, Reservation } from '@/hooks/useReservations';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { configureMomentLocale } from '@/utils/momentConfig';

// Setup localizer for French
configureMomentLocale();
const localizer = momentLocalizer(moment);

interface ReservationsCalendarProps {
  userId?: string;
  isAdminMode?: boolean;
}

type ViewType = 'day' | 'week' | 'month';

const viewTypeMap: Record<ViewType, 'day' | 'week' | 'month'> = {
  day: 'day',
  week: 'week',
  month: 'month',
};

export const ReservationsCalendar: React.FC<ReservationsCalendarProps> = ({
  userId,
  isAdminMode = false,
}) => {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewType>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { reservations, isLoading, hasWebhook, refetch } = useReservations(userId);

  // Calculate header label based on view
  const headerLabel = useMemo(() => {
    switch (view) {
      case 'day':
        return moment(currentDate).locale('fr').format('dddd D MMMM YYYY');
      case 'week':
        return `${moment(currentDate).startOf('week').locale('fr').format('D MMMM')} - ${moment(currentDate).endOf('week').locale('fr').format('D MMMM YYYY')}`;
      case 'month':
        return moment(currentDate).locale('fr').format('MMMM YYYY');
      default:
        return '';
    }
  }, [view, currentDate]);

  // Event style getter
  const eventStyleGetter = (event: Event) => {
    const reservation = event as unknown as Reservation;
    let backgroundColor = 'hsl(var(--primary))';
    let borderColor = 'hsl(var(--primary))';
    let textDecoration = 'none';

    switch (reservation.status) {
      case 'confirmed':
        backgroundColor = 'hsl(142 76% 36%)'; // green
        borderColor = 'hsl(142 76% 26%)'; // green plus foncé
        break;
      case 'pending':
        backgroundColor = 'hsl(25 95% 53%)'; // orange
        borderColor = 'hsl(25 95% 43%)'; // orange plus foncé
        break;
      case 'cancelled':
        backgroundColor = 'hsl(var(--muted))';
        borderColor = 'hsl(var(--muted-foreground))';
        textDecoration = 'line-through';
        break;
    }

    return {
      style: {
        backgroundColor,
        color: 'white',
        borderRadius: '6px',
        border: `2px solid ${borderColor}`,
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
        textDecoration,
        fontSize: '0.875rem',
        padding: '4px 6px',
      },
    };
  };

  // Custom event component with tooltip
  const EventComponent = ({ event }: { event: Event }) => {
    const reservation = event as unknown as Reservation;
    return (
      <div className="p-1" title={`${reservation.customerName}\n${reservation.phone || ''}\n${reservation.email || ''}\n${reservation.notes || ''}`}>
        <div className="font-medium text-xs">{event.title}</div>
      </div>
    );
  };

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    const newDate = new Date(currentDate);
    
    if (action === 'TODAY') {
      setCurrentDate(new Date());
      return;
    }

    if (view === 'day') {
      newDate.setDate(newDate.getDate() + (action === 'NEXT' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (action === 'NEXT' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (action === 'NEXT' ? 1 : -1));
    }
    
    setCurrentDate(newDate);
  };

  const handleSelectEvent = (event: Event) => {
    const reservation = event as unknown as Reservation;
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  // Helper functions for the modal
  const formatDateTime = (date: Date) => moment(date).locale('fr').format('dddd D MMMM YYYY [à] HH:mm');
  
  const formatDuration = (start: Date, end: Date) => {
    const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? mins.toString().padStart(2, '0') : ''}`;
    }
    return `${mins} min`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Confirmée
          </div>
        );
      case 'pending':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm font-medium">
            <AlertCircle className="h-4 w-4" />
            En attente
          </div>
        );
      case 'cancelled':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm font-medium">
            <XCircle className="h-4 w-4" />
            Annulée
          </div>
        );
    }
  };

  const messages = {
    today: "Aujourd'hui",
    previous: 'Précédent',
    next: 'Suivant',
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Heure',
    event: 'Événement',
    noEventsInRange: 'Aucune réservation pour cette période',
    showMore: (total: number) => `+ ${total} de plus`,
    allDay: 'Toute la journée',
    work_week: 'Semaine de travail',
    yesterday: 'Hier',
    tomorrow: 'Demain',
  };

  const formats = {
    dayHeaderFormat: (date: Date) => moment(date).locale('fr').format('dddd D MMMM'),
    dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${moment(start).locale('fr').format('D MMMM')} - ${moment(end).locale('fr').format('D MMMM YYYY')}`,
    monthHeaderFormat: (date: Date) => moment(date).locale('fr').format('MMMM YYYY'),
    weekdayFormat: (date: Date) => moment(date).locale('fr').format('dddd'),
    timeGutterFormat: (date: Date) => moment(date).locale('fr').format('HH:mm'),
    eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${moment(start).locale('fr').format('HH:mm')} - ${moment(end).locale('fr').format('HH:mm')}`,
    // Additional formats to ensure French labels in week/month headers
    dateFormat: (date: Date) => moment(date).locale('fr').format('D'),
    dayFormat: (date: Date) => moment(date).locale('fr').format('dd D'),
  };

  if (!hasWebhook) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendrier de Réservations
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            Le webhook de réservations n'est pas configuré
          </p>
          {!isAdminMode && (
            <Button onClick={() => navigate('/settings')}>
              Accéder aux paramètres
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendrier de Réservations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[600px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-sm border-muted/60">
      <CardHeader className="px-4 py-4 md:px-6 md:py-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-primary" />
            </div>
            <span>Calendrier</span>
          </CardTitle>

          <Tabs value={view} onValueChange={(v) => setView(v as ViewType)} className="w-full md:w-auto">
            <TabsList className="grid w-full grid-cols-3 md:w-auto">
              <TabsTrigger value="day" className="text-xs sm:text-sm">Jour</TabsTrigger>
              <TabsTrigger value="week" className="text-xs sm:text-sm">Semaine</TabsTrigger>
              <TabsTrigger value="month" className="text-xs sm:text-sm">Mois</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/30 p-3 rounded-lg border border-muted/50">
          <div className="text-sm sm:text-base font-semibold capitalize text-primary">
            {headerLabel}
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => handleNavigate('PREV')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleNavigate('TODAY')}
              className="h-8 sm:h-9 text-xs sm:text-sm px-4 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              Aujourd'hui
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => handleNavigate('NEXT')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 sm:px-6 pb-6">
        <div className="min-h-[500px] bg-background">
          <Calendar
            localizer={localizer}
            events={reservations}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            className="font-sans text-sm"
            view={viewTypeMap[view]}
            date={currentDate}
            onNavigate={(date) => setCurrentDate(date)}
            onView={(newView) => setView(newView as ViewType)}
            onSelectEvent={handleSelectEvent}
            messages={messages}
            formats={formats}
            eventPropGetter={eventStyleGetter}
            components={{
              event: EventComponent,
            }}
            min={new Date(0, 0, 0, 8, 0, 0)}
            max={new Date(0, 0, 0, 23, 0, 0)}
            culture="fr"
            toolbar={false}
            views={{ day: true, week: true, month: true }}
          />
        </div>
      </CardContent>

      {/* Modal de détails de réservation */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CalendarIcon className="h-5 w-5" />
              Détails de la réservation
            </DialogTitle>
            <DialogDescription>
              Informations complètes sur cette réservation
            </DialogDescription>
          </DialogHeader>
          
          {selectedReservation && (
            <div className="space-y-4 py-4">
              {/* Statut */}
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-sm font-medium text-muted-foreground">Statut</span>
                {getStatusBadge(selectedReservation.status)}
              </div>
              
              <div className="space-y-4">
                {/* Client */}
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Client</p>
                    <p className="text-base font-semibold">{selectedReservation.customerName}</p>
                  </div>
                </div>
                
                {/* Téléphone */}
                {selectedReservation.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                      <p className="text-base">{selectedReservation.phone}</p>
                    </div>
                  </div>
                )}
                
                {/* Email */}
                {selectedReservation.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-base break-all">{selectedReservation.email}</p>
                    </div>
                  </div>
                )}
                
                {/* Nombre de personnes */}
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Nombre de personnes</p>
                    <p className="text-base font-semibold">{selectedReservation.numberOfPeople} personne{selectedReservation.numberOfPeople > 1 ? 's' : ''}</p>
                  </div>
                </div>
                
                {/* Date et heure */}
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Date et heure</p>
                    <p className="text-base capitalize">{formatDateTime(selectedReservation.start)}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Durée : {formatDuration(selectedReservation.start, selectedReservation.end)}
                    </p>
                  </div>
                </div>
                
                {/* Notes */}
                {selectedReservation.notes && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Notes</p>
                      <p className="text-base whitespace-pre-wrap">{selectedReservation.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
