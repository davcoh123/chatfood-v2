-- Phase 1: Refonte Sécurisée de la Base de Données (version corrigée)

-- 1.1 Créer la table user_roles en utilisant l'enum user_role existant
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 1.2 Créer l'enum pour les plans d'abonnement
CREATE TYPE public.subscription_plan AS ENUM ('starter', 'pro', 'premium');

-- 1.3 Créer la table user_subscriptions (fonctionnalités)
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan subscription_plan NOT NULL DEFAULT 'starter',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 1.4 Créer les fonctions SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_plan(_user_id uuid)
RETURNS subscription_plan
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT plan FROM public.user_subscriptions
  WHERE user_id = _user_id
$$;

-- 1.5 Mettre à jour la fonction is_admin() existante pour utiliser user_roles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

-- 1.6 Modifier le trigger handle_new_user pour créer role + subscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Créer le profil
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  
  -- Créer le role par défaut (user)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Créer l'abonnement par défaut (starter)
  INSERT INTO public.user_subscriptions (user_id, plan)
  VALUES (NEW.id, 'starter');
  
  RETURN NEW;
END;
$$;

-- 1.7 Migrer les données existantes de profiles.role vers user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- 1.8 Créer les abonnements pour tous les users existants
INSERT INTO public.user_subscriptions (user_id, plan)
SELECT user_id, 'starter'::subscription_plan FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- 1.9 Supprimer la colonne role de profiles (source de vulnérabilité)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- 1.10 Créer les RLS policies pour user_roles
CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- 1.11 Créer les RLS policies pour user_subscriptions
CREATE POLICY "Users can view their own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert subscriptions"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all subscriptions"
  ON public.user_subscriptions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- 1.12 Créer un trigger pour auto-update de updated_at sur user_subscriptions
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();