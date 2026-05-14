
export type MoodType = 'calm' | 'happy' | 'neutral' | 'stressed' | 'anxious' | 'sad' | 'overwhelmed';

export interface MoodEntry {
  id: string;
  timestamp: number;
  mood: MoodType;
  note?: string;
  anxietyLevel: number; // 1-10
  factors?: {
    sleep: 'poor' | 'fair' | 'good';
    energy: 'low' | 'medium' | 'high';
    water: boolean;
    social: boolean;
  };
  uid: string;
}

export interface JournalEntry {
  id: string;
  timestamp: number;
  title: string;
  content: string;
  mood?: MoodType;
  uid: string;
}

export interface BreathingSession {
  id: string;
  timestamp: number;
  duration: number; // in seconds
  cycles: number;
  uid: string;
}

export type Language = 'en' | 'ta' | 'ml' | 'kn' | 'te' | 'hi';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinedAt: number;
  role?: string;
  lastCheckIn?: number;
  trustedContact?: {
    name: string;
    phone: string;
    email?: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  uid: string;
  detection?: AnxietyDetection;
}

export interface AnxietyDetection {
  level: 'low' | 'medium' | 'high';
  score: number; // 0-1
  keywords: string[];
}

export interface GAD7Entry {
  id: string;
  timestamp: number;
  scores: number[]; // 7 scores (0-3)
  totalScore: number;
  level: 'mild' | 'moderate' | 'severe';
  uid: string;
}

export interface VoiceAnalysis {
  state: 'Calm' | 'Slightly Stressed' | 'Moderately Stressed' | 'Highly Stressed';
  confidence: number;
  features: {
    pitch: string;
    speed: string;
    energy: string;
    pauses: string;
  };
  explanation: string;
  suggestions: string[];
}

export interface VoiceEntry {
  id: string;
  timestamp: number;
  analysis: VoiceAnalysis;
  uid: string;
}
