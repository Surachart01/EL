/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import CartoonCharacter, { CharacterState, CharacterType } from '../components/CartoonCharacter';
import Confetti from '../components/Confetti';
import { calculateSimilarity, computeThaiDiff, DiffSegment } from '../utils/similarity';
import { audioSynth } from '../utils/audio';

// Interface for Dialogue Lessons
interface Lesson {
  id: number;
  title: string;
  emoji: string;
  phraseBoy: string;
  phraseGirl: string;
  tip: string;
}

const LESSONS: Lesson[] = [
  {
    id: 1,
    title: 'คำทักทายแสนดี',
    emoji: '👋',
    phraseBoy: 'สวัสดีครับ ยินดีที่ได้รู้จักครับ',
    phraseGirl: 'สวัสดีค่ะ ยินดีที่ได้รู้จักค่ะ',
    tip: 'พูดทักทายด้วยน้ำเสียงสดใสและยิ้มแย้มนะจ๊ะ!'
  },
  {
    id: 2,
    title: 'วันนี้หนูมีความสุข',
    emoji: '😊',
    phraseBoy: 'วันนี้ผมมีความสุขและแข็งแรงมากครับ',
    phraseGirl: 'วันนี้หนูมีความสุขและแข็งแรงมากค่ะ',
    tip: 'ออกเสียงคำว่า "แข็งแรง" ให้ชัดถ้อยชัดคำนะคนเก่ง'
  },
  {
    id: 3,
    title: 'ธรรมชาติแสนสวย',
    emoji: '🌳',
    phraseBoy: 'ธรรมชาติรอบตัวเราสวยงามและร่มรื่นมากครับ',
    phraseGirl: 'ธรรมชาติรอบตัวเราสวยงามและร่มรื่นมากค่ะ',
    tip: 'คำว่า "ธรรมชาติ" และ "ร่มรื่น" อย่าลืมม้วนลิ้น ร เรือ นะครับ'
  },
  {
    id: 4,
    title: 'ขอบคุณผู้มีพระคุณ',
    emoji: '💖',
    phraseBoy: 'ขอบคุณคุณพ่อคุณแม่ที่คอยดูแลผมอย่างดีครับ',
    phraseGirl: 'ขอบคุณคุณพ่อคุณแม่ที่คอยดูแลหนูอย่างดีค่ะ',
    tip: 'พนมมือไหว้สวยๆ และพูดคำนี้ด้วยความตั้งใจนะจ๊ะ'
  },
  {
    id: 5,
    title: 'สัตว์เลี้ยงแสนรัก',
    emoji: '🐱',
    phraseBoy: 'เจ้าเหมียวตัวเล็กขนฟูนุ่มน่ารักที่สุดเลยครับ',
    phraseGirl: 'เจ้าเหมียวตัวเล็กขนฟูนุ่มน่ารักที่สุดเลยค่ะ',
    tip: 'จินตนาการถึงเจ้าแมวขนปุยน่ารัก แล้วออกเสียงตามเลย!'
  }
];

