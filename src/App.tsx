
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Toaster } from './components/ui/sonner';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Chat } from './pages/Chat';
import { MoodTracker } from './pages/MoodTracker';
import { Breathing } from './pages/Breathing';
import { Journal } from './pages/Journal';
import { Analytics } from './pages/Analytics';
import { Emergency } from './pages/Emergency';
import { Profile } from './pages/Profile';
import { Assessment } from './pages/Assessment';
import { FacialDetection } from './pages/FacialDetection';
import { VoiceAnalysisPage } from './pages/VoiceAnalysis';
import { useStore } from './store/useStore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { MoodEntry, JournalEntry, ChatMessage, BreathingSession, GAD7Entry, VoiceEntry } from './types';

// Paz Application Root
export default function App() {
  const { 
    user, 
    setUser, 
    setAuthReady, 
    setMoodEntries, 
    setJournalEntries, 
    setChatHistory, 
    setBreathingSessions, 
    setGad7Entries,
    setVoiceEntries
  } = useStore();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (!userDoc.exists()) {
            const newUser = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Paz User',
              email: firebaseUser.email || '',
              avatar: firebaseUser.photoURL || '',
              joinedAt: Date.now(),
              role: 'user',
              lastCheckIn: Date.now()
            };
            await setDoc(userDocRef, newUser);
            setUser(newUser);
          } else {
            setUser(userDoc.data() as any);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setUser(null);
      }
      setAuthReady(true);
    });

    return () => unsubscribeAuth();
  }, [setUser, setAuthReady]);

  // Firestore Listeners
  useEffect(() => {
    if (!user) {
      setMoodEntries([]);
      setJournalEntries([]);
      setChatHistory([]);
      setBreathingSessions([]);
      setGad7Entries([]);
      setVoiceEntries([]);
      return;
    }

    const moodsQuery = query(collection(db, `users/${user.id}/moods`), orderBy('timestamp', 'asc'));
    const unsubscribeMoods = onSnapshot(moodsQuery, (snapshot) => {
      const moods = snapshot.docs.map(doc => doc.data() as MoodEntry);
      setMoodEntries(moods);
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.id}/moods`));

    const journalsQuery = query(collection(db, `users/${user.id}/journals`), orderBy('timestamp', 'asc'));
    const unsubscribeJournals = onSnapshot(journalsQuery, (snapshot) => {
      const journals = snapshot.docs.map(doc => doc.data() as JournalEntry);
      setJournalEntries(journals);
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.id}/journals`));

    const chatsQuery = query(collection(db, `users/${user.id}/chats`), orderBy('timestamp', 'asc'));
    const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
      const chats = snapshot.docs.map(doc => doc.data() as ChatMessage);
      setChatHistory(chats);
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.id}/chats`));

    const sessionsQuery = query(collection(db, `users/${user.id}/sessions`), orderBy('timestamp', 'asc'));
    const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
      const sessions = snapshot.docs.map(doc => doc.data() as BreathingSession);
      setBreathingSessions(sessions);
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.id}/sessions`));

    const gad7Query = query(collection(db, `users/${user.id}/assessments`), orderBy('timestamp', 'asc'));
    const unsubscribeGad7 = onSnapshot(gad7Query, (snapshot) => {
      const entries = snapshot.docs.map(doc => doc.data() as GAD7Entry);
      setGad7Entries(entries);
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.id}/assessments`));

    const voiceQuery = query(collection(db, `users/${user.id}/voice_history`), orderBy('timestamp', 'asc'));
    const unsubscribeVoice = onSnapshot(voiceQuery, (snapshot) => {
      const entries = snapshot.docs.map(doc => doc.data() as VoiceEntry);
      setVoiceEntries(entries);
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.id}/voice_history`));

    return () => {
      unsubscribeMoods();
      unsubscribeJournals();
      unsubscribeChats();
      unsubscribeSessions();
      unsubscribeGad7();
      unsubscribeVoice();
    };
  }, [user, setMoodEntries, setJournalEntries, setChatHistory, setBreathingSessions, setGad7Entries, setVoiceEntries]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/mood" element={<MoodTracker />} />
              <Route path="/breathing" element={<Breathing />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/facial" element={<FacialDetection />} />
              <Route path="/voice" element={<VoiceAnalysisPage />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        } />
      </Routes>
      <Toaster position="top-center" richColors />
    </Router>
  );
}
