import { useState, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Code, Eye, Sparkles, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  restaurantName?: string;
  openingHours?: string;
  categories?: string;
  assets?: string;
  address?: string;
  orderWaitTime?: number;
  defaultTemplate?: string; // Template from admin system_settings
}

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

export function PromptEditor({ 
  value, 
  onChange, 
  restaurantName = 'Mon Restaurant',
  openingHours = 'Lundi: 12h-14h, 19h-23h\nMardi: 12h-14h, 19h-23h\nMercredi: Fermé\nJeudi: 12h-14h, 19h-23h\nVendredi: 12h-14h, 19h-00h\nSamedi: 19h-00h\nDimanche: 12h-15h',
  categories = 'Pizzas, Burgers, Pâtes, Salades, Desserts, Boissons',
  assets = 'Menu principal = https://dcwfgxbwpecnjbhrhrib.supabase.co/storage/v1/object/public/assets/menu.jpg\nLogo du restaurant = https://dcwfgxbwpecnjbhrhrib.supabase.co/storage/v1/object/public/assets/logo.png',
  address = '123 Rue de la Paix, 75001 Paris',
  orderWaitTime = 30,
  defaultTemplate
}: PromptEditorProps) {
  const [activeTab, setActiveTab] = useState<string>('edit');

  // Highlight placeholders in the text - sanitized for XSS protection
  const highlightedPreview = useMemo(() => {
    // First, escape the raw text to prevent XSS
    const escapeHtml = (text: string) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };
    
    let highlighted = escapeHtml(value || DEFAULT_PROMPT);
    
    // Escape data values before inserting
    const safeRestaurantName = escapeHtml(restaurantName);
    const safeAddress = escapeHtml(address);
    const safeOpeningHours = escapeHtml(openingHours);
    const safeCategories = escapeHtml(categories);
    const safeAssets = escapeHtml(assets);
    
    // Replace static placeholders with actual values for preview
    highlighted = highlighted.replace(/\[\[RESTAURANT_NAME\]\]/g, `<span class="bg-blue-500/30 px-1 rounded font-medium">${safeRestaurantName}</span>`);
    highlighted = highlighted.replace(/\[\[ADDRESS\]\]/g, `<span class="bg-green-500/30 px-1 rounded font-medium">${safeAddress}</span>`);
    highlighted = highlighted.replace(/\[\[OPENING_HOURS\]\]/g, `<span class="bg-purple-500/30 px-1 rounded font-medium">${safeOpeningHours}</span>`);
    highlighted = highlighted.replace(/\[\[CATEGORIES\]\]/g, `<span class="bg-orange-500/30 px-1 rounded font-medium">${safeCategories}</span>`);
    highlighted = highlighted.replace(/\[\[ASSETS\]\]/g, `<span class="bg-pink-500/30 px-1 rounded font-medium">${safeAssets}</span>`);
    highlighted = highlighted.replace(/\[\[ORDER_WAIT_TIME\]\]/g, `<span class="bg-cyan-500/30 px-1 rounded font-medium">${orderWaitTime}</span>`);
    
    // Highlight dynamic variables (not replaced, just styled)
    highlighted = highlighted.replace(/\{\{NOW\}\}/g, '<span class="bg-amber-500/30 px-1 rounded font-mono text-xs">{{NOW}}</span>');
    highlighted = highlighted.replace(/\{\{CUSTOMER_NAME\}\}/g, '<span class="bg-red-500/30 px-1 rounded font-mono text-xs">{{CUSTOMER_NAME}}</span>');
    highlighted = highlighted.replace(/\{\{USER_MESSAGE\}\}/g, '<span class="bg-red-500/30 px-1 rounded font-mono text-xs">{{USER_MESSAGE}}</span>');
    
    // Sanitize the final HTML to only allow safe tags
    return DOMPurify.sanitize(highlighted, { 
      ALLOWED_TAGS: ['span'], 
      ALLOWED_ATTR: ['class'] 
    });
  }, [value, restaurantName, openingHours, categories, assets, address, orderWaitTime]);

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
    const textarea = document.getElementById('prompt-textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.slice(0, start) + placeholder + value.slice(end);
      onChange(newValue);
      // Restore cursor position after insert
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
        textarea.focus();
      }, 0);
    } else {
      onChange(value + placeholder);
    }
  };

  const handleUseDefault = () => {
    onChange(defaultTemplate || DEFAULT_PROMPT);
  };

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-medium">Prompt Système IA</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {placeholderStats.static}/{STATIC_PLACEHOLDERS.length} statiques
          </Badge>
          <Badge variant="outline" className="text-xs">
            {placeholderStats.dynamic}/{DYNAMIC_VARIABLES.length} dynamiques
          </Badge>
        </div>
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
            <div className="flex items-center justify-between">
              <Label htmlFor="prompt-textarea">Contenu du prompt</Label>
              <button
                type="button"
                onClick={handleUseDefault}
                className="text-xs text-primary hover:underline"
              >
                Utiliser le template par défaut
              </button>
            </div>
            <Textarea
              id="prompt-textarea"
              value={value}
              onChange={(e) => onChange(e.target.value)}
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
            <Label>Aperçu avec données réelles</Label>
            <ScrollArea className="h-[400px] w-full rounded-md border bg-muted/30 p-4">
              <div 
                className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-mono text-sm"
                dangerouslySetInnerHTML={{ __html: highlightedPreview }}
              />
            </ScrollArea>
            <p className="text-xs text-muted-foreground">
              Les placeholders statiques sont remplacés par vos données actuelles. Les variables dynamiques restent visibles car elles seront injectées par n8n.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Info if no static placeholders - not an error, just informational */}
      {placeholderStats.static === 0 && value && value.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Aucun placeholder statique <code className="bg-blue-500/20 px-1 rounded">[[...]]</code> détecté. 
            Vous pouvez en ajouter pour personnaliser automatiquement le prompt avec les données du restaurant.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
