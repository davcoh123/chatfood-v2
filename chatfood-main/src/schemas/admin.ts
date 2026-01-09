import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(72, "Le mot de passe ne peut pas dépasser 72 caractères")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-=<>{}[\]|~^.,;:_°])[A-Za-z\d@$!%*?&#+\-=<>{}[\]|~^.,;:_°]+$/, 
      "Le mot de passe doit contenir au moins: 1 minuscule, 1 majuscule, 1 chiffre et 1 caractère spécial"),
  
  first_name: z.string()
    .max(100, "Le prénom ne peut pas dépasser 100 caractères")
    .optional(),
  
  last_name: z.string()
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .optional(),
  
  role: z.enum(['admin', 'user']),
  
  plan: z.enum(['starter', 'pro', 'premium'])
});

export const updateEmailSchema = z.object({
  user_id: z.string().uuid("ID utilisateur invalide"),
  new_email: z.string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères")
});

export const updateProfileSchema = z.object({
  user_id: z.string().uuid("ID utilisateur invalide"),
  first_name: z.string()
    .max(100, "Le prénom ne peut pas dépasser 100 caractères")
    .optional(),
  last_name: z.string()
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .optional()
});

export const editProfileFormSchema = z.object({
  first_name: z.string()
    .max(100, "Le prénom ne peut pas dépasser 100 caractères")
    .optional(),
  last_name: z.string()
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .optional(),
  email: z.string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères")
});

export const resetPasswordFormSchema = z.object({
  new_password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(72, "Le mot de passe ne peut pas dépasser 72 caractères")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-=<>{}[\]|~^.,;:_°])[A-Za-z\d@$!%*?&#+\-=<>{}[\]|~^.,;:_°]+$/, 
      "Le mot de passe doit contenir au moins: 1 minuscule, 1 majuscule, 1 chiffre et 1 caractère spécial")
});

export const resetPasswordSchema = z.object({
  user_id: z.string().uuid("ID utilisateur invalide"),
  new_password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(72, "Le mot de passe ne peut pas dépasser 72 caractères")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-=<>{}[\]|~^.,;:_°])[A-Za-z\d@$!%*?&#+\-=<>{}[\]|~^.,;:_°]+$/, 
      "Le mot de passe doit contenir au moins: 1 minuscule, 1 majuscule, 1 chiffre et 1 caractère spécial")
});

export const toggleBlockSchema = z.object({
  user_id: z.string().uuid("ID utilisateur invalide"),
  action: z.enum(['block', 'unblock']),
  reason: z.string().max(500, "La raison ne peut pas dépasser 500 caractères").optional()
});

export const systemSettingsSchema = z.object({
  allow_registration: z.boolean().optional(),
  max_login_attempts: z.number().int().min(1).max(20).optional(),
  block_duration_minutes: z.number().int().min(1).max(1440).optional(),
  email_notifications_signup: z.boolean().optional(),
  email_notifications_security: z.boolean().optional(),
  maintenance_mode: z.boolean().optional()
});

export type CreateUserForm = z.infer<typeof createUserSchema>;
export type UpdateEmailForm = z.infer<typeof updateEmailSchema>;
export type UpdateProfileForm = z.infer<typeof updateProfileSchema>;
export type EditProfileFormData = z.infer<typeof editProfileFormSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
export type ToggleBlockForm = z.infer<typeof toggleBlockSchema>;
export type SystemSettingsForm = z.infer<typeof systemSettingsSchema>;
