import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Store, ExternalLink, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Restaurant {
  user_id: string;
  restaurant_name: string;
  slug: string;
  email: string;
  first_name: string;
  last_name: string;
  plan: string;
  chatbot_active: boolean;
  created_at: string;
}

export default function AdminDashboardsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      // Fetch restaurant settings with profile info
      const { data: settingsData } = await supabase
        .from('restaurant_settings')
        .select('user_id, restaurant_name, slug, chatbot_active, created_at')
        .order('created_at', { ascending: false });

      if (!settingsData) {
        setRestaurants([]);
        return;
      }

      // Enrich with profile and subscription data
      const enriched = await Promise.all(
        settingsData.map(async (settings) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, first_name, last_name')
            .eq('user_id', settings.user_id)
            .single();

          const { data: subscription } = await supabase
            .from('user_subscriptions')
            .select('plan')
            .eq('user_id', settings.user_id)
            .single();

          return {
            ...settings,
            email: profile?.email || '',
            first_name: profile?.first_name || '',
            last_name: profile?.last_name || '',
            plan: subscription?.plan || 'starter',
          };
        })
      );

      setRestaurants(enriched);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter(r => {
    const query = searchQuery.toLowerCase();
    return (
      r.restaurant_name?.toLowerCase().includes(query) ||
      r.email?.toLowerCase().includes(query) ||
      r.slug?.toLowerCase().includes(query)
    );
  });

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      starter: 'bg-gray-100 text-gray-700',
      pro: 'bg-blue-100 text-blue-700',
      premium: 'bg-purple-100 text-purple-700',
    };
    return <Badge className={colors[plan] || colors.starter}>{plan.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Restaurants</h1>
        <p className="text-gray-500">{restaurants.length} restaurants configurés</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom, email ou slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Restaurants Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Store className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun restaurant trouvé</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Propriétaire</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Chatbot</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRestaurants.map((restaurant) => (
                  <TableRow key={restaurant.user_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Store className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{restaurant.restaurant_name || 'Sans nom'}</p>
                          <p className="text-sm text-gray-500">/r/{restaurant.slug || 'non-configuré'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {restaurant.first_name || restaurant.last_name 
                          ? `${restaurant.first_name || ''} ${restaurant.last_name || ''}`.trim()
                          : 'Non renseigné'}
                      </p>
                      <p className="text-xs text-gray-500">{restaurant.email}</p>
                    </TableCell>
                    <TableCell>{getPlanBadge(restaurant.plan)}</TableCell>
                    <TableCell>
                      {restaurant.chatbot_active ? (
                        <Badge className="bg-green-100 text-green-700">Actif</Badge>
                      ) : (
                        <Badge variant="outline">Inactif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {format(new Date(restaurant.created_at), 'd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      {restaurant.slug && (
                        <a 
                          href={`/r/${restaurant.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-green-600 hover:text-green-700"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      )}
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
