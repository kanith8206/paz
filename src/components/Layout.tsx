
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  MessageCircle, 
  Smile, 
  Wind, 
  Book, 
  AlertCircle, 
  User as UserIcon, 
  BarChart3,
  ClipboardCheck,
  Camera,
  Mic,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { useStore } from '../store/useStore';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { LanguageSelector } from './LanguageSelector';
import { translations } from '../lib/translations';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, language } = useStore();
  const t = translations[language].nav;

  const navItems = [
    { path: '/dashboard', label: t.dashboard, icon: Home },
    { path: '/chat', label: t.chat, icon: MessageCircle },
    { path: '/mood', label: t.mood, icon: Smile },
    { path: '/breathing', label: t.breathing, icon: Wind },
    { path: '/journal', label: t.journal, icon: Book },
    { path: '/analytics', label: t.analytics, icon: BarChart3 },
    { path: '/assessment', label: translations[language].assessment.title, icon: ClipboardCheck },
    { path: '/facial', label: translations[language].facial.title, icon: Camera },
    { path: '/voice', label: translations[language].voice.title, icon: Mic },
    { path: '/emergency', label: t.emergency, icon: AlertCircle },
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-[#E2E8F0] flex-col sticky top-0 h-screen">
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#6C5CE7] rounded-2xl flex items-center justify-center shadow-lg shadow-[#6C5CE7]/20">
              <Smile className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-[#2D3436] tracking-tight">Paz</span>
          </div>
        </div>

        <div className="px-6 mb-4">
          <LanguageSelector />
        </div>

        <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ x: 5 }}
                  className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-sm transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#6C5CE7] text-white shadow-xl shadow-[#6C5CE7]/20' 
                      : 'text-[#636E72] hover:bg-[#F0F2F5] hover:text-[#6C5CE7]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#B2BEC3]'}`} />
                  {item.label}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[#F0F2F5]">
          {user ? (
            <div className="flex items-center justify-between">
              <Link to="/profile" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-[#F0F2F5] group-hover:border-[#6C5CE7] transition-colors">
                  <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-[#2D3436] truncate w-24">{user.name}</p>
                  <p className="text-[10px] font-bold text-[#B2BEC3] uppercase tracking-widest">{t.profile}</p>
                </div>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-[#B2BEC3] hover:text-[#FF7675] hover:bg-[#FF7675]/10 rounded-xl">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Link to="/profile">
              <Button className="w-full bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-xl font-bold">
                {language === 'en' ? 'Sign In' : 'உள்நுழைக'}
              </Button>
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smile className="text-[#6C5CE7] w-6 h-6" />
          <span className="text-xl font-bold text-[#2D3436]">Paz</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6 text-[#2D3436]" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-white z-[60] p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-2">
                <Smile className="text-[#6C5CE7] w-8 h-8" />
                <span className="text-2xl font-bold text-[#2D3436]">Paz</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-8 h-8 text-[#2D3436]" />
              </Button>
            </div>

            <nav className="flex-1 space-y-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setIsMobileMenuOpen(false)}>
                    <div className={`flex items-center gap-4 p-5 rounded-2xl font-bold text-lg ${
                      isActive ? 'bg-[#6C5CE7] text-white' : 'text-[#636E72]'
                    }`}>
                      <Icon className="w-6 h-6" />
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-8 border-t border-[#F0F2F5]">
              {user ? (
                <div className="flex items-center justify-between">
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden">
                      <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-[#2D3436]">{user.name}</p>
                      <p className="text-xs text-[#B2BEC3]">{t.profile}</p>
                    </div>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-[#FF7675]">
                    <LogOut className="w-6 h-6" />
                  </Button>
                </div>
              ) : (
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-[#6C5CE7] text-white rounded-2xl h-14 font-bold text-lg">
                    {language === 'en' ? 'Sign In' : 'உள்நுழைக'}
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-12 pt-24 lg:pt-12 overflow-y-auto">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
