import { z } from 'zod';

export const profileUpdateSchema = z.object({
  firstName: z.string()
    .min(1, "Le prénom est requis")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s-']+$/, "Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes"),
  
  lastName: z.string()
    .min(1, "Le nom est requis")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s-']+$/, "Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes"),
  
  email: z.string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères")
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string()
    .min(1, "Le mot de passe actuel est requis"),
  
  newPassword: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-=<>{}[\]|~^.,;:_°])[A-Za-z\d@$!%*?&#+\-=<>{}[\]|~^.,;:_°]+$/, 
      "Le mot de passe doit contenir au moins: 1 minuscule, 1 majuscule, 1 chiffre et 1 caractère spécial"),
  
  confirmPassword: z.string()
    .min(1, "La confirmation du mot de passe est requise")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

export type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;
export type PasswordChangeForm = z.infer<typeof passwordChangeSchema>;