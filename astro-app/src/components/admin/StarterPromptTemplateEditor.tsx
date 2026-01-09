import { useState, useEffect, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Code, Eye, Sparkles, Info, Save, RotateCcw, Users, UserPlus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

// Placeholders statiques (remplacés par les données Supabase)
const STATIC_PLACEHOLDERS = [
  { key: '[[RESTAURANT_NAME]]', description: 'Nom du restaurant', color: 'bg-blue-500/20 text-blue-700 border-blue-300' },
  { key: '[[ADDRESS]]', description: 'Adresse complète', color: 'bg-green-500/20 text-green-700 border-green-300' },
  { key: '[[OPENING_HOURS]]', description: 'Horaires d\'ouverture', color: 'bg-purple-500/20 text-purple-700 border-purple-300' },
  { key: '[[CATEGORIES]]', description: 'Liste des catégories', color: 'bg-orange-500/20 text-orange-700 border-orange-300' },
  { key: '[[ASSETS]]', description: 'URLs et descriptions des images', color: 'bg-pink-500/20 text-pink-700 border-pink-300' },
  { key: '[[ORDER_WAIT_TIME]]', description: 'Temps d\'attente commande (minutes)', color: 'bg-cyan-500/20 text-cyan-700 border-cyan-300' },
];

// Variables dynamiques (injectées par n8n à chaque requête)
const DYNAMIC_VARIABLES = [
  { key: '{{NOW}}', description: 'Date et heure actuelles', color: 'bg-amber-500/20 text-amber-700 border-amber-300' },
  { key: '{{CUSTOMER_NAME}}', description: 'Nom du client WhatsApp', color: 'bg-red-500/20 text-red-700 border-red-300' },
  { key: '{{USER_MESSAGE}}', description: 'Message du client', color: 'bg-red-500/20 text-red-700 border-red-300' },
];

const DEFAULT_PROMPT = `Tu es l'assistant virtuel de [[RESTAURANT_NAME]], un chatbot WhatsApp intelligent spécialisé dans la prise de commande et le service client pour la restauration.

## 🏠 INFORMATIONS DU RESTAURANT

**Nom :** [[RESTAURANT_NAME]]
**Adresse :** [[ADDRESS]]
**Temps d'attente estimé pour récupérer une commande :** [[ORDER_WAIT_TIME]] minutes

**Horaires d'ouverture :**
[[OPENING_HOURS]]

## 📋 CATÉGORIES DU CATALOGUE

Les catégories disponibles sont : [[CATEGORIES]]

## 🖼️ IMAGES ET ASSETS DISPONIBLES

Tu peux envoyer ces images aux clients si pertinent :
[[ASSETS]]

## 📜 RÈGLES DE COMPORTEMENT

1. **Accueil** : Salue chaleureusement chaque nouveau client
2. **Langue** : Réponds toujours dans la langue du client
3. **Prise de commande** : Guide le client à travers le menu, propose des suggestions
4. **Réservations** : Gère les demandes de réservation
5. **Questions** : Réponds aux questions sur les allergènes, ingrédients, horaires
6. **Politesse** : Reste toujours poli, professionnel et serviable
7. **Clarification** : Si une demande est ambiguë, demande des précisions

## ⚙️ FORMAT DE RÉPONSE

- Utilise des emojis avec parcimonie pour rendre les messages chaleureux
- Sois concis mais informatif
- Propose toujours une action suivante au client

---

## 🔄 BLOC DYNAMIQUE (injecté automatiquement par n8n à chaque requête)

**Contexte temporel :**
- Date et heure actuelles : {{NOW}}

**Informations client :**
- Nom du client WhatsApp : {{CUSTOMER_NAME}}

**Message à traiter :**
{{USER_MESSAGE}}
`;

export function StarterPromptTemplateEditor() {
  const { session } = useAuth();
  const [value, setValue] = useState('');
  const [activeTab, setActiveTab] = useState<string>('edit');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applyingToAll, setApplyingToAll] = useState(false);
  const [confirmApplyAllOpen, setConfirmApplyAllOpen] = useState(false);
  const [starterCount, setStarterCount] = useState(0);

  useEffect(() => {
    loadTemplate();
    loadStarterCount();
  }, []);

  const loadTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'starter_prompt_template')
        .maybeSingle();

      if (error) throw error;

      if (data?.setting_value) {
        // setting_value is Json type, could be a string or object
        const templateValue = typeof data.setting_value === 'string' 
          ? data.setting_value 
          : (data.setting_value as { template?: string })?.template || '';
        setValue(templateValue);
      } else {
        setValue(DEFAULT_PROMPT);
      }
    } catch (error) {
      console.error('Error loading starter prompt template:', error);
      toast.error('Erreur lors du chargement du template');
      setValue(DEFAULT_PROMPT);
    } finally {
      setLoading(false);
    }
  };

  const loadStarterCount = async () => {
    try {
      // Count Starter users
      const { count, error } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('plan', 'starter');

      if (error) throw error;
      setStarterCount(count || 0);
    } catch (error) {
      console.error('Error counting starter users:', error);
    }
  };

  const handleSave = async () => {
    if (!session) {
      toast.error('Session expirée');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: 'starter_prompt_template',
          setting_value: { template: value },
          updated_by: session.user.id,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'setting_key' });

      if (error) throw error;

      toast.success('Template Starter sauvegardé avec succès');
    } catch (error) {
      console.error('Error saving starter prompt template:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setValue(DEFAULT_PROMPT);
    toast.info('Template réinitialisé (non sauvegardé)');
  };

  // Helper: Format opening hours from JSON to readable text
  const formatOpeningHours = (hours: unknown): string => {
    if (!hours || !Array.isArray(hours)) return 'Horaires non renseignés';
    const formatted = hours
      .filter((h: { day?: string; slot1?: string; slot2?: string }) => h.slot1 || h.slot2)
      .map((h: { day?: string; slot1?: string; slot2?: string }) => 
        `${h.day || ''}: ${[h.slot1, h.slot2].filter(Boolean).join(' / ')}`
      )
      .join('\n');
    return formatted || 'Horaires non renseignés';
  };

  // Helper: Format assets from JSON to readable text
  const formatAssets = (assets: unknown): string => {
    if (!assets || !Array.isArray(assets) || assets.length === 0) return 'Aucune image disponible';
    return assets
      .map((a: { description?: string; filename?: string; url?: string }) => 
        `- ${a.description || a.filename || 'Image'}: ${a.url || ''}`
      )
      .join('\n');
  };

  // Helper: Replace all static placeholders with real restaurant data
  const replacePlaceholders = (
    template: string, 
    restaurant: {
      restaurant_name?: string | null;
      address_street?: string | null;
      address_postal_code?: string | null;
      address_city?: string | null;
      opening_hours?: unknown;
      order_time_minutes?: number | null;
      assets?: unknown;
    }, 
    categories: string[]
  ): string => {
    let rendered = template;
    
    // [[RESTAURANT_NAME]]
    rendered = rendered.replace(/\[\[RESTAURANT_NAME\]\]/g, restaurant.restaurant_name || 'Restaurant');
    
    // [[ADDRESS]]
    const address = [restaurant.address_street, restaurant.address_postal_code, restaurant.address_city]
      .filter(Boolean).join(', ');
    rendered = rendered.replace(/\[\[ADDRESS\]\]/g, address || 'Adresse non renseignée');
    
    // [[OPENING_HOURS]]
    const hours = formatOpeningHours(restaurant.opening_hours);
    rendered = rendered.replace(/\[\[OPENING_HOURS\]\]/g, hours);
    
    // [[ORDER_WAIT_TIME]]
    rendered = rendered.replace(/\[\[ORDER_WAIT_TIME\]\]/g, String(restaurant.order_time_minutes || 15));
    
    // [[ASSETS]]
    const assets = formatAssets(restaurant.assets);
    rendered = rendered.replace(/\[\[ASSETS\]\]/g, assets);
    
    // [[CATEGORIES]]
    rendered = rendered.replace(/\[\[CATEGORIES\]\]/g, categories.join(', ') || 'Aucune catégorie');
    
    return rendered;
  };

  // Apply template to all existing Starter users
  const handleApplyToAllStarters = async () => {
    setConfirmApplyAllOpen(false);
    setApplyingToAll(true);
    
    try {
      // First, get all Starter user IDs
      const { data: starterUsers, error: usersError } = await supabase
        .from('user_subscriptions')
        .select('user_id')
        .eq('plan', 'starter');

      if (usersError) throw usersError;

      if (!starterUsers || starterUsers.length === 0) {
        toast.info('Aucun utilisateur Starter trouvé');
        return;
      }

      const userIds = starterUsers.map(u => u.user_id);

      // Fetch complete restaurant data for each Starter user
      const { data: starterRestaurants, error: settingsError } = await supabase
        .from('restaurant_settings')
        .select(`
          user_id,
          restaurant_name,
          address_street,
          address_postal_code,
          address_city,
          opening_hours,
          order_time_minutes,
          assets
        `)
        .in('user_id', userIds);

      if (settingsError) throw settingsError;

      if (!starterRestaurants || starterRestaurants.length === 0) {
        toast.warning('Aucun restaurant configuré parmi les utilisateurs Starter');
        return;
      }

      // Fetch all products for these users to get categories
      const restaurantUserIds = starterRestaurants.map(s => s.user_id);
      const { data: allProducts, error: productsError } = await supabase
        .from('products')
        .select('user_id, category')
        .in('user_id', restaurantUserIds);

      if (productsError) {
        console.error('Error fetching products:', productsError);
      }

      // Group categories by user_id
      const categoriesByUser: Record<string, Set<string>> = {};
      allProducts?.forEach(p => {
        if (!categoriesByUser[p.user_id]) {
          categoriesByUser[p.user_id] = new Set();
        }
        categoriesByUser[p.user_id].add(p.category);
      });

      // Update each restaurant individually with personalized prompt
      let updatedCount = 0;
      for (const restaurant of starterRestaurants) {
        const categories = Array.from(categoriesByUser[restaurant.user_id] || []);
        const renderedPrompt = replacePlaceholders(value, restaurant, categories);

        const { error: updateError } = await supabase
          .from('restaurant_settings')
          .update({
            chatbot_prompt: renderedPrompt,        // Rendered prompt with real data
            updated_at: new Date().toISOString()
          })
          .eq('user_id', restaurant.user_id);

        if (updateError) {
          console.error(`Error updating restaurant for user ${restaurant.user_id}:`, updateError);
        } else {
          updatedCount++;
          console.log(`Updated ${restaurant.restaurant_name || restaurant.user_id} with personalized prompt`);
        }
      }

      if (updatedCount > 0) {
        toast.success(`Template personnalisé appliqué à ${updatedCount} restaurant(s) Starter`);
      } else {
        toast.warning('Aucun restaurant mis à jour');
      }

      // Also save to system_settings for new users
      await handleSave();
    } catch (error) {
      console.error('Error applying template to all starters:', error);
      toast.error('Erreur lors de l\'application du template');
    } finally {
      setApplyingToAll(false);
    }
  };

  // Highlight placeholders in the text for preview - sanitized for XSS protection
  const highlightedPreview = useMemo(() => {
    // First, escape the raw text to prevent XSS
    const escapeHtml = (text: string) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };
    
    let highlighted = escapeHtml(value || DEFAULT_PROMPT);
    
    // Highlight static placeholders (escaped versions)
    highlighted = highlighted.replace(/\[\[RESTAURANT_NAME\]\]/g, '<span class="bg-blue-500/30 px-1 rounded font-medium">[[RESTAURANT_NAME]]</span>');
    highlighted = highlighted.replace(/\[\[ADDRESS\]\]/g, '<span class="bg-green-500/30 px-1 rounded font-medium">[[ADDRESS]]</span>');
    highlighted = highlighted.replace(/\[\[OPENING_HOURS\]\]/g, '<span class="bg-purple-500/30 px-1 rounded font-medium">[[OPENING_HOURS]]</span>');
    highlighted = highlighted.replace(/\[\[CATEGORIES\]\]/g, '<span class="bg-orange-500/30 px-1 rounded font-medium">[[CATEGORIES]]</span>');
    highlighted = highlighted.replace(/\[\[ASSETS\]\]/g, '<span class="bg-pink-500/30 px-1 rounded font-medium">[[ASSETS]]</span>');
    highlighted = highlighted.replace(/\[\[ORDER_WAIT_TIME\]\]/g, '<span class="bg-cyan-500/30 px-1 rounded font-medium">[[ORDER_WAIT_TIME]]</span>');
    
    // Highlight dynamic variables
    highlighted = highlighted.replace(/\{\{NOW\}\}/g, '<span class="bg-amber-500/30 px-1 rounded font-mono text-xs">{{NOW}}</span>');
    highlighted = highlighted.replace(/\{\{CUSTOMER_NAME\}\}/g, '<span class="bg-red-500/30 px-1 rounded font-mono text-xs">{{CUSTOMER_NAME}}</span>');
    highlighted = highlighted.replace(/\{\{USER_MESSAGE\}\}/g, '<span class="bg-red-500/30 px-1 rounded font-mono text-xs">{{USER_MESSAGE}}</span>');
    
    // Sanitize the final HTML to only allow safe tags
    return DOMPurify.sanitize(highlighted, { 
      ALLOWED_TAGS: ['span'], 
      ALLOWED_ATTR: ['class'] 
    });
  }, [value]);

  // Count placeholder usage
  const placeholderStats = useMemo(() => {
    const text = value || '';
    return {
      static: STATIC_PLACEHOLDERS.filter(p => text.includes(p.key)).length,
      dynamic: DYNAMIC_VARIABLES.filter(v => text.includes(v.key)).length,
      total: STATIC_PLACEHOLDERS.length + DYNAMIC_VARIABLES.length,
    };
  }, [value]);

  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById('starter-prompt-textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.slice(0, start) + placeholder + value.slice(end);
      setValue(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
        textarea.focus();
      }, 0);
    } else {
      setValue(value + placeholder);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-64 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>Template Prompt Starter</CardTitle>
        </div>
        <CardDescription>
          Ce template est utilisé par défaut pour tous les restaurants avec le plan Starter. 
          Les placeholders seront remplacés par les données de chaque restaurant.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {placeholderStats.static}/{STATIC_PLACEHOLDERS.length} statiques
          </Badge>
          <Badge variant="outline" className="text-xs">
            {placeholderStats.dynamic}/{DYNAMIC_VARIABLES.length} dynamiques
          </Badge>
        </div>

        {/* Info alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Les placeholders <code className="bg-blue-500/20 px-1 rounded">[[...]]</code> sont remplacés par les données Supabase. 
            Les variables <code className="bg-amber-500/20 px-1 rounded">{'{{'} ... {'}}'}</code> sont injectées par n8n à chaque requête.
          </AlertDescription>
        </Alert>

        {/* Placeholder buttons */}
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Placeholders statiques (Supabase)</Label>
            <div className="flex flex-wrap gap-1.5">
              {STATIC_PLACEHOLDERS.map((p) => (
                <TooltipProvider key={p.key}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => insertPlaceholder(p.key)}
                        className={`px-2 py-1 text-xs rounded border font-mono hover:opacity-80 transition-opacity ${p.color}`}
                      >
                        {p.key}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{p.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Variables dynamiques (n8n)</Label>
            <div className="flex flex-wrap gap-1.5">
              {DYNAMIC_VARIABLES.map((v) => (
                <TooltipProvider key={v.key}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => insertPlaceholder(v.key)}
                        className={`px-2 py-1 text-xs rounded border font-mono hover:opacity-80 transition-opacity ${v.color}`}
                      >
                        {v.key}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{v.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </div>

        {/* Editor tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Éditer
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Aperçu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="mt-4">
            <div className="space-y-2">
              <Label htmlFor="starter-prompt-textarea">Contenu du template</Label>
              <Textarea
                id="starter-prompt-textarea"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={DEFAULT_PROMPT}
                className="min-h-[400px] font-mono text-sm resize-y"
              />
              <p className="text-xs text-muted-foreground">
                {(value || '').length} caractères
              </p>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <div className="space-y-2">
              <Label>Aperçu avec placeholders colorés</Label>
              <ScrollArea className="h-[400px] w-full rounded-md border bg-muted/30 p-4">
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-mono text-sm"
                  dangerouslySetInnerHTML={{ __html: highlightedPreview }}
                />
              </ScrollArea>
              <p className="text-xs text-muted-foreground">
                Les placeholders sont mis en évidence. Ils seront remplacés par les données de chaque restaurant.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action buttons */}
        <div className="flex flex-col gap-4 pt-4 border-t">
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={handleSave} disabled={saving || applyingToAll}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder (nouveaux utilisateurs)'}
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={saving || applyingToAll}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button 
              variant="secondary" 
              onClick={() => setConfirmApplyAllOpen(true)}
              disabled={saving || applyingToAll}
            >
              <Users className="h-4 w-4 mr-2" />
              {applyingToAll ? 'Application...' : `Appliquer à tous les Starter (${starterCount})`}
            </Button>
            <p className="text-xs text-muted-foreground">
              Mettra à jour le prompt de tous les utilisateurs Starter existants
            </p>
          </div>
        </div>

        <Alert className="mt-4">
          <UserPlus className="h-4 w-4" />
          <AlertDescription>
            <strong>Sauvegarder</strong> = Le template sera utilisé pour les nouveaux utilisateurs Starter uniquement.<br/>
            <strong>Appliquer à tous</strong> = Mettra à jour le prompt de tous les Starter existants ET sera utilisé pour les nouveaux.
          </AlertDescription>
        </Alert>
      </CardContent>

      <ConfirmDialog
        open={confirmApplyAllOpen}
        onOpenChange={setConfirmApplyAllOpen}
        title="Appliquer à tous les Starter"
        description={`Êtes-vous sûr de vouloir appliquer ce template à ${starterCount} utilisateur(s) Starter ? Leurs prompts actuels seront remplacés.`}
        onConfirm={handleApplyToAllStarters}
        variant="default"
      />
    </Card>
  );
}
