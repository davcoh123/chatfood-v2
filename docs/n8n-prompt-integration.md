# Documentation n8n - Intégration du Prompt Système

## Architecture

Le prompt système est divisé en deux parties :
1. **Partie Statique** : Stockée dans Supabase (`restaurant_settings.chatbot_prompt`)
2. **Partie Dynamique** : Injectée par n8n à chaque requête

---

## 📊 Structure des Placeholders

### Placeholders Statiques (Supabase → n8n)

| Placeholder | Source Supabase | Transformation n8n |
|-------------|-----------------|-------------------|
| `[[RESTAURANT_NAME]]` | `restaurant_settings.restaurant_name` | Direct |
| `[[ADDRESS]]` | `restaurant_settings.address_street`, `address_postal_code`, `address_city` | Concaténation |
| `[[OPENING_HOURS]]` | `restaurant_settings.opening_hours` (JSON) | Formatage par jour |
| `[[CATEGORIES]]` | `products.category` (DISTINCT) | `.join(', ')` |
| `[[ASSETS]]` | `restaurant_settings.assets` (JSON) | `.map(a => a.description + ' = ' + a.url).join('\n')` |

### Variables Dynamiques (n8n Runtime)

| Variable | Expression n8n | Description |
|----------|---------------|-------------|
| `{{NOW}}` | `{{ $now.setLocale('fr').toFormat('dd/MM/yyyy HH:mm') }}` | Date et heure actuelles |
| `{{DAY_NAME}}` | `{{ $now.setLocale('fr').toFormat('cccc') }}` | Nom du jour en français |
| `{{CUSTOMER_NAME}}` | `{{ $('Webhook').item.json.body.contacts[0].profile.name }}` | Nom du contact WhatsApp |
| `{{USER_MESSAGE}}` | `{{ $('Webhook').item.json.body.messages[0].text.body }}` | Message du client |

---

## 🔧 Workflow n8n - Pseudo-code

```javascript
// 1. RÉCUPÉRATION DU PROMPT STATIQUE
const { data: settings } = await supabase
  .from('restaurant_settings')
  .select('chatbot_prompt, restaurant_name, opening_hours, assets, address_street, address_postal_code, address_city')
  .eq('user_id', userId)
  .single();

// 2. RÉCUPÉRATION DES CATÉGORIES
const { data: products } = await supabase
  .from('products')
  .select('category')
  .eq('user_id', userId)
  .eq('is_active', true);

const categories = [...new Set(products.map(p => p.category))].join(', ');

// 3. FORMATAGE DES ASSETS
// Format: "description = URL" (une ligne par asset)
const assets = settings.assets
  .map(a => `${a.description} = ${a.url}`)
  .join('\n');

// 4. FORMATAGE DE L'ADRESSE
const address = [
  settings.address_street,
  settings.address_postal_code,
  settings.address_city
].filter(Boolean).join(', ');

// 5. FORMATAGE DES HORAIRES
// Format: une ligne par jour
const openingHours = Object.entries(settings.opening_hours)
  .map(([day, hours]) => `${day}: ${hours.open || 'Fermé'}${hours.close ? ' - ' + hours.close : ''}`)
  .join('\n');

// 6. REMPLACEMENT DES PLACEHOLDERS STATIQUES
let prompt = settings.chatbot_prompt
  .replace(/\[\[RESTAURANT_NAME\]\]/g, settings.restaurant_name)
  .replace(/\[\[ADDRESS\]\]/g, address)
  .replace(/\[\[OPENING_HOURS\]\]/g, openingHours)
  .replace(/\[\[CATEGORIES\]\]/g, categories)
  .replace(/\[\[ASSETS\]\]/g, assets);

// 7. REMPLACEMENT DES VARIABLES DYNAMIQUES
prompt = prompt
  .replace(/\{\{NOW\}\}/g, $now.setLocale('fr').toFormat('dd/MM/yyyy HH:mm'))
  .replace(/\{\{DAY_NAME\}\}/g, $now.setLocale('fr').toFormat('cccc'))
  .replace(/\{\{CUSTOMER_NAME\}\}/g, webhookData.contacts[0].profile.name)
  .replace(/\{\{USER_MESSAGE\}\}/g, webhookData.messages[0].text.body);

// 8. ENVOI À L'API LLM
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: prompt },
    { role: 'user', content: webhookData.messages[0].text.body }
  ]
});
```

