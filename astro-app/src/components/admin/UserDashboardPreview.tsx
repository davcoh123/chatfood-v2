import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DynamicMetricCard } from '@/components/dashboard/DynamicMetricCard';
import { ReservationsCalendar } from '@/components/dashboard/ReservationsCalendar';
import { ConversationsWidget } from '@/components/dashboard/ConversationsWidget';
import { EditMetricDialog } from './EditMetricDialog';
import { DashboardConfigEditor } from './DashboardConfigEditor';
import { CatalogueConfigEditor } from './CatalogueConfigEditor';
import { TrendingUp, Calendar, Users, Star, MessageSquare, ShoppingCart, UtensilsCrossed, LayoutDashboard } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Catalogue from '@/pages/Catalogue';

interface DashboardSection {
  id: string;
  type: string;
  title: string;
  icon: any;
  color: string;
}

interface DashboardConfig {
  id: string;
  section_id: string;
  customizations: any;
  is_active: boolean;
}

interface UserDashboardPreviewProps {
  userId: string;
  plan: 'starter' | 'pro' | 'premium';
  userName: string;
  isAdminMode?: boolean;
  sections?: DashboardSection[];
  configs?: DashboardConfig[];
  onConfigSave?: () => void;
}

const DASHBOARD_SECTIONS: Record<string, DashboardSection[]> = {
  starter: [
    { id: 'whatsapp_messages', type: 'metric', title: 'Messages WhatsApp', icon: MessageSquare, color: 'text-green-600' },
    { id: 'orders', type: 'metric', title: 'Nombre de commandes', icon: ShoppingCart, color: 'text-orange-600' },
    { id: 'reservations_calendar', type: 'calendar', title: 'Calendrier de Réservations', icon: Calendar, color: 'text-blue-600' },
    { id: 'catalogue', type: 'catalogue', title: 'Catalogue', icon: UtensilsCrossed, color: 'text-orange-600' },
  ],
  pro: [
    { id: 'daily_revenue', type: 'metric', title: 'Revenu journalier', icon: TrendingUp, color: 'text-emerald-600' },
    { id: 'daily_orders', type: 'metric', title: 'Commandes', icon: Calendar, color: 'text-blue-600' },
    { id: 'active_customers', type: 'metric', title: 'Clients actifs', icon: Users, color: 'text-purple-600' },
    { id: 'satisfaction', type: 'metric', title: 'Satisfaction', icon: Star, color: 'text-yellow-600' },
    { id: 'reservations_calendar', type: 'calendar', title: 'Calendrier de Réservations', icon: Calendar, color: 'text-blue-600' },
    { id: 'catalogue', type: 'catalogue', title: 'Catalogue', icon: UtensilsCrossed, color: 'text-orange-600' },
  ],
  premium: [
    { id: 'daily_revenue', type: 'metric', title: 'Revenu journalier', icon: TrendingUp, color: 'text-emerald-600' },
    { id: 'daily_orders', type: 'metric', title: 'Commandes', icon: Calendar, color: 'text-blue-600' },
    { id: 'active_customers', type: 'metric', title: 'Clients actifs', icon: Users, color: 'text-purple-600' },
    { id: 'satisfaction', type: 'metric', title: 'Satisfaction', icon: Star, color: 'text-yellow-600' },
    { id: 'reservations_calendar', type: 'calendar', title: 'Calendrier de Réservations', icon: Calendar, color: 'text-blue-600' },
    { id: 'catalogue', type: 'catalogue', title: 'Catalogue', icon: UtensilsCrossed, color: 'text-orange-600' },
  ],
};

