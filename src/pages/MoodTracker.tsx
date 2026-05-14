
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Smile, 
  Frown, 
  Meh, 
  Laugh, 
  Annoyed, 
  Check, 
  Calendar, 
  History,
  TrendingUp,
  AlertCircle,
  Activity,
  CloudRain,
  Zap,
  Droplets,
  Users,
  Moon,
  Coffee,
  Sun,
  Wind,
  ClipboardCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Slider } from '../components/ui/slider';
import { Textarea } from '../components/ui/textarea';
import { useStore } from '../store/useStore';
import { translations } from '../lib/translations';
import { MoodType, MoodEntry } from '../types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export function MoodTracker() {
  const { moodEntries, user, language } = useStore();
  const t = translations[language].mood;
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [anxietyLevel, setAnxietyLevel] = useState(5);
  const [note, setNote] = useState('');
  const [factors, setFactors] = useState({
    sleep: 'fair' as 'poor' | 'fair' | 'good',
    energy: 'medium' as 'low' | 'medium' | 'high',
    water: false,
    social: false
  });

  const moods: { type: MoodType; icon: any; label: string; color: string }[] = [
    { type: 'calm', icon: Wind, label: t.calm, color: '#55EFC4' },
    { type: 'happy', icon: Laugh, label: t.happy, color: '#00B894' },
    { type: 'neutral', icon: Meh, label: t.neutral, color: '#FAB1A0' },
    { type: 'stressed', icon: Zap, label: t.stressed, color: '#FDCB6E' },
    { type: 'anxious', icon: AlertCircle, label: t.anxious, color: '#FF7675' },
    { type: 'sad', icon: CloudRain, label: t.sad, color: '#0984E3' },
    { type: 'overwhelmed', icon: Frown, label: t.overwhelmed, color: '#D63031' },
  ];

  const handleSave = async () => {
    if (!selectedMood) {
      toast.error('Please select a mood');
      return;
    }
    if (!user) {
      toast.error('Please sign in to log your mood');
      return;
    }

    const id = crypto.randomUUID();
    const timestamp = Date.now();
    const entry: MoodEntry = { 
      id, 
      timestamp, 
      mood: selectedMood, 
      anxietyLevel, 
      note, 
      factors,
      uid: user.id 
    };

    const path = `users/${user.id}/moods/${id}`;
    try {
      await setDoc(doc(db, path), entry);
      toast.success(t.success);
      setSelectedMood(null);
      setAnxietyLevel(5);
      setNote('');
      setFactors({
        sleep: 'fair',
        energy: 'medium',
        water: false,
        social: false
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-[#2D3436] tracking-tight">{t.title}</h1>
          <p className="text-[#636E72] text-lg">{t.subtitle}</p>
        </div>
        <Link to="/assessment">
          <Button variant="outline" className="border-[#6C5CE7] text-[#6C5CE7] hover:bg-[#6C5CE7] hover:text-white rounded-2xl px-6 h-12 font-bold transition-all">
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Take GAD-7 Assessment
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Mood Selection */}
          <Card className="bg-white border-none shadow-sm rounded-[2rem] p-8">
            <h3 className="text-lg font-bold text-[#2D3436] mb-6 flex items-center gap-2">
              <Smile className="w-5 h-5 text-[#6C5CE7]" />
              How are you feeling right now?
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-4">
              {moods.map((mood) => {
                const Icon = mood.icon;
                const isActive = selectedMood === mood.type;
                return (
                  <button
                    key={mood.type}
                    onClick={() => setSelectedMood(mood.type)}
                    className="flex flex-col items-center gap-3 transition-all duration-300 group"
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-[#6C5CE7] text-white shadow-xl shadow-[#6C5CE7]/20 scale-110' 
                        : 'bg-[#F8FAFC] text-[#B2BEC3] hover:bg-[#E9E3FF] hover:text-[#6C5CE7]'
                    }`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider text-center ${
                      isActive ? 'text-[#6C5CE7]' : 'text-[#B2BEC3]'
                    }`}>
                      {mood.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Anxiety Level */}
          <Card className="bg-white border-none shadow-sm rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-[#2D3436] flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#FF7675]" />
                {t.anxietyLevel}
              </h3>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                anxietyLevel > 7 ? 'bg-[#FF7675]/10 text-[#FF7675]' : 'bg-[#55EFC4]/10 text-[#00B894]'
              }`}>
                {anxietyLevel}/10
              </span>
            </div>
            <Slider
              value={[anxietyLevel]}
              onValueChange={(val) => setAnxietyLevel(val[0])}
              max={10}
              min={1}
              step={1}
              className="py-4"
            />
            <div className="flex justify-between mt-4">
              <span className="text-xs font-bold text-[#B2BEC3] uppercase tracking-widest">Peaceful</span>
              <span className="text-xs font-bold text-[#B2BEC3] uppercase tracking-widest">Intense</span>
            </div>
          </Card>

          {/* Daily Factors */}
          <Card className="bg-white border-none shadow-sm rounded-[2rem] p-8">
            <h3 className="text-lg font-bold text-[#2D3436] mb-8 flex items-center gap-2">
              <Sun className="w-5 h-5 text-[#FDCB6E]" />
              {t.factors}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-sm font-bold text-[#636E72] uppercase tracking-widest">{t.sleep}</p>
                <div className="flex gap-2">
                  {(['poor', 'fair', 'good'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setFactors({ ...factors, sleep: s })}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                        factors.sleep === s 
                          ? 'bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/20' 
                          : 'bg-[#F8FAFC] text-[#B2BEC3] hover:bg-[#F0F2F5]'
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-sm font-bold text-[#636E72] uppercase tracking-widest">{t.energy}</p>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((e) => (
                    <button
                      key={e}
                      onClick={() => setFactors({ ...factors, energy: e })}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                        factors.energy === e 
                          ? 'bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/20' 
                          : 'bg-[#F8FAFC] text-[#B2BEC3] hover:bg-[#F0F2F5]'
                      }`}
                    >
                      {e.charAt(0).toUpperCase() + e.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl">
                <div className="flex items-center gap-3">
                  <Droplets className="w-5 h-5 text-[#0984E3]" />
                  <span className="text-sm font-bold text-[#2D3436]">{t.water}</span>
                </div>
                <button
                  onClick={() => setFactors({ ...factors, water: !factors.water })}
                  className={`w-12 h-6 rounded-full transition-all relative ${
                    factors.water ? 'bg-[#55EFC4]' : 'bg-[#DFE6E9]'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                    factors.water ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#6C5CE7]" />
                  <span className="text-sm font-bold text-[#2D3436]">{t.social}</span>
                </div>
                <button
                  onClick={() => setFactors({ ...factors, social: !factors.social })}
                  className={`w-12 h-6 rounded-full transition-all relative ${
                    factors.social ? 'bg-[#55EFC4]' : 'bg-[#DFE6E9]'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                    factors.social ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>
          </Card>

          {/* Note */}
          <Card className="bg-white border-none shadow-sm rounded-[2rem] p-8">
            <h3 className="text-lg font-bold text-[#2D3436] mb-6 flex items-center gap-2">
              <Coffee className="w-5 h-5 text-[#636E72]" />
              {t.note}
            </h3>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write a short note about how you feel today..."
              className="min-h-[150px] rounded-[1.5rem] border-none bg-[#F8FAFC] focus:ring-2 focus:ring-[#6C5CE7]/20 p-6 text-lg"
            />
          </Card>

          <Button 
            onClick={handleSave}
            className="w-full h-16 bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-[1.5rem] font-bold text-xl shadow-xl shadow-[#6C5CE7]/20 transition-all active:scale-[0.98]"
          >
            {t.save}
          </Button>
        </div>

        {/* Sidebar: History */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-[#2D3436] flex items-center gap-2">
              <History className="w-5 h-5 text-[#6C5CE7]" />
              {t.recentHistory}
            </h2>
          </div>

          <div className="space-y-4">
            {moodEntries.length === 0 ? (
              <div className="bg-white border-none rounded-[2rem] p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-[#B2BEC3] w-8 h-8" />
                </div>
                <p className="text-[#636E72] font-medium">No mood entries yet. Start your journey today!</p>
              </div>
            ) : (
              moodEntries.slice(-6).reverse().map((entry) => {
                const moodInfo = moods.find(m => m.type === entry.mood);
                const Icon = moodInfo?.icon || Smile;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border-none rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110" style={{ backgroundColor: `${moodInfo?.color}15`, color: moodInfo?.color }}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-[#2D3436] truncate">{moodInfo?.label}</h4>
                        <span className="text-[10px] font-bold text-[#B2BEC3] uppercase tracking-widest">{format(entry.timestamp, 'MMM d, h:mm a')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#F8FAFC] rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${entry.anxietyLevel * 10}%`,
                              backgroundColor: entry.anxietyLevel > 7 ? '#FF7675' : '#55EFC4'
                            }} 
                          />
                        </div>
                        <span className="text-[10px] font-bold text-[#636E72]">{entry.anxietyLevel}/10</span>
                      </div>
                      {entry.note && (
                        <p className="text-xs text-[#636E72] mt-2 line-clamp-1 italic text-opacity-80">"{entry.note}"</p>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {moodEntries.length > 0 && (
            <Card className="bg-gradient-to-br from-[#6C5CE7] to-[#8E44AD] border-none rounded-[2rem] p-8 text-white shadow-lg shadow-[#6C5CE7]/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="text-white w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Daily Insight</h4>
                  <p className="text-sm text-white/80 leading-relaxed">
                    You've logged your mood for 3 days in a row! Consistency is key to understanding your emotional well-being.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
