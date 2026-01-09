/**
 * OnboardingPage - Page d'onboarding complète en 5 étapes
 * Migré depuis la version React
 */

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check, Store, Clock, MessageCircle, ShoppingBag, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

import OnboardingStep1 from '@/components/onboarding/OnboardingStep1';
import OnboardingStep2 from '@/components/onboarding/OnboardingStep2';
import OnboardingStep3 from '@/components/onboarding/OnboardingStep3';
import OnboardingStep4 from '@/components/onboarding/OnboardingStep4';
import OnboardingStep5 from '@/components/onboarding/OnboardingStep5';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function OnboardingContent() {
  const { user } = useAuth();
  const { settings, updateSettings } = useRestaurantSettings();
  
  // Get step from URL or default to 1
  const [currentStep, setCurrentStep] = useState(1);
  
  // Local state for form data
  const [step1Data, setStep1Data] = useState({
    restaurant_name: '',
    address_street: '',
    address_postal_code: '',
    address_city: '',
    longitude: null as number | null,
    latitude: null as number | null,
  });
  const [step2Data, setStep2Data] = useState<any[]>([]);
  const [step5Data, setStep5Data] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync data from settings when loaded
  useEffect(() => {
    if (settings) {
      setStep1Data({
        restaurant_name: settings.restaurant_name || '',
        address_street: settings.address_street || '',
        address_postal_code: settings.address_postal_code || '',
        address_city: settings.address_city || '',
        longitude: settings.longitude || null,
        latitude: settings.latitude || null,
      });
      setStep2Data(settings.opening_hours || []);
      setStep5Data(settings.siret || '');
    }
  }, [settings]);

  // Read step from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const step = parseInt(params.get('step') || '1');
    if (step >= 1 && step <= 5) {
      setCurrentStep(step);
    }
  }, []);

  const updateStepInUrl = (step: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('step', step.toString());
    window.history.pushState({}, '', url.toString());
    setCurrentStep(step);
  };

  const handleNext = async () => {
    setIsSaving(true);
    try {
      // Save current step data
      if (currentStep === 1) {
        await updateSettings(step1Data);
      } else if (currentStep === 2) {
        await updateSettings({ opening_hours: step2Data });
      } else if (currentStep === 5) {
        await updateSettings({ siret: step5Data });
      }
      
      if (currentStep < 5) {
        updateStepInUrl(currentStep + 1);
      } else {
        // Complete onboarding
        await updateSettings({ onboarding_completed: true });
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error("Error saving step:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      updateStepInUrl(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    if (currentStep < 5) {
      updateStepInUrl(currentStep + 1);
    } else {
      await updateSettings({ onboarding_completed: true });
      window.location.href = '/dashboard';
    }
  };

  const stepsConfig = [
    { id: 1, icon: Store, label: "Restaurant" },
    { id: 2, icon: Clock, label: "Horaires" },
    { id: 3, icon: MessageCircle, label: "WhatsApp" },
    { id: 4, icon: ShoppingBag, label: "Menu" },
    { id: 5, icon: FileText, label: "Légal" },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Sidebar */}
      <div className="hidden lg:flex w-1/3 bg-primary/5 border-r flex-col p-8 justify-between relative overflow-hidden">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">C</span>
            </div>
            <span className="text-xl font-bold">ChatFood</span>
          </div>
          
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-4">Configurons votre restaurant</h1>
              <p className="text-muted-foreground text-lg">
                Quelques étapes simples pour propulser votre activité sur WhatsApp.
              </p>
            </div>

            <div className="space-y-4">
              {stepsConfig.map((step) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;

                return (
                  <div 
                    key={step.id}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-lg transition-all duration-200",
                      isActive ? "bg-background shadow-sm border" : "opacity-60"
                    )}
                  >
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                      isActive ? "bg-primary text-primary-foreground" : 
                      isCompleted ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className={cn("font-medium", isActive && "text-primary")}>{step.label}</p>
                      {isActive && <p className="text-xs text-muted-foreground">En cours...</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b flex items-center justify-between bg-background">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">C</span>
            </div>
            <span className="font-bold">ChatFood</span>
          </div>
          <div className="text-sm font-medium">
            Étape {currentStep}/5
          </div>
        </div>

        {/* Progress Bar (Mobile) */}
        <div className="lg:hidden w-full bg-muted h-1">
          <div 
            className="bg-primary h-1 transition-all duration-300" 
            style={{ width: `${(currentStep / 5) * 100}%` }} 
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-6 lg:p-12">
            <div className="mb-8">
              <Button 
                variant="ghost" 
                size="sm" 
                className="mb-4 pl-0 hover:pl-2 transition-all"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </div>

            <div className="min-h-[400px]">
              {currentStep === 1 && (
                <OnboardingStep1 
                  data={step1Data} 
                  onChange={(data) => setStep1Data({ ...step1Data, ...data })} 
                />
              )}
              {currentStep === 2 && (
                <OnboardingStep2 
                  data={step2Data} 
                  onChange={setStep2Data} 
                />
              )}
              {currentStep === 3 && <OnboardingStep3 userId={userId} />}
              {currentStep === 4 && <OnboardingStep4 userId={userId} />}
              {currentStep === 5 && (
                <OnboardingStep5 
                  data={step5Data} 
                  onChange={setStep5Data} 
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t p-6 bg-background/50 backdrop-blur-sm sticky bottom-0">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Passer cette étape
            </Button>
            
            <Button 
              onClick={handleNext} 
              disabled={isSaving}
              className="min-w-[120px]"
            >
              {isSaving ? (
                "Sauvegarde..."
              ) : currentStep === 5 ? (
                "Terminer"
              ) : (
                <>
                  Suivant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <Toaster />
    </div>
  );
}

export function OnboardingPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <OnboardingContent />
    </QueryClientProvider>
  );
}

export default OnboardingPage;
