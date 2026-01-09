import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Search, Calendar as CalendarIcon, Download, RotateCcw } from 'lucide-react';
import { Order } from '@/hooks/useOrders';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface OrdersHistoryProps {
  orders: Order[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  delivered: { label: 'Livrée', color: 'bg-green-500/20 text-green-700 dark:text-green-300' },
  cancelled: { label: 'Annulée', color: 'bg-red-500/20 text-red-700 dark:text-red-300' },
};

export const OrdersHistory: React.FC<OrdersHistoryProps> = ({ orders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search filter
      const matchesSearch = 
        order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone.includes(searchTerm);

      // Status filter
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      // Date filters
      const orderDate = new Date(order.heure_de_commande);
      const matchesDateFrom = !dateFrom || orderDate >= dateFrom;
      const matchesDateTo = !dateTo || orderDate <= new Date(dateTo.getTime() + 86400000); // Include end date

      // Amount filters
      const matchesMinAmount = !minAmount || order.price_total >= parseFloat(minAmount);
      const matchesMaxAmount = !maxAmount || order.price_total <= parseFloat(maxAmount);

      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo && matchesMinAmount && matchesMaxAmount;
    });
  }, [orders, searchTerm, statusFilter, dateFrom, dateTo, minAmount, maxAmount]);

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || dateFrom || dateTo || minAmount || maxAmount;

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setMinAmount('');
    setMaxAmount('');
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: fr });
    } catch {
      return dateString;
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Client', 'Téléphone', 'Montant', 'Statut'];
    const rows = filteredOrders.map(order => [
      formatDate(order.heure_de_commande),
      order.name || 'N/A',
      order.phone || 'N/A',
      order.price_total.toFixed(2).replace('.', ','),
      STATUS_CONFIG[order.status]?.label || order.status
    ]);

    // BOM UTF-8 + séparateur ; pour Excel FR
    const BOM = '\uFEFF';
    const csvContent = BOM + [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `commandes_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <Card>
      <CardHeader className="px-4 md:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              Historique des commandes
              <Badge variant="secondary">{filteredOrders.length}</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs md:text-sm">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Réinitialiser</span>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={exportCSV} disabled={filteredOrders.length === 0} className="text-xs md:text-sm">
                <Download className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2">
            {/* Search */}
            <div className="relative col-span-2 sm:col-span-1 sm:w-48">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9"
              />
            </div>

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36 h-9">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="delivered">Livrées</SelectItem>
                <SelectItem value="cancelled">Annulées</SelectItem>
              </SelectContent>
            </Select>

            {/* Date from */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("h-9 w-full sm:w-36 justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, 'dd/MM/yyyy') : 'Du'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {/* Date to */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("h-9 w-full sm:w-36 justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, 'dd/MM/yyyy') : 'Au'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {/* Min amount */}
            <Input
              type="number"
              placeholder="Min €"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="w-full sm:w-24 h-9"
            />

            {/* Max amount */}
            <Input
              type="number"
              placeholder="Max €"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="w-full sm:w-24 h-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 md:px-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {hasActiveFilters ? 'Aucune commande trouvée avec ces filtres' : 'Aucune commande dans l\'historique'}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium truncate max-w-[150px]">{order.name}</div>
                          <div className="text-sm text-muted-foreground">{order.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3 shrink-0" />
                          {formatDate(order.heure_de_commande)}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold whitespace-nowrap">{order.price_total.toFixed(2)}€</TableCell>
                      <TableCell>
                        <Badge className={STATUS_CONFIG[order.status]?.color || ''}>
                          {STATUS_CONFIG[order.status]?.label || order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{order.name}</div>
                      <div className="text-xs text-muted-foreground">{order.phone}</div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {formatDate(order.heure_de_commande)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold">{order.price_total.toFixed(2)}€</div>
                      <Badge className={`${STATUS_CONFIG[order.status]?.color || ''} text-xs mt-1`}>
                        {STATUS_CONFIG[order.status]?.label || order.status}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
