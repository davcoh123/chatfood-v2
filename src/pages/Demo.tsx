import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, MessageCircle, Phone, Video, MoreVertical, Smartphone, Zap, Bot, ZoomIn } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { resolveAssetsToObjectURLs, waitImagesLoad, type AssistantPayload } from '@/utils/assetLoader';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered';
  imageUrls?: string[];
  isLoading?: boolean;
  plats?: string[];
}

const Demo = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIds, setLoadingMessageIds] = useState<Set<string>>(new Set());
  const [isSending, setIsSending] = useState(false);
  const [selectedPlats, setSelectedPlats] = useState<Map<string, Set<string>>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>('');
  const location = useLocation();

  // Forcer le scroll vers le haut quand on arrive sur la page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Générer un session ID unique au montage du composant
  useEffect(() => {
    sessionIdRef.current = 'demo-session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }, []);

  // Auto-scroll vers le bas de la ZONE DE CHAT uniquement quand de nouveaux messages arrivent
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Suivre les derniers messages pour nettoyage au démontage uniquement
  const messagesRef = useRef<Message[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Cleanup des ObjectURLs uniquement au démontage du composant
  useEffect(() => {
    return () => {
      messagesRef.current.forEach(msg => {
        if (msg.imageUrls) {
          msg.imageUrls.forEach(url => {
            if (url.startsWith('blob:')) {
              URL.revokeObjectURL(url);
            }
          });
        }
      });
    };
  }, []);

  const handleAssistantResponse = async (
    data: unknown,
    userMessageId: string
  ): Promise<void> => {
    try {
      let payload: AssistantPayload | null = null;

      // Parser le JSON selon les différents formats possibles
      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        payload = data[0].output as AssistantPayload;
      } else if (typeof data === 'object' && data !== null && 'message' in data) {
        payload = data as AssistantPayload;
      }

      if (!payload) {
        throw new Error('Format de réponse invalide');
      }

      const { message = '', assets = [], plat = [] } = payload;
      
      // Vérifier qu'il y a au moins du contenu (message, assets ou plats)
      const hasContent = message || 
                         (Array.isArray(assets) && assets.length > 0) ||
                         (Array.isArray(plat) && plat.length > 0);

      if (!hasContent) {
        console.warn('Réponse vide du webhook, ignorée');
        return;
      }

      console.log('Payload assistant:', payload);

      const aiMessageId = (Date.now() + 1).toString();

      // Stocker les plats séparément pour un affichage dédié
      const finalMessage = message;
      const platsArray = Array.isArray(plat) && plat.length > 0 ? (plat as string[]) : undefined;

      // Si pas d'assets → affichage immédiat
      if (assets.length === 0) {
        const aiMessage: Message = {
          id: aiMessageId,
          text: finalMessage,
          isUser: false,
          timestamp: new Date(),
          status: 'delivered',
          imageUrls: [],
          plats: platsArray,
        };
        setMessages(prev => [...prev, aiMessage]);
        return;
      }

      // Avec assets → afficher un skeleton puis charger
      const skeletonMessage: Message = {
        id: aiMessageId,
        text: '',
        isUser: false,
        timestamp: new Date(),
        status: 'delivered',
        isLoading: true,
      };

      setMessages(prev => [...prev, skeletonMessage]);
      setLoadingMessageIds(prev => new Set(prev).add(aiMessageId));

      // Télécharger les binaires en parallèle
      const imageUrls = await resolveAssetsToObjectURLs(assets, {
        chatId: sessionIdRef.current,
        messageId: aiMessageId,
      });

      // Attendre que les <img> soient prêtes
      await waitImagesLoad(imageUrls);

      // Remplacer le skeleton par le vrai message
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, text: finalMessage, imageUrls, isLoading: false, plats: platsArray }
            : msg
        )
      );
      setLoadingMessageIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(aiMessageId);
        return newSet;
      });

    } catch (error) {
      console.error('Erreur handleAssistantResponse:', error);
      
      // Message d'erreur
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Désolé, une erreur s'est produite lors du traitement de la réponse.",
        isUser: false,
        timestamp: new Date(),
        status: 'delivered',
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const togglePlatSelection = (messageId: string, plat: string) => {
    setSelectedPlats(prev => {
      const newMap = new Map(prev);
      const currentSet = newMap.get(messageId) || new Set();
      
      if (currentSet.has(plat)) {
        currentSet.delete(plat);
      } else {
        currentSet.add(plat);
      }
      
      if (currentSet.size === 0) {
        newMap.delete(messageId);
      } else {
        newMap.set(messageId, currentSet);
      }
      
      return newMap;
    });
  };

  const sendSelectedPlats = async (messageId: string) => {
    const selected = selectedPlats.get(messageId);
    if (!selected || selected.size === 0 || isLoading) return;
    
    const platsArray = Array.from(selected);
    const messageText = `Je veux bien ${platsArray.join(' et ')}`;
    if (messageText.length > 2000) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsSending(true);
    setTimeout(() => setIsSending(false), 600);

    // Nettoyer les sélections après envoi
    setSelectedPlats(prev => {
      const newMap = new Map(prev);
      newMap.delete(messageId);
      return newMap;
    });

    try {
      // Marquer le message comme envoyé après 1-3 secondes
      const randomDelay = Math.random() * 2000 + 1000;
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        ));
      }, randomDelay);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes

      const response = await fetch('https://n8n.chatfood.fr/webhook/957bc686-e338-4df9-a936-8c0c7d5c8637', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          timestamp: new Date().toISOString(),
          sessionId: sessionIdRef.current
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'delivered' } : msg
      ));

      await handleAssistantResponse(data, userMessage.id);
    } catch (error) {
      console.error('Erreur détaillée:', error);
      if (error.name === 'AbortError') {
        console.error('Timeout - Le webhook a pris plus de 2 minutes à répondre');
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Désolé, je mets un peu de temps à répondre. Pouvez-vous reformuler votre demande ?",
        isUser: false,
        timestamp: new Date(),
        status: 'delivered'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const MAX_MESSAGE_LENGTH = 2000;

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    if (inputMessage.length > MAX_MESSAGE_LENGTH) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: `Le message ne peut pas dépasser ${MAX_MESSAGE_LENGTH} caractères.`,
        isUser: false,
        timestamp: new Date(),
        status: 'delivered'
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsSending(true);
    setTimeout(() => setIsSending(false), 600);

    try {
      // Marquer le message comme envoyé après 1-3 secondes
      const randomDelay = Math.random() * 2000 + 1000; // Entre 1 et 3 secondes
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        ));
      }, randomDelay);

      console.log('Envoi du message:', inputMessage);
      console.log('Session ID:', sessionIdRef.current);

      // Envoyer le webhook avec timeout plus long
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes

      const response = await fetch('https://n8n.chatfood.fr/webhook/957bc686-e338-4df9-a936-8c0c7d5c8637', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          timestamp: new Date().toISOString(),
          sessionId: sessionIdRef.current
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('Status de la réponse:', response.status);
      console.log('Headers de la réponse:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Réponse webhook complète:', data);
      
      // Marquer le message utilisateur comme livré
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'delivered' } : msg
      ));

      // Déléguer à handleAssistantResponse
      await handleAssistantResponse(data, userMessage.id);
    } catch (error) {
      console.error('Erreur détaillée:', error);
      console.error('Type d\'erreur:', error.constructor.name);
      if (error.name === 'AbortError') {
        console.error('Timeout - Le webhook a pris plus de 2 minutes à répondre');
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Désolé, je mets un peu de temps à répondre. Pouvez-vous reformuler votre demande ?",
        isUser: false,
        timestamp: new Date(),
        status: 'delivered'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendSuggestedMessage = async (message: string) => {
    if (isLoading) return;
    if (message.length > MAX_MESSAGE_LENGTH) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsSending(true);
    setTimeout(() => setIsSending(false), 600);

    try {
      // Marquer le message comme envoyé après 1-3 secondes
      const randomDelay = Math.random() * 2000 + 1000;
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        ));
      }, randomDelay);

      console.log('Envoi du message:', message);
      console.log('Session ID:', sessionIdRef.current);

      // Envoyer le webhook avec timeout plus long
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes

      const response = await fetch('https://n8n.chatfood.fr/webhook/957bc686-e338-4df9-a936-8c0c7d5c8637', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          timestamp: new Date().toISOString(),
          sessionId: sessionIdRef.current
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('Status de la réponse:', response.status);
      console.log('Headers de la réponse:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Réponse webhook complète:', data);
      
      // Marquer le message utilisateur comme livré
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'delivered' } : msg
      ));

      // Déléguer à handleAssistantResponse
      await handleAssistantResponse(data, userMessage.id);
    } catch (error) {
      console.error('Erreur détaillée:', error);
      console.error('Type d\'erreur:', error.constructor.name);
      if (error.name === 'AbortError') {
        console.error('Timeout - Le webhook a pris plus de 2 minutes à répondre');
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Désolé, je mets un peu de temps à répondre. Pouvez-vous reformuler votre demande ?",
        isUser: false,
        timestamp: new Date(),
        status: 'delivered'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedMessages = [
    "Bonjour ! Quels sont vos horaires ?",
    "Je souhaite réserver une table pour 4 personnes ce soir",
    "Avez-vous une carte végétarienne ?",
    "Quel est votre plat du jour ?",
    "Je voudrais voir votre menu complet"
  ];

  const ZoomableImage = ({ src, alt }: { src: string; alt: string }) => (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative group cursor-pointer rounded-lg overflow-hidden max-w-xs">
          <img 
            src={src} 
            alt={alt}
            className="w-full h-auto rounded-lg transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <ZoomIn className="w-8 h-8 text-white" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full p-0">
        <AspectRatio ratio={16 / 9} className="bg-muted">
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-contain"
          />
        </AspectRatio>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-6 animate-fade-in">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Démo Interactive</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Testez <span className="text-primary">ChatFood</span> en Action
            </h1>
            <p className="text-xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Découvrez la puissance de votre assistant IA dans une interface WhatsApp authentique
            </p>
            <div className="flex flex-wrap gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 rounded-full px-3 py-1">
                <Bot className="w-4 h-4 text-primary" />
                IA Temps Réel
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 rounded-full px-3 py-1">
                <Smartphone className="w-4 h-4 text-primary" />
                Interface WhatsApp
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 rounded-full px-3 py-1">
                <MessageCircle className="w-4 h-4 text-primary" />
                Webhook Intégré
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Chat Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="overflow-hidden shadow-2xl bg-white">
              {/* WhatsApp Header */}
              <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center shadow-lg">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div id="chatfood-assistant">
                    <h3 className="font-semibold">ChatFood Assistant</h3>
                    <p className="text-xs text-green-100 flex items-center gap-1">
                      <div 
                        className="w-2 h-2 bg-green-400 rounded-full" 
                        style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite, wiggle 3s ease-in-out infinite' }}
                      ></div>
                      En ligne
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 opacity-70">
                  <Video className="w-5 h-5" />
                  <Phone className="w-5 h-5" />
                  <MoreVertical className="w-5 h-5" />
                </div>
              </div>

              {/* Chat Background */}
              <div 
                ref={chatContainerRef}
                className="h-[500px] overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundColor: '#e5ddd5'
                }}
              >
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    style={{ 
                      animation: message.isUser 
                        ? 'slide-in-right 0.3s ease-out, fade-in 0.3s ease-out'
                        : 'fade-in 0.3s ease-out'
                    }}
                  >
                    <div
                      className={`max-w-xs px-4 py-3 rounded-2xl shadow-sm ${
                        message.isUser
                          ? 'bg-[#dcf8c6] text-gray-800 rounded-br-sm'
                          : 'bg-white text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      {/* Skeleton si chargement */}
                      {message.isLoading ? (
                        <div className="space-y-3">
                          <div className="relative overflow-hidden h-4 bg-gray-200 rounded w-3/4">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent" style={{ animation: 'skeleton-shimmer 1.5s ease-in-out infinite' }}></div>
                          </div>
                          <div className="relative overflow-hidden h-4 bg-gray-200 rounded w-full">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent" style={{ animation: 'skeleton-shimmer 1.5s ease-in-out infinite', animationDelay: '0.2s' }}></div>
                          </div>
                          <div className="relative overflow-hidden h-4 bg-gray-200 rounded w-2/3">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent" style={{ animation: 'skeleton-shimmer 1.5s ease-in-out infinite', animationDelay: '0.4s' }}></div>
                          </div>
                          <div className="relative overflow-hidden h-32 bg-gray-200 rounded mt-2">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent" style={{ animation: 'skeleton-shimmer 1.5s ease-in-out infinite', animationDelay: '0.6s' }}></div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Texte du message */}
                          {message.text && (
                            <p className="text-sm leading-relaxed">{message.text}</p>
                          )}
                          
                          {/* Plats en colonne - sélectionnables */}
                          {message.plats && message.plats.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-xs font-semibold text-gray-600 mb-2">📋 Suggestions :</p>
                              <div className="flex flex-col gap-2">
                                {message.plats.map((plat, idx) => {
                                  const isSelected = selectedPlats.get(message.id)?.has(plat);
                                  return (
                                    <div
                                      key={idx}
                                      onClick={() => togglePlatSelection(message.id, plat)}
                                      className={`
                                        cursor-pointer rounded-lg px-3 py-2
                                        transition-all duration-200 hover:scale-[1.02] active:scale-95
                                        ${isSelected 
                                          ? 'bg-green-50 border-2 border-green-500 shadow-md' 
                                          : 'bg-white/90 backdrop-blur-sm border border-gray-200 hover:shadow-md'
                                        }
                                      `}
                                    >
                                      <span className="text-sm font-medium text-gray-800 flex items-center justify-between">
                                        <span>{idx + 1}. {plat}</span>
                                        {isSelected && <span className="text-green-600 font-bold ml-2">✓</span>}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                              
                              {/* Bouton envoyer conditionnel */}
                              {selectedPlats.get(message.id)?.size > 0 && (
                                <div className="mt-3 animate-fade-in">
                                  <Button
                                    onClick={() => sendSelectedPlats(message.id)}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors"
                                    disabled={isLoading}
                                  >
                                    <Send className="w-4 h-4 mr-2" />
                                    Envoyer ({selectedPlats.get(message.id)?.size})
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Images (0, 1 ou 2) */}
                          {message.imageUrls && message.imageUrls.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.imageUrls.map((url, idx) => (
                                <ZoomableImage
                                  key={idx}
                                  src={url}
                                  alt={`Image ${idx + 1}`}
                                />
                              ))}
                            </div>
                          )}
                          
                          {/* Timestamp */}
                          <div className={`text-xs mt-2 flex items-center ${
                            message.isUser ? 'justify-end' : 'justify-start'
                          }`}>
                            <span className="text-gray-500">
                              {message.timestamp.toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            {message.isUser && (
                              <div className="ml-2 flex items-center">
                                {message.status === 'sending' && (
                                  <div className="text-gray-400 text-base">✓</div>
                                )}
                                {message.status === 'sent' && (
                                  <div className="text-gray-400 text-base flex">
                                    <span>✓</span>
                                    <span style={{ animation: 'check-appear 0.3s ease-out' }}>✓</span>
                                  </div>
                                )}
                                {message.status === 'delivered' && (
                                  <div className="text-blue-500 text-base">✓✓</div>
                                )}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start" style={{ animation: 'fade-in 0.3s ease-out' }}>
                    <div className="bg-white px-5 py-4 rounded-2xl rounded-bl-sm shadow-sm" style={{ animation: 'scale-in 0.2s ease-out' }}>
                      <div className="flex items-center space-x-1.5">
                        <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full" style={{ animation: 'typing-pulse 1.4s ease-in-out infinite' }}></div>
                        <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full" style={{ animation: 'typing-pulse 1.4s ease-in-out infinite', animationDelay: '0.2s' }}></div>
                        <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full" style={{ animation: 'typing-pulse 1.4s ease-in-out infinite', animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Messages */}
              {messages.length === 0 && (
                <div className="bg-[#f0f0f0] px-4 pt-3 pb-1">
                  <div className="flex md:flex-wrap overflow-x-auto md:overflow-x-visible gap-2 mb-3 pb-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {suggestedMessages.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => sendSuggestedMessage(suggestion)}
                        disabled={isLoading}
                        className="bg-white hover:bg-gray-50 text-gray-700 text-sm px-3 py-2 rounded-full border border-gray-200 transition-all duration-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap md:whitespace-normal flex-shrink-0 md:flex-shrink"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="bg-[#f0f0f0] p-4 flex items-center space-x-3 border-t">
                <div className="flex-1 relative">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tapez votre message..."
                    className="bg-white border-2 border-transparent rounded-full shadow-sm transition-all duration-300 focus:border-[#25D366] focus:shadow-md focus:shadow-[#25D366]/20"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-[#25D366] hover:bg-[#20b358] rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Send className="w-5 h-5" style={isSending ? { animation: 'send-rotate 0.6s ease-out' } : {}} />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Demo;