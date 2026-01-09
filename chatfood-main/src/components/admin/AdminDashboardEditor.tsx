import { UserDashboardPreview } from './UserDashboardPreview';
import { LucideIcon } from 'lucide-react';

interface DashboardSection {
  id: string;
  type: string;
  title: string;
  icon: LucideIcon;
  color: string;
}

interface DashboardConfig {
  id: string;
  section_id: string;
  customizations: any;
  is_active: boolean;
}

interface AdminDashboardEditorProps {
  userId: string;
  userName: string;
  plan: 'starter' | 'pro' | 'premium';
  sections: DashboardSection[];
  configs: DashboardConfig[];
  onConfigSave: () => void;
}

export function AdminDashboardEditor({
  userId,
  userName,
  plan,
  sections,
  configs,
  onConfigSave,
}: AdminDashboardEditorProps) {
  return (
    <UserDashboardPreview
      userId={userId}
      userName={userName}
      plan={plan}
      isAdminMode={true}
      sections={sections}
      configs={configs}
      onConfigSave={onConfigSave}
    />
  );
}
