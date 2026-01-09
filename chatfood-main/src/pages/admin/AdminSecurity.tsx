import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Clock, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LoginAttempt {
  id: string;
  email: string;
  ip_address: string | null;
  attempt_time: string;
  success: boolean;
}

interface SecurityBlock {
  id: string;
  email: string | null;
  ip_address: string | null;
  block_type: string;
  blocked_until: string;
  reason: string;
  created_at: string;
}

export default function AdminSecurity() {
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [securityBlocks, setSecurityBlocks] = useState<SecurityBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      // Fetch recent login attempts (last 100)
      const { data: attempts, error: attemptsError } = await supabase
        .from('login_attempts')
        .select('*')
        .order('attempt_time', { ascending: false })
        .limit(100);

      if (attemptsError) throw attemptsError;

      // Fetch active security blocks
      const { data: blocks, error: blocksError } = await supabase
        .from('security_blocks')
        .select('*')
        .gt('blocked_until', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (blocksError) throw blocksError;

      setLoginAttempts((attempts as LoginAttempt[]) || []);
      setSecurityBlocks((blocks as SecurityBlock[]) || []);
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast.error('Erreur lors du chargement des données de sécurité');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (blockId: string) => {
    try {
      const { error } = await supabase
        .from('security_blocks')
        .delete()
        .eq('id', blockId);

      if (error) throw error;

      toast.success('Blocage supprimé avec succès');
      fetchSecurityData();
    } catch (error) {
      console.error('Error removing block:', error);
      toast.error('Erreur lors de la suppression du blocage');
    }
  };

  const failedAttemptsLast24h = loginAttempts.filter((attempt) => {
    const attemptDate = new Date(attempt.attempt_time);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return !attempt.success && attemptDate > yesterday;
  }).length;

  const successRate =
    loginAttempts.length > 0
      ? ((loginAttempts.filter((a) => a.success).length / loginAttempts.length) * 100).toFixed(1)
      : '0';

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sécurité & Logs</h1>
        <p className="text-muted-foreground mt-2">
          Surveillance des tentatives de connexion et des blocages de sécurité
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Échecs (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedAttemptsLast24h}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <AlertTriangle className="h-3 w-3" />
              Tentatives échouées
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Comptes Bloqués</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityBlocks.length}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Shield className="h-3 w-3" />
              Actuellement actifs
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taux de Réussite</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              Connexions réussies
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comptes Bloqués</CardTitle>
          <CardDescription>Blocages de sécurité actuellement actifs</CardDescription>
        </CardHeader>
        <CardContent>
          {securityBlocks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun compte bloqué actuellement
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Adresse IP</TableHead>
                    <TableHead>Raison</TableHead>
                    <TableHead>Bloqué jusqu'à</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityBlocks.map((block) => (
                    <TableRow key={block.id}>
                      <TableCell className="font-medium">{block.email || 'N/A'}</TableCell>
                      <TableCell>{block.ip_address || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">{block.reason}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {new Date(block.blocked_until).toLocaleString('fr-FR')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnblock(block.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Débloquer
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

      <Card>
        <CardHeader>
          <CardTitle>Tentatives de Connexion Récentes</CardTitle>
          <CardDescription>100 dernières tentatives de connexion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Adresse IP</TableHead>
                  <TableHead>Date & Heure</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loginAttempts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Aucune tentative de connexion enregistrée
                    </TableCell>
                  </TableRow>
                ) : (
                  loginAttempts.map((attempt) => (
                    <TableRow key={attempt.id}>
                      <TableCell className="font-medium">{attempt.email}</TableCell>
                      <TableCell>{attempt.ip_address}</TableCell>
                      <TableCell>
                        {new Date(attempt.attempt_time).toLocaleString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        {attempt.success ? (
                          <Badge variant="default" className="bg-green-500">
                            Réussie
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Échouée</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
