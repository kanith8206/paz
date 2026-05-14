
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Smile, 
  Wind, 
  MessageCircle, 
  ArrowRight, 
  Calendar, 
  TrendingUp,
  Plus,
  BookOpen,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Brain,
  Sparkles,
  AlertCircle,
  Camera,
  Mic
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { translations } from '../lib/translations';

export function Dashboard() {
  const { user, moodEntries, journalEntries, breathingSessions, gad7Entries, voiceEntries, chatHistory, language } = useStore();
  const t = translations[language].dashboard;
  const moodT = translations[language].mood;
  const navT = translations[language].nav;
  const assessT = translations[language].assessment;
  
  const lastMood = moodEntries[moodEntries.length - 1];
  const lastJournal = journalEntries[journalEntries.length - 1];
  const lastSession = breathingSessions[breathingSessions.length - 1];
  const lastAssessment = gad7Entries[gad7Entries.length - 1];
  const lastVoice = voiceEntries[voiceEntries.length - 1];
  const lastAiDetection = chatHistory.filter(m => m.role === 'assistant' && m.detection).slice(-1)[0]?.detection;

  const getMoodLabel = (mood: string) => {
    return moodT[mood] || mood;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'severe': case 'high': return 'text-[#D63031] bg-[#D63031]/10';
      case 'moderate': case 'medium': return 'text-[#E17055] bg-[#E17055]/10';
      case 'mild': case 'low': return 'text-[#FDCB6E] bg-[#FDCB6E]/10';
      default: return 'text-[#00B894] bg-[#00B894]/10';
    }
  };

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-[#2D3436] mb-2">
            {t.welcome}, {user?.name?.split(' ')[0] || 'Friend'}
          </h1>
          <p className="text-[#636E72] text-lg">{moodT.title}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/assessment">
            <Button className="bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-2xl px-6 h-12 font-bold shadow-lg shadow-[#6C5CE7]/20 transition-all active:scale-95">
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Take Assessment
            </Button>
          </Link>
          <Link to="/mood">
            <Button variant="outline" className="border-[#E2E8F0] text-[#636E72] rounded-2xl px-6 h-12 font-bold hover:bg-[#F0F2F5] transition-all active:scale-95">
              <Plus className="w-4 h-4 mr-2" />
              {moodT.save}
            </Button>
          </Link>
          <Link to="/facial">
            <Button variant="outline" className="border-[#E2E8F0] text-[#636E72] rounded-2xl px-6 h-12 font-bold hover:bg-[#F0F2F5] transition-all active:scale-95">
              <Camera className="w-4 h-4 mr-2" />
              Facial AI
            </Button>
          </Link>
          <Link to="/voice">
            <Button variant="outline" className="border-[#E2E8F0] text-[#636E72] rounded-2xl px-6 h-12 font-bold hover:bg-[#F0F2F5] transition-all active:scale-95">
              <Mic className="w-4 h-4 mr-2" />
              Voice AI
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-white border-[#E2E8F0] shadow-sm rounded-3xl overflow-hidden group hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#E9E3FF] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Smile className="text-[#6C5CE7] w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-[#B2BEC3] uppercase tracking-widest">{navT.mood}</span>
            </div>
            <h3 className="text-2xl font-bold text-[#2D3436] mb-1 capitalize">
              {lastMood ? getMoodLabel(lastMood.mood) : 'Not Logged'}
            </h3>
            <p className="text-sm text-[#636E72]">
              {lastMood ? `Logged ${format(lastMood.timestamp, 'h:mm a')}` : moodT.subtitle}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E2E8F0] shadow-sm rounded-3xl overflow-hidden group hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#D1FAE5] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <ClipboardCheck className="text-[#059669] w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-[#B2BEC3] uppercase tracking-widest">GAD-7 Score</span>
            </div>
            <h3 className="text-2xl font-bold text-[#2D3436] mb-1">
              {lastAssessment ? `${lastAssessment.totalScore} pts` : 'No Assessment'}
            </h3>
            <div className="flex items-center gap-2">
              {lastAssessment && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${getLevelColor(lastAssessment.level)}`}>
                  {lastAssessment.level}
                </span>
              )}
              <p className="text-sm text-[#636E72]">
                {lastAssessment ? format(lastAssessment.timestamp, 'MMM d') : 'Check your level'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E2E8F0] shadow-sm rounded-3xl overflow-hidden group hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#E0F2FE] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mic className="text-[#0284C7] w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-[#B2BEC3] uppercase tracking-widest">Voice AI</span>
            </div>
            <h3 className="text-2xl font-bold text-[#2D3436] mb-1 capitalize">
              {lastVoice ? lastVoice.analysis.state : 'No Data'}
            </h3>
            <div className="flex items-center gap-2">
              {lastVoice && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${getLevelColor(lastVoice.analysis.state)}`}>
                  {Math.round(lastVoice.analysis.confidence * 100)}% Conf.
                </span>
              )}
              <p className="text-sm text-[#636E72]">Voice patterns</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E2E8F0] shadow-sm rounded-3xl overflow-hidden group hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#FEF3C7] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Brain className="text-[#D97706] w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-[#B2BEC3] uppercase tracking-widest">AI Detection</span>
            </div>
            <h3 className="text-2xl font-bold text-[#2D3436] mb-1 capitalize">
              {lastAiDetection ? lastAiDetection.level : 'Waiting...'}
            </h3>
            <div className="flex items-center gap-2">
              {lastAiDetection && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${getLevelColor(lastAiDetection.level)}`}>
                  {Math.round(lastAiDetection.score * 100)}% Match
                </span>
              )}
              <p className="text-sm text-[#636E72]">Real-time analysis</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E2E8F0] shadow-sm rounded-3xl overflow-hidden group hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="text-[#64748B] w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-[#B2BEC3] uppercase tracking-widest">{moodT.anxietyLevel}</span>
            </div>
            <h3 className="text-2xl font-bold text-[#2D3436] mb-1">
              {lastMood ? `${lastMood.anxietyLevel}/10` : 'No Data'}
            </h3>
            <p className="text-sm text-[#636E72]">{moodT.subtitle}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Journal */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-[#2D3436] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#6C5CE7]" />
              {translations[language].journal.title}
            </h2>
            <Link to="/journal">
              <Button variant="ghost" className="text-[#6C5CE7] font-bold text-sm">{t.recentActivity}</Button>
            </Link>
          </div>
          
          <Card className="bg-white border-[#E2E8F0] shadow-sm rounded-3xl overflow-hidden p-8">
            {lastJournal ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#B2BEC3] uppercase tracking-widest">
                    {format(lastJournal.timestamp, 'MMMM d, yyyy')}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[#2D3436]">{lastJournal.title}</h3>
                <p className="text-[#636E72] line-clamp-3 leading-relaxed">
                  {lastJournal.content}
                </p>
                <Link to="/journal">
                  <Button variant="ghost" className="p-0 text-[#6C5CE7] font-bold hover:bg-transparent group">
                    {translations[language].journal.newEntry}
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="text-[#B2BEC3] w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#2D3436] mb-2">{translations[language].journal.noEntries}</h3>
                <p className="text-[#636E72] mb-6">{translations[language].journal.subtitle}</p>
                <Link to="/journal">
                  <Button className="bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-xl px-6">{translations[language].journal.newEntry}</Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Mood Insights */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-[#2D3436] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#6C5CE7]" />
              {navT.analytics}
            </h2>
            <Link to="/analytics">
              <Button variant="ghost" className="text-[#6C5CE7] font-bold text-sm">{t.recentActivity}</Button>
            </Link>
          </div>

          <Card className="bg-[#6C5CE7] border-none shadow-xl shadow-[#6C5CE7]/20 rounded-3xl overflow-hidden p-8 text-white relative">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">{t.dailyQuote}</h3>
              <p className="text-white/80 leading-relaxed mb-8 text-lg">
                {t.dailyQuote}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <Wind className="text-white w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold">{translations[language].breathing.title}</p>
                  <p className="text-sm text-white/70">{translations[language].breathing.subtitle}</p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
          </Card>
        </div>
      </div>
    </div>
  );
}
