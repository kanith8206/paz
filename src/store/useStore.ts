
import { create } from 'zustand';
import { MoodEntry, JournalEntry, User, ChatMessage, BreathingSession, Language, GAD7Entry, VoiceEntry } from '../types';

interface AppState {
  user: User | null;
  moodEntries: MoodEntry[];
  journalEntries: JournalEntry[];
  chatHistory: ChatMessage[];
  breathingSessions: BreathingSession[];
  gad7Entries: GAD7Entry[];
  voiceEntries: VoiceEntry[];
  isAuthReady: boolean;
  language: Language;
  
  setUser: (user: User | null) => void;
  setMoodEntries: (entries: MoodEntry[]) => void;
  setJournalEntries: (entries: JournalEntry[]) => void;
  setChatHistory: (messages: ChatMessage[]) => void;
  setBreathingSessions: (sessions: BreathingSession[]) => void;
  setGad7Entries: (entries: GAD7Entry[]) => void;
  setVoiceEntries: (entries: VoiceEntry[]) => void;
  setAuthReady: (ready: boolean) => void;
  setLanguage: (language: Language) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  moodEntries: [],
  journalEntries: [],
  chatHistory: [],
  breathingSessions: [],
  gad7Entries: [],
  voiceEntries: [],
  isAuthReady: false,
  language: 'en',
  
  setUser: (user) => set({ user }),
  setMoodEntries: (moodEntries) => set({ moodEntries }),
  setJournalEntries: (journalEntries) => set({ journalEntries }),
  setChatHistory: (chatHistory) => set({ chatHistory }),
  setBreathingSessions: (breathingSessions) => set({ breathingSessions }),
  setGad7Entries: (gad7Entries) => set({ gad7Entries }),
  setVoiceEntries: (voiceEntries) => set({ voiceEntries }),
  setAuthReady: (isAuthReady) => set({ isAuthReady }),
  setLanguage: (language) => set({ language }),
}));
