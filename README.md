# 🍔 ChatFood V2

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Une plateforme moderne de gestion de restauration avec un système de commande, paiement en ligne et tableau de bord administrateur complet.

## ✨ Caractéristiques

- 🛒 **Système de commande en ligne** - Catalogue de produits avec panier d'achat
- 💳 **Intégration Stripe** - Paiements sécurisés via Stripe
- 📊 **Dashboard Analytics** - Statistiques détaillées et rapports exportables
- 👥 **Gestion multi-utilisateurs** - Système d'authentification avec Supabase
- 🎨 **UI Moderne** - Interface avec shadcn/ui et Tailwind CSS
- 📱 **Responsive Design** - Compatible mobile, tablette et desktop
- 🔐 **Sécurité** - Authentification, autorisation et protection des données

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ et npm
- Compte Supabase (pour la base de données)
- Compte Stripe (pour les paiements)

## Project info

**URL**: https://lovable.dev/projects/0aeb90a0-74fc-4aa2-a961-129c7059d589

## 📦 Installation

```sh
# Cloner le repository
git clone https://github.com/davcoh123/chatfood-v2.git

# Naviguer dans le dossier
cd chatfood-v2

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

### Configuration

Créez un fichier `.env` à la racine du projet avec vos clés API :

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_supabase
VITE_STRIPE_PUBLIC_KEY=votre_cle_publique_stripe
```

## 📝 Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Build pour la production
- `npm run build:dev` - Build en mode développement
- `npm run lint` - Lint du code
- `npm run preview` - Prévisualise le build de production

## 🛠 Technologies utilisées

### Core
- **React 18.3** - Library UI
- **TypeScript 5.8** - Typage statique
- **Vite 5.4** - Build tool ultra-rapide

### UI & Styling
- **Tailwind CSS 3.4** - Framework CSS utility-first
- **shadcn/ui** - Composants React réutilisables
- **Radix UI** - Primitives UI accessibles
- **Lucide React** - Icônes modernes

### Backend & Database
- **Supabase** - Backend as a Service (Auth + Database)
- **Stripe** - Paiements en ligne

### State Management & Data
- **React Hook Form** - Gestion des formulaires
- **TanStack Query** - Cache et état serveur
- **React Router** - Navigation
- **Zod** - Validation de schémas

### Autres
- **jsPDF** - Génération de PDF
- **Recharts** - Graphiques et visualisations
- **DnD Kit** - Drag & drop
- **date-fns** - Manipulation de dates

## 🔧 Développement

### Méthodes d'édition

**Via Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/0aeb90a0-74fc-4aa2-a961-129c7059d589) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Via votre IDE préféré**

Clonez le repo et poussez vos changements. Les modifications seront reflétées dans Lovable.

**Directement sur GitHub**

Éditez les fichiers directement dans l'interface GitHub.

**Via GitHub Codespaces**

Cliquez sur "Code" → "Codespaces" → "New codespace" pour un environnement de développement complet dans le navigateur.

## 🚀 Déploiement

### Via Lovable

Simply open [Lovable](https://lovable.dev/projects/0aeb90a0-74fc-4aa2-a961-129c7059d589) and click on Share → Publish.

### Via Vercel (Recommandé)

```sh
npm install -g vercel
vercel
```

### Via Netlify

```sh
npm run build
# Puis déployez le dossier dist/
```

## 🌐 Domaine personnalisé

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## 📂 Structure du projet

```
chatfood-v2/
├── src/
│   ├── components/      # Composants React réutilisables
│   ├── pages/          # Pages de l'application
│   ├── contexts/       # Contexts React (Auth, Cart, etc.)
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Librairies et utilitaires
│   ├── schemas/        # Schémas de validation Zod
│   ├── utils/          # Fonctions utilitaires
│   └── integrations/   # Intégrations externes (Supabase, Stripe)
├── public/             # Assets statiques
├── astro-app/          # Application Astro (si utilisée)
└── supabase/           # Configuration Supabase
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**davcoh123**
- GitHub: [@davcoh123](https://github.com/davcoh123)
- Repository: [chatfood-v2](https://github.com/davcoh123/chatfood-v2)

## 🙏 Remerciements

- [Lovable](https://lovable.dev) - Pour la plateforme de développement
- [shadcn/ui](https://ui.shadcn.com) - Pour les composants UI
- [Supabase](https://supabase.com) - Pour le backend
- [Stripe](https://stripe.com) - Pour les paiements

---

⭐ N'oubliez pas de mettre une étoile si ce projet vous plaît !

---

**Dernière mise à jour** : 12 janvier 2026
