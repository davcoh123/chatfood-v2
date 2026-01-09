import { useCatalogue } from './useCatalogue';
import { useRestaurantSettings } from './useRestaurantSettings';
import { useWhatsAppIntegration } from './useWhatsAppIntegration';

export interface OnboardingStep {
  id: number;
  label: string;
  completed: boolean;
  required: boolean;
}

export function useOnboardingProgress(userId?: string) {
  const { settings, isLoading: settingsLoading } = useRestaurantSettings(userId);
  const { items: products, isLoading: productsLoading } = useCatalogue({ userId });
  const { integration, isLoading: whatsappLoading } = useWhatsAppIntegration(userId);

  const isLoading = settingsLoading || productsLoading || whatsappLoading;

  // Check if each step is completed
  const step1Completed = Boolean(settings?.restaurant_name?.trim());
  
  const step2Completed = Boolean(
    settings?.opening_hours && 
    Array.isArray(settings.opening_hours) &&
    settings.opening_hours.some((day: any) => day.slot1?.trim() || day.slot2?.trim())
  );
  
  const step3Completed = integration?.status === 'active';
  
  const step4Completed = products && products.length > 0;
  
  const step5Completed = Boolean(
    settings?.siret && 
    settings.siret.replace(/\s/g, '').length === 14
  );

  const steps: OnboardingStep[] = [
    { id: 1, label: 'Restaurant', completed: step1Completed, required: true },
    { id: 2, label: 'Horaires', completed: step2Completed, required: false },
    { id: 3, label: 'WhatsApp', completed: step3Completed, required: false },
    { id: 4, label: 'Catalogue', completed: step4Completed, required: false },
    { id: 5, label: 'SIRET', completed: step5Completed, required: false },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  // Find first incomplete step to resume
  const currentStepIndex = steps.findIndex(s => !s.completed);
  const currentStep = currentStepIndex === -1 ? 5 : currentStepIndex + 1;

  return {
    steps,
    currentStep,
    completedCount,
    progressPercent,
    isLoading,
    onboardingCompleted: settings?.onboarding_completed ?? false,
  };
}
