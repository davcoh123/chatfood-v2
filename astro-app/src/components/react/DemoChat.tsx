import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
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

const suggestedMessages = [
  "Bonjour ! Quels sont vos horaires ?",
  "Je souhaite réserver une table pour 4 personnes ce soir",
  "Avez-vous une carte végétarienne ?",
  "Quel est votre plat du jour ?",
  "Je voudrais voir votre menu complet"
];

const MAX_MESSAGE_LENGTH = 2000;

export default function DemoChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIds, setLoadingMessageIds] = useState<Set<string>>(new Set());
  const [isSending, setIsSending] = useState(false);
  const [selectedPlats, setSelectedPlats] = useState<Map<string, Set<string>>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>('');

  // Générer un session ID unique au montage du composant
  useEffect(() => {
    sessionIdRef.current = 'demo-session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }, []);

  // Auto-scroll vers le bas de la zone de chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Cleanup des ObjectURLs au démontage
  const messagesRef = useRef<Message[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

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

      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        payload = data[0].output as AssistantPayload;
      } else if (typeof data === 'object' && data !== null && 'message' in data) {
        payload = data as AssistantPayload;
      }

      if (!payload) {
        throw new Error('Format de réponse invalide');
      }

      const { message = '', assets = [], plat = [] } = payload;
      
      const hasContent = message || 
                         (Array.isArray(assets) && assets.length > 0) ||
                         (Array.isArray(plat) && plat.length > 0);

      if (!hasContent) {
        console.warn('Réponse vide du webhook, ignorée');
        return;
      }

      const aiMessageId = (Date.now() + 1).toString();
      const finalMessage = message;
      const platsArray = Array.isArray(plat) && plat.length > 0 ? (plat as string[]) : undefined;

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

      const imageUrls = await resolveAssetsToObjectURLs(assets, {
        chatId: sessionIdRef.current,
        messageId: aiMessageId,
      });

      await waitImagesLoad(imageUrls);

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
    if (messageText.length > MAX_MESSAGE_LENGTH) return;
    
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

    setSelectedPlats(prev => {
      const newMap = new Map(prev);
      newMap.delete(messageId);
      return newMap;
    });

    try {
      const randomDelay = Math.random() * 2000 + 1000;
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        ));
      }, randomDelay);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

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
    } catch (error: any) {
      console.error('Erreur:', error);
      
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
      const randomDelay = Math.random() * 2000 + 1000;
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        ));
      }, randomDelay);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'delivered' } : msg
      ));

      await handleAssistantResponse(data, userMessage.id);
    } catch (error: any) {
      console.error('Erreur:', error);
      
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

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendSuggestedMessage = async (message: string) => {
    if (isLoading) return;
    setInputMessage(message);
    
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
      const randomDelay = Math.random() * 2000 + 1000;
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        ));
      }, randomDelay);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'delivered' } : msg
      ));

      await handleAssistantResponse(data, userMessage.id);
    } catch (error: any) {
      console.error('Erreur:', error);
      
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
      setInputMessage('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="overflow-hidden shadow-2xl bg-white rounded-xl">
        {/* WhatsApp Header */}
        <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-full flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
                <path d="M12 8V4H8"/>
                <rect width="16" height="12" x="4" y="8" rx="2"/>
                <path d="M2 14h2"/>
                <path d="M20 14h2"/>
                <path d="M15 13v2"/>
                <path d="M9 13v2"/>
              </svg>
            </div>
            <div id="chatfood-assistant">
              <h3 className="font-semibold">ChatFood Assistant</h3>
              <p className="text-xs text-green-100 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                En ligne
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 opacity-70">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </div>
        </div>

        {/* Chat Background */}
        <div 
          ref={chatContainerRef}
          className="h-[500px] overflow-y-auto p-4 space-y-3"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundColor: '#e5ddd5'
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-xs px-4 py-3 rounded-2xl shadow-sm ${
                  message.isUser
                    ? 'bg-[#dcf8c6] text-gray-800 rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm'
                }`}
              >
                {message.isLoading ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                    <div className="h-32 bg-gray-200 rounded mt-2 animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    {message.text && (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                    )}
                    
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
                                  cursor-pointer rounded-lg px-3 py-2 transition-all duration-200 hover:scale-[1.02] active:scale-95
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
                        
                        {(selectedPlats.get(message.id)?.size ?? 0) > 0 && (
                          <div className="mt-3 animate-fade-in">
                            <button
                              onClick={() => sendSelectedPlats(message.id)}
                              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                              disabled={isLoading}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                              Envoyer ({selectedPlats.get(message.id)?.size})
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {message.imageUrls && message.imageUrls.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.imageUrls.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Image ${idx + 1}`}
                            className="w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(url, '_blank')}
                          />
                        ))}
                      </div>
                    )}
                    
                    <div className={`text-xs mt-2 flex items-center ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-gray-500">
                        {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {message.isUser && (
                        <div className="ml-2 flex items-center">
                          {message.status === 'sending' && <span className="text-gray-400">✓</span>}
                          {message.status === 'sent' && <span className="text-gray-400">✓✓</span>}
                          {message.status === 'delivered' && <span className="text-blue-500">✓✓</span>}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white px-5 py-4 rounded-2xl rounded-bl-sm shadow-sm">
                <div className="flex items-center space-x-1.5">
                  <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Messages */}
        {messages.length === 0 && (
          <div className="bg-[#f0f0f0] px-4 pt-3 pb-1">
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestedMessages.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => sendSuggestedMessage(suggestion)}
                  disabled={isLoading}
                  className="bg-white hover:bg-gray-50 text-gray-700 text-sm px-3 py-2 rounded-full border border-gray-200 transition-all duration-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              className="w-full bg-white border-2 border-transparent rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#25D366] focus:shadow-md transition-all duration-300"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-[#25D366] hover:bg-[#20b358] rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z"/>
              <path d="M22 2 11 13"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
