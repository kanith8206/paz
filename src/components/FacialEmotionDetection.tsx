
import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, RefreshCw, Smile, AlertCircle, Info, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useStore } from '../store/useStore';
import { translations } from '../lib/translations';
import { toast } from 'sonner';

export function FacialEmotionDetection() {
  const { language } = useStore();
  const t = translations[language].facial;
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<string | null>(null);
  const [emotionScores, setEmotionScores] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setIsModelLoaded(true);
      } catch (err) {
        console.error('Error loading face-api models:', err);
        setError('Failed to load emotion detection models.');
      }
    };
    loadModels();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setError(null);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions.');
      toast.error('Camera access denied');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
      setDetectedEmotion(null);
      setEmotionScores({});
    }
  };

  useEffect(() => {
    let interval: any;
    if (isCameraActive && isModelLoaded) {
      interval = setInterval(async () => {
        if (videoRef.current && canvasRef.current) {
          const detections = await faceapi
            .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();

          if (detections.length > 0) {
            const expressions = detections[0].expressions;
            const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
            setDetectedEmotion(sorted[0][0]);
            setEmotionScores(expressions as any);

            // Draw on canvas
            const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
            faceapi.matchDimensions(canvasRef.current, displaySize);
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            canvasRef.current.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
          } else {
            setDetectedEmotion(null);
          }
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isCameraActive, isModelLoaded]);

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'happy': return 'text-[#00B894] bg-[#00B894]/10';
      case 'sad': return 'text-[#0984E3] bg-[#0984E3]/10';
      case 'angry': return 'text-[#D63031] bg-[#D63031]/10';
      case 'fearful': return 'text-[#6C5CE7] bg-[#6C5CE7]/10';
      case 'neutral': return 'text-[#636E72] bg-[#636E72]/10';
      default: return 'text-[#FDCB6E] bg-[#FDCB6E]/10';
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-[#2D3436] tracking-tight">{t.title}</h2>
        <p className="text-[#636E72] text-lg">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-black rounded-[2.5rem] overflow-hidden relative aspect-video shadow-2xl border-none">
            {!isCameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-6 bg-[#2D3436]">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                  <Camera className="w-10 h-10 opacity-50" />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-bold text-xl">Camera is Off</p>
                  <p className="text-white/60 text-sm">Start your camera to begin detection</p>
                </div>
                <Button 
                  onClick={startCamera}
                  disabled={!isModelLoaded}
                  className="bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-2xl px-8 h-12 font-bold"
                >
                  {isModelLoaded ? t.start : 'Loading Models...'}
                </Button>
              </div>
            )}

            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />

            {isCameraActive && (
              <div className="absolute top-6 right-6">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={stopCamera}
                  className="bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md"
                >
                  <CameraOff className="w-5 h-5" />
                </Button>
              </div>
            )}

            <AnimatePresence>
              {isCameraActive && detectedEmotion && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                  <div className={`px-8 py-4 rounded-3xl backdrop-blur-xl shadow-2xl flex items-center gap-4 border border-white/20 ${getEmotionColor(detectedEmotion).split(' ')[1].replace('/10', '/80')} text-white`}>
                    <Sparkles className="w-6 h-6" />
                    <div className="text-left">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Detected State</p>
                      <p className="text-xl font-bold capitalize">{t.emotions[detectedEmotion as keyof typeof t.emotions] || detectedEmotion}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white border-none shadow-sm rounded-[2.5rem] p-8">
            <h3 className="text-lg font-bold text-[#2D3436] mb-6 flex items-center gap-2">
              <Smile className="w-5 h-5 text-[#6C5CE7]" />
              Emotion Breakdown
            </h3>
            <div className="space-y-4">
              {Object.entries(emotionScores).length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-12 h-12 bg-[#F8FAFC] rounded-2xl flex items-center justify-center mx-auto">
                    <Info className="text-[#B2BEC3] w-6 h-6" />
                  </div>
                  <p className="text-sm text-[#B2BEC3] font-medium">{t.notDetected}</p>
                </div>
              ) : (
                Object.entries(emotionScores)
                  .sort((a, b) => b[1] - a[1])
                  .map(([emotion, score]) => (
                    <div key={emotion} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                        <span className="text-[#2D3436]">{t.emotions[emotion as keyof typeof t.emotions] || emotion}</span>
                        <span className="text-[#636E72]">{Math.round(score * 100)}%</span>
                      </div>
                      <div className="h-2 bg-[#F0F2F5] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score * 100}%` }}
                          className={`h-full rounded-full ${getEmotionColor(emotion).split(' ')[1].replace('/10', '')}`}
                        />
                      </div>
                    </div>
                  ))
              )}
            </div>
          </Card>

          <Card className="bg-[#6C5CE7] border-none rounded-[2.5rem] p-8 text-white shadow-xl shadow-[#6C5CE7]/20 relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <Info className="w-6 h-6" />
                <h3 className="font-bold">AI Insight</h3>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                {detectedEmotion 
                  ? t.insight.replace('{emotion}', t.emotions[detectedEmotion as keyof typeof t.emotions]?.toLowerCase() || detectedEmotion)
                  : "Start the camera to see how your facial expressions correlate with your internal state."}
              </p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          </Card>
        </div>
      </div>
    </div>
  );
}
