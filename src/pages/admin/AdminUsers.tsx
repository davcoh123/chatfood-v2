import React, { useEffect, useState } from 'react';
import { Search, UserCog, Shield, Mail, Calendar, MoreVertical, UserPlus, Edit, KeyRound, Ban, Trash2, Link } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreateUserDialog } from '@/components/admin/CreateUserDialog';
import { EditUserDialog } from '@/components/admin/EditUserDialog';
import { ResetPasswordDialog } from '@/components/admin/ResetPasswordDialog';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { ChangeSubscriptionDialog } from '@/components/admin/ChangeSubscriptionDialog';
import { GenerateLoginLinkDialog } from '@/components/admin/GenerateLoginLinkDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: 'admin' | 'user';
  plan: 'starter' | 'pro' | 'premium';
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [changeSubscriptionDialogOpen, setChangeSubscriptionDialogOpen] = useState(false);
  const [loginLinkDialogOpen, setLoginLinkDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter]);

  const fetchUsers = async () => {
    try {
      // Fetch profiles with role and plan joined
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // For each profile, fetch role and plan
      const usersWithRoleAndPlan = await Promise.all(
        (profilesData || []).map(async (profile) => {
          // Fetch role
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.user_id)
            .single();

          // Fetch plan
          const { data: planData } = await supabase
            .from('user_subscriptions')
            .select('plan')
            .eq('user_id', profile.user_id)
            .single();

          return {
            ...profile,
            role: roleData?.role || 'user',
            plan: planData?.plan || 'starter'
          };
        })
      );

      setUsers(usersWithRoleAndPlan);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleChangeRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expirée, veuillez vous reconnecter');
        return;
      }

      const { data, error } = await supabase.functions.invoke('admin-change-role', {
        body: { user_id: userId, new_role: newRole },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;

      toast.success(data.message || 'Rôle modifié avec succès');
      fetchUsers();
    } catch (error: any) {
      console.error('Error changing role:', error);
      toast.error(error.message || 'Erreur lors du changement de rôle');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.functions.invoke('admin-delete-user', {
        body: { user_id: selectedUser.user_id },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      if (error) throw error;
      toast.success('Utilisateur supprimé avec succès');
      setDeleteDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBlock = async (action: 'block' | 'unblock') => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.functions.invoke('admin-toggle-block', {
        body: { user_id: selectedUser.user_id, action, reason: 'Bloqué par administrateur' },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      if (error) throw error;
      toast.success(action === 'block' ? 'Utilisateur bloqué' : 'Utilisateur débloqué');
      setBlockDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <Badge variant="default" className="bg-purple-500">
        <Shield className="h-3 w-3 mr-1" />
        Admin
      </Badge>
    ) : (
      <Badge variant="secondary">Utilisateur</Badge>
    );
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground mt-2">
            Gérer les comptes utilisateurs et leurs permissions
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Créer un utilisateur
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Administrateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === 'admin').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Standard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === 'user').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs</CardTitle>
          <CardDescription>
            Recherchez et gérez les utilisateurs de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par email ou nom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="admin">Administrateurs</SelectItem>
                <SelectItem value="user">Utilisateurs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Date d'inscription</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.first_name || user.last_name
                          ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                          : 'Non renseigné'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {user.email}
                        </div>
                      </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      user.plan === 'premium' ? 'border-purple-500 text-purple-500' :
                      user.plan === 'pro' ? 'border-blue-500 text-blue-500' :
                      'border-gray-500 text-gray-500'
                    }>
                      {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                    </Badge>
                  </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user);
                              setEditDialogOpen(true);
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Éditer le profil
                            </DropdownMenuItem>
                            
                          <DropdownMenuItem
                            onClick={() =>
                              handleChangeRole(
                                user.user_id,
                                user.role === 'admin' ? 'user' : 'admin'
                              )
                            }
                          >
                            <UserCog className="h-4 w-4 mr-2" />
                            Changer en {user.role === 'admin' ? 'Utilisateur' : 'Admin'}
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            setChangeSubscriptionDialogOpen(true);
                          }}>
                            <UserCog className="h-4 w-4 mr-2" />
                            Changer le plan
                          </DropdownMenuItem>
                            
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user);
                              setResetPasswordDialogOpen(true);
                            }}>
                              <KeyRound className="h-4 w-4 mr-2" />
                              Réinitialiser le mot de passe
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user);
                              setLoginLinkDialogOpen(true);
                            }}>
                              <Link className="h-4 w-4 mr-2" />
                              Générer lien de connexion
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user);
                              setBlockDialogOpen(true);
                            }}>
                              <Ban className="h-4 w-4 mr-2" />
                              Bloquer/Débloquer
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(user);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer l'utilisateur
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogues */}
      <CreateUserDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchUsers}
      />

      <EditUserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        profile={selectedUser}
        onSuccess={fetchUsers}
      />

      <ResetPasswordDialog
        open={resetPasswordDialogOpen}
        onOpenChange={setResetPasswordDialogOpen}
        userId={selectedUser?.user_id || null}
        userEmail={selectedUser?.email || null}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Supprimer l'utilisateur"
        description={`Êtes-vous sûr de vouloir supprimer ${selectedUser?.email} ? Cette action est irréversible.`}
        onConfirm={handleDeleteUser}
        loading={actionLoading}
        variant="destructive"
      />

      <ConfirmDialog
        open={blockDialogOpen}
        onOpenChange={setBlockDialogOpen}
        title="Bloquer/Débloquer l'utilisateur"
        description={`Voulez-vous bloquer ${selectedUser?.email} ?`}
        onConfirm={() => handleToggleBlock('block')}
        loading={actionLoading}
      />

      <ChangeSubscriptionDialog
        open={changeSubscriptionDialogOpen}
        onOpenChange={setChangeSubscriptionDialogOpen}
        userId={selectedUser?.user_id || ''}
        currentPlan={selectedUser?.plan || 'starter'}
        userEmail={selectedUser?.email || ''}
        onSuccess={fetchUsers}
      />

      <GenerateLoginLinkDialog
        open={loginLinkDialogOpen}
        onOpenChange={setLoginLinkDialogOpen}
        userId={selectedUser?.user_id || ''}
        userEmail={selectedUser?.email || ''}
      />
    </div>
  );
}
