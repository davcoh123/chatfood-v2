import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConversationMessageProps {
  message: string;
  time: string;
  status: 'send' | 'receive';
  name: string;
  messageType?: string;
  isPending?: boolean;
}

export const ConversationMessage: React.FC<ConversationMessageProps> = ({
  message,
  time,
  status,
  name,
  messageType = 'text',
  isPending = false,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const formatTime = (isoDate: string) => {
    try {
      return format(new Date(isoDate), 'HH:mm', { locale: fr });
    } catch {
      return '';
    }
  };

  const formatMessage = (text: string) => {
    return text.replace(/\\n/g, '\n');
  };

  const isReceived = status === 'receive';
  const isImage = messageType === 'image' || (message && message.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)/i));

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 20, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => { setZoom(100); setRotation(0); };
  
  const handleDownload = async () => {
    try {
      const response = await fetch(message);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <>
      <div className={`flex items-start gap-2 mb-3 ${isReceived ? '' : 'justify-end'}`}>
        {isReceived && (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`flex flex-col ${isReceived ? 'items-start' : 'items-end'} max-w-[85%] sm:max-w-[70%] overflow-hidden`}>
          {isImage ? (
            <div
              className="relative cursor-pointer group rounded-lg overflow-hidden"
              onClick={() => setIsPreviewOpen(true)}
            >
              <img 
                src={message} 
                alt="Image message"
                className="max-w-[200px] max-h-[200px] object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ZoomIn className="h-6 w-6 text-white" />
              </div>
            </div>
          ) : (
            <div
              className={`rounded-lg px-4 py-2 ${
                isReceived
                  ? 'bg-muted text-foreground'
                  : 'bg-green-500 text-white'
              } ${isPending ? 'opacity-60' : ''}`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{formatMessage(message)}</p>
              {isPending && (
                <span className="text-[10px] opacity-70">Envoi...</span>
              )}
            </div>
          )}
          <span className="text-xs mt-1 text-muted-foreground">
            {formatTime(time)}
          </span>
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] w-fit max-h-[95vh] p-0 overflow-hidden border">
          <div className="flex flex-col h-full">
            {/* Controls Header */}
            <div className="flex items-center justify-between p-3 bg-background border-b">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm min-w-[50px] text-center font-medium">{zoom}%</span>
                <Button variant="outline" size="icon" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleRotate}>
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Reset
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsPreviewOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Image Container */}
            <div 
              className="flex-1 flex items-center justify-center overflow-auto p-4 bg-muted/30"
              style={{ height: 'calc(95vh - 70px)' }}
            >
              <img
                src={message}
                alt="Preview"
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
