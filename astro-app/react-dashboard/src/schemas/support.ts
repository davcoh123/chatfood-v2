import { z } from 'zod';

export const ticketTypes = [
  { value: 'add_dish', label: '🍽️ Ajouter/Modifier un plat' },
  { value: 'technical_issue', label: '🔧 Problème technique' },
  { value: 'billing', label: '💳 Question de facturation' },
  { value: 'feature_request', label: '✨ Demande de fonctionnalité' },
  { value: 'other', label: '📦 Autre' }
] as const;

export const createTicketSchema = z.object({
  ticket_type: z.string().refine(
    (val) => ['add_dish', 'technical_issue', 'billing', 'feature_request', 'other'].includes(val),
    { message: "Veuillez sélectionner un type de problème" }
  ),
  subject: z.string()
    .min(5, "Le sujet doit faire au moins 5 caractères")
    .max(100, "Le sujet ne peut pas dépasser 100 caractères"),
  description: z.string()
    .min(20, "Veuillez décrire votre problème en détail (minimum 20 caractères)")
    .max(2000, "La description ne peut pas dépasser 2000 caractères"),
  priority: z.string().default('normal')
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
