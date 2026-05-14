
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  Square, 
  Upload, 
  Play, 
  Pause, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  Brain, 
  Sparkles,
  Info,
  History as HistoryIcon,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { useStore } from '../store/useStore';
import { translations } from '../lib/translations';
import { VoiceAnalysis, VoiceEntry } from '../types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export function VoiceAssistant() {
  const { user, language, voiceEntries } = useStore();
  const t = translations[language].voice;
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<VoiceAnalysis | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast.error('Microphone access denied. If you are in the preview, try opening the app in a new tab.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioBlob(file);
      setAudioUrl(URL.createObjectURL(file));
      setAnalysis(null);
    }
  };

  const analyzeVoice = async () => {
    if (!audioBlob) return;

    setIsAnalyzing(true);
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
      });
      reader.readAsDataURL(audioBlob);
      const base64Data = await base64Promise;

      const prompt = `
        Analyze this audio for emotional stress and anxiety indicators. 
        Focus on vocal features: tone, pitch variation, speech rate, pauses, and energy.
        
        IMPORTANT: Do NOT provide a medical diagnosis. This is an AI-based emotional stress estimate.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: base64Data,
                  mimeType: audioBlob.type || 'audio/webm'
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              state: { 
                type: Type.STRING, 
                enum: ["Calm", "Slightly Stressed", "Moderately Stressed", "Highly Stressed"] 
              },
              confidence: { type: Type.NUMBER },
              features: {
                type: Type.OBJECT,
                properties: {
                  pitch: { type: Type.STRING },
                  speed: { type: Type.STRING },
                  energy: { type: Type.STRING },
                  pauses: { type: Type.STRING }
                },
                required: ["pitch", "speed", "energy", "pauses"]
              },
              explanation: { type: Type.STRING },
              suggestions: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              }
            },
            required: ["state", "confidence", "features", "explanation", "suggestions"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setAnalysis(data);
      
      if (user) {
        const id = crypto.randomUUID();
        const entry: VoiceEntry = {
          id,
          timestamp: Date.now(),
          analysis: data,
          uid: user.id
        };
        const path = `users/${user.id}/voice_history/${id}`;
        await setDoc(doc(db, path), entry);
      }
      
      toast.success('Analysis complete');
    } catch (err) {
      console.error('Voice analysis error:', err);
      toast.error('Failed to analyze voice. Please try a longer recording.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLevelColor = (state: string) => {
    switch (state) {
      case 'Highly Stressed': return 'text-[#D63031] bg-[#D63031]/10';
      case 'Moderately Stressed': return 'text-[#E17055] bg-[#E17055]/10';
      case 'Slightly Stressed': return 'text-[#FDCB6E] bg-[#FDCB6E]/10';
      default: return 'text-[#00B894] bg-[#00B894]/10';
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-[#2D3436] tracking-tight">{t.title}</h1>
        <p className="text-[#636E72] text-lg">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Recording / Upload Section */}
          <Card className="bg-white border-none shadow-sm rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-10">
              <div className="flex flex-col items-center justify-center space-y-8">
                <div className="relative">
                  <AnimatePresence>
                    {isRecording && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 0.2 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 bg-[#6C5CE7] rounded-full"
                      />
                    )}
                  </AnimatePresence>
                  <Button
                    size="icon"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-24 h-24 rounded-full shadow-2xl transition-all active:scale-95 relative z-10 ${
                      isRecording ? 'bg-[#D63031] hover:bg-[#B32626]' : 'bg-[#6C5CE7] hover:bg-[#5B4BC4]'
                    }`}
                  >
                    {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-10 h-10" />}
                  </Button>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-[#2D3436]">
                    {isRecording ? formatTime(recordingTime) : t.record}
                  </p>
                  <p className="text-[#636E72]">{isRecording ? t.stop : 'Tap to start speaking'}</p>
                </div>

                <div className="flex items-center gap-4 w-full max-w-xs">
                  <div className="h-px bg-[#E2E8F0] flex-1" />
                  <span className="text-[10px] font-bold text-[#B2BEC3] uppercase tracking-widest">OR</span>
                  <div className="h-px bg-[#E2E8F0] flex-1" />
                </div>

                <div className="flex gap-4">
                  <label className="cursor-pointer">
                    <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
                    <div className="flex items-center gap-2 px-6 py-3 bg-[#F0F2F5] hover:bg-[#E2E8F0] text-[#636E72] rounded-2xl font-bold transition-all">
                      <Upload className="w-4 h-4" />
                      {t.upload}
                    </div>
                  </label>
                </div>

                {audioUrl && (
                  <div className="w-full space-y-6 pt-4">
                    <audio src={audioUrl} controls className="w-full" />
                    <Button
                      onClick={analyzeVoice}
                      disabled={isAnalyzing}
                      className="w-full bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-2xl h-14 font-bold shadow-lg shadow-[#6C5CE7]/20"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          {t.analyzing}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Analyze Emotional State
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Result */}
          <AnimatePresence>
            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <Card className="bg-white border-none shadow-sm rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="p-8 pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl font-bold text-[#2D3436]">{t.result}</CardTitle>
                        <CardDescription>{t.subtitle}</CardDescription>
                      </div>
                      <div className={`px-4 py-2 rounded-2xl font-bold ${getLevelColor(analysis.state)}`}>
                        {analysis.state}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-[#F8FAFC] rounded-2xl space-y-1">
                        <p className="text-[10px] font-bold text-[#B2BEC3] uppercase tracking-widest">{t.pitch}</p>
                        <p className="font-bold text-[#2D3436]">{analysis.features.pitch}</p>
                      </div>
                      <div className="p-4 bg-[#F8FAFC] rounded-2xl space-y-1">
                        <p className="text-[10px] font-bold text-[#B2BEC3] uppercase tracking-widest">{t.speed}</p>
                        <p className="font-bold text-[#2D3436]">{analysis.features.speed}</p>
                      </div>
                      <div className="p-4 bg-[#F8FAFC] rounded-2xl space-y-1">
                        <p className="text-[10px] font-bold text-[#B2BEC3] uppercase tracking-widest">{t.energy}</p>
                        <p className="font-bold text-[#2D3436]">{analysis.features.energy}</p>
                      </div>
                      <div className="p-4 bg-[#F8FAFC] rounded-2xl space-y-1">
                        <p className="text-[10px] font-bold text-[#B2BEC3] uppercase tracking-widest">{t.pauses}</p>
                        <p className="font-bold text-[#2D3436]">{analysis.features.pauses}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-[#2D3436] flex items-center gap-2">
                        <Brain className="w-5 h-5 text-[#6C5CE7]" />
                        {t.explanation}
                      </h4>
                      <p className="text-[#636E72] leading-relaxed">{analysis.explanation}</p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-[#2D3436] flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#00B894]" />
                        {t.suggestions}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {analysis.suggestions.map((s, i) => (
                          <div key={i} className="p-4 bg-[#55EFC4]/10 rounded-2xl text-sm font-medium text-[#2D3436]">
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#D63031]/5 border border-[#D63031]/20 rounded-[2.5rem] p-8">
                  <div className="flex gap-4">
                    <ShieldAlert className="w-6 h-6 text-[#D63031] flex-shrink-0" />
                    <p className="text-sm text-[#D63031] font-medium leading-relaxed">
                      {t.disclaimer}
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <Card className="bg-white border-none shadow-sm rounded-[2.5rem] p-8">
            <h3 className="text-xl font-bold text-[#2D3436] mb-6 flex items-center gap-2">
              <HistoryIcon className="w-5 h-5 text-[#6C5CE7]" />
              {t.history}
            </h3>
            <div className="space-y-4">
              {voiceEntries.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-12 h-12 bg-[#F8FAFC] rounded-2xl flex items-center justify-center mx-auto">
                    <Info className="text-[#B2BEC3] w-6 h-6" />
                  </div>
                  <p className="text-sm text-[#B2BEC3] font-medium">No history yet</p>
                </div>
              ) : (
                voiceEntries.slice().reverse().map((entry) => (
                  <div key={entry.id} className="p-4 bg-[#F8FAFC] rounded-2xl space-y-2 group cursor-pointer hover:bg-[#F0F2F5] transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#B2BEC3]">{format(entry.timestamp, 'MMM d, h:mm a')}</span>
                      <ChevronRight className="w-4 h-4 text-[#B2BEC3] group-hover:text-[#6C5CE7] transition-colors" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getLevelColor(entry.analysis.state).split(' ')[1].replace('/10', '')}`} />
                      <span className="font-bold text-[#2D3436]">{entry.analysis.state}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-[#6C5CE7] to-[#8E44AD] border-none rounded-[2.5rem] p-8 text-white shadow-xl shadow-[#6C5CE7]/20">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-white" />
              How it works
            </h3>
            <div className="space-y-4 text-sm text-white/80 leading-relaxed">
              <p>Our AI analyzes several acoustic features in your voice:</p>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Pitch:</strong> Variations can indicate stress levels.</li>
                <li><strong>Speed:</strong> Rapid speech often correlates with anxiety.</li>
                <li><strong>Energy:</strong> Volume and intensity patterns.</li>
                <li><strong>Pauses:</strong> Irregular breathing or hesitation.</li>
              </ul>
              <p className="pt-2">This data is processed by a specialized speech-emotion model to provide a supportive estimate.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
