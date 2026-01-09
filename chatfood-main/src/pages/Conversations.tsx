import { MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ConversationsWidget } from '@/components/dashboard/ConversationsWidget';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function Conversations() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vous devez être connecté pour accéder aux conversations.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <MessageSquare className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Conversations WhatsApp</h1>
        </div>
        <p className="text-sm md:text-base text-muted-foreground">
          Gérez vos conversations WhatsApp avec vos clients en temps réel
        </p>
      </div>

      {/* Conversations Widget */}
      <ConversationsWidget sectionId="conversations" />
    </div>
  );
}
