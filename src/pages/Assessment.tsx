
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardCheck, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle, 
  CheckCircle2, 
  History,
  ArrowRight,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useStore } from '../store/useStore';
import { translations } from '../lib/translations';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { GAD7Entry } from '../types';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function Assessment() {
  const { user, language, gad7Entries, setGad7Entries } = useStore();
  const t = translations[language].assessment;
  const [currentStep, setCurrentStep] = useState(-1); // -1: intro, 0-6: questions, 7: result
  const [scores, setScores] = useState<number[]>(new Array(7).fill(-1));
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `users/${user.id}/assessments`), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => doc.data() as GAD7Entry);
      setGad7Entries(entries);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.id}/assessments`));
    return () => unsubscribe();
  }, [user, setGad7Entries]);

  const handleScoreSelect = (score: number) => {
    const newScores = [...scores];
    newScores[currentStep] = score;
    setScores(newScores);
    
    // Auto advance after a short delay
    setTimeout(() => {
      if (currentStep < 6) {
        setCurrentStep(currentStep + 1);
      }
    }, 300);
  };

  const calculateResult = () => {
    const total = scores.reduce((a, b) => a + b, 0);
    let level: 'mild' | 'moderate' | 'severe' = 'mild';
    if (total >= 15) level = 'severe';
    else if (total >= 10) level = 'moderate';
    else if (total >= 5) level = 'mild';
    
    return { total, level };
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    const { total, level } = calculateResult();
    const id = crypto.randomUUID();
    const entry: GAD7Entry = {
      id,
      timestamp: Date.now(),
      scores,
      totalScore: total,
      level,
      uid: user.id
    };

    try {
      await setDoc(doc(db, `users/${user.id}/assessments/${id}`), entry);
      setCurrentStep(7);
      toast.success('Assessment completed');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.id}/assessments/${id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'severe': return 'text-[#D63031] bg-[#D63031]/10';
      case 'moderate': return 'text-[#E17055] bg-[#E17055]/10';
      case 'mild': return 'text-[#FDCB6E] bg-[#FDCB6E]/10';
      default: return 'text-[#00B894] bg-[#00B894]/10';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-[#2D3436] tracking-tight">{t.title}</h1>
        <p className="text-[#636E72] text-lg">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {currentStep === -1 && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="bg-white border-none shadow-sm rounded-[2.5rem] p-10 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-10 opacity-5">
                    <ClipboardCheck className="w-40 h-40" />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div className="w-16 h-16 bg-[#E9E3FF] rounded-3xl flex items-center justify-center">
                      <Info className="text-[#6C5CE7] w-8 h-8" />
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-3xl font-bold text-[#2D3436]">Ready to check in?</h2>
                      <p className="text-[#636E72] text-lg leading-relaxed">
                        {t.instructions}
                        <br /><br />
                        This assessment takes about 2 minutes and helps us understand how you've been feeling over the last two weeks.
                      </p>
                    </div>
                    <Button 
                      onClick={() => setCurrentStep(0)}
                      className="bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-2xl px-8 h-14 font-bold text-lg shadow-lg shadow-[#6C5CE7]/20"
                    >
                      Start Assessment
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {currentStep >= 0 && currentStep <= 6 && (
              <motion.div
                key={`q-${currentStep}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-[#B2BEC3] uppercase tracking-widest">Question {currentStep + 1} of 7</span>
                  <div className="flex gap-1">
                    {new Array(7).fill(0).map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === currentStep ? 'w-8 bg-[#6C5CE7]' : i < currentStep ? 'w-4 bg-[#00B894]' : 'w-4 bg-[#E2E8F0]'
                        }`} 
                      />
                    ))}
                  </div>
                </div>

                <Card className="bg-white border-none shadow-sm rounded-[2.5rem] p-10">
                  <h2 className="text-2xl font-bold text-[#2D3436] mb-10 leading-tight">
                    {t.questions[currentStep]}
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {t.options.map((option: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => handleScoreSelect(index)}
                        className={`p-6 rounded-2xl text-left font-bold transition-all border-2 ${
                          scores[currentStep] === index
                            ? 'bg-[#6C5CE7] text-white border-[#6C5CE7] shadow-lg shadow-[#6C5CE7]/20'
                            : 'bg-[#F8FAFC] text-[#636E72] border-transparent hover:border-[#6C5CE7]/30 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {scores[currentStep] === index && <CheckCircle2 className="w-5 h-5" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>

                <div className="flex justify-between items-center px-2">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="text-[#B2BEC3] hover:text-[#6C5CE7] font-bold"
                  >
                    <ChevronLeft className="mr-2 w-5 h-5" />
                    Back
                  </Button>
                  {currentStep === 6 && scores[6] !== -1 && (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-[#00B894] hover:bg-[#00A383] text-white rounded-2xl px-8 h-12 font-bold shadow-lg shadow-[#00B894]/20"
                    >
                      {isSubmitting ? 'Submitting...' : t.submit}
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            {currentStep === 7 && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <Card className="bg-white border-none shadow-sm rounded-[2.5rem] p-10 text-center space-y-8">
                  <div className="w-20 h-20 bg-[#55EFC4]/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="text-[#00B894] w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-[#2D3436]">{t.result}</h2>
                    <p className="text-[#636E72]">{format(Date.now(), 'MMMM d, yyyy')}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-[#F8FAFC] rounded-3xl">
                      <p className="text-xs font-bold text-[#B2BEC3] uppercase tracking-widest mb-2">{t.score}</p>
                      <p className="text-4xl font-bold text-[#2D3436]">{calculateResult().total}</p>
                    </div>
                    <div className={`p-6 rounded-3xl flex flex-col items-center justify-center ${getLevelColor(calculateResult().level)}`}>
                      <p className="text-xs font-bold uppercase tracking-widest mb-2">Level</p>
                      <p className="text-xl font-bold capitalize">{calculateResult().level}</p>
                    </div>
                  </div>

                  <div className="p-6 bg-[#E9E3FF]/30 rounded-3xl text-left space-y-3">
                    <h3 className="font-bold text-[#6C5CE7] flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {t.recommendation}
                    </h3>
                    <p className="text-sm text-[#2D3436] leading-relaxed">
                      {calculateResult().level === 'severe' 
                        ? "Your scores indicate high anxiety. We strongly recommend speaking with a mental health professional. You can also use our SOS feature if you feel in immediate distress."
                        : calculateResult().level === 'moderate'
                        ? "You're experiencing moderate anxiety. Regular breathing exercises and journaling can help manage these feelings. Consider talking to someone you trust."
                        : "Your anxiety levels are currently low. Continue your wellness practices to maintain this balance."}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      onClick={() => setCurrentStep(-1)}
                      variant="outline"
                      className="flex-1 border-[#E2E8F0] text-[#636E72] rounded-2xl h-12 font-bold"
                    >
                      Retake
                    </Button>
                    <Button 
                      onClick={() => window.location.href = '/dashboard'}
                      className="flex-1 bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-2xl h-12 font-bold shadow-lg shadow-[#6C5CE7]/20"
                    >
                      Dashboard
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <Card className="bg-white border-none shadow-sm rounded-[2.5rem] p-8">
            <h3 className="text-lg font-bold text-[#2D3436] mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-[#6C5CE7]" />
              {t.history}
            </h3>
            <div className="space-y-4">
              {gad7Entries.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-[#B2BEC3]">No previous assessments</p>
                </div>
              ) : (
                gad7Entries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="p-4 bg-[#F8FAFC] rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-[#2D3436]">{format(entry.timestamp, 'MMM d')}</p>
                      <p className="text-[10px] text-[#B2BEC3] font-bold uppercase tracking-widest">{format(entry.timestamp, 'h:mm a')}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getLevelColor(entry.level)}`}>
                      {entry.totalScore} pts
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="bg-[#6C5CE7] border-none rounded-[2.5rem] p-8 text-white shadow-xl shadow-[#6C5CE7]/20">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold">Privacy Note</h3>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              Your assessment data is private and encrypted. We use this information only to provide you with better support and insights.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Sparkles(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
