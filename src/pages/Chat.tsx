
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Trash2, Sparkles, User, Bot, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { useStore } from '../store/useStore';
import { getGeminiResponse, generateSpeech } from '../services/geminiService';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, collection, writeBatch, getDocs, query, where } from 'firebase/firestore';
import { ChatMessage } from '../types';
import { translations } from '../lib/translations';

export function Chat() {
  const { chatHistory, user, language } = useStore();
  const t = translations[language].chat;
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playAudio = async (base64Data: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // The TTS model returns 16-bit PCM (2 bytes per sample)
      const float32Data = new Float32Array(bytes.buffer.byteLength / 2);
      const view = new DataView(bytes.buffer);
      for (let i = 0; i < float32Data.length; i++) {
        float32Data[i] = view.getInt16(i * 2, true) / 32768.0;
      }

      const audioBuffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      // Set language for recognition
      const langMap: Record<string, string> = {
        en: 'en-US',
        ta: 'ta-IN',
        ml: 'ml-IN',
        kn: 'kn-IN',
        te: 'te-IN',
        hi: 'hi-IN'
      };
      recognitionRef.current.lang = langMap[language] || 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Voice recognition failed. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast.info('Listening...');
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const saveMessage = async (role: 'user' | 'assistant', content: string, detection?: any) => {
    if (!user) return;
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    const message: ChatMessage = { id, role, content, timestamp, uid: user.id, detection };
    const path = `users/${user.id}/chats/${id}`;
    try {
      await setDoc(doc(db, path), message);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    if (!user) {
      toast.error('Please sign in to chat');
      return;
    }

    await saveMessage('user', userMessage);
    setIsLoading(true);

    try {
      const history = chatHistory.map(msg => ({ role: msg.role, content: msg.content }));
      const { text: aiResponse, detection } = await getGeminiResponse(userMessage, history, language);
      const finalResponse = aiResponse || "I'm sorry, I couldn't process that. How else can I help?";
      await saveMessage('assistant', finalResponse, detection);

      if (isVoiceOutputEnabled && aiResponse) {
        const audioData = await generateSpeech(aiResponse);
        if (audioData) {
          playAudio(audioData);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response. Please check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!user) return;
    const path = `users/${user.id}/chats`;
    try {
      const q = query(collection(db, path));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      toast.success('Chat history cleared');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#6C5CE7] rounded-full flex items-center justify-center shadow-lg shadow-[#6C5CE7]/20">
            <Bot className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-[#2D3436]">Paz</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-[#00B894] rounded-full animate-pulse" />
              <span className="text-xs font-medium text-[#636E72]">Always here to listen</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVoiceOutputEnabled(!isVoiceOutputEnabled)}
            className={`rounded-full transition-all ${isVoiceOutputEnabled ? 'bg-[#E9E3FF] text-[#6C5CE7]' : 'text-[#B2BEC3] hover:bg-[#F0F2F5]'}`}
            title={isVoiceOutputEnabled ? "Disable Voice Assistant" : "Enable Voice Assistant"}
          >
            {isVoiceOutputEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleClearChat} className="text-[#B2BEC3] hover:text-[#FF7675] hover:bg-[#FF7675]/10 rounded-full">
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="space-y-6">
          {chatHistory.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-[#E9E3FF] rounded-3xl flex items-center justify-center mb-4">
                <Sparkles className="text-[#6C5CE7] w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#2D3436] mb-2">{t.greeting.split('.')[0]}</h3>
              <p className="text-[#636E72] max-w-xs">
                {t.greeting}
              </p>
            </div>
          )}

          {chatHistory.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                  message.role === 'user' ? 'bg-[#F0F2F5]' : 'bg-[#6C5CE7]'
                }`}>
                  {message.role === 'user' ? <User className="w-4 h-4 text-[#636E72]" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={`p-4 rounded-2xl shadow-sm ${
                  message.role === 'user' 
                    ? 'bg-[#6C5CE7] text-white rounded-tr-none' 
                    : 'bg-[#F0F2F5] text-[#2D3436] rounded-tl-none'
                }`}>
                  <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-inherit prose-strong:text-inherit">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  <p className={`text-[10px] mt-2 opacity-50 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {format(message.timestamp, 'h:mm a')}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-[#6C5CE7] flex-shrink-0 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-[#F0F2F5] p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                  <div className="w-1.5 h-1.5 bg-[#B2BEC3] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-[#B2BEC3] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-[#B2BEC3] rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-6 border-t border-[#E2E8F0] bg-white">
        <div className="flex gap-3 items-end">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleListening}
            className={`h-[52px] w-[52px] rounded-2xl flex-shrink-0 transition-all ${
              isListening ? 'bg-[#FF7675] text-white animate-pulse' : 'bg-[#F0F2F5] text-[#636E72] hover:bg-[#E2E8F0]'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? "Listening..." : t.placeholder}
              className="pr-12 py-6 rounded-2xl border-[#E2E8F0] focus:ring-[#6C5CE7] focus:border-[#6C5CE7] bg-[#F8FAFC]"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#B2BEC3] hover:text-[#6C5CE7] rounded-full"
            >
              <Smile className="w-5 h-5" />
            </Button>
          </div>
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            className="h-[52px] w-[52px] bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-2xl shadow-lg shadow-[#6C5CE7]/20 flex-shrink-0 transition-all active:scale-95"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-[10px] text-center text-[#B2BEC3] mt-3 uppercase tracking-widest font-bold">
          {language === 'en' ? 'Paz can make mistakes. Consider checking important information.' : 'பாஸ் தவறுகள் செய்யலாம். முக்கியமான தகவலைச் சரிபார்க்கவும்.'}
        </p>
      </div>
    </div>
  );
}
