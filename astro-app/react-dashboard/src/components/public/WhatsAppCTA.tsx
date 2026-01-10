import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WhatsAppCTAProps {
  restaurantName: string;
  phoneNumber?: string;
  className?: string;
  themeColor?: string | null;
}

export function WhatsAppCTA({ restaurantName, phoneNumber, className = '', themeColor }: WhatsAppCTAProps) {
  // Default WhatsApp number - in production this would come from the restaurant's settings
  const whatsappNumber = phoneNumber || '';
  
  const message = encodeURIComponent(
    `Bonjour ! Je souhaite passer une commande chez ${restaurantName}.`
  );
  
  const whatsappUrl = whatsappNumber 
    ? `https://wa.me/${whatsappNumber}?text=${message}`
    : '#';

  // Use theme color or default WhatsApp green
  const buttonStyle = themeColor 
    ? { backgroundColor: themeColor }
    : { backgroundColor: '#25D366' };

  const hoverClass = themeColor ? 'hover:opacity-90' : 'hover:bg-[#128C7E]';

  return (
    <div className={`sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent ${className}`}>
      <Button 
        asChild={!!whatsappNumber}
        size="lg"
        className={`w-full text-white font-semibold py-6 text-base shadow-lg ${hoverClass}`}
        style={buttonStyle}
        disabled={!whatsappNumber}
      >
        {whatsappNumber ? (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-5 w-5 mr-2" />
            Commander sur WhatsApp
          </a>
        ) : (
          <span>
            <MessageCircle className="h-5 w-5 mr-2" />
            Commander sur WhatsApp
          </span>
        )}
      </Button>
      {!whatsappNumber && (
        <p className="text-xs text-center text-muted-foreground mt-2">
          Les commandes en ligne ne sont pas encore disponibles
        </p>
      )}
    </div>
  );
}
