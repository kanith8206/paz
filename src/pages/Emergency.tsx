
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  Heart, 
  Shield, 
  AlertCircle, 
  ExternalLink,
  LifeBuoy,
  Users,
  MessageSquare,
  Bell,
  UserPlus,
  Send,
  CheckCircle2,
  MapPin,
  Navigation,
  AlertTriangle,
  X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { useStore } from '../store/useStore';
import { translations } from '../lib/translations';
import { Input } from '../components/ui/input';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { toast } from 'sonner';

interface LocationData {
  latitude: number;
  longitude: number;
  mapsLink: string;
}

const resourcesData = [
  {
    title: "National Suicide Prevention Lifeline",
    phone: "988",
    desc: "24/7, free and confidential support for people in distress.",
    color: "#FF7675"
  },
  {
    title: "Crisis Text Line",
    phone: "Text HOME to 741741",
    desc: "Free, 24/7 crisis counseling via text message.",
    color: "#6C5CE7"
  },
  {
    title: "SAMHSA National Helpline",
    phone: "1-800-662-4357",
    desc: "Treatment referral and information service for mental health.",
    color: "#55EFC4"
  }
];

const emergencyTipsData = [
  "Find a safe, quiet place to sit down.",
  "Focus on your breathing: inhale for 4, hold for 4, exhale for 8.",
  "Splash cold water on your face or hold an ice cube.",
  "Remind yourself that this feeling is temporary and will pass.",
  "Avoid caffeine or other stimulants right now."
];

