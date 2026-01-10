import { Settings } from 'lucide-react';

export default function Maintenance() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="max-w-md w-full p-8 bg-card rounded-xl shadow-lg text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <Settings 
              className="h-12 w-12 text-primary animate-spin" 
              style={{ animationDuration: '3s' }} 
            />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Maintenance en cours</h1>
        <p className="text-muted-foreground">
          Notre plateforme est actuellement en maintenance pour améliorer votre expérience. 
          Nous serons de retour très bientôt !
        </p>
        <p className="text-sm text-muted-foreground">
          Merci de votre patience.
        </p>
      </div>
    </div>
  );
}
