<div align="center">
  <h1>🌿 Paz - AI-Powered Mental Wellness Companion</h1>
  <p>A comprehensive web application designed to support mental wellbeing through AI, facial and voice analysis, and structured assessments.</p>
</div>

## ✨ Key Features

- **🤖 AI Chat Assistant:** Intelligent conversational support and guidance for mental wellness.
- **📊 Mood Tracking & Analytics:** Log your daily moods and anxiety levels to track patterns over time.
- **👁️ Facial Emotion Detection:** Uses on-device machine learning (`face-api.js`) to analyze emotional states in real-time.
- **🎙️ Voice Stress Analysis:** Analyzes voice input patterns (pitch, speed, energy) to detect stress levels and provide calmness suggestions.
- **📋 GAD-7 Assessment:** Clinically validated Generalized Anxiety Disorder (GAD-7) assessment tool with history tracking.
- **🫁 Breathing Exercises:** Guided breathing sessions (e.g., Box Breathing) with visual and timed cues to help reduce anxiety.
- **📓 Journaling:** Private digital journal to record thoughts and reflections with mood context.
- **🚨 Emergency / SOS:** Quick access to crisis hotlines, resources, and trusted contacts when immediate help is needed.

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling & UI:** Tailwind CSS v4, Framer Motion, shadcn/ui, Radix UI Primitives, Lucide React
- **State Management:** Zustand
- **AI & Machine Learning:** `@google/genai` (Gemini API), `@vladmandic/face-api`
- **Backend & Database:** Firebase (Authentication, Firestore Database)
- **Routing:** React Router DOM

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18+)
- Firebase Account (for Database & Auth)
- Google Gemini API Key

### 1. Clone & Install
```bash
# Navigate to the project directory
cd paz

# Install dependencies
npm install
```

### 2. Environment Setup
Create a `.env` file in the root of the project (you can copy from `.env.example`) and add your Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: Firebase is already configured via the included `firebase-applet-config.json` file, so you do not need to add any Firebase keys.)*

### 3. Run the Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to open a Pull Request.

## 📝 License
This project is available under the MIT License.