---

## 📝 Exemple de Prompt Final

### Avant transformation (stocké dans Supabase)

```
Tu es l'assistant virtuel de [[RESTAURANT_NAME]].

**Adresse :** [[ADDRESS]]

**Horaires :**
[[OPENING_HOURS]]

**Catégories disponibles :** [[CATEGORIES]]

**Images :**
[[ASSETS]]

---
Date : {{NOW}}
Jour : {{DAY_NAME}}
Client : {{CUSTOMER_NAME}}
Message : {{USER_MESSAGE}}
```

### Après transformation (envoyé au LLM)

```
Tu es l'assistant virtuel de Pizza Nova.

**Adresse :** 15 Rue de la Pizza, 75001, Paris

**Horaires :**
Lundi: 12h-14h, 19h-23h
Mardi: 12h-14h, 19h-23h
Mercredi: Fermé
Jeudi: 12h-14h, 19h-23h
Vendredi: 12h-14h, 19h-00h
Samedi: 19h-00h
Dimanche: 12h-15h

**Catégories disponibles :** Pizzas, Pâtes, Salades, Desserts, Boissons

**Images :**
Menu principal = https://dcwfgxbwpecnjbhrhrib.supabase.co/storage/v1/object/public/assets/menu.jpg
Logo du restaurant = https://dcwfgxbwpecnjbhrhrib.supabase.co/storage/v1/object/public/assets/logo.png

---
Date : 19/12/2025 14:30
Jour : jeudi
Client : Jean Dupont
Message : Bonjour, je voudrais commander une pizza margherita
```

---

## 🔄 Node n8n - Code Block

```javascript
// Node: "Build System Prompt"
// Type: Code

const settings = $('Supabase Settings').item.json;
const products = $('Supabase Products').all();
const webhook = $('Webhook').item.json;

// Catégories uniques
const categories = [...new Set(products.map(p => p.category))].join(', ');

// Assets formatés
const assets = (settings.assets || [])
  .map(a => `${a.description} = ${a.url}`)
  .join('\n');

// Adresse complète
const address = [
  settings.address_street,
  settings.address_postal_code,
  settings.address_city
].filter(Boolean).join(', ');

// Horaires formatés
const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const openingHours = days.map(day => {
  const hours = settings.opening_hours?.[day.toLowerCase()];
  if (!hours || hours.closed) return `${day}: Fermé`;
  return `${day}: ${hours.open} - ${hours.close}`;
}).join('\n');

// Remplacement des placeholders
let prompt = settings.chatbot_prompt || '';

// Statiques
prompt = prompt
  .replace(/\[\[RESTAURANT_NAME\]\]/g, settings.restaurant_name || '')
  .replace(/\[\[ADDRESS\]\]/g, address)
  .replace(/\[\[OPENING_HOURS\]\]/g, openingHours)
  .replace(/\[\[CATEGORIES\]\]/g, categories)
  .replace(/\[\[ASSETS\]\]/g, assets);

// Dynamiques
const now = DateTime.now().setLocale('fr');
prompt = prompt
  .replace(/\{\{NOW\}\}/g, now.toFormat('dd/MM/yyyy HH:mm'))
  .replace(/\{\{DAY_NAME\}\}/g, now.toFormat('cccc'))
  .replace(/\{\{CUSTOMER_NAME\}\}/g, webhook.body?.contacts?.[0]?.profile?.name || 'Client')
  .replace(/\{\{USER_MESSAGE\}\}/g, webhook.body?.messages?.[0]?.text?.body || '');

return { systemPrompt: prompt };
```

---

## ⚠️ Points d'attention

1. **Ordre de remplacement** : Toujours remplacer les placeholders statiques AVANT les dynamiques
2. **Échappement** : Les `[[` et `{{` doivent être échappés si présents dans le contenu
3. **Valeurs manquantes** : Toujours fournir des valeurs par défaut pour éviter les erreurs
4. **Performance** : Mettre en cache les données statiques si possible (refresh toutes les 5 min)
5. **Assets vides** : Si aucun asset n'est configuré, la section peut être vide
