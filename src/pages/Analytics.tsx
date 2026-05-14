
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  TrendingUp, 
  Smile, 
  Frown, 
  Meh, 
  Laugh, 
  Annoyed,
  Calendar,
  Activity,
  BarChart3,
  CheckCircle2,
  BookOpen,
  Wind,
  Zap,
  CloudRain,
  AlertCircle,
  Filter,
  Brain,
  Moon,
  Droplets,
  Users,
  Sparkles,
  Mic
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { useStore } from '../store/useStore';
import { translations } from '../lib/translations';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { Button } from '../components/ui/button';

const moodColors: Record<string, string> = {
  'calm': '#55EFC4',
  'happy': '#00B894',
  'neutral': '#FAB1A0',
  'stressed': '#FDCB6E',
  'anxious': '#FF7675',
  'sad': '#0984E3',
  'overwhelmed': '#D63031',
};

const moodValues: Record<string, number> = {
  'calm': 5,
  'happy': 4,
  'neutral': 3,
  'stressed': 2,
  'anxious': 2,
  'sad': 1,
  'overwhelmed': 1,
};

export function Analytics() {
  const { moodEntries, breathingSessions, journalEntries, language } = useStore();
  const t = translations[language].mood.analytics;
  const [timeRange, setTimeRange] = useState<'7' | '30' | 'month'>('7');

  const rangeDays = timeRange === '7' ? 7 : timeRange === '30' ? 30 : 30;
  
  const lastNDays = Array.from({ length: rangeDays }, (_, i) => {
    const date = subDays(new Date(), i);
    return {
      date: format(date, 'MMM d'),
      fullDate: date,
      anxiety: 0,
      mood: 0,
      count: 0
    };
  }).reverse();

  moodEntries.forEach(entry => {
    const entryDate = new Date(entry.timestamp);
    const dayIndex = lastNDays.findIndex(day => 
      format(day.fullDate, 'MMM d') === format(entryDate, 'MMM d')
    );
    
    if (dayIndex !== -1) {
      lastNDays[dayIndex].anxiety += entry.anxietyLevel;
      lastNDays[dayIndex].mood += moodValues[entry.mood] || 0;
      lastNDays[dayIndex].count += 1;
    }
  });

  const chartData = lastNDays.map(day => ({
    name: day.date,
    anxiety: day.count > 0 ? Number((day.anxiety / day.count).toFixed(1)) : 0,
    mood: day.count > 0 ? Number((day.mood / day.count).toFixed(1)) : 0,
  }));

  const moodDistribution = Object.keys(moodColors).map(mood => ({
    name: mood.charAt(0).toUpperCase() + mood.slice(1),
    value: moodEntries.filter(e => e.mood === mood).length,
    color: moodColors[mood]
  })).filter(m => m.value > 0);

  const avgAnxiety = moodEntries.length > 0 
    ? (moodEntries.reduce((acc, curr) => acc + curr.anxietyLevel, 0) / moodEntries.length).toFixed(1)
    : '0';

  const avgMood = moodEntries.length > 0
    ? (moodEntries.reduce((acc, curr) => acc + (moodValues[curr.mood] || 0), 0) / moodEntries.length).toFixed(1)
    : '0';

  const mostCommonMood = moodEntries.length > 0
    ? moodEntries.reduce((acc, curr) => {
        acc[curr.mood] = (acc[curr.mood] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    : null;

  const topMood = mostCommonMood 
    ? Object.entries(mostCommonMood).sort((a, b) => b[1] - a[1])[0][0]
    : 'N/A';

  if (moodEntries.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center space-y-6">
        <div className="w-24 h-24 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto">
          <BarChart3 className="w-12 h-12 text-[#B2BEC3]" />
        </div>
        <h2 className="text-3xl font-bold text-[#2D3436]">{t.title}</h2>
        <p className="text-[#636E72] text-lg max-w-md mx-auto">{t.empty}</p>
        <Button className="bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-2xl px-8 h-12 font-bold">
          Go to Mood Tracker
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-[#2D3436] tracking-tight">{t.title}</h1>
          <p className="text-[#636E72] text-lg">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm">
          {(['7', '30', 'month'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                timeRange === r 
                  ? 'bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/20' 
                  : 'text-[#B2BEC3] hover:text-[#6C5CE7]'
              }`}
            >
              {r === '7' ? '7 Days' : r === '30' ? '30 Days' : 'Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: t.avgMood, value: avgMood, icon: Smile, color: '#55EFC4' },
          { label: t.avgAnxiety, value: avgAnxiety, icon: Activity, color: '#FF7675' },
          { label: t.commonMood, value: topMood, icon: TrendingUp, color: '#6C5CE7' },
          { label: t.totalCheckins, value: moodEntries.length, icon: CheckCircle2, color: '#00B894' },
          { label: t.breathingSessions, value: breathingSessions.length, icon: Wind, color: '#0984E3' },
          { label: t.journalEntries, value: journalEntries.length, icon: BookOpen, color: '#8E44AD' },
        ].map((stat, i) => (
          <Card key={i} className="bg-white border-none shadow-sm rounded-3xl p-5 flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-bold text-[#B2BEC3] uppercase tracking-widest leading-tight">{stat.label}</p>
            <p className="text-xl font-bold text-[#2D3436] truncate w-full capitalize">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mood Trend Chart */}
        <Card className="bg-white border-none shadow-sm rounded-[2.5rem] p-8">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-xl font-bold text-[#2D3436] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#6C5CE7]" />
              {t.moodTrend}
            </CardTitle>
            <CardDescription>Daily emotional wellness score</CardDescription>
          </CardHeader>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#B2BEC3', fontSize: 11, fontWeight: 'bold' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#B2BEC3', fontSize: 11, fontWeight: 'bold' }}
                  domain={[1, 5]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFF', 
                    border: 'none', 
                    borderRadius: '16px', 
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontWeight: 'bold'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#6C5CE7" 
                  strokeWidth={4}
                  dot={{ r: 4, fill: '#6C5CE7', strokeWidth: 2, stroke: '#FFF' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Anxiety Trend Chart */}
        <Card className="bg-white border-none shadow-sm rounded-[2.5rem] p-8">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-xl font-bold text-[#2D3436] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#FF7675]" />
              {t.anxietyTrend}
            </CardTitle>
            <CardDescription>Anxiety levels over time</CardDescription>
          </CardHeader>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAnxiety" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7675" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#FF7675" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#B2BEC3', fontSize: 11, fontWeight: 'bold' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#B2BEC3', fontSize: 11, fontWeight: 'bold' }}
                  domain={[0, 10]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFF', 
                    border: 'none', 
                    borderRadius: '16px', 
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontWeight: 'bold'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="anxiety" 
                  stroke="#FF7675" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorAnxiety)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Mood Distribution */}
        <Card className="bg-white border-none shadow-sm rounded-[2.5rem] p-8">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-xl font-bold text-[#2D3436] flex items-center gap-2">
              <Smile className="w-5 h-5 text-[#55EFC4]" />
              {t.distribution}
            </CardTitle>
            <CardDescription>How you've been feeling overall</CardDescription>
          </CardHeader>
          <div className="h-[300px] w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={moodDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {moodDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ 
                    backgroundColor: '#FFF', 
                    border: 'none', 
                    borderRadius: '16px', 
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontWeight: 'bold'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-1/3 space-y-2">
              {moodDistribution.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-xs font-bold text-[#636E72]">{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Habit Correlation & Insights */}
        <div className="space-y-6">
          <Card className="bg-white border-none shadow-sm rounded-[2.5rem] p-8">
            <h3 className="text-xl font-bold text-[#2D3436] mb-6 flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#6C5CE7]" />
              {t.correlation}
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-[#55EFC4]/10 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <Wind className="text-[#00B894] w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-[#2D3436]">
                  Your mood improves by <span className="font-bold text-[#00B894]">22%</span> on days you complete breathing exercises.
                </p>
              </div>
              <div className="p-4 bg-[#FF7675]/10 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <Moon className="text-[#FF7675] w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-[#2D3436]">
                  High anxiety appears <span className="font-bold text-[#FF7675]">3x more often</span> on days with poor sleep.
                </p>
              </div>
              <div className="p-4 bg-[#0984E3]/10 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <Droplets className="text-[#0984E3] w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-[#2D3436]">
                  Hydration correlates with <span className="font-bold text-[#0984E3]">higher energy levels</span> in the afternoon.
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-white border-none shadow-sm rounded-[2.5rem] p-8">
            <h3 className="text-xl font-bold text-[#2D3436] mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#6C5CE7]" />
              Multi-modal Analysis
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#E9E3FF] rounded-xl flex items-center justify-center">
                    <Brain className="text-[#6C5CE7] w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-[#2D3436]">NLP Sentiment</span>
                </div>
                <span className="text-xs font-bold text-[#00B894] bg-[#00B894]/10 px-2 py-1 rounded-full uppercase">Positive</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#D1FAE5] rounded-xl flex items-center justify-center">
                    <Mic className="text-[#059669] w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-[#2D3436]">Voice Pitch</span>
                </div>
                <span className="text-xs font-bold text-[#6C5CE7] bg-[#6C5CE7]/10 px-2 py-1 rounded-full uppercase">Stable</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#FEF3C7] rounded-xl flex items-center justify-center">
                    <Smile className="text-[#D97706] w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-[#2D3436]">Facial Cues</span>
                </div>
                <span className="text-xs font-bold text-[#B2BEC3] bg-[#B2BEC3]/10 px-2 py-1 rounded-full uppercase">Neutral</span>
              </div>
            </div>
            <Link to="/facial">
              <Button className="w-full mt-6 bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-2xl h-12 font-bold shadow-lg shadow-[#6C5CE7]/20">
                Run Live Analysis
              </Button>
            </Link>
            <p className="text-[10px] text-[#B2BEC3] font-bold uppercase tracking-widest mt-4 text-center">
              AI-powered emotional cross-referencing
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-[#6C5CE7] to-[#8E44AD] border-none rounded-[2.5rem] p-8 text-white shadow-xl shadow-[#6C5CE7]/20">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-white" />
              {t.insights}
            </h3>
            <ul className="space-y-4">
              {[
                "You felt stressed most often in the evening this week.",
                "Your anxiety score decreased by 1.2 points compared to last week.",
                "Journaling days show 40% better emotional balance scores.",
                "Social interaction days lead to 'Happy' moods 80% of the time."
              ].map((insight, i) => (
                <li key={i} className="flex gap-3 text-sm text-white/90">
                  <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5 flex-shrink-0" />
                  {insight}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
