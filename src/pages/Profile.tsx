
import React from 'react';
import { motion } from 'framer-motion';
import { 
  User as UserIcon, 
  Settings, 
  Bell, 
  Shield, 
  LogOut, 
  Edit3, 
  Camera,
  Smile,
  Moon,
  Sun,
  Globe,
  Lock
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { useStore } from '../store/useStore';
import { translations } from '../lib/translations';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { toast } from 'sonner';

export function Profile() {
  const { user, language } = useStore();
  const t = translations[language].profile;

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-[#F0F2F5] rounded-full flex items-center justify-center mb-6">
          <UserIcon className="text-[#B2BEC3] w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-[#2D3436] mb-4">{language === 'en' ? 'Sign in to Paz' : 'பாஸில் உள்நுழையவும்'}</h2>
        <p className="text-[#636E72] max-w-xs mx-auto mb-8">
          {language === 'en' ? 'Save your mood logs, journal entries, and chat history across all your devices.' : 'உங்கள் மனநிலை பதிவுகள், இதழ் பதிவுகள் மற்றும் அரட்டை வரலாற்றை உங்கள் எல்லா சாதனங்களிலும் சேமிக்கவும்.'}
        </p>
        <Button 
          onClick={handleSignIn}
          className="bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-full px-10 h-14 font-bold text-lg shadow-xl shadow-[#6C5CE7]/20"
        >
          {language === 'en' ? 'Sign in with Google' : 'கூகிள் மூலம் உள்நுழையவும்'}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <Card className="bg-white border-[#E2E8F0] shadow-sm rounded-3xl overflow-hidden p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-[#F0F2F5] shadow-lg">
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#6C5CE7] text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-[#2D3436] mb-1">{user.name}</h1>
                <p className="text-[#636E72] font-medium">{user.email}</p>
              </div>
              <Button variant="outline" className="rounded-xl border-[#E2E8F0] text-[#636E72] font-bold hover:bg-[#F0F2F5]">
                <Edit3 className="w-4 h-4 mr-2" />
                {t.editProfile}
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
              <div className="px-4 py-2 bg-[#E9E3FF] rounded-xl flex items-center gap-2">
                <Smile className="text-[#6C5CE7] w-4 h-4" />
                <span className="text-xs font-bold text-[#6C5CE7] uppercase tracking-widest">Active User</span>
              </div>
              <div className="px-4 py-2 bg-[#F0F2F5] rounded-xl flex items-center gap-2">
                <Globe className="text-[#636E72] w-4 h-4" />
                <span className="text-xs font-bold text-[#636E72] uppercase tracking-widest">{language === 'en' ? 'English' : 'தமிழ்'}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Settings Sections */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-[#B2BEC3] uppercase tracking-widest px-4">{t.preferences}</h3>
          <div className="bg-white border border-[#E2E8F0] rounded-3xl overflow-hidden shadow-sm">
            <button className="w-full px-6 py-5 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors border-b border-[#F0F2F5]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#F0F2F5] rounded-xl flex items-center justify-center">
                  <Bell className="text-[#636E72] w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-[#2D3436]">{t.notifications}</h4>
                  <p className="text-xs text-[#B2BEC3]">{language === 'en' ? 'Reminders for mood tracking' : 'மனநிலை கண்காணிப்புக்கான நினைவூட்டல்கள்'}</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-[#55EFC4] rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </button>
            <button className="w-full px-6 py-5 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors border-b border-[#F0F2F5]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#F0F2F5] rounded-xl flex items-center justify-center">
                  <Moon className="text-[#636E72] w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-[#2D3436]">{t.darkMode}</h4>
                  <p className="text-xs text-[#B2BEC3]">{language === 'en' ? 'Easier on the eyes at night' : 'இரவில் கண்களுக்கு எளிதானது'}</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-[#F0F2F5] rounded-full relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-bold text-[#B2BEC3] uppercase tracking-widest px-4">{t.account}</h3>
          <div className="bg-white border border-[#E2E8F0] rounded-3xl overflow-hidden shadow-sm">
            <button className="w-full px-6 py-5 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors border-b border-[#F0F2F5]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#F0F2F5] rounded-xl flex items-center justify-center">
                  <Shield className="text-[#636E72] w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-[#2D3436]">{language === 'en' ? 'Privacy' : 'தனியுரிமை'}</h4>
                  <p className="text-xs text-[#B2BEC3]">{language === 'en' ? 'Manage your data sharing' : 'உங்கள் தரவு பகிர்வை நிர்வகிக்கவும்'}</p>
                </div>
              </div>
              <Globe className="text-[#B2BEC3] w-5 h-5" />
            </button>
            <button className="w-full px-6 py-5 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors border-b border-[#F0F2F5]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#F0F2F5] rounded-xl flex items-center justify-center">
                  <Lock className="text-[#636E72] w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-[#2D3436]">{language === 'en' ? 'Security' : 'பாதுகாப்பு'}</h4>
                  <p className="text-xs text-[#B2BEC3]">{language === 'en' ? 'Password and sessions' : 'கடவுச்சொல் மற்றும் அமர்வுகள்'}</p>
                </div>
              </div>
              <Globe className="text-[#B2BEC3] w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-8">
        <Button 
          variant="ghost" 
          onClick={handleSignOut}
          className="w-full h-16 bg-[#FF7675]/10 hover:bg-[#FF7675]/20 text-[#D63031] rounded-3xl font-bold flex items-center justify-center gap-3 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {t.signOut}
        </Button>
      </div>
    </div>
  );
}