export default function SpeechAdventureApp() {
  // App States
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(LESSONS[0]);
  const [gender, setGender] = useState<'boy' | 'girl'>('boy');
  const [character, setCharacter] = useState<CharacterType>('dino');
  const [characterState, setCharacterState] = useState<CharacterState>('idle');
  
  // Audio & Speech States
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [evaluationMessage, setEvaluationMessage] = useState('');
  const [diffSegments, setDiffSegments] = useState<DiffSegment[]>([]);
  const [passedLessons, setPassedLessons] = useState<Record<number, boolean>>({});

  // System Fallbacks & Safety
  const [speechSupported, setSpeechSupported] = useState(true);
  const [micPermissionState, setMicPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [errorMessage, setErrorMessage] = useState('');
  const [showMicGuide, setShowMicGuide] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  // References for Speech Recognition API
  const recognitionRef = useRef<any>(null);
  const targetPhrase = gender === 'boy' ? selectedLesson.phraseBoy : selectedLesson.phraseGirl;

  // Initial detection of Speech Recognition compatibility
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setSpeechSupported(false);
        setErrorMessage('เบราว์เซอร์นี้ยังไม่รองรับการจำเสียงพูดจ้า แนะนำให้เปิดใน Google Chrome หรือ Safari บนคอมพิวเตอร์และมือถือนะคนเก่ง!');
      } else {
        // Initialize Speech Recognition instance
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'th-TH';

        rec.onstart = () => {
          setIsListening(true);
          setTranscript('');
          setScore(null);
          setEvaluationMessage('');
          setCharacterState('idle');
          setErrorMessage('');
        };

        rec.onresult = (event: any) => {
          const resultText = event.results[0][0].transcript;
          setTranscript(resultText);
          evaluateSpeech(resultText);
        };

        rec.onerror = (event: any) => {
          setIsListening(false);
          console.error('Speech Recognition Error:', event.error);
          
          if (event.error === 'not-allowed') {
            setMicPermissionState('denied');
            setShowMicGuide(true);
            setErrorMessage('ไมค์ถูกปิดอยู่จ้า! กดอนุญาตให้ใช้ไมโครโฟนก่อนคุยกับเพื่อนๆ นะ');
          } else if (event.error === 'no-speech') {
            setErrorMessage('เอ๊ะ... ดูเหมือนจะไม่ได้ยินเสียงพูดเลย ลองขยับเข้ามาใกล้ๆ แล้วพูดเสียงดังขึ้นอีกนิดนึงนะจ๊ะ 🎙️');
            setCharacterState('sad');
            audioSynth.playTryAgain();
            setTimeout(() => setCharacterState('idle'), 2000);
          } else {
            setErrorMessage('มีบางอย่างผิดพลาดเกี่ยวกับไมโครโฟน ลองกดพูดใหม่อีกครั้งนะจ๊ะคนเก่ง');
          }
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
      
      // Check microphone permission state if API available
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'microphone' as PermissionName })
          .then((permissionStatus) => {
            setMicPermissionState(permissionStatus.state as any);
            permissionStatus.onchange = () => {
              setMicPermissionState(permissionStatus.state as any);
              if (permissionStatus.state === 'granted') {
                setShowMicGuide(false);
                setErrorMessage('');
              }
            };
          })
          .catch(err => console.log('Permission query not supported', err));
      }
    }
  }, []);

  // Voice synthesis (Text to speech for target phrase)
  const speakReferencePhrase = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // If already speaking, cancel it
      window.speechSynthesis.cancel();
      audioSynth.playPop();

      const utterance = new SpeechSynthesisUtterance(targetPhrase);
      utterance.lang = 'th-TH';
      utterance.rate = 0.85; // Slightly slower, cute and friendly speaking speed for children
      utterance.pitch = 1.2; // High pitched, friendly kid sound

      utterance.onstart = () => {
        setCharacterState('speaking');
      };

      utterance.onend = () => {
        setCharacterState('idle');
      };

      utterance.onerror = () => {
        setCharacterState('idle');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // TTS not supported fallback
      alert('ขออภัยด้วยจ้า! เบราว์เซอร์นี้ไม่รองรับการสังเคราะห์เสียง');
    }
  };

  // Start Speech Recognition
  const startRecording = async () => {
    if (!speechSupported) {
      alert(errorMessage);
      return;
    }

    audioSynth.playPop();

    // Check permission state first
    if (micPermissionState === 'denied') {
      setShowMicGuide(true);
      return;
    }

    try {
      // Request mic via API to trigger popup if prompt
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermissionState('granted');
      setShowMicGuide(false);

      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (err) {
      console.error('Mic Access Denied', err);
      setMicPermissionState('denied');
      setShowMicGuide(true);
      setErrorMessage('เปิดไมโครโฟนไม่ได้จ้า กรุณากดปุ่มแม่กุญแจข้างๆ ช่องใส่ URL เพื่อกดเปิดอนุญาตใช้งานไมโครโฟนนะคนเก่ง!');
    }
  };

  // Stop Speech Recognition manually
  const stopRecording = () => {
    audioSynth.playPop();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Evaluate the speech based on Thai similarity
  const evaluateSpeech = (spokenText: string) => {
    const similarityScore = calculateSimilarity(targetPhrase, spokenText);
    setScore(similarityScore);

    // Compute diff segments for high-fidelity highlighting
    const diffs = computeThaiDiff(targetPhrase, spokenText);
    setDiffSegments(diffs);

    if (similarityScore >= 80) {
      // Success feedback
      setCharacterState('celebrating');
      audioSynth.playSuccess();
      setConfettiActive(true);
      
      const successMessages = [
        'สุดยอดไปเลยเก่งมากๆ! 🎉 น้องไดโนและพี่หมีภูมิใจในตัวหนูที่สุด!',
        'ว้าว! ออกเสียงได้ชัดเจนมากเลยคนเก่ง ได้รับดาวดวงใหญ่ไปเลยจ้า! ⭐',
        'เก่งมากเลยครับ! สำเนียงยอดเยี่ยม ผ่านด่านได้อย่างสวยงาม! 🏆',
        'ทำได้ยอดเยี่ยมมากจ้า! ลองไปต่อบทเรียนถัดไปกันเลยนะ 🚀'
      ];
      setEvaluationMessage(successMessages[Math.floor(Math.random() * successMessages.length)]);
      
      // Save passed status
      setPassedLessons((prev) => ({ ...prev, [selectedLesson.id]: true }));
    } else {
      // Retrying feedback
      setCharacterState('sad');
      audioSynth.playTryAgain();
      
      const retryMessages = [
        'เกือบถูกแล้วคนเก่ง! ลองพูดให้เสียงดังและชัดขึ้นอีกนิดนึงนะจ๊ะ 💪',
        'อีกนิดเดียวเท่านั้นจ้า! สู้ๆ นะ ลองฟังเสียงตัวอย่างแล้วพูดใหม่อีกรอบนะคนเก่ง 🦖',
        'น้องหมีและน้องไดโนคอยเชียร์อยู่นะ! ลองฝึกพูดอีกครั้งน้า สู้ๆ! 💖'
      ];
      setEvaluationMessage(retryMessages[Math.floor(Math.random() * retryMessages.length)]);
      
      // Auto return character to idle after 3.5 seconds
      setTimeout(() => {
        setCharacterState('idle');
      }, 3500);
    }
  };

  // Handle lesson change
  const handleSelectLesson = (lesson: Lesson) => {
    audioSynth.playPop();
    setSelectedLesson(lesson);
    setTranscript('');
    setScore(null);
    setEvaluationMessage('');
    setDiffSegments([]);
    setErrorMessage('');
    setCharacterState('idle');
    setConfettiActive(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-50 py-6 px-4 md:px-8 relative overflow-hidden select-none">
      {/* Sparkles / Clouds Decoration in background */}
      <div className="absolute top-10 left-10 text-6xl opacity-20 pointer-events-none animate-float-slow hidden md:block">☁️</div>
      <div className="absolute top-24 right-16 text-7xl opacity-25 pointer-events-none animate-float hidden md:block">☁️</div>
      <div className="absolute bottom-10 left-8 text-5xl opacity-20 pointer-events-none animate-float-slow hidden md:block">🌳</div>
      <div className="absolute bottom-24 right-12 text-6xl opacity-20 pointer-events-none animate-float hidden md:block">🦖</div>

      {/* Confetti Particle Overlay */}
      <Confetti active={confettiActive} onComplete={() => setConfettiActive(false)} />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header App Banner */}
        <header className="text-center mb-8 animate-float">
          <div className="inline-flex items-center gap-3 bg-white px-6 py-2.5 rounded-full shadow-md border-4 border-yellow-300">
            <span className="text-3xl">🗣️</span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-sky-600 tracking-wide font-kids">
              ผจญภัยฝึกพูดกับไดโนน้อย!
            </h1>
            <span className="text-3xl">🦖</span>
          </div>
          <p className="text-sm md:text-base text-slate-500 font-semibold mt-3">
            ฝึกออกเสียงภาษาไทยแสนสนุก เล่นวิดีโอ ประเมินทันที ฟรี 100%!
          </p>
        </header>

        {/* Top Control Panel: Gender selector & Character toggler */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-sky-200/50 backdrop-blur-md rounded-2xl p-4 mb-6 gap-4 border-2 border-sky-300/40">
          
          {/* Kids Gender selection */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-sky-800">ฉันคือคนเก่ง:</span>
            <div className="flex bg-white/80 p-1 rounded-xl shadow-inner border border-sky-300">
              <button
                onClick={() => {
                  audioSynth.playPop();
                  setGender('boy');
                  setTranscript('');
                  setScore(null);
                  setDiffSegments([]);
                }}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  gender === 'boy'
                    ? 'bg-sky-500 text-white shadow-md scale-105'
                    : 'text-sky-700 hover:bg-sky-100'
                }`}
              >
                เด็กผู้ชาย 👦 (ครับ)
              </button>
              <button
                onClick={() => {
                  audioSynth.playPop();
                  setGender('girl');
                  setTranscript('');
                  setScore(null);
                  setDiffSegments([]);
                }}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  gender === 'girl'
                    ? 'bg-pink-400 text-white shadow-md scale-105'
                    : 'text-pink-600 hover:bg-pink-50'
                }`}
              >
                เด็กผู้หญิง 👧 (ค่ะ)
              </button>
            </div>
          </div>

          {/* Character selection */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-sky-800">เลือกเพื่อนซี้คู่ใจ:</span>
            <div className="flex bg-white/80 p-1 rounded-xl shadow-inner border border-sky-300">
              <button
                onClick={() => {
                  audioSynth.playPop();
                  setCharacter('dino');
                }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  character === 'dino'
                    ? 'bg-emerald-500 text-white shadow-md scale-105'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                🦖 น้องไดโน Dino
              </button>
              <button
                onClick={() => {
                  audioSynth.playPop();
                  setCharacter('bear');
                }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  character === 'bear'
                    ? 'bg-amber-600 text-white shadow-md scale-105'
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                🐻 พี่หมี Ted
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Grid (Two Column Area) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT COLUMN: Interactive Animation & Character Area (lg: 5 cols) */}
          <section className="lg:col-span-5 flex flex-col gap-6">
            
            {/* The Cartoon/Video Card */}
            <div className="kids-card bg-gradient-to-b from-sky-400 to-sky-500 rounded-3xl p-6 relative flex flex-col justify-between items-center min-h-[380px] text-white">
              
              {/* Card Header & Video Player controls */}
              <div className="w-full flex justify-between items-center mb-2 z-10">
                <span className="bg-white/30 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold border border-white/20">
                  🔴 Live Animation Room
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={speakReferencePhrase}
                    className="p-2 rounded-full bg-white/25 hover:bg-white/40 transition active:scale-95 border border-white/20"
                    title="เริ่มวิดีโออนิเมชั่นจำลอง"
                  >
                    ▶️
                  </button>
                  <button 
                    onClick={() => {
                      audioSynth.playPop();
                      setCharacterState('idle');
                    }}
                    className="p-2 rounded-full bg-white/25 hover:bg-white/40 transition active:scale-95 border border-white/20"
                    title="หยุดชั่วคราว"
                  >
                    ⏸️
                  </button>
                </div>
              </div>

              {/* The SVG Character Component */}
              <div className="flex-1 flex items-center justify-center relative w-full">
                <CartoonCharacter 
                  type={character} 
                  state={characterState} 
                  onClick={speakReferencePhrase}
                />
              </div>

              {/* Card footer description */}
              <div className="w-full text-center mt-3 z-10">
                <p className="text-sm font-bold bg-white/20 backdrop-blur-md py-1.5 px-4 rounded-2xl border border-white/10 inline-block animate-pulse">
                  {characterState === 'speaking' 
                    ? `🔊 ${character === 'dino' ? 'น้องไดโน' : 'พี่หมี'} กำลังพูดให้ฟังน้า...` 
                    : characterState === 'celebrating' 
                    ? `🎉 ${character === 'dino' ? 'น้องไดโน' : 'พี่หมี'} ดีใจที่หนูทำได้!` 
                    : characterState === 'sad'
                    ? `💪 ไม่เป็นไรน้า ลองใหม่อีกครั้งนะ!`
                    : `👋 กดที่ตัวเพื่อนซี้เพื่อให้ออกเสียงตัวอย่าง`}
                </p>
              </div>

              {/* Cute Wave overlay inside the character panel */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-white/10 rounded-b-[28px] overflow-hidden pointer-events-none">
                <svg viewBox="0 0 120 28" className="w-full h-full text-white/10 fill-current animate-float-slow">
                  <path d="M0 15 Q 30 5, 60 15 T 120 15 L 120 28 L 0 28 Z" />
                </svg>
              </div>
            </div>

            {/* Quick Tips / Advice card */}
            <div className="kids-card bg-yellow-100 rounded-2xl p-5 border-yellow-200">
              <h3 className="text-amber-800 font-extrabold flex items-center gap-2 text-base">
                💡 เคล็ดลับน่ารู้คู่ใจ
              </h3>
              <p className="text-amber-900 text-xs md:text-sm font-bold leading-relaxed mt-2">
                {selectedLesson.tip}
              </p>
            </div>
          </section>


          {/* RIGHT COLUMN: Dialogue Task & Mic Integration (lg: 7 cols) */}
          <section className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Target Dialogue Task */}
            <div className="kids-card rounded-3xl p-6 md:p-8 flex flex-col justify-between">
              
              {/* Category indicator & listen prompt */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs md:text-sm font-extrabold text-sky-600 bg-sky-100 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                  บทเรียนที่ {selectedLesson.id}: {selectedLesson.title}
                </span>
                <button
                  onClick={speakReferencePhrase}
                  className="btn-3d flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-4 py-1.5 rounded-2xl text-xs md:text-sm font-extrabold border-2 border-yellow-500 shadow-amber-400 text-yellow-950 active:translate-y-1"
                >
                  🔊 ฟังเสียงพูดนำ
                </button>
              </div>

              {/* Large Thai Target Phrase Display */}
              <div className="bg-sky-50 rounded-2xl p-6 mb-6 text-center border-2 border-dashed border-sky-300/60 relative overflow-hidden">
                <div className="absolute top-1 right-2 text-3xl opacity-20 pointer-events-none">✨</div>
                
                <h2 className="text-2xl md:text-3xl font-extrabold text-sky-900 leading-snug tracking-wide font-kids">
                  &ldquo;
                  {diffSegments.length > 0 ? (
                    // Display diff with highlighted green/red characters
                    diffSegments.map((seg, i) => (
                      <span
                        key={i}
                        className={`${
                          seg.isMatched 
                            ? 'text-emerald-500 font-black scale-105 inline-block drop-shadow-[0_1.5px_0_rgba(16,185,129,0.2)]' 
                            : 'text-rose-400 underline decoration-wavy decoration-rose-300 font-bold opacity-80 inline-block'
                        }`}
                      >
                        {seg.char}
                      </span>
                    ))
                  ) : (
                    // Default target phrase
                    targetPhrase
                  )}
                  &rdquo;
                </h2>
                
                <p className="text-xs text-sky-600 font-bold mt-3">
                  {diffSegments.length > 0 
                    ? 'สีเขียว = ออกเสียงถูกต้อง | สีแดง = ยังไม่สมบูรณ์ ลองแก้ไขดูนะคนเก่ง' 
                    : 'พูดตามข้อความภาษาไทยข้างบนนี้ให้เสียงดังฟังชัดได้เลยจ้า!'}
                </p>
              </div>

              {/* Web Speech API Micro Controller */}
              <div className="flex flex-col items-center justify-center p-4">
                
                {/* Audio Waveform CSS Animation during active recording */}
                <div className="h-16 flex items-center justify-center gap-1.5 mb-4 w-full max-w-[200px]">
                  {isListening ? (
                    // Active pulsing wave
                    Array.from({ length: 9 }).map((_, i) => (
                      <span
                        key={i}
                        className="w-1.5 bg-gradient-to-t from-sky-400 to-emerald-400 rounded-full animate-wave-pulse"
                        style={{
                          height: `${[24, 40, 56, 32, 48, 64, 44, 28, 16][i]}px`,
                          animationDelay: `${i * 0.15}s`,
                          animationDuration: '1.2s'
                        }}
                      />
                    ))
                  ) : (
                    // Flat static wave line
                    <div className="text-slate-400 text-xs font-bold tracking-wide flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      ระบบอัดเสียงพร้อมใช้งาน
                    </div>
                  )}
                </div>

                {/* Big Round Mic Button */}
                <div className="relative mb-4">
                  {isListening && (
                    <>
                      {/* Bouncing radar ripples around mic */}
                      <span className="absolute inset-0 rounded-full bg-sky-500 animate-pulse-ring -z-10" />
                      <span className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-ring -z-10" style={{ animationDelay: '0.6s' }} />
                    </>
                  )}

                  <button
                    onClick={isListening ? stopRecording : startRecording}
                    className={`btn-3d w-28 h-28 rounded-full flex items-center justify-center text-5xl transition-all shadow-lg ${
                      isListening
                        ? 'bg-rose-500 text-white border-4 border-rose-600 active:bg-rose-600 shadow-rose-400'
                        : 'bg-emerald-400 hover:bg-emerald-500 text-white border-4 border-emerald-500 hover:border-emerald-600 shadow-emerald-400 active:bg-emerald-500'
                    }`}
                  >
                    {isListening ? '⏹️' : '🎙️'}
                  </button>
                </div>

                {/* Microphone text control */}
                <p className={`text-base font-extrabold ${isListening ? 'text-rose-500 animate-pulse' : 'text-slate-600'}`}>
                  {isListening ? '🔴 กำลังอัดเสียง... พูดตามได้เลยคนเก่ง (กดปุ่มสี่เหลี่ยมเพื่อหยุด)' : '👆 กดปุ่มไมโครโฟนเพื่อพูดตามประโยค'}
                </p>
              </div>

              {/* Error messages display */}
              {errorMessage && (
                <div className="mt-4 bg-rose-50 border-2 border-rose-200 rounded-xl p-4 text-center">
                  <p className="text-rose-600 text-xs md:text-sm font-bold flex items-center justify-center gap-1.5">
                    ⚠️ {errorMessage}
                  </p>
                </div>
              )}

              {/* Speech Permission Friendly Help Guide */}
              {showMicGuide && (
                <div className="mt-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 shadow-sm animate-float">
                  <h4 className="text-amber-800 font-extrabold text-sm mb-1">🤔 วิธีเปิดการใช้งานไมโครโฟน:</h4>
                  <ol className="text-amber-950 text-xs font-semibold list-decimal list-inside space-y-1">
                    <li>มองหาไอคอน 🔒 แม่กุญแจ หรือ 🎙️ ลูกไมค์ ที่ช่องใส่ที่อยู่เว็บด้านบนสุดของจอ</li>
                    <li>กดคลิกที่ไอคอนนั้น และเลือกเปลี่ยนตัวเลือกเป็น &quot;อนุญาต (Allow)&quot;</li>
                    <li>รีเฟรชหน้าเว็บนี้แล้วลองกดบันทึกเสียงอีกครั้งจ้า!</li>
                  </ol>
                  <button
                    onClick={() => setShowMicGuide(false)}
                    className="mt-3 px-3 py-1 bg-amber-400 text-amber-950 text-xs font-bold rounded-lg border-2 border-amber-500"
                  >
                    เข้าใจแล้วจ้า
                  </button>
                </div>
              )}

            </div>

            {/* Results Speech Bubble & Score Indicator */}
            {(transcript || score !== null) && (
              <div className="kids-card rounded-3xl p-6 md:p-8 bg-white border-sky-100 flex flex-col gap-6">
                
                {/* Visual score ring and thumbs */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-sky-50/50 p-5 rounded-2xl border border-sky-100">
                  
                  {/* Speech-to-Text Bubbles */}
                  <div className="flex-1 flex flex-col gap-2 w-full">
                    <span className="text-xs font-extrabold text-sky-600 bg-sky-100 px-3 py-1 rounded-full self-start">
                      🔊 ข้อความที่ระบบถอดความได้ (User Speech)
                    </span>
                    <div className="relative bg-pink-100/90 text-pink-900 border-2 border-pink-200 p-4 rounded-2xl rounded-tl-none font-bold text-lg md:text-xl shadow-inner mt-2">
                      <span className="absolute -top-3 left-0 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-pink-100" />
                      &ldquo;{transcript || 'ไม่มีคำพูดที่ถอดรหัสได้... ลองอีกครั้งคนเก่ง'}&rdquo;
                    </div>
                  </div>

                  {/* Percentage Score Circle */}
                  {score !== null && (
                    <div className="flex flex-col items-center justify-center flex-shrink-0">
                      <div className={`w-28 h-28 rounded-full border-8 flex flex-col items-center justify-center shadow-lg transition-transform hover:scale-105 duration-300 ${
                        score >= 80 
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-600 shadow-emerald-200' 
                          : 'border-amber-400 bg-amber-50 text-amber-600 shadow-amber-200'
                      }`}>
                        <span className="text-3xl font-extrabold">{score}%</span>
                        <span className="text-[10px] font-black uppercase tracking-wider">คะแนนความแม่น</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Visual Feedback and Encouraging words */}
                {score !== null && (
                  <div className={`rounded-2xl p-5 text-center border-2 transition-all ${
                    score >= 80
                      ? 'bg-emerald-100/80 border-emerald-200 text-emerald-900'
                      : 'bg-amber-100/80 border-amber-200 text-amber-900'
                  }`}>
                    <div className="text-4xl mb-2 animate-bounce">
                      {score >= 80 ? '🎉🏆🤩' : '💪🍀❤️'}
                    </div>
                    <p className="text-base md:text-lg font-black leading-relaxed">
                      {evaluationMessage}
                    </p>
                    
                    {score >= 80 && (
                      <p className="text-xs text-emerald-700 font-bold mt-2">
                        🌟 หนูเก่งมากครับ! ปลดล็อกเหรียญตราเกียรติยศประจำบทเรียนแล้วจ้า
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* BOTTOM: Dialog Tasks Dashboard - Choose Lessons */}
        <footer className="mt-12 bg-white/70 backdrop-blur-md rounded-3xl p-6 border-4 border-white shadow-xl">
          <h3 className="text-xl font-extrabold text-sky-700 text-center md:text-left mb-6 flex items-center justify-center md:justify-start gap-2">
            🗺️ แผนที่การเดินทางฝึกพูด (Select Conversations)
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {LESSONS.map((lesson) => {
              const isPassed = passedLessons[lesson.id];
              const isSelected = selectedLesson.id === lesson.id;
              
              return (
                <button
                  key={lesson.id}
                  onClick={() => handleSelectLesson(lesson)}
                  className={`relative p-4 rounded-2xl text-center border-3 transition-all duration-300 flex flex-col justify-between items-center gap-2 overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-b from-sky-400 to-sky-500 text-white border-sky-500 shadow-md scale-105 ring-4 ring-sky-200'
                      : 'bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border-slate-200 hover:border-sky-300'
                  }`}
                >
                  {/* Achievement Sticker Badge */}
                  {isPassed && (
                    <span className="absolute top-1 right-1 bg-yellow-400 text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm border border-white font-extrabold animate-bounce z-10" title="สอบผ่านด่านนี้แล้ว!">
                      ⭐
                    </span>
                  )}
                  
                  <span className="text-4xl">{lesson.emoji}</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-extrabold opacity-75">บทที่ {lesson.id}</span>
                    <span className="text-sm font-black whitespace-nowrap">{lesson.title}</span>
                  </div>

                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-white/30 text-white'
                      : isPassed
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isSelected 
                      ? 'กำลังเรียน 📖' 
                      : isPassed 
                      ? 'ผ่านแล้ว! ✅' 
                      : 'ยังไม่ทำ 🔒'}
                  </span>
                </button>
              );
            })}
          </div>
        </footer>

      </div>
    </div>
  );
}
