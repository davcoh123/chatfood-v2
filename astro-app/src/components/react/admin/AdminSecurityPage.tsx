import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Lock, Unlock, AlertTriangle, Shield, Clock, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SecurityBlock {
  id: string;
  identifier: string;
  identifier_type: string;
  blocked_until: string;
  reason: string;
  created_at: string;
}

interface LoginAttempt {
  id: string;
  email: string;
  success: boolean;
  ip_address: string;
  attempt_time: string;
}

export default function AdminSecurityPage() {
  const [blocks, setBlocks] = useState<SecurityBlock[]>([]);
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch active blocks
      const { data: blocksData } = await supabase
        .from('security_blocks')
        .select('*')
        .gt('blocked_until', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      // Fetch recent login attempts
      const { data: attemptsData } = await supabase
        .from('login_attempts')
        .select('*')
        .order('attempt_time', { ascending: false })
        .limit(100);

      setBlocks(blocksData || []);
      setAttempts(attemptsData || []);
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (block: SecurityBlock) => {
    try {
      await supabase
        .from('security_blocks')
        .delete()
        .eq('id', block.id);
      
      toast.success('Utilisateur débloqué');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors du déblocage');
    }
  };

  const failedAttemptsToday = attempts.filter(a => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !a.success && new Date(a.attempt_time) >= today;
  }).length;

  const successRate = attempts.length > 0
    ? Math.round((attempts.filter(a => a.success).length / attempts.length) * 100)
    : 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sécurité</h1>
        <p className="text-gray-500">Surveillance et gestion des accès</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Comptes bloqués</p>
              <Lock className="h-4 w-4 text-red-600" />
            </div>
            {loading ? <Skeleton className="h-8 w-16" /> : (
              <p className="text-2xl font-bold text-red-600">{blocks.length}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Échecs aujourd'hui</p>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
            {loading ? <Skeleton className="h-8 w-16" /> : (
              <p className="text-2xl font-bold text-orange-600">{failedAttemptsToday}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Taux de succès</p>
              <Shield className="h-4 w-4 text-green-600" />
            </div>
            {loading ? <Skeleton className="h-8 w-16" /> : (
              <p className="text-2xl font-bold text-green-600">{successRate}%</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Tentatives (24h)</p>
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            {loading ? <Skeleton className="h-8 w-16" /> : (
              <p className="text-2xl font-bold">{attempts.length}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Blocked Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-red-600" />
            Comptes bloqués
          </CardTitle>
          <CardDescription>Comptes temporairement suspendus</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : blocks.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Aucun compte bloqué</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Identifiant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Raison</TableHead>
                  <TableHead>Bloqué jusqu'au</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blocks.map((block) => (
                  <TableRow key={block.id}>
                    <TableCell className="font-medium">{block.identifier}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{block.identifier_type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{block.reason}</TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(block.blocked_until), 'd MMM yyyy HH:mm', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => unblockUser(block)}
                      >
                        <Unlock className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Login Attempts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Tentatives de connexion récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.slice(0, 20).map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell className="font-medium">{attempt.email}</TableCell>
                    <TableCell>
                      {attempt.success ? (
                        <Badge className="bg-green-100 text-green-700">Succès</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700">Échec</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{attempt.ip_address || 'N/A'}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {format(new Date(attempt.attempt_time), 'd MMM HH:mm', { locale: fr })}
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
