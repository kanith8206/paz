
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smile, ArrowRight, Wind, MessageCircle, BarChart3, Shield, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useStore } from '../store/useStore';
import { translations } from '../lib/translations';
import { LanguageSelector } from '../components/LanguageSelector';
import { toast } from 'sonner';

export function Landing() {
  const { language } = useStore();
  const t = translations[language].landing;
  const navT = translations[language].nav;

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7F9] text-[#2D3436] overflow-x-hidden">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between sticky top-0 bg-[#F5F7F9]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#6C5CE7] rounded-full flex items-center justify-center">
            <Smile className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight">Paz</span>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-[#636E72] hover:text-[#6C5CE7] transition-colors">{navT.features}</a>
          <a href="#about" className="text-sm font-medium text-[#636E72] hover:text-[#6C5CE7] transition-colors">{navT.about}</a>
          <a href="#contact" className="text-sm font-medium text-[#636E72] hover:text-[#6C5CE7] transition-colors">{navT.contact}</a>
          <LanguageSelector />
          <Link to="/dashboard">
            <Button className="bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-full px-6">
              {t.getStarted}
            </Button>
          </Link>
        </div>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <LanguageSelector />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-[#636E72]"
          >
            {isMobileMenuOpen ? <ArrowRight className="w-6 h-6 rotate-180" /> : <div className="w-6 h-0.5 bg-current relative after:content-[''] after:absolute after:w-full after:h-full after:bg-current after:-top-2 before:content-[''] before:absolute before:w-full before:h-full before:bg-current before:top-2" />}
          </Button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed inset-0 bg-white z-[60] p-6 flex flex-col gap-8 md:hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#6C5CE7] rounded-full flex items-center justify-center">
                  <Smile className="text-white w-6 h-6" />
                </div>
                <span className="font-bold text-2xl tracking-tight">Paz</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <ArrowRight className="w-6 h-6 rotate-180" />
              </Button>
            </div>
            <div className="flex flex-col gap-6 text-xl font-medium">
              <a href="#features" onClick={() => setIsMobileMenuOpen(false)}>{navT.features}</a>
              <a href="#about" onClick={() => setIsMobileMenuOpen(false)}>{navT.about}</a>
              <a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>{navT.contact}</a>
            </div>
            <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="mt-auto">
              <Button className="w-full bg-[#6C5CE7] h-14 rounded-2xl text-lg">
                {t.getStarted}
              </Button>
            </Link>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 bg-[#E9E3FF] text-[#6C5CE7] text-xs font-bold uppercase tracking-widest rounded-full mb-6">
            {t.heroTag}
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 max-w-4xl leading-[1.1]">
            {language === 'en' ? (
              <>Find your inner peace in a <span className="text-[#6C5CE7]">chaotic world</span></>
            ) : (
              t.heroTitle
            )}
          </h1>
          <p className="text-lg md:text-xl text-[#636E72] mb-12 max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link to="/dashboard">
              <Button size="lg" className="bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-full px-8 h-14 text-lg shadow-xl shadow-[#6C5CE7]/20 group">
                {t.startJourney}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="ghost" size="lg" className="rounded-full px-8 h-14 text-lg text-[#636E72]">
              {t.watchDemo}
            </Button>
          </div>
        </motion.div>

        {/* Hero Image / Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 relative w-full max-w-5xl aspect-video bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E2E8F0]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#6C5CE7]/5 to-transparent" />
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF7675]" />
            <div className="w-3 h-3 rounded-full bg-[#FAB1A0]" />
            <div className="w-3 h-3 rounded-full bg-[#55EFC4]" />
          </div>
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-6">
              <div className="w-24 h-24 bg-[#6C5CE7]/10 rounded-full flex items-center justify-center animate-pulse">
                <Smile className="text-[#6C5CE7] w-12 h-12" />
              </div>
              <p className="text-[#636E72] font-medium italic">"Take a deep breath..."</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-32 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">{t.featuresTitle}</h2>
            <p className="text-[#636E72] max-w-2xl mx-auto">
              {t.featuresSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: MessageCircle, title: navT.chat, desc: translations[language].mood.subtitle, path: '/chat' },
              { icon: Smile, title: navT.mood, desc: translations[language].mood.subtitle, path: '/mood' },
              { icon: Wind, title: navT.breathing, desc: translations[language].breathing.subtitle, path: '/breathing' },
              { icon: BarChart3, title: navT.analytics, desc: translations[language].mood.subtitle, path: '/analytics' },
              { icon: Shield, title: navT.profile, desc: translations[language].profile.title, path: '/profile' },
              { icon: AlertCircle, title: navT.emergency, desc: translations[language].emergency.subtitle, path: '/emergency' },
            ].map((feature, i) => (
              <Link key={i} to={feature.path}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="p-8 h-full rounded-3xl bg-[#F5F7F9] border border-transparent hover:border-[#6C5CE7]/20 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
                    <feature.icon className="text-[#6C5CE7] w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-[#636E72] leading-relaxed">{feature.desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-[#F5F7F9] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-8">{t.aboutTitle}</h2>
              <p className="text-lg text-[#636E72] leading-relaxed mb-8">
                {t.aboutText}
              </p>
              <div className="flex gap-4">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-[#6C5CE7]">10k+</span>
                  <span className="text-sm text-[#636E72]">Active Users</span>
                </div>
                <div className="w-px h-12 bg-[#E2E8F0]" />
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-[#6C5CE7]">4.9/5</span>
                  <span className="text-sm text-[#636E72]">App Rating</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-[#6C5CE7]/10 rounded-3xl flex items-center justify-center">
                <Smile className="w-32 h-32 text-[#6C5CE7]" />
              </div>
              <div className="absolute -bottom-6 -right-6 p-6 bg-white rounded-2xl shadow-xl border border-[#E2E8F0]">
                <p className="text-sm font-medium text-[#2D3436]">"Paz changed my life."</p>
                <p className="text-xs text-[#636E72] mt-1">— Sarah J.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">{t.contactTitle}</h2>
            <p className="text-[#636E72]">
              {t.contactSubtitle}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto bg-[#F5F7F9] p-8 md:p-12 rounded-3xl border border-[#E2E8F0]"
          >
            <form 
              className="space-y-6" 
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Message sent! We'll get back to you soon.");
              }}
            >
              <div>
                <label className="block text-sm font-medium text-[#2D3436] mb-2">{t.contactName}</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7] transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D3436] mb-2">{t.contactEmail}</label>
                <input
                  required
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7] transition-all"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D3436] mb-2">{t.contactMessage}</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7] transition-all resize-none"
                  placeholder="How can we help?"
                />
              </div>
              <Button type="submit" className="w-full bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white h-12 rounded-xl text-lg">
                {t.contactSend}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F5F7F9] py-20 border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#6C5CE7] rounded-full flex items-center justify-center">
              <Smile className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">Paz</span>
          </div>
          <p className="text-[#636E72] text-sm">{t.footerRights}</p>
          <div className="flex items-center gap-6">
            <a href="#about" className="text-sm text-[#636E72] hover:text-[#6C5CE7]">{navT.about}</a>
            <a href="#contact" className="text-sm text-[#636E72] hover:text-[#6C5CE7]">{navT.contact}</a>
            <a href="#" className="text-sm text-[#636E72] hover:text-[#6C5CE7]">{t.privacy}</a>
            <a href="#" className="text-sm text-[#636E72] hover:text-[#6C5CE7]">{t.terms}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
