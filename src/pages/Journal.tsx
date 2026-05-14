
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Calendar, 
  Trash2, 
  Edit3, 
  ChevronRight,
  Smile,
  X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { useStore } from '../store/useStore';
import { translations } from '../lib/translations';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { JournalEntry } from '../types';

export function Journal() {
  const { journalEntries, user, language } = useStore();
  const t = translations[language].journal;
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }
    if (!user) {
      toast.error('Please sign in to save journal entries');
      return;
    }

    const id = crypto.randomUUID();
    const timestamp = Date.now();
    const entry: JournalEntry = { id, timestamp, title, content, uid: user.id };

    const path = `users/${user.id}/journals/${id}`;
    try {
      await setDoc(doc(db, path), entry);
      toast.success(t.success);
      setTitle('');
      setContent('');
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    const path = `users/${user.id}/journals/${id}`;
    try {
      await deleteDoc(doc(db, path));
      toast.success('Entry deleted');
      if (selectedEntry?.id === id) setSelectedEntry(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const filteredEntries = journalEntries.filter(entry => 
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  ).reverse();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#2D3436] flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-[#6C5CE7]" />
            {t.title}
          </h1>
          <p className="text-[#636E72] mt-1">{t.subtitle}</p>
        </div>
        {!isAdding && (
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-full shadow-lg shadow-[#6C5CE7]/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.newEntry}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar: Entry List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B2BEC3] w-4 h-4" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'en' ? 'Search entries...' : 'தேடுக...'} 
              className="pl-10 rounded-2xl border-[#E2E8F0] bg-white focus:ring-[#6C5CE7] focus:border-[#6C5CE7]"
            />
          </div>

          <ScrollArea className="h-[calc(100vh-20rem)] rounded-3xl bg-white border border-[#E2E8F0] shadow-sm">
            <div className="p-4 space-y-3">
              {filteredEntries.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-12 h-12 bg-[#F0F2F5] rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="text-[#B2BEC3] w-6 h-6" />
                  </div>
                  <p className="text-sm text-[#636E72] font-medium">{translations[language].dashboard.noActivity}</p>
                </div>
              ) : (
                filteredEntries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => {
                      setSelectedEntry(entry);
                      setIsAdding(false);
                    }}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-200 group ${
                      selectedEntry?.id === entry.id 
                        ? 'bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/20' 
                        : 'bg-white hover:bg-[#F0F2F5] border border-transparent hover:border-[#E2E8F0]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${
                        selectedEntry?.id === entry.id ? 'text-white/70' : 'text-[#B2BEC3]'
                      }`}>
                        {format(entry.timestamp, 'MMM d, yyyy')}
                      </span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${
                        selectedEntry?.id === entry.id ? 'text-white' : 'text-[#B2BEC3] group-hover:translate-x-1'
                      }`} />
                    </div>
                    <h4 className="font-bold truncate mb-1">{entry.title}</h4>
                    <p className={`text-xs line-clamp-2 leading-relaxed ${
                      selectedEntry?.id === entry.id ? 'text-white/80' : 'text-[#636E72]'
                    }`}>
                      {entry.content}
                    </p>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main Area: Editor or Viewer */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {isAdding ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden h-full flex flex-col"
              >
                <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
                  <h3 className="font-bold text-[#2D3436]">{t.newEntry}</h3>
                  <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)} className="rounded-full">
                    <X className="w-5 h-5 text-[#B2BEC3]" />
                  </Button>
                </div>
                <div className="p-8 space-y-6 flex-1 overflow-y-auto">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#B2BEC3] uppercase tracking-widest">{language === 'en' ? 'Title' : 'தலைப்பு'}</label>
                    <Input 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={language === 'en' ? 'Give your entry a title...' : 'தலைப்பைக் கொடுங்கள்...'} 
                      className="text-2xl font-bold border-none bg-transparent focus:ring-0 p-0 placeholder:text-[#B2BEC3]"
                    />
                  </div>
                  <div className="space-y-2 flex-1 flex flex-col">
                    <label className="text-xs font-bold text-[#B2BEC3] uppercase tracking-widest">{language === 'en' ? 'Content' : 'உள்ளடக்கம்'}</label>
                    <Textarea 
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={language === 'en' ? 'Start writing your thoughts here...' : 'உங்கள் எண்ணங்களை இங்கே எழுதத் தொடங்குங்கள்...'} 
                      className="flex-1 min-h-[300px] text-lg border-none bg-transparent focus:ring-0 p-0 placeholder:text-[#B2BEC3] resize-none leading-relaxed"
                    />
                  </div>
                </div>
                <div className="p-6 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl font-bold text-[#636E72]">{language === 'en' ? 'Cancel' : 'ரத்துசெய்'}</Button>
                  <Button onClick={handleSave} className="bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-xl font-bold px-8">{t.save}</Button>
                </div>
              </motion.div>
            ) : selectedEntry ? (
              <motion.div
                key="viewer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden h-full flex flex-col"
              >
                <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#E9E3FF] rounded-xl flex items-center justify-center">
                      <Calendar className="text-[#6C5CE7] w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#2D3436]">{format(selectedEntry.timestamp, 'MMMM d, yyyy')}</h3>
                      <p className="text-xs text-[#B2BEC3] uppercase font-bold tracking-widest">{format(selectedEntry.timestamp, 'h:mm a')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full text-[#B2BEC3] hover:text-[#6C5CE7] hover:bg-[#F0F2F5]">
                      <Edit3 className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(selectedEntry.id)}
                      className="rounded-full text-[#B2BEC3] hover:text-[#FF7675] hover:bg-[#FF7675]/10"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                <ScrollArea className="flex-1 p-10">
                  <h2 className="text-4xl font-bold text-[#2D3436] mb-8 leading-tight">{selectedEntry.title}</h2>
                  <div className="prose prose-lg max-w-none text-[#636E72] leading-relaxed whitespace-pre-wrap">
                    {selectedEntry.content}
                  </div>
                </ScrollArea>
              </motion.div>
            ) : (
              <div className="h-full bg-white rounded-3xl border border-[#E2E8F0] shadow-sm flex flex-col items-center justify-center text-center p-12">
                <div className="w-24 h-24 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-6">
                  <Smile className="text-[#B2BEC3] w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold text-[#2D3436] mb-3">{language === 'en' ? 'Select an entry to read' : 'படிக்க ஒரு பதிவைத் தேர்ந்தெடுக்கவும்'}</h3>
                <p className="text-[#636E72] max-w-xs mx-auto leading-relaxed">
                  {language === 'en' ? 'Reflecting on your past thoughts can help you track your progress and manage anxiety.' : 'உங்கள் கடந்த கால எண்ணங்களைப் பிரதிபலிப்பது உங்கள் முன்னேற்றத்தைக் கண்காணிக்கவும் கவலையை நிர்வகிக்கவும் உதவும்.'}
                </p>
                <Button 
                  onClick={() => setIsAdding(true)}
                  className="mt-8 bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-full px-8"
                >
                  {t.newEntry}
                </Button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
