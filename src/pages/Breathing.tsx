
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Play, RotateCcw, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

type Phase = 'Inhale' | 'Hold' | 'Exhale' | 'Ready';

import { toast } from 'sonner';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useStore } from '../store/useStore';
import { BreathingSession } from '../types';
import { translations } from '../lib/translations';

export function Breathing() {
  const { user, language } = useStore();
  const t = translations[language].breathing;
  const [phase, setPhase] = useState<Phase>('Ready');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  // 4-7-8 Technique
  const phases = {
    Inhale: 4,
    Hold: 7,
    Exhale: 8
  };

  const getPhaseLabel = (p: Phase) => {
    switch (p) {
      case 'Inhale': return t.inhale;
      case 'Hold': return t.hold;
      case 'Exhale': return t.exhale;
      case 'Ready': return t.ready;
      default: return p;
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      if (phase === 'Ready') {
        setPhase('Inhale');
        setTimeLeft(phases.Inhale);
        setStartTime(Date.now());
      } else if (phase === 'Inhale') {
        setPhase('Hold');
        setTimeLeft(phases.Hold);
      } else if (phase === 'Hold') {
        setPhase('Exhale');
        setTimeLeft(phases.Exhale);
      } else if (phase === 'Exhale') {
        setCycles((prev) => prev + 1);
        setPhase('Inhale');
        setTimeLeft(phases.Inhale);
      }
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft, phase]);

  const startSession = () => {
    setIsActive(true);
    setPhase('Inhale');
    setTimeLeft(phases.Inhale);
    setCycles(0);
    setStartTime(Date.now());
  };

  const stopSession = async () => {
    if (cycles > 0 && user && startTime) {
      const id = crypto.randomUUID();
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const session: BreathingSession = {
        id,
        timestamp: Date.now(),
        duration,
        cycles,
        uid: user.id
      };
      const path = `users/${user.id}/sessions/${id}`;
      try {
        await setDoc(doc(db, path), session);
        toast.success(t.success);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }
    setIsActive(false);
    setPhase('Ready');
    setTimeLeft(0);
    setStartTime(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-[#2D3436]">{t.title}</h1>
        <p className="text-[#636E72] text-lg max-w-xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[400px] relative">
        {/* Breathing Circle */}
        <div className="relative flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ scale: phase === 'Inhale' ? 1 : phase === 'Exhale' ? 1.5 : 1.5 }}
              animate={{ 
                scale: phase === 'Inhale' ? 1.5 : phase === 'Hold' ? 1.5 : phase === 'Exhale' ? 1 : 1,
                backgroundColor: phase === 'Inhale' ? '#6C5CE7' : phase === 'Hold' ? '#A29BFE' : phase === 'Exhale' ? '#55EFC4' : '#F0F2F5'
              }}
              transition={{ 
                duration: phase === 'Inhale' ? 4 : phase === 'Hold' ? 7 : phase === 'Exhale' ? 8 : 0.5,
                ease: "easeInOut"
              }}
              className="w-64 h-64 rounded-full flex flex-col items-center justify-center shadow-2xl shadow-[#6C5CE7]/20"
            >
              <div className="text-white text-center">
                <motion.p 
                  key={phase + 'text'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold uppercase tracking-widest mb-2"
                >
                  {getPhaseLabel(phase)}
                </motion.p>
                {isActive && (
                  <motion.p 
                    key={timeLeft}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-4xl font-mono font-bold"
                  >
                    {timeLeft}
                  </motion.p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Outer Rings */}
          <div className="absolute inset-0 -m-8 border-2 border-[#E2E8F0] rounded-full opacity-20" />
          <div className="absolute inset-0 -m-16 border-2 border-[#E2E8F0] rounded-full opacity-10" />
        </div>

        <div className="mt-20 flex flex-col items-center gap-8">
          {!isActive ? (
            <Button 
              onClick={startSession}
              className="bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-full px-12 h-16 text-xl font-bold shadow-xl shadow-[#6C5CE7]/20 transition-all active:scale-95"
            >
              <Play className="w-6 h-6 mr-3" />
              {t.start}
            </Button>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <Button 
                onClick={stopSession}
                variant="outline"
                className="border-[#E2E8F0] text-[#636E72] rounded-full px-10 h-14 font-bold hover:bg-[#FF7675]/10 hover:text-[#D63031] hover:border-[#FF7675]"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                {t.stop}
              </Button>
              <div className="flex items-center gap-2 text-[#636E72] font-bold uppercase tracking-widest text-xs">
                <CheckCircle2 className="w-4 h-4 text-[#00B894]" />
                {language === 'en' ? 'Cycles Completed' : 'சுழற்சிகள் முடிந்தது'}: {cycles}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Card className="p-6 bg-white border-[#E2E8F0] rounded-3xl shadow-sm">
          <div className="w-10 h-10 bg-[#E9E3FF] rounded-xl flex items-center justify-center mb-4">
            <Info className="text-[#6C5CE7] w-5 h-5" />
          </div>
          <h4 className="font-bold text-[#2D3436] mb-2">{t.inhale} (4s)</h4>
          <p className="text-sm text-[#636E72]">{language === 'en' ? 'Breathe in deeply through your nose, feeling your belly expand.' : 'உங்கள் மூக்கின் வழியாக ஆழமாக சுவாசிக்கவும், உங்கள் வயிறு விரிவடைவதை உணரவும்.'}</p>
        </Card>
        <Card className="p-6 bg-white border-[#E2E8F0] rounded-3xl shadow-sm">
          <div className="w-10 h-10 bg-[#E9E3FF] rounded-xl flex items-center justify-center mb-4">
            <Info className="text-[#6C5CE7] w-5 h-5" />
          </div>
          <h4 className="font-bold text-[#2D3436] mb-2">{t.hold} (7s)</h4>
          <p className="text-sm text-[#636E72]">{language === 'en' ? 'Keep the air in your lungs. This allows oxygen to fully saturate your blood.' : 'உங்கள் நுரையீரலில் காற்றை வைத்திருங்கள். இது ஆக்ஸிஜன் உங்கள் இரத்தத்தை முழுமையாக நிறைவு செய்ய அனுமதிக்கிறது.'}</p>
        </Card>
        <Card className="p-6 bg-white border-[#E2E8F0] rounded-3xl shadow-sm">
          <div className="w-10 h-10 bg-[#E9E3FF] rounded-xl flex items-center justify-center mb-4">
            <Info className="text-[#6C5CE7] w-5 h-5" />
          </div>
          <h4 className="font-bold text-[#2D3436] mb-2">{t.exhale} (8s)</h4>
          <p className="text-sm text-[#636E72]">{language === 'en' ? 'Breathe out completely through your mouth with a whooshing sound.' : 'உங்கள் வாயின் வழியாக ஒரு சத்தத்துடன் முழுமையாக மூச்சை வெளியேற்றவும்.'}</p>
        </Card>
      </div>
    </div>
  );
}
