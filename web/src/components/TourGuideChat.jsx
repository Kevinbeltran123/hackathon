import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../lib/api.js';
import { useRoute } from '../store/store.js';

export default function TourGuideChat({ userLocation }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { items: activeRoute } = useRoute();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 1,
        type: 'bot',
        content: '¡Hola! Soy tu guía turístico virtual de Ibagué 🎵 ¿En qué puedo ayudarte a descubrir nuestra hermosa Capital Musical de Colombia?',
        timestamp: new Date()
      }]);
    }
  }, [messages.length]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const context = {
        userId,
        lat: userLocation?.lat,
        lng: userLocation?.lng,
        activeRoute: activeRoute.map(item => ({
          title: item.title || item.name,
          place_name: item.place_name
        }))
      };

      const response = await sendChatMessage(userMsg.content, context);
      
      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.message,
        timestamp: new Date(),
        isDemo: response.isDemo,
        fromCache: response.fromCache,
        isFallback: response.isFallback,
        tokensUsed: response.tokensUsed
      };

      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMsg = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Lo siento, tengo problemas de conexión. Mientras tanto, te recomiendo visitar el centro histórico de Ibagué, donde encontrarás la Plaza de Bolívar y la Catedral Primada 🏛️',
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const suggestedQuestions = [
    "¿Qué lugares puedo visitar en el centro?",
    "¿Dónde puedo comer comida típica?",
    "¿Qué actividades hay disponibles ahora?",
    "Cuéntame sobre la historia de Ibagué"
  ];

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 transition-all duration-300 flex items-center justify-center text-2xl ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
        title={isOpen ? 'Cerrar chat' : 'Chat con guía turístico'}
      >
        {isOpen ? '✕' : '🎵'}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[500px] bg-white rounded-2xl shadow-2xl z-40 flex flex-col border border-gray-200">
          
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              🎵
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Guía de Ibagué</h3>
              <p className="text-blue-100 text-sm">Capital Musical de Colombia</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : msg.isError
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-1 opacity-70">
                    <span className="text-xs">
                      {formatTime(msg.timestamp)}
                    </span>
                    
                    {msg.isDemo && (
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">
                        Demo
                      </span>
                    )}
                    
                    {msg.fromCache && (
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                        Caché
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">Escribiendo...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length <= 1 && !isLoading && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-600 mb-2">Preguntas sugeridas:</p>
              <div className="flex flex-wrap gap-1">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Pregúntame sobre Ibagué..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  '➤'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}