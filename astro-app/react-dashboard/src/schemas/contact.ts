import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s-']+$/, "Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes"),
  
  email: z.string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  
  restaurant: z.string()
    .min(2, "Le nom du restaurant doit contenir au moins 2 caractères")
    .max(100, "Le nom du restaurant ne peut pas dépasser 100 caractères"),
  
  phone: z.string()
    .min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres")
    .max(20, "Le numéro de téléphone ne peut pas dépasser 20 caractères")
    .regex(/^[0-9+\s()-]+$/, "Le numéro de téléphone ne peut contenir que des chiffres, +, espaces, tirets et parenthèses"),
  
  message: z.string()
    .min(20, "Le message doit contenir au moins 20 caractères")
    .max(1000, "Le message ne peut pas dépasser 1000 caractères")
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
