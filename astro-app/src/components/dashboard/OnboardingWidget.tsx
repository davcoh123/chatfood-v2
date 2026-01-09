import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ArrowRight, X, Sparkles } from 'lucide-react';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';

interface OnboardingWidgetProps {
  className?: string;
  userId?: string;
}

export function OnboardingWidget({ className, userId }: OnboardingWidgetProps) {
  const navigate = (path: string) => window.location.href = path;
  const { steps, currentStep, progressPercent, isLoading, onboardingCompleted } = useOnboardingProgress(userId);
  const { updateSettings, isUpdating } = useRestaurantSettings(userId);

  // Don't render if already completed or still loading
  if (isLoading || onboardingCompleted) {
    return null;
  }

  const handleContinue = () => {
    navigate(`/onboarding?step=${currentStep}`);
  };

  const handleDismiss = async () => {
    await updateSettings({ onboarding_completed: true });
  };

  const completedCount = steps.filter(s => s.completed).length;

  return (
    <Card className={`border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 shadow-md ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Finaliser la configuration</CardTitle>
              <p className="text-sm text-muted-foreground">
                {completedCount}/{steps.length} étapes complétées
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={handleDismiss}
            disabled={isUpdating}
            title="Masquer et marquer comme terminé"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Progress value={progressPercent} className="h-2 mt-3" />
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2 mb-4">
          {steps.map((step) => (
            <li
              key={step.id}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                step.completed 
                  ? 'text-muted-foreground' 
                  : step.id === currentStep 
                    ? 'bg-primary/10 text-foreground' 
                    : 'text-muted-foreground'
              }`}
            >
              {step.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className={`h-5 w-5 flex-shrink-0 ${step.id === currentStep ? 'text-primary' : 'text-muted-foreground/50'}`} />
              )}
              <span className={`text-sm ${step.completed ? 'line-through' : 'font-medium'}`}>
                {step.label}
              </span>
              {step.required && !step.completed && (
                <span className="text-xs text-destructive ml-auto">Requis</span>
              )}
            </li>
          ))}
        </ul>
        <Button 
          onClick={handleContinue} 
          className="w-full"
          disabled={isUpdating}
        >
          Continuer la configuration
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
