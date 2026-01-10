import React, { useState, useEffect } from 'react';
import { Copy, Link, Loader2, Trash2, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GenerateLoginLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
}

interface ImpersonationToken {
  id: string;
  token: string;
  expires_at: string;
  created_at: string;
  revoked: boolean;
  used: boolean;
  single_use: boolean;
}

export function GenerateLoginLinkDialog({ 
  open, 
  onOpenChange, 
  userId, 
  userEmail 
}: GenerateLoginLinkDialogProps) {
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [existingTokens, setExistingTokens] = useState<ImpersonationToken[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [singleUse, setSingleUse] = useState(true);

  useEffect(() => {
    if (open && userId) {
      fetchExistingTokens();
      setGeneratedUrl('');
      setExpiresAt('');
    }
  }, [open, userId]);

  const fetchExistingTokens = async () => {
    setLoadingTokens(true);
    try {
      // Récupérer les tokens actifs (non révoqués, non expirés)
      // Pour les tokens multi-usage, on les montre même s'ils ont été utilisés
      const { data, error } = await supabase
        .from('admin_impersonation_tokens')
        .select('*')
        .eq('target_user_id', userId)
        .eq('revoked', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filtrer : montrer les tokens non utilisés OU les tokens multi-usage
      const activeTokens = (data || []).filter(t => !t.used || t.single_use === false);
      setExistingTokens(activeTokens);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setLoadingTokens(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expirée');
        return;
      }

      const { data, error } = await supabase.functions.invoke('admin-generate-login-link', {
        body: { user_id: userId, user_email: userEmail, single_use: singleUse },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;

      if (data?.url) {
        setGeneratedUrl(data.url);
        setExpiresAt(data.expires_at);
        toast.success('Lien de connexion généré');
        fetchExistingTokens();
      } else if (data?.error) {
        toast.error(data.error);
      }
    } catch (error: any) {
      console.error('Error generating link:', error);
      toast.error(error.message || 'Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      toast.success('Lien copié !');
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  const handleRevoke = async (tokenId: string) => {
    setRevoking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expirée');
        return;
      }

      const { error } = await supabase.functions.invoke('admin-revoke-login-link', {
        body: { token_id: tokenId },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;

      toast.success('Lien révoqué');
      fetchExistingTokens();
      if (generatedUrl.includes(tokenId)) {
        setGeneratedUrl('');
        setExpiresAt('');
      }
    } catch (error: any) {
      console.error('Error revoking link:', error);
      toast.error(error.message || 'Erreur lors de la révocation');
    } finally {
      setRevoking(false);
    }
  };

  const handleRevokeAll = async () => {
    setRevoking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expirée');
        return;
      }

      const { data, error } = await supabase.functions.invoke('admin-revoke-login-link', {
        body: { user_id: userId },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;

      toast.success(data?.message || 'Liens révoqués');
      setExistingTokens([]);
      setGeneratedUrl('');
      setExpiresAt('');
    } catch (error: any) {
      console.error('Error revoking all links:', error);
      toast.error(error.message || 'Erreur lors de la révocation');
    } finally {
      setRevoking(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Lien de connexion
          </DialogTitle>
          <DialogDescription>
            Générer un lien de connexion pour <strong>{userEmail}</strong>
            <br />
            <span className="text-xs text-muted-foreground">
              Le lien sera valide 24h et à usage unique. Aucun email ne sera envoyé.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Option usage unique */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="space-y-0.5">
              <Label htmlFor="single-use" className="text-sm font-medium">Usage unique</Label>
              <p className="text-xs text-muted-foreground">
                {singleUse 
                  ? "Le lien ne fonctionnera qu'une seule fois" 
                  : "Le lien sera valide 24h avec usages illimités"}
              </p>
            </div>
            <Switch
              id="single-use"
              checked={singleUse}
              onCheckedChange={setSingleUse}
            />
          </div>

          {/* Bouton Générer */}
          <Button 
            onClick={handleGenerate} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Link className="h-4 w-4 mr-2" />
                Générer un nouveau lien
              </>
            )}
          </Button>

          {/* Lien généré */}
          {generatedUrl && (
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-2">
                <Input 
                  value={generatedUrl} 
                  readOnly 
                  className="font-mono text-xs"
                />
                <Button size="icon" variant="outline" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={() => window.open(generatedUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              {expiresAt && (
                <p className="text-xs text-muted-foreground">
                  Expire le : {formatDate(expiresAt)}
                </p>
              )}
            </div>
          )}

          {/* Liens existants */}
          {loadingTokens ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : existingTokens.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">
                  Liens actifs ({existingTokens.length})
                </h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRevokeAll}
                  disabled={revoking}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Révoquer tous
                </Button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {existingTokens.map((token) => (
                  <div 
                    key={token.id}
                    className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">Actif</Badge>
                      {token.single_use === false && (
                        <Badge variant="secondary">Multi-usage</Badge>
                      )}
                      <span className="text-muted-foreground">
                        Expire : {formatDate(token.expires_at)}
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleRevoke(token.token)}
                      disabled={revoking}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
