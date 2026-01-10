import { useState } from "react";
import { LayoutDashboard, BarChart3, TrendingUp, ShoppingCart, Users, MessageCircle, Settings, LogOut, Crown, User, ChevronDown, ChevronRight, Shield, LifeBuoy, Gauge, UtensilsCrossed, Wrench, Package, Globe, CreditCard } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSupportTickets } from "@/hooks/useSupportTickets";
import { useAdminTickets } from "@/hooks/useAdminTickets";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar, SidebarHeader, SidebarFooter, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
const userMainItems = [{
  title: "Dashboard",
  url: "/dashboard",
  icon: LayoutDashboard
}, {
  title: "Commandes",
  url: "/orders",
  icon: Package
}, {
  title: "Catalogue",
  url: "/catalogue",
  icon: UtensilsCrossed
}, {
  title: "Conversations",
  url: "/conversations",
  icon: MessageCircle
}, {
  title: "Profil Public",
  url: "/public-profile",
  icon: Globe
}, {
  title: "Paiements",
  url: "/payments",
  icon: CreditCard
}, {
  title: "Support",
  url: "/support",
  icon: LifeBuoy
}, {
  title: "Paramètres",
  url: "/settings",
  icon: Settings
}];
const adminMainItems = [{
  title: "Dashboard Admin",
  url: "/admin/dashboard",
  icon: LayoutDashboard
}];
const analyticsItems = [{
  title: "Revenus & Performance",
  url: "/analytics/revenue",
  icon: TrendingUp
}, {
  title: "Commandes & Produits",
  url: "/analytics/orders",
  icon: ShoppingCart
}, {
  title: "Métriques Client",
  url: "/analytics/customers",
  icon: Users
}];
export function AppSidebar() {
  const {
    state,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    isNarrow
  } = useSidebar();
  const {
    profile,
    signOut
  } = useAuth();
  const {
    unreadCount
  } = useSupportTickets();
  const {
    awaitingAdminCount
  } = useAdminTickets();
  const shouldAutoClose = isMobile || isNarrow; // mobile & tablette
  const collapsed = !shouldAutoClose && state === 'collapsed';
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [analyticsOpen, setAnalyticsOpen] = useState(currentPath.startsWith('/analytics'));
  const isActive = (path: string) => currentPath === path;
  const isGroupActive = (basePath: string) => currentPath.startsWith(basePath);
  const getNavCls = (isActive: boolean) => isActive ? collapsed ? "bg-primary/20 text-primary rounded-lg" // Bulle verte claire complète en collapsed
  : "bg-gradient-to-r from-primary/20 to-primary/10 text-primary font-semibold border-r-2 border-primary shadow-sm" : "hover:bg-muted/70 transition-all duration-200 hover:translate-x-1";
  const handleSignOut = async () => {
    await signOut();
    // Full page navigation to exit React SPA and go to Astro public page
    window.location.href = '/';
  };
  const handleNavClick = (path: string) => {
    if (shouldAutoClose) {
      // Sur mobile/tablette : fermer la sidebar après navigation (sheet + inline state)
      setOpenMobile?.(false);
      setOpen?.(false);
      return;
    }
    if (collapsed && currentPath !== path) {
      // Desktop collapsed : on ouvre pour afficher les labels
      setOpen?.(true);
      if (path.startsWith('/analytics') || path.startsWith('/settings')) {
        setAnalyticsOpen(true);
      }
    }
  };
  const isAdmin = profile?.role === 'admin';

  // Select appropriate navigation items based on role
  const mainItems = isAdmin ? adminMainItems : userMainItems;

  // Filter analytics items based on subscription plan
  const getAvailableAnalyticsItems = () => {
    const plan = profile?.plan || 'starter';

    // Pro and Premium have access to analytics (without Paramètres - already in main nav)
    if (plan === 'pro' || plan === 'premium') {
      return [{
        title: "Revenus & Performance",
        url: "/analytics/revenue",
        icon: TrendingUp
      }, {
        title: "Commandes & Produits",
        url: "/analytics/orders",
        icon: ShoppingCart
      }, {
        title: "Métriques Client",
        url: "/analytics/customers",
        icon: Users
      }];
    }

    // Starter has no analytics section
    return [];
  };
  const availableAnalyticsItems = getAvailableAnalyticsItems();
  const analyticsAvailable = profile?.plan === 'pro' || profile?.plan === 'premium';

  // Get badge style based on role/plan
  const getBadgeStyle = () => {
    if (isAdmin) return 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground';
    switch (profile?.plan) {
      case 'premium':
        return 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white';
      case 'pro':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'starter':
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white';
    }
  };
  const getBadgeText = () => {
    if (isAdmin) return 'Admin';
    return profile?.plan?.toUpperCase() || 'STARTER';
  };

  // Données utilisateur réelles depuis le profil
  const userName = profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : profile?.email?.split('@')[0] || 'Utilisateur';
  const userInitials = profile?.first_name && profile?.last_name ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase() : (profile?.email?.[0] || 'U').toUpperCase();
  return <Sidebar className={`transition-all duration-300 ${collapsed ? "w-16" : "w-64"} bg-gradient-to-b from-background via-background to-muted/20`} collapsible="icon">
      <SidebarHeader className={`h-14 border-b bg-gradient-to-r from-primary/5 to-primary/10 transition-all duration-300 flex flex-col justify-center ${collapsed ? "p-0 items-center" : "px-4"}`}>
        <div className={`flex ${collapsed ? "justify-center" : "items-center space-x-3"} transition-all duration-300 w-full`}>
          <div className="relative shrink-0">
            <div className={`${collapsed ? "w-8 h-8" : "w-8 h-8"} bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center shadow-sm transition-all duration-300`}>
              <MessageCircle className={`${collapsed ? "h-4 w-4" : "h-5 w-5"} text-primary-foreground`} />
            </div>
          </div>
          {!collapsed && <div className="flex-1 min-w-0 overflow-hidden">
              <h2 className="font-bold text-lg bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent truncate leading-none">
                ChatFood
              </h2>
            </div>}
        </div>
      </SidebarHeader>

      <SidebarContent className={`space-y-1 ${collapsed ? "px-0" : "p-2"}`}>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={`${collapsed ? "sr-only" : "text-sm font-semibold text-foreground/80 px-2 mb-2"}`}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={`${getNavCls(isActive(item.url))} ${collapsed ? "p-2 w-12 h-12 flex items-center justify-center ml-0" : "p-3 rounded-lg"}`} onClick={() => handleNavClick(item.url)}>
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="ml-3 font-medium flex items-center gap-2">
                          {item.title}
                          {item.title === "Support" && unreadCount > 0 && <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                              {unreadCount}
                            </Badge>}
                        </span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Analytics & Settings Section - Only show if user has access or is admin */}
        {(analyticsAvailable || isAdmin) && <SidebarGroup>
            <Collapsible open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
              <SidebarMenuItem className="list-none">
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className={`${getNavCls(isGroupActive('/analytics'))} ${collapsed ? "p-2 w-12 h-12 flex items-center justify-center ml-0" : "p-3 rounded-lg"} group [&[data-state=open]>svg]:rotate-90 [&>span]:data-[state=open]:visible`} onClick={() => handleNavClick('/analytics')}>
                    <BarChart3 className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <>
                        <span className="ml-3 font-medium flex-1 text-left">Analytics</span>
                        <ChevronRight className={`ml-auto h-4 w-4 transition-transform duration-200 ${analyticsOpen ? "rotate-90" : ""}`} />
                      </>}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {!collapsed && <CollapsibleContent className="transition-all duration-200">
                    <SidebarMenuSub className="ml-4 mt-1 space-y-1">
                      {availableAnalyticsItems.map(item => <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild>
                            <NavLink to={item.url} className={`${getNavCls(isActive(item.url))} rounded-lg p-2 pl-6`} onClick={() => handleNavClick(item.url)}>
                              <item.icon className="h-4 w-4 flex-shrink-0" />
                              <span className="ml-3 text-sm">{item.title}</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>)}
                    </SidebarMenuSub>
                  </CollapsibleContent>}
              </SidebarMenuItem>
            </Collapsible>
          </SidebarGroup>}

        {/* Admin Section */}
        {isAdmin && <SidebarGroup>
            <SidebarGroupLabel className={`${collapsed ? "sr-only" : "text-sm font-semibold text-foreground/80 px-2 mb-2"}`}>
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin/dashboards" className={`${getNavCls(isActive('/admin/dashboards'))} ${collapsed ? "p-2 w-12 h-12 flex items-center justify-center ml-0" : "p-3 rounded-lg"}`} onClick={() => handleNavClick('/admin/dashboards')}>
                      <Gauge className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="ml-3 font-medium">Dashboards</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin/users" className={`${getNavCls(isActive('/admin/users'))} ${collapsed ? "p-2 w-12 h-12 flex items-center justify-center ml-0" : "p-3 rounded-lg"}`} onClick={() => handleNavClick('/admin/users')}>
                      <Users className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="ml-3 font-medium">Utilisateurs</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin/tickets" className={`${getNavCls(isActive('/admin/tickets'))} ${collapsed ? "p-2 w-12 h-12 flex items-center justify-center ml-0" : "p-3 rounded-lg"}`} onClick={() => handleNavClick('/admin/tickets')}>
                      <LifeBuoy className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="ml-3 font-medium flex items-center gap-2">
                          Tickets Support
                          {awaitingAdminCount > 0 && <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                              {awaitingAdminCount}
                            </Badge>}
                        </span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin/security" className={`${getNavCls(isActive('/admin/security'))} ${collapsed ? "p-2 w-12 h-12 flex items-center justify-center ml-0" : "p-3 rounded-lg"}`} onClick={() => handleNavClick('/admin/security')}>
                      <Shield className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="ml-3 font-medium">Sécurité & Logs</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin/settings" className={`${getNavCls(isActive('/admin/settings'))} ${collapsed ? "p-2 w-12 h-12 flex items-center justify-center ml-0" : "p-3 rounded-lg"}`} onClick={() => handleNavClick('/admin/settings')}>
                      <Settings className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="ml-3 font-medium">Paramètres Système</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin/restaurant-settings" className={`${getNavCls(isActive('/admin/restaurant-settings'))} ${collapsed ? "p-2 w-12 h-12 flex items-center justify-center ml-0" : "p-3 rounded-lg"}`} onClick={() => handleNavClick('/admin/restaurant-settings')}>
                      <Wrench className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="ml-3 font-medium">Config Restaurants</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>}
      </SidebarContent>

      <SidebarFooter className={`border-t bg-gradient-to-r from-muted/30 to-muted/50 transition-all duration-300 ${collapsed ? "p-3" : "p-4"}`}>
        {!collapsed && profile && <div className="space-y-3">
            {/* User Info Card */}
            <div className="bg-gradient-to-r from-background to-muted/50 rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-sm text-foreground truncate">{userName}</h4>
                    <Badge className={`text-xs px-2 py-0.5 ${getBadgeStyle()}`}>
                      {getBadgeText()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate font-medium">
                    {profile.email}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Logout Button */}
            <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full bg-gradient-to-r hover:from-destructive/10 hover:to-destructive/5 hover:border-destructive/20 transition-all duration-200 hover:shadow-sm">
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>}
        
        {collapsed && <div className="flex flex-col items-center space-y-3">
            <Avatar className="h-8 w-8 ring-2 ring-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="p-2 hover:bg-destructive/10">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>}
      </SidebarFooter>
    </Sidebar>;
}