export function Emergency() {
  const { user, moodEntries, setUser, language } = useStore();
  const t = translations[language].emergency;
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSosActive, setIsSosActive] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [showSosConfirm, setShowSosConfirm] = useState(false);

  const lastMood = moodEntries[moodEntries.length - 1];
  const isHighAnxiety = lastMood && lastMood.anxietyLevel >= 8;

  const getLocation = (): Promise<LocationData | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser");
        resolve(null);
        return;
      }

      setIsFetchingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
          const data = { latitude, longitude, mapsLink };
          setLocation(data);
          setIsFetchingLocation(false);
          resolve(data);
        },
        (error) => {
          console.error("Error fetching location:", error);
          let errorMsg = "Failed to get location";
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = "Location permission denied. Please enable it in your browser settings.";
          }
          toast.error(errorMsg);
          setIsFetchingLocation(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const sendSosMessage = (locData: LocationData | null) => {
    if (!user?.trustedContact) return;
    
    const baseMessage = language === 'en' 
      ? "SOS! I need help." 
      : "SOS! எனக்கு உதவி தேவை.";
    
    const locationPart = locData 
      ? `${language === 'en' ? " My location: " : " எனது இருப்பிடம்: "}${locData.mapsLink}`
      : "";
    
    const fullMessage = `${baseMessage}${locationPart}`;
    
    // Use sms: protocol to open the native messaging app
    const smsUrl = `sms:${user.trustedContact.phone}?body=${encodeURIComponent(fullMessage)}`;
    window.location.href = smsUrl;
    
    toast.success(`Opening SMS app to message ${user.trustedContact.name}`);
  };

  const makeEmergencyCall = () => {
    if (!user?.trustedContact) return;
    window.location.href = `tel:${user.trustedContact.phone}`;
  };

  const triggerSos = async () => {
    setIsSosActive(true);
    setShowSosConfirm(false);
    
    toast.info(language === 'en' ? 'Fetching GPS location...' : 'GPS இருப்பிடத்தைப் பெறுகிறது...', {
      duration: 2000
    });

    const locData = await getLocation();
    
    if (locData) {
      toast.error('SOS Alert Triggered!', {
        description: `Emergency alerts with your location are being prepared for ${user?.trustedContact?.name || 'emergency services'}.`,
        duration: 5000
      });
      
      // Automatically trigger SMS and Call options after a short delay
      setTimeout(() => {
        sendSosMessage(locData);
      }, 1500);
    } else {
      toast.error('SOS Alert Triggered!', {
        description: `Location unavailable. Sending emergency alert without location to ${user?.trustedContact?.name || 'emergency services'}.`,
        duration: 5000
      });
      setTimeout(() => {
        sendSosMessage(null);
      }, 1500);
    }

    setTimeout(() => setIsSosActive(false), 5000);
  };

  const resources = [
    {
      title: t.helpline,
      phone: "988",
      desc: language === 'en' ? "24/7, free and confidential support for people in distress." : "துயரத்தில் உள்ளவர்களுக்கு 24/7, இலவச மற்றும் ரகசிய ஆதரவு.",
      color: "#FF7675"
    },
    {
      title: "Crisis Text Line",
      phone: "Text HOME to 741741",
      desc: language === 'en' ? "Free, 24/7 crisis counseling via text message." : "உரை செய்தி மூலம் இலவச, 24/7 நெருக்கடி ஆலோசனை.",
      color: "#6C5CE7"
    },
    {
      title: "SAMHSA National Helpline",
      phone: "1-800-662-4357",
      desc: language === 'en' ? "Treatment referral and information service for mental health." : "மனநலத்திற்கான சிகிச்சை பரிந்துரை மற்றும் தகவல் சேவை.",
      color: "#55EFC4"
    }
  ];

  const emergencyTips = [
    language === 'en' ? "Find a safe, quiet place to sit down." : "அமர ஒரு பாதுகாப்பான, அமைதியான இடத்தைக் கண்டறியவும்.",
    language === 'en' ? "Focus on your breathing: inhale for 4, hold for 4, exhale for 8." : "உங்கள் சுவாசத்தில் கவனம் செலுத்துங்கள்: 4 எண்ணும் வரை உள்ளிழுக்கவும், 4 எண்ணும் வரை வைத்திருக்கவும், 8 எண்ணும் வரை வெளியேற்றவும்.",
    language === 'en' ? "Splash cold water on your face or hold an ice cube." : "உங்கள் முகத்தில் குளிர்ந்த நீரைத் தெளிக்கவும் அல்லது ஒரு பனிக்கட்டியைப் பிடிக்கவும்.",
    language === 'en' ? "Remind yourself that this feeling is temporary and will pass." : "இந்த உணர்வு தற்காலிகமானது மற்றும் கடந்துவிடும் என்று உங்களுக்கு நினைவூட்டுங்கள்.",
    language === 'en' ? "Avoid caffeine or other stimulants right now." : "இப்போது காஃபின் அல்லது பிற தூண்டுதல்களைத் தவிர்க்கவும்."
  ];

  const handleSaveContact = async () => {
    if (!user || !contactName || !contactPhone) return;
    
    const updatedContact = { name: contactName, phone: contactPhone };
    const userRef = doc(db, 'users', user.id);
    
    try {
      await updateDoc(userRef, { trustedContact: updatedContact });
      setUser({ ...user, trustedContact: updatedContact });
      setIsAddingContact(false);
      toast.success('Trusted contact saved');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      {/* Emergency SOS Section (Always Visible) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden"
      >
        <Card className="bg-[#D63031] border-none shadow-2xl shadow-[#D63031]/30 rounded-[2rem] overflow-hidden text-white">
          <div className="p-8 md:p-12 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{t.sos} 🚨</h2>
                <p className="text-white/80">{language === 'en' ? "Emergency assistance is one tap away." : "அவசர உதவி ஒரு தட்டலில் கிடைக்கும்."}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Emergency Tips */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {language === 'en' ? 'Quick Relief Tips' : 'விரைவான நிவாரண குறிப்புகள்'}
                </h3>
                <ul className="space-y-3">
                  {emergencyTips.map((tip, i) => (
                    <li key={i} className="flex gap-3 text-white/90 bg-white/10 p-3 rounded-xl text-sm">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* SOS & Trusted Contact */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {language === 'en' ? 'Trusted Help' : 'நம்பகமான உதவி'}
                </h3>
                
                {user?.trustedContact ? (
                  <div className="bg-white/10 p-6 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-white/60">{language === 'en' ? 'Trusted Contact' : 'நம்பகமான தொடர்பு'}</p>
                        <p className="text-xl font-bold">{user.trustedContact.name}</p>
                      </div>
                      <a href={`tel:${user.trustedContact.phone}`}>
                        <Button className="bg-white text-[#D63031] hover:bg-white/90 rounded-xl px-6 font-bold">
                          <Phone className="w-4 h-4 mr-2" />
                          {language === 'en' ? 'Call Now' : 'இப்போது அழைக்கவும்'}
                        </Button>
                      </a>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                      onClick={() => sendSosMessage(location)}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Send "I need help" Message' : '"எனக்கு உதவி தேவை" செய்தியை அனுப்பு'}
                    </Button>
                  </div>
                ) : (
                  <div className="bg-white/10 p-6 rounded-2xl text-center space-y-4">
                    <p className="text-sm text-white/80">{language === 'en' ? "You haven't set a trusted contact yet." : "நீங்கள் இன்னும் நம்பகமான தொடர்பை அமைக்கவில்லை."}</p>
                    <Button 
                      onClick={() => setIsAddingContact(true)}
                      className="bg-white text-[#D63031] hover:bg-white/90 rounded-xl font-bold"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Add Contact' : 'தொடர்பைச் சேர்'}
                    </Button>
                  </div>
                )}

                <Button 
                  onClick={() => setShowSosConfirm(true)}
                  disabled={isSosActive || isFetchingLocation}
                  className={`w-full h-24 rounded-2xl font-black text-3xl shadow-2xl transition-all active:scale-95 flex flex-col items-center justify-center gap-1 ${
                    isSosActive ? 'bg-white text-[#D63031]' : 'bg-white text-[#D63031] hover:bg-white/90'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Bell className={`w-8 h-8 ${isSosActive ? 'animate-ping' : ''}`} />
                    {isSosActive ? t.sosActive : t.sos}
                  </div>
                  {isFetchingLocation && (
                    <span className="text-xs font-normal animate-pulse">
                      {t.fetchingLocation}
                    </span>
                  )}
                </Button>
                {/* SOS Confirmation Dialog */}
                <AnimatePresence>
                  {showSosConfirm && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
                    >
                      <Card className="w-full max-w-md bg-white rounded-[2.5rem] p-8 space-y-6 shadow-2xl border-none">
                        <div className="text-center space-y-4">
                          <div className="w-20 h-20 bg-[#FF7675]/10 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-10 h-10 text-[#D63031]" />
                          </div>
                          <h3 className="text-2xl font-bold text-[#2D3436]">
                            {t.confirmSosTitle}
                          </h3>
                          <p className="text-[#636E72]">
                            {t.confirmSosDesc}
                          </p>
                        </div>
                        <div className="flex flex-col gap-3">
                          <Button 
                            onClick={triggerSos}
                            className="w-full h-14 bg-[#D63031] hover:bg-[#B71C1C] text-white rounded-2xl font-bold text-lg"
                          >
                            {t.confirmSosYes}
                          </Button>
                          <Button 
                            variant="ghost"
                            onClick={() => setShowSosConfirm(false)}
                            className="w-full h-14 text-[#636E72] hover:bg-[#F0F2F5] rounded-2xl font-bold"
                          >
                            {t.confirmSosCancel}
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Post-SOS Actions */}
                {location && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/20 p-4 rounded-2xl space-y-3 border border-white/30"
                  >
                    <p className="text-xs font-bold text-white/80 flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      {t.locationCaptured}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        variant="secondary"
                        className="flex-1 rounded-xl bg-white text-[#D63031] hover:bg-white/90"
                        onClick={() => sendSosMessage(location)}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {t.sendSms}
                      </Button>
                      <Button 
                        variant="secondary"
                        className="flex-1 rounded-xl bg-white text-[#D63031] hover:bg-white/90"
                        onClick={makeEmergencyCall}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        {t.call}
                      </Button>
                    </div>
                    <a 
                      href={location.mapsLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] text-white/60 hover:text-white underline block text-center"
                    >
                      {t.viewOnMaps}
                    </a>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Trusted Contact Setup Modal (Simple Inline) */}
      {isAddingContact && (
        <Card className="bg-white border-2 border-[#6C5CE7] p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-[#2D3436]">{language === 'en' ? 'Set Trusted Contact' : 'நம்பகமான தொடர்பை அமைக்கவும்'}</h3>
            <Button variant="ghost" onClick={() => setIsAddingContact(false)}>{language === 'en' ? 'Cancel' : 'ரத்துசெய்'}</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#636E72]">{language === 'en' ? 'Name' : 'பெயர்'}</label>
              <Input 
                placeholder="e.g. Mom, Best Friend" 
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#636E72]">{language === 'en' ? 'Phone Number' : 'தொலைபேசி எண்'}</label>
              <Input 
                placeholder="+1 (555) 000-0000" 
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="rounded-xl h-12"
              />
            </div>
          </div>
          <Button 
            onClick={handleSaveContact}
            className="w-full bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white h-14 rounded-xl font-bold text-lg"
          >
            {language === 'en' ? 'Save Trusted Contact' : 'நம்பகமான தொடர்பைச் சேமி'}
          </Button>
        </Card>
      )}

      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-[#FF7675]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="text-[#D63031] w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold text-[#2D3436]">{t.title}</h1>
        <p className="text-[#636E72] text-lg max-w-xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((res, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-white border-[#E2E8F0] shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-shadow h-full">
              <div className="p-8 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${res.color}15`, color: res.color }}>
                    <Phone className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-[#B2BEC3] uppercase tracking-widest">{language === 'en' ? 'Available 24/7' : '24/7 கிடைக்கும்'}</span>
                </div>
                <h3 className="text-xl font-bold text-[#2D3436] mb-2">{res.title}</h3>
                <p className="text-[#636E72] text-sm mb-6 flex-1">{res.desc}</p>
                <Button 
                  className="w-full h-14 rounded-2xl font-bold text-lg transition-all active:scale-95"
                  style={{ backgroundColor: res.color, color: 'white' }}
                >
                  {res.phone}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="space-y-8 pt-8">
        <h2 className="text-2xl font-bold text-[#2D3436] flex items-center gap-3">
          <Shield className="w-6 h-6 text-[#6C5CE7]" />
          Self-Help Grounding
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-[#F8FAFC] border-none rounded-3xl">
            <h4 className="font-bold text-[#2D3436] mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#6C5CE7]" />
              Reach Out
            </h4>
            <p className="text-sm text-[#636E72] leading-relaxed">
              Call or text a trusted friend or family member. Just talking can help ground you.
            </p>
          </Card>
          <Card className="p-6 bg-[#F8FAFC] border-none rounded-3xl">
            <h4 className="font-bold text-[#2D3436] mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#6C5CE7]" />
              5-4-3-2-1
            </h4>
            <p className="text-sm text-[#636E72] leading-relaxed">
              Identify 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you can taste.
            </p>
          </Card>
          <Card className="p-6 bg-[#F8FAFC] border-none rounded-3xl">
            <h4 className="font-bold text-[#2D3436] mb-3 flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-[#6C5CE7]" />
              Safe Space
            </h4>
            <p className="text-sm text-[#636E72] leading-relaxed">
              Close your eyes and visualize a place where you feel completely safe and calm.
            </p>
          </Card>
        </div>
      </div>

      <Card className="bg-[#6C5CE7] border-none rounded-3xl p-10 text-white text-center">
        <Heart className="w-12 h-12 mx-auto mb-6 text-white/80" />
        <h3 className="text-2xl font-bold mb-4">You are valued and important.</h3>
        <p className="text-white/80 max-w-xl mx-auto mb-8">
          Mental health struggles are real, but help is always available. Don't hesitate to reach out to professionals who care about your well-being.
        </p>
        <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full px-8">
          Find Local Resources
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </Card>
    </div>
  );
}