export function UserDashboardPreview({ 
  userId, 
  plan, 
  userName,
  isAdminMode = false,
  sections: propSections,
  configs = [],
  onConfigSave,
}: UserDashboardPreviewProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingCalendar, setEditingCalendar] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard');
  
  const sections = propSections || DASHBOARD_SECTIONS[plan] || DASHBOARD_SECTIONS.starter;
  const metricSections = sections.filter(s => s.type === 'metric');
  const calendarSections = sections.filter(s => s.type === 'calendar');
  const catalogueSections = sections.filter(s => s.type === 'catalogue');
  const calendarConfig = configs.find(c => c.section_id === 'reservations_calendar');
  const catalogueConfig = configs.find(c => c.section_id === 'catalogue');
  const conversationsConfig = configs.find(c => c.section_id === 'conversations');

  return (
    <div className="space-y-6">
      {/* Admin Preview Banner */}
      <Alert className="border-primary/50 bg-primary/5">
        <Eye className="h-4 w-4" />
        <AlertDescription>
          <span className="font-semibold">MODE ADMIN PREVIEW</span> - Vous visualisez le dashboard tel que {userName} le voit
        </AlertDescription>
      </Alert>

      {/* Tabs for Dashboard, Catalogue & Conversations */}
      <Tabs value={activeAdminTab} onValueChange={setActiveAdminTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="dashboard">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard & Métriques
          </TabsTrigger>
          <TabsTrigger value="catalogue">
            <UtensilsCrossed className="h-4 w-4 mr-2" />
            Catalogue
          </TabsTrigger>
          <TabsTrigger value="conversations">
            <MessageSquare className="h-4 w-4 mr-2" />
            Conversations WhatsApp
          </TabsTrigger>
        </TabsList>

        {/* Onglet Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">

      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Bonjour, {userName} 👋
        </h2>
        <p className="text-muted-foreground">
          Voici votre tableau de bord {plan === 'starter' ? 'Starter' : plan === 'pro' ? 'PRO' : 'PREMIUM'}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricSections.map((section) => (
          <DynamicMetricCard
            key={section.id}
            sectionId={section.id}
            defaultTitle={section.title}
            defaultIcon={section.icon}
            defaultColor={section.color}
            isAdminMode={isAdminMode}
            userId={userId}
            onEdit={() => setEditingSection(section.id)}
          />
        ))}
      </div>

      {editingSection && (
        <EditMetricDialog
          open={!!editingSection}
          onOpenChange={(open) => !open && setEditingSection(null)}
          userId={userId}
          sectionId={editingSection}
          sectionType={sections.find(s => s.id === editingSection)?.type || 'metric'}
          plan={plan}
          currentConfig={configs.find(c => c.section_id === editingSection)?.customizations}
          isActive={configs.find(c => c.section_id === editingSection)?.is_active ?? true}
          onSave={() => {
            setEditingSection(null);
            onConfigSave?.();
          }}
        />
      )}

      {/* Quick Actions for Pro/Premium */}
      {(plan === 'pro' || plan === 'premium') && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-base">Revenus</CardTitle>
                <CardDescription>Analyser les revenus</CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-base">Commandes</CardTitle>
                <CardDescription>Voir les commandes</CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-base">Clients</CardTitle>
                <CardDescription>Gérer les clients</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      )}

      {/* Premium Features */}
      {plan === 'premium' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Fonctionnalités Premium</h3>
          <Card>
            <CardHeader>
              <CardTitle>Suggestions IA</CardTitle>
              <CardDescription>Recommandations personnalisées pour optimiser votre activité</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Les suggestions IA analyseront vos données en temps réel une fois vos webhooks configurés.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upgrade CTA for Starter */}
      {plan === 'starter' && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <Badge className="w-fit mb-2">Upgrade disponible</Badge>
            <CardTitle>Passez au plan PRO</CardTitle>
            <CardDescription>
              Débloquez des fonctionnalités avancées pour développer votre activité
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✅ Analytics avancés (revenus, commandes, clients)</li>
              <li>✅ Tableaux de bord personnalisables</li>
              <li>✅ Support prioritaire</li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Calendrier de réservations */}
      {calendarSections.map((section) => (
        <div key={section.id} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{section.title}</h3>
            {isAdminMode && !editingCalendar && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEditingCalendar(true)}
              >
                Configurer les webhooks
              </Button>
            )}
          </div>
          
          {editingCalendar ? (
            <DashboardConfigEditor
              userId={userId}
              sectionId={section.id}
              sectionType="calendar"
              plan={plan}
              currentConfig={calendarConfig?.customizations || {}}
              isActive={calendarConfig?.is_active ?? true}
              onSave={() => {
                setEditingCalendar(false);
                onConfigSave?.();
              }}
            />
          ) : (
            <ReservationsCalendar 
              userId={userId} 
              isAdminMode={isAdminMode}
            />
          )}
        </div>
      ))}
        </TabsContent>

        {/* Onglet Catalogue */}
        <TabsContent value="catalogue" className="space-y-6">
          {/* Configuration des webhooks */}
          <CatalogueConfigEditor
            userId={userId}
            userName={userName}
            existingConfig={catalogueConfig?.customizations as any}
            onSave={() => onConfigSave?.()}
          />

          {/* Prévisualisation du catalogue utilisateur */}
          <Card>
            <CardHeader>
              <CardTitle>Prévisualisation du Catalogue</CardTitle>
              <CardDescription>
          Vous voyez exactement ce que {userName} voit dans son catalogue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Catalogue userId={userId} />
      </CardContent>
    </Card>
        </TabsContent>

        {/* Onglet Conversations WhatsApp */}
        <TabsContent value="conversations" className="space-y-6">
          {/* Configuration des webhooks */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration Conversations WhatsApp</CardTitle>
              <CardDescription>
                Configurez les webhooks pour synchroniser les conversations de {userName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DashboardConfigEditor
                userId={userId}
                sectionId="conversations"
                sectionType="conversations"
                plan={plan}
                currentConfig={conversationsConfig?.customizations || {}}
                isActive={conversationsConfig?.is_active ?? true}
                onSave={() => onConfigSave?.()}
              />
            </CardContent>
          </Card>

          {/* Prévisualisation en direct */}
          <Card>
            <CardHeader>
              <CardTitle>Prévisualisation en direct</CardTitle>
              <CardDescription>
                Vous voyez exactement ce que {userName} voit dans ses conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConversationsWidget userId={userId} sectionId="conversations" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
