import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CancelOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  customerPhone: string;
  restaurantName: string;
  restaurantPhone: string;
  phoneNumberId: string;
  whatsappBusinessId: string;
  accessToken: string;
  userId: string;
  onConfirmCancel: () => void;
}

export const CancelOrderDialog: React.FC<CancelOrderDialogProps> = ({
  open,
  onOpenChange,
  customerName,
  customerPhone,
  restaurantName,
  restaurantPhone,
  phoneNumberId,
  whatsappBusinessId,
  accessToken,
  userId,
  onConfirmCancel,
}) => {
  const defaultMessage = `Bonjour ${customerName},
Nous sommes désolés, mais ${restaurantName} a dû annuler votre commande.
Vous pouvez repasser commande quand vous voulez. Merci pour votre compréhension 🙏`;

  const [message, setMessage] = useState(defaultMessage);
  const [isSending, setIsSending] = useState(false);

  // Reset message when dialog opens
  React.useEffect(() => {
    if (open) {
      setMessage(`Bonjour ${customerName},
Nous sommes désolés, mais ${restaurantName} a dû annuler votre commande.
Vous pouvez repasser commande quand vous voulez. Merci pour votre compréhension 🙏`);
    }
  }, [open, customerName, restaurantName]);

  const handleConfirm = async () => {
    setIsSending(true);
    try {
      const response = await fetch('https://n8n.chatfood.fr/webhook/send-whatsapp-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_number: customerPhone,
          message: message,
          restaurant_phone: restaurantPhone,
          phone_number_id: phoneNumberId,
          whatsapp_business_id: whatsappBusinessId,
          access_token: accessToken,
          user_id: userId,
          customer_name: customerName,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }

      toast.success('Message envoyé au client');
      onConfirmCancel();
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending cancellation message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Annuler la commande</DialogTitle>
          <DialogDescription>
            Envoyez un message au client pour l'informer de l'annulation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cancel-message">Message au client</Label>
            <Textarea
              id="cancel-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Ce message sera envoyé via WhatsApp au client ({customerPhone})
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            Fermer
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSending || !message.trim()}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi...
              </>
            ) : (
              'Confirmer l\'annulation'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
