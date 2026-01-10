import React, { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradeModal } from './UpgradeModal';

interface RequiresPlanProps {
  children: React.ReactNode;
  requiredPlan: 'pro' | 'premium';
}

export const RequiresPlan: React.FC<RequiresPlanProps> = ({ children, requiredPlan }) => {
  const { plan, canAccessAnalytics } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Check if user has access
  const hasAccess = React.useMemo(() => {
    if (requiredPlan === 'pro') {
      return canAccessAnalytics; // Pro or Premium
    }
    if (requiredPlan === 'premium') {
      return plan === 'premium';
    }
    return false;
  }, [requiredPlan, plan, canAccessAnalytics]);

  React.useEffect(() => {
    if (!hasAccess) {
      setShowUpgradeModal(true);
    }
  }, [hasAccess]);

  if (!hasAccess) {
    return (
      <UpgradeModal 
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        targetPlan={requiredPlan}
        currentPlan={plan}
      />
    );
  }

  return <>{children}</>;
};
