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

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  customerPhone: string;
  restaurantPhone: string;
  phoneNumberId: string;
  whatsappBusinessId: string;
  accessToken: string;
  userId: string;
}

export const SendMessageDialog: React.FC<SendMessageDialogProps> = ({
  open,
  onOpenChange,
  customerName,
  customerPhone,
  restaurantPhone,
  phoneNumberId,
  whatsappBusinessId,
  accessToken,
  userId,
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Reset message when dialog opens
  React.useEffect(() => {
    if (open) {
      setMessage('');
    }
  }, [open]);

  const handleSend = async () => {
    if (!message.trim()) return;
    
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

      toast.success('Message envoyé');
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Envoyer un message à {customerName}</DialogTitle>
          <DialogDescription>
            Ce message sera envoyé via WhatsApp au {customerPhone}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Votre message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Tapez votre message ici..."
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || !message.trim()}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi...
              </>
            ) : (
              'Envoyer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
