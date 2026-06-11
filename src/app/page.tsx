/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import CartoonCharacter, { CharacterState } from '../components/CartoonCharacter';
import Confetti from '../components/Confetti';
import { calculateSimilarity, computeEnglishWordDiff, WordDiffSegment } from '../utils/similarity';
import { audioSynth } from '../utils/audio';
import { LESSONS, LessonData } from '../utils/lessons';



export default function TrangKidsSpeakApp() {
  // Student Auth states
  const [student, setStudent] = useState<{ studentId: string; name: string; classroom: string } | null>(null);
  const [loginId, setLoginId] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Navigation tabs: 'home' | 'knowledge' | 'flashcards' | 'animation' | 'roleplay'
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedLesson, setSelectedLesson] = useState<LessonData>(LESSONS[0]);
  const [gender, setGender] = useState<'boy' | 'girl'>('girl'); // default matching Nong Aom 👧
  const [isPracticeExpanded, setIsPracticeExpanded] = useState<boolean>(false);
  const [isReaderOpen, setIsReaderOpen] = useState<boolean>(false);
  const [readerPage, setReaderPage] = useState<number>(1);
  
  // Confetti celebration state
  const [confettiActive, setConfettiActive] = useState(false);

  // Global Speech/Mic Support & Permission
  const [speechSupported, setSpeechSupported] = useState(true);

  


  // Flashcards state
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [flashcardScores, setFlashcardScores] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('trang_kids_speak_flashcard_scores');
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  });
  const [activeCardMic, setActiveCardMic] = useState<string | null>(null);
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState<number>(0);
  const [flashcardTranscripts, setFlashcardTranscripts] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('trang_kids_speak_flashcard_transcripts');
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  });
  const [roleplayTranscripts, setRoleplayTranscripts] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('trang_kids_speak_roleplay_transcripts');
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  });
  const [completedRoleplays, setCompletedRoleplays] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('trang_kids_speak_completed_roleplays');
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  });
  const [activeRoleplaySteps, setActiveRoleplaySteps] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('trang_kids_speak_active_roleplay_steps');
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  });
  const [roleplayScores, setRoleplayScores] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('trang_kids_speak_roleplay_scores');
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  });

  // Helper to save progress to DB
  const saveProgressToDB = async (
    studentId: string,
    update: {
      flashcardScores?: Record<string, number>;
      completedRoleplays?: Record<string, boolean>;
      activeRoleplaySteps?: Record<string, number>;
      roleplayScores?: Record<string, number>;
      flashcardTranscripts?: Record<string, string>;
      roleplayTranscripts?: Record<string, string>;
      submission?: { lessonId: number; score: number; mediaType: 'audio' | 'video'; status: string; date: string };
    }
  ) => {
    if (studentId === 'guest') return; // Skip saving to DB for guest
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, ...update }),
      });
    } catch (e) {
      console.error('Error saving progress to DB:', e);
    }
  };

  // Helper to fetch student progress from DB with Local Storage fallback
  const fetchStudentProgress = async (studentId: string) => {
    if (studentId === 'guest') return; // Skip fetching from DB for guest
    try {
      const res = await fetch(`/api/progress?studentId=${studentId}`);
      const data = await res.json();
      if (data.success && data.progress) {
        const dbScores = data.progress.flashcardScores || {};
        if (Object.keys(dbScores).length > 0) {
          setFlashcardScores(dbScores);
        } else {
          const storedScores = localStorage.getItem('trang_kids_speak_flashcard_scores');
          if (storedScores) {
            const parsed = JSON.parse(storedScores);
            setFlashcardScores(parsed);
            await saveProgressToDB(studentId, { flashcardScores: parsed });
          }
        }
        const dbRoleplays = data.progress.completedRoleplays || {};
        if (Object.keys(dbRoleplays).length > 0) {
          setCompletedRoleplays(dbRoleplays);
        } else {
          const storedRoleplays = localStorage.getItem('trang_kids_speak_completed_roleplays');
          if (storedRoleplays) {
            const parsed = JSON.parse(storedRoleplays);
            setCompletedRoleplays(parsed);
            await saveProgressToDB(studentId, { completedRoleplays: parsed });
          }
        }
        const dbRoleplaySteps = data.progress.activeRoleplaySteps || {};
        if (Object.keys(dbRoleplaySteps).length > 0) {
          setActiveRoleplaySteps(dbRoleplaySteps);
        } else {
          const storedRoleplaySteps = localStorage.getItem('trang_kids_speak_active_roleplay_steps');
          if (storedRoleplaySteps) {
            const parsed = JSON.parse(storedRoleplaySteps);
            setActiveRoleplaySteps(parsed);
            await saveProgressToDB(studentId, { activeRoleplaySteps: parsed });
          }
        }
        const dbRoleplayScores = data.progress.roleplayScores || {};
        if (Object.keys(dbRoleplayScores).length > 0) {
          setRoleplayScores(dbRoleplayScores);
        } else {
          const storedRoleplayScores = localStorage.getItem('trang_kids_speak_roleplay_scores');
          if (storedRoleplayScores) {
            const parsed = JSON.parse(storedRoleplayScores);
            setRoleplayScores(parsed);
            await saveProgressToDB(studentId, { roleplayScores: parsed });
          }
        }
        const dbFlashcardTranscripts = data.progress.flashcardTranscripts || {};
        if (Object.keys(dbFlashcardTranscripts).length > 0) {
          setFlashcardTranscripts(dbFlashcardTranscripts);
        } else {
          const storedTranscripts = localStorage.getItem('trang_kids_speak_flashcard_transcripts');
          if (storedTranscripts) {
            const parsed = JSON.parse(storedTranscripts);
            setFlashcardTranscripts(parsed);
            await saveProgressToDB(studentId, { flashcardTranscripts: parsed });
          }
        }
        const dbRoleplayTranscripts = data.progress.roleplayTranscripts || {};
        if (Object.keys(dbRoleplayTranscripts).length > 0) {
          setRoleplayTranscripts(dbRoleplayTranscripts);
        } else {
          const storedTranscripts = localStorage.getItem('trang_kids_speak_roleplay_transcripts');
          if (storedTranscripts) {
            const parsed = JSON.parse(storedTranscripts);
            setRoleplayTranscripts(parsed);
            await saveProgressToDB(studentId, { roleplayTranscripts: parsed });
          }
        }

      }
    } catch (e) {
      console.error('Error fetching progress:', e);
    }
  };

  // Load student session from localStorage on Mount (Client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedStudent = localStorage.getItem('el_student');
      if (savedStudent) {
        try {
          const parsed = JSON.parse(savedStudent);
          setStudent(parsed);
          const isGirl = parsed.name.includes('เด็กหญิง') || parsed.name.includes('หญิง');
          setGender(isGirl ? 'girl' : 'boy');
          fetchStudentProgress(parsed.studentId);
        } catch (e) {
          console.error('Error loading saved student session', e);
        }
      }
    }
  }, []);

  // Reset E-Book Reader state when switching tabs
  useEffect(() => {
    if (activeTab !== 'knowledge') {
      setIsReaderOpen(false);
    }
  }, [activeTab]);

  // Keyboard page flipping for E-Book
  useEffect(() => {
    if (!isReaderOpen) return;
    const UNIT_PAGE_COUNTS: Record<number, number> = { 1: 5, 2: 3, 3: 4, 4: 3, 5: 3 };
    const totalPages = UNIT_PAGE_COUNTS[selectedLesson.id] || 3;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setReaderPage(p => Math.min(totalPages, p + 1));
      } else if (e.key === 'ArrowLeft') {
        setReaderPage(p => Math.max(1, p - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isReaderOpen, selectedLesson.id]);

  // Animation simulator state
  const [activeAnimTopicIdx, setActiveAnimTopicIdx] = useState<number>(0);
  const [activeRoleplayTopicIdx, setActiveRoleplayTopicIdx] = useState<number>(0);
  const [simPlaying, setSimPlaying] = useState(false);
  const [simStep, setSimStep] = useState<number>(-1);
  const [simDinoState, setSimDinoState] = useState<CharacterState>('idle');
  const [simBearState, setSimBearState] = useState<CharacterState>('idle');
  const [animationSubtitle, setAnimationSubtitle] = useState<string>('');

  // Role Play game states
  const [userRole] = useState<'dino' | 'bear'>('bear');
  const [rolePlayStep, setRolePlayStep] = useState<number>(0);
  const [rolePlayScore, setRolePlayScore] = useState<number | null>(null);
  const [rolePlayDiff, setRolePlayDiff] = useState<WordDiffSegment[]>([]);
  const [rolePlayTranscript, setRolePlayTranscript] = useState<string>('');
  const [isRolePlayListening, setIsRolePlayListening] = useState<boolean>(false);
  const [dinoRoleState, setDinoRoleState] = useState<CharacterState>('idle');
  const [bearRoleState, setBearRoleState] = useState<CharacterState>('idle');
  const [rolePlayFeedback, setRolePlayFeedback] = useState<string>('');

  // Helpers to calculate progress percentages
  const getVocabProgress = (lesson: LessonData) => {
    const totalVocab = lesson.vocab.length;
    if (totalVocab === 0) return 100;
    const passed = lesson.vocab.filter((_, idx) => {
      const cardKey = `${lesson.id}-${idx}`;
      return (flashcardScores[cardKey] || 0) >= 80;
    }).length;
    return Math.round((passed / totalVocab) * 100);
  };

  const getTopicProgress = (lesson: LessonData, topicIdx: number) => {
    const topic = lesson.dialogueTopics?.[topicIdx];
    if (!topic) return 0;
    const userLines = topic.dialogue.filter(line => line.character === userRole);
    if (userLines.length === 0) return 100;
    const passed = topic.dialogue.filter((line, lineIdx) => {
      if (line.character !== userRole) return false;
      const scoreKey = `${lesson.id}_${topicIdx}_${lineIdx}`;
      return (roleplayScores[scoreKey] || 0) >= 80;
    }).length;
    return Math.round((passed / userLines.length) * 100);
  };

  const getLessonOverallProgress = (lesson: LessonData) => {
    const vocabProgress = getVocabProgress(lesson);
    const topics = lesson.dialogueTopics || [];
    if (topics.length === 0) return vocabProgress;
    
    let sumOfTopics = 0;
    topics.forEach((_, idx) => {
      sumOfTopics += getTopicProgress(lesson, idx);
    });
    
    const average = (vocabProgress + sumOfTopics) / (1 + topics.length);
    return Math.round(average);
  };


  

  // References for Web Speech API
  const recognitionRef = useRef<any>(null);
  const rolePlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const simTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to create a fresh SpeechRecognition instance each time (prevents 'already started' errors)
  const createRecognition = (): any | null => {
    if (typeof window === 'undefined') return null;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';
    return rec;
  };

  // Check Speech Recognition support on Mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechSupported(false);
      }
    }
  }, []);

  // Pre-load Web Speech Synthesis voices on mount to prevent first-click silence/wrong voice issues in Chrome/Edge
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // First call triggers voice loading in Chromium browsers
      window.speechSynthesis.getVoices();
      
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
      } else {
        window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      }
      
      return () => {
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = null;
        } else {
          window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        }
      };
    }
  }, []);

  // Reset flashcard index and topic indices when lesson changes
  useEffect(() => {
    setActiveFlashcardIndex(0);
    setActiveAnimTopicIdx(0);
    setActiveRoleplayTopicIdx(0);
  }, [selectedLesson]);

  // Auto-scroll to active dialogue line during simulation
  useEffect(() => {
    if (simPlaying && simStep !== -1) {
      const activeEl = document.getElementById(`dialogue-line-${simStep}`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [simStep, simPlaying]);

  // Stop speaking and clear role-play states when changing tab or lesson
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    // Clear any active timeout
    if (rolePlayTimeoutRef.current) {
      clearTimeout(rolePlayTimeoutRef.current);
    }
    if (simTimeoutRef.current) {
      clearTimeout(simTimeoutRef.current);
      simTimeoutRef.current = null;
    }

    if (activeTab === 'roleplay') {
      startRolePlay(selectedLesson, userRole);
    } else {
      setRolePlayStep(0);
      setRolePlayScore(null);
      setRolePlayDiff([]);
      setRolePlayTranscript('');
      setRolePlayFeedback('');
      setDinoRoleState('idle');
      setBearRoleState('idle');
    }
  }, [activeTab, selectedLesson]);



  // Speaks any English phrase using Web Speech Synthesis
  const speakText = (text: string, isDino: boolean = true, onEnd?: () => void) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      
      // Preprocess text: Convert all-caps words (length >= 2) to Title Case (e.g. THANAPHOB -> Thanaphob)
      // so that TTS engine pronounces them as normal words instead of spelling them out letter-by-letter.
      let processedText = text.replace(/\b([A-Z]{2,})\b/g, (match) => {
        return match.charAt(0) + match.slice(1).toLowerCase();
      });

      // Fix English TTS pronunciation for Thai names/words containing "ph" (which English TTS pronounces as "f")
      // e.g., Thanaphob -> Thanapob, Phob -> Pob, Phu -> Pu, Phraya -> Praya
      const pronunciationFixes: { [key: string]: string } = {
        'Thanaphob': 'Thanapob',
        'Thanaphop': 'Thanapob',
        'Phob': 'Pob',
        'Phu': 'Pu',
        'Phraya': 'Praya',
        'thanaphob': 'thanapob',
        'thanaphop': 'thanapob',
        'phob': 'pob',
        'phu': 'pu',
        'phraya': 'praya'
      };

      Object.entries(pronunciationFixes).forEach(([original, replacement]) => {
        const regex = new RegExp(`\\b${original}\\b`, 'g');
        processedText = processedText.replace(regex, replacement);
      });

      const utterance = new SpeechSynthesisUtterance(processedText);
      utterance.lang = 'en-US';
      utterance.rate = 0.9; // Clear natural rate
      utterance.pitch = 1.0; // Natural standard pitch (resolves hard-to-understand distortion)

      // Query and select high-quality Google voice if available in browser
      const voices = window.speechSynthesis.getVoices();
      const googleVoice = 
        voices.find(v => v.name === 'Google US English') ||
        voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
        voices.find(v => v.lang === 'en-US') ||
        voices.find(v => v.lang.startsWith('en'));

      if (googleVoice) {
        utterance.voice = googleVoice;
      }

      utterance.onstart = () => {
        if (isDino) {
          setSimDinoState('speaking');
          setDinoRoleState('speaking');
        } else {
          setSimBearState('speaking');
          setBearRoleState('speaking');
        }
      };

      utterance.onend = () => {
        setSimDinoState('idle');
        setSimBearState('idle');
        setDinoRoleState('idle');
        setBearRoleState('idle');
        if (onEnd) {
          onEnd();
        }
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  // Start micro-recording for one Flashcard
  const recordFlashcard = async (vocabWord: string, indexKey: string) => {
    if (!speechSupported) {
      alert('ขออภัยด้วยจ้า ระบบถอดความเสียงไม่พร้อมทำงานบนบราวเซอร์นี้');
      return;
    }
    // Abort any existing session and create a fresh instance
    if (recognitionRef.current) { try { recognitionRef.current.abort(); } catch { /* ignore */ } }
    const rec = createRecognition();
    if (!rec) { alert('ขออภัยด้วยจ้า ระบบถอดความเสียงไม่รองรับบนบราวเซอร์นี้'); return; }
    recognitionRef.current = rec;

    audioSynth.playPop();
    setActiveCardMic(indexKey);

    rec.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      setFlashcardTranscripts(prev => {
        const next = { ...prev, [indexKey]: resultText };
        if (typeof window !== 'undefined') {
          localStorage.setItem('trang_kids_speak_flashcard_transcripts', JSON.stringify(next));
        }
        return next;
      });
      const cardScore = calculateSimilarity(vocabWord.toLowerCase().trim(), resultText.toLowerCase().trim());
      setFlashcardScores(prev => {
        const next = { ...prev, [indexKey]: cardScore };
        if (typeof window !== 'undefined') {
          localStorage.setItem('trang_kids_speak_flashcard_scores', JSON.stringify(next));
        }
        if (student) {
          saveProgressToDB(student.studentId, {
            flashcardScores: { [indexKey]: cardScore },
            flashcardTranscripts: { [indexKey]: resultText }
          });
        }
        return next;
      });
      if (cardScore >= 80) { audioSynth.playSuccess(); setConfettiActive(true); }
      else { audioSynth.playTryAgain(); }
      setActiveCardMic(null);
    };
    rec.onerror = () => { setActiveCardMic(null); };
    rec.onend = () => { setActiveCardMic(null); };

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      rec.start();
    } catch {
      alert('กรุณาอนุญาตการเข้าถึงไมโครโฟนเพื่อฝึกพูดนะจ๊ะ!');
      setActiveCardMic(null);
    }
  };

  // Run the dialogue interactive simulation in the animation player
  const runAnimationSimulation = () => {
    if (simPlaying) return;
    setSimPlaying(true);
    
    const lines = selectedLesson.dialogueTopics?.[activeAnimTopicIdx]?.dialogue || selectedLesson.dialogue;
    
    // Resume from current simStep if within range, otherwise start from 0
    let index = (simStep >= 0 && simStep < lines.length) ? simStep : 0;

    const playNextLine = () => {
      if (index >= lines.length) {
        setSimPlaying(false);
        setSimStep(-1);
        setAnimationSubtitle('');
        setSimDinoState('idle');
        setSimBearState('idle');
        return;
      }

      const line = lines[index];
      setSimStep(index);
      setAnimationSubtitle(`[${line.character === 'dino' ? 'Dino 🦖' : 'Bear 🐻'}]: "${line.text}" (${line.translation})`);
      speakText(line.text, line.character === 'dino');

      // Schedule next line
      const textDuration = line.text.length * 90 + 2000; // rough estimation of voice length
      index++;
      simTimeoutRef.current = setTimeout(playNextLine, textDuration);
    };

    playNextLine();
  };

  // Pause the dialogue interactive simulation
  const pauseAnimationSimulation = () => {
    if (simTimeoutRef.current) {
      clearTimeout(simTimeoutRef.current);
      simTimeoutRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSimPlaying(false);
    setSimDinoState('idle');
    setSimBearState('idle');
  };

  // Reset the dialogue interactive simulation to the beginning
  const resetAnimationSimulation = () => {
    if (simTimeoutRef.current) {
      clearTimeout(simTimeoutRef.current);
      simTimeoutRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSimPlaying(false);
    setSimStep(-1);
    setAnimationSubtitle('');
    setSimDinoState('idle');
    setSimBearState('idle');
  };

  // Stop the dialogue interactive simulation (alias for reset)
  const stopAnimationSimulation = () => {
    resetAnimationSimulation();
  };

  // Role Play Step logic
  const startRolePlay = (topic: LessonData, roleOverride?: 'dino' | 'bear', resetStep: boolean = false, topicIdxOverride?: number) => {
    audioSynth.playPop();

    // Clear any active timeout
    if (rolePlayTimeoutRef.current) {
      clearTimeout(rolePlayTimeoutRef.current);
    }
    // Cancel active speech
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setSelectedLesson(topic);
    setRolePlayScore(null);
    setRolePlayDiff([]);
    setRolePlayTranscript('');
    setRolePlayFeedback('');
    setDinoRoleState('idle');
    setBearRoleState('idle');

    const activeTopicIdx = topicIdxOverride !== undefined ? topicIdxOverride : activeRoleplayTopicIdx;
    const progressKey = `${topic.id}_${activeTopicIdx}`;
    let savedStep = 0;
    if (!resetStep) {
      savedStep = activeRoleplaySteps[progressKey] || 0;
    } else {
      setActiveRoleplaySteps(prev => {
        const next = { ...prev, [progressKey]: 0 };
        if (typeof window !== 'undefined') {
          localStorage.setItem('trang_kids_speak_active_roleplay_steps', JSON.stringify(next));
        }
        if (student) saveProgressToDB(student.studentId, { activeRoleplaySteps: next });
        return next;
      });
    }

    const activeRole = roleOverride || userRole;
    const lines = topic.dialogueTopics?.[activeTopicIdx]?.dialogue || topic.dialogue;

    if (savedStep >= lines.length) {
      // If completed previously, but click start again, let's reset to 0
      savedStep = 0;
    }

    setRolePlayStep(savedStep);

    if (lines.length > 0) {
      const currentLine = lines[savedStep];
      const otherRole = activeRole === 'dino' ? 'bear' : 'dino';
      if (currentLine.character === otherRole) {
        rolePlayTimeoutRef.current = setTimeout(() => {
          triggerRolePlayComputerTurn(savedStep, topic, activeRole, activeTopicIdx);
        }, 500);
      } else {
        setRolePlayFeedback('ตาของหนูแล้วคนเก่ง! กดปุ่มไมค์เพื่อพูดเลยจ้า 🎙️');
      }
    }
  };

  const triggerRolePlayComputerTurn = (stepIndex: number, lesson: LessonData, roleOverride?: 'dino' | 'bear', topicIdxOverride?: number) => {
    const activeTopicIdx = topicIdxOverride !== undefined ? topicIdxOverride : activeRoleplayTopicIdx;
    const lines = lesson.dialogueTopics?.[activeTopicIdx]?.dialogue || lesson.dialogue;
    if (stepIndex >= lines.length) return;

    const currentLine = lines[stepIndex];
    const activeRole = roleOverride || userRole;
    const otherRole = activeRole === 'dino' ? 'bear' : 'dino';

    // If it is the computer's role
    if (currentLine.character === otherRole) {
      setRolePlayFeedback(`${currentLine.character === 'dino' ? 'น้องไดโน 🦖' : 'พี่หมี 🐻'} กำลังพูด...`);
      speakText(currentLine.text, currentLine.character === 'dino', () => {
        const nextStep = stepIndex + 1;
        setRolePlayStep(nextStep);
        setRolePlayFeedback('ตาของหนูแล้วคนเก่ง! กดปุ่มไมค์เพื่อพูดเลยจ้า 🎙️');
        
        const progressKey = `${lesson.id}_${activeTopicIdx}`;
        // Save progress to state, localStorage, and DB
        setActiveRoleplaySteps(prevSteps => {
          const next = { ...prevSteps, [progressKey]: nextStep };
          if (typeof window !== 'undefined') {
            localStorage.setItem('trang_kids_speak_active_roleplay_steps', JSON.stringify(next));
          }
          if (student) saveProgressToDB(student.studentId, { activeRoleplaySteps: next });
          return next;
        });

        // If the next turn is also computer's turn (which shouldn't happen in alternating role-play, but just in case), trigger it
        if (nextStep < lines.length) {
          const nextLine = lines[nextStep];
          if (nextLine.character === otherRole) {
            rolePlayTimeoutRef.current = setTimeout(() => {
              triggerRolePlayComputerTurn(nextStep, lesson, activeRole, activeTopicIdx);
            }, 1000);
          }
        }
      });
    }
  };

  const recordRolePlayLine = async () => {
    if (!speechSupported) {
      alert('ขออภัยด้วยจ้า ระบบถอดความเสียงไม่พร้อมทำงานบนบราวเซอร์นี้');
      return;
    }
    const activeTopicIdx = activeRoleplayTopicIdx;
    const lines = selectedLesson.dialogueTopics?.[activeTopicIdx]?.dialogue || selectedLesson.dialogue;
    const targetLine = lines[rolePlayStep];
    if (targetLine.character !== userRole) { alert('ตาของคู่หูคุณพูดอยู่จ้า รอแป๊บน้า!'); return; }

    // Abort any existing session and create a fresh instance
    if (recognitionRef.current) { try { recognitionRef.current.abort(); } catch { /* ignore */ } }
    const rec = createRecognition();
    if (!rec) { alert('ขออภัยด้วยจ้า ระบบถอดความเสียงไม่รองรับบนบราวเซอร์นี้'); return; }
    recognitionRef.current = rec;

    audioSynth.playPop();
    setIsRolePlayListening(true);
    setRolePlayScore(null);
    setRolePlayTranscript('');

    rec.onstart = () => {
      if (userRole === 'dino') setDinoRoleState('speaking');
      else setBearRoleState('speaking');
    };

    rec.onresult = (event: any) => {
      const spokenText = event.results[0][0].transcript;
      setRolePlayTranscript(spokenText);
      const similarityScore = calculateSimilarity(targetLine.text, spokenText);
      setRolePlayScore(similarityScore);
      setRolePlayDiff(computeEnglishWordDiff(targetLine.text, spokenText));

      const scoreKey = `${selectedLesson.id}_${activeTopicIdx}_${rolePlayStep}`;

      setRoleplayTranscripts(prev => {
        const next = { ...prev, [scoreKey]: spokenText };
        if (typeof window !== 'undefined') {
          localStorage.setItem('trang_kids_speak_roleplay_transcripts', JSON.stringify(next));
        }
        return next;
      });

      setRoleplayScores(prev => {
        const currentScore = prev[scoreKey] || 0;
        const nextScore = Math.max(currentScore, similarityScore);
        const next = { ...prev, [scoreKey]: nextScore };
        if (typeof window !== 'undefined') {
          localStorage.setItem('trang_kids_speak_roleplay_scores', JSON.stringify(next));
        }
        if (student) {
          saveProgressToDB(student.studentId, {
            roleplayScores: { [scoreKey]: nextScore },
            roleplayTranscripts: { [scoreKey]: spokenText }
          });
        }
        return next;
      });

      const progressKey = `${selectedLesson.id}_${activeTopicIdx}`;

      if (similarityScore >= 80) {
        if (userRole === 'dino') setDinoRoleState('celebrating'); else setBearRoleState('celebrating');
        audioSynth.playSuccess();
        setConfettiActive(true);
        setRolePlayFeedback('เก่งมากๆ เลยคนเก่ง! ผ่านฉลุยจ้า 🌟');
        setTimeout(() => {
          const nextStep = rolePlayStep + 1;
          setRolePlayStep(nextStep);
          setRolePlayScore(null);
          setRolePlayDiff([]);
          setRolePlayTranscript('');

          const stepToSave = nextStep < lines.length ? nextStep : 0;
          setActiveRoleplaySteps(prevSteps => {
            const next = { ...prevSteps, [progressKey]: stepToSave };
            if (typeof window !== 'undefined') {
              localStorage.setItem('trang_kids_speak_active_roleplay_steps', JSON.stringify(next));
            }
            if (student) saveProgressToDB(student.studentId, { activeRoleplaySteps: next });
            return next;
          });

          if (nextStep < lines.length) {
            triggerRolePlayComputerTurn(nextStep, selectedLesson, userRole, activeTopicIdx);
          } else {
            setRolePlayFeedback('🎉 ว้าว! คุณทำกิจกรรมบทบาทสมมติเสร็จสมบูรณ์แล้ว ยอดเยี่ยมมากจ้า!');
            audioSynth.playSuccess();
            setConfettiActive(true);
            setCompletedRoleplays(prev => {
              const next = { ...prev, [progressKey]: true };
              if (typeof window !== 'undefined') {
                localStorage.setItem('trang_kids_speak_completed_roleplays', JSON.stringify(next));
              }
              if (student) saveProgressToDB(student.studentId, { completedRoleplays: next });
              return next;
            });
          }
        }, 3000);
      } else {
        if (userRole === 'dino') setDinoRoleState('sad'); else setBearRoleState('sad');
        audioSynth.playTryAgain();
        setRolePlayFeedback('ออกเสียงผิดเพี้ยนไปนิดนึงจ้า ลองกดไมค์พยายามใหม่อีกครั้งนะสู้ๆ! 💪');
        setTimeout(() => { setDinoRoleState('idle'); setBearRoleState('idle'); }, 2500);
      }
    };
    rec.onerror = () => {
      setIsRolePlayListening(false);
      setRolePlayFeedback('ไม่ได้ยินเสียงพูดเลยจ้า ลองพูดใกล้ขึ้นอีกนิดนึงน้า 🎙️');
      if (userRole === 'dino') setDinoRoleState('sad'); else setBearRoleState('sad');
      audioSynth.playTryAgain();
      setTimeout(() => { setDinoRoleState('idle'); setBearRoleState('idle'); }, 2500);
    };
    rec.onend = () => { setIsRolePlayListening(false); };
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      rec.start();
    } catch {
      alert('กรุณาเปิดไมโครโฟนเพื่อพูดบทบาทสมมติจ้า!');
      setIsRolePlayListening(false);
    }
  };

  // Keypad login handlers
  const handleKeyPress = (num: string) => { audioSynth.playPop(); if (loginId.length < 10) setLoginId(prev => prev + num); };
  const handleBackspace = () => { audioSynth.playPop(); setLoginId(prev => prev.slice(0, -1)); };
  const handleClear = () => { audioSynth.playPop(); setLoginId(''); };

  const handleGuestLogin = () => {
    audioSynth.playSuccess();
    setConfettiActive(true);
    const guestStudent = {
      studentId: 'guest',
      name: 'บุคคลทั่วไป (Guest)',
      classroom: 'ห้องทดสอบ (Test Room)'
    };
    setStudent(guestStudent);
    if (typeof window !== 'undefined') {
      localStorage.setItem('el_student', JSON.stringify(guestStudent));
    }
    setGender('boy');
  };

  const handleLoginSubmit = async () => {
    if (!loginId.trim()) { setLoginError('กรุณากรอกรหัสนักเรียนจ้า'); return; }
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: loginId }) });
      const data = await res.json();
      if (data.success) {
        audioSynth.playSuccess();
        setConfettiActive(true);
        setStudent(data.student);
        localStorage.setItem('el_student', JSON.stringify(data.student));
        setGender(data.student.name.includes('เด็กหญิง') || data.student.name.includes('หญิง') ? 'girl' : 'boy');
        fetchStudentProgress(data.student.studentId);
      } else {
        audioSynth.playTryAgain();
        setLoginError(data.error || 'ไม่พบรหัสนักเรียนนี้ในระบบ');
      }
    } catch {
      audioSynth.playTryAgain();
      setLoginError('เกิดข้อผิดพลาดในการเชื่อมต่อระบบ');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!student) {
    return (
      <div className="min-h-screen bg-[#f3f9fc] flex items-center justify-center py-6 px-4 relative overflow-hidden select-none">
        <Confetti active={confettiActive} onComplete={() => setConfettiActive(false)} />
        <div className="absolute top-16 left-6 text-6xl opacity-20 pointer-events-none animate-float-slow hidden md:block">☁️</div>
        <div className="absolute top-32 right-12 text-7xl opacity-20 pointer-events-none animate-float hidden md:block">☁️</div>
        <div className="max-w-md w-full bg-white rounded-[32px] shadow-[0_12px_40px_rgba(203,213,225,0.4)] border-4 border-white p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 flex items-center justify-center shrink-0 animate-bounce-gentle">
              <svg viewBox="0 0 64 64" className="w-full h-full">
                <rect x="22" y="10" width="20" height="44" rx="2" fill="#bae6fd" stroke="#0284c7" strokeWidth="2" />
                <rect x="25" y="16" width="14" height="14" rx="7" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
                <path d="M 32 23 L 32 20 M 32 23 L 35 23" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
                <polygon points="32,2 20,10 44,10" fill="#fca5a5" stroke="#e11d48" strokeWidth="2" />
                <rect x="28" y="36" width="8" height="14" rx="4" fill="#60a5fa" stroke="#0284c7" strokeWidth="1.5" />
              </svg>
            </div>
            <h1 className="text-2xl font-black font-kids tracking-wide leading-none mt-2">
              <span className="text-[#0284c7]">Trang</span>{' '}<span className="text-[#f97316]">Kids</span>{' '}<span className="text-[#8b5cf6]">Speak</span>
            </h1>
            <p className="text-xs font-bold text-slate-400 mt-1">ยินดีต้อนรับสู่แดนกิจกรรมภาษาอังกฤษ ป.2 🌟</p>
            <div className="w-full bg-[#f8fafc] rounded-2xl border-2 border-slate-100 p-4 mt-4">
              <div className="text-3xl font-black tracking-widest text-[#1e293b] font-mono min-h-[45px] flex items-center justify-center bg-white rounded-xl border border-slate-200 shadow-inner px-4 py-2">
                {loginId || <span className="text-slate-300 text-base select-none">ใส่รหัสนักเรียน</span>}
              </div>
              {loginError && <div className="text-xs font-black text-rose-500 mt-2">⚠️ {loginError}</div>}
            </div>
            <div className="grid grid-cols-3 gap-3 w-full mt-4">
              {[1,2,3,4,5,6,7,8,9].map(num => (
                <button key={num} type="button" onClick={() => handleKeyPress(String(num))}
                  className="bg-white border-2 border-slate-200 border-b-4 hover:border-b-2 active:border-b-0 hover:bg-slate-50 text-slate-700 active:translate-y-[2px] rounded-2xl py-3 font-black text-2xl font-kids shadow-sm transition-all duration-75">
                  {num}
                </button>
              ))}
              <button type="button" onClick={handleClear}
                className="bg-rose-50 border-2 border-rose-200 border-b-4 hover:border-b-2 active:border-b-0 text-rose-600 active:translate-y-[2px] rounded-2xl py-3 font-black text-lg font-kids shadow-sm transition-all duration-75">
                ล้าง
              </button>
              <button type="button" onClick={() => handleKeyPress('0')}
                className="bg-white border-2 border-slate-200 border-b-4 hover:border-b-2 active:border-b-0 hover:bg-slate-50 text-slate-700 active:translate-y-[2px] rounded-2xl py-3 font-black text-2xl font-kids shadow-sm transition-all duration-75">
                0
              </button>
              <button type="button" onClick={handleBackspace}
                className="bg-orange-50 border-2 border-orange-200 border-b-4 hover:border-b-2 active:border-b-0 text-orange-600 active:translate-y-[2px] rounded-2xl py-3 font-black text-xl font-kids shadow-sm transition-all duration-75 flex items-center justify-center">
                ⌫
              </button>
            </div>
            <button type="button" disabled={isLoggingIn} onClick={handleLoginSubmit}
              className={`w-full text-white font-black text-lg font-kids py-3 rounded-2xl mt-4 shadow-md transition-all flex items-center justify-center gap-2 border-b-4 active:translate-y-[2px] ${
                isLoggingIn ? 'bg-emerald-400 border-emerald-500 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 border-emerald-600'
              }`}>
              {isLoggingIn ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />กำลังเข้าสู่ระบบ...</>) : <>เข้าสู่ระบบ 🚀</>}
            </button>
            <button type="button" disabled={isLoggingIn} onClick={handleGuestLogin}
              className="w-full text-slate-700 bg-slate-100 hover:bg-slate-200 border-2 border-slate-200 border-b-4 active:border-b-0 hover:border-slate-350 active:translate-y-[2px] font-black text-sm font-kids py-2.5 rounded-2xl mt-3 transition-all flex items-center justify-center gap-1.5 shadow-sm">
              🔑 เข้าเล่นแบบบุคคลทั่วไป (Guest Mode)
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeAnimDialogue = selectedLesson.dialogueTopics?.[activeAnimTopicIdx]?.dialogue || selectedLesson.dialogue;
  const activeRoleplayDialogue = selectedLesson.dialogueTopics?.[activeRoleplayTopicIdx]?.dialogue || selectedLesson.dialogue;

  return (
    <div className="min-h-screen bg-[#f3f9fc] py-2 px-2 sm:py-4 sm:px-4 md:px-8 relative overflow-hidden select-none pb-20 md:pb-6">
      
      {/* Decorative clouds in deep background */}
      <div className="absolute top-16 left-6 text-6xl opacity-20 pointer-events-none animate-float-slow hidden md:block">☁️</div>
      <div className="absolute top-32 right-12 text-7xl opacity-20 pointer-events-none animate-float hidden md:block">☁️</div>

      {/* Confetti Overlay */}
      <Confetti active={confettiActive} onComplete={() => setConfettiActive(false)} />

      {/* Mobile Sticky Bottom Navigation Bar - Superb Mobile UX Upgrade */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t-2 border-slate-100 shadow-[0_-8px_24px_rgba(148,163,184,0.15)] py-2 px-3 flex justify-around items-center z-40 md:hidden rounded-t-2xl">
        {[
          { id: 'home', label: 'หน้าแรก', emoji: '🏠' },
          { id: 'knowledge', label: 'ใบความรู้', emoji: '📖' },
          { id: 'flashcards', label: 'บัตรคำ', emoji: '🎴' },
          { id: 'animation', label: 'อนิเมชัน', emoji: '🎬' },
          { id: 'roleplay', label: 'บทบาทสมมติ', emoji: '🎭' },

        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                audioSynth.playPop();
                setActiveTab(tab.id);
              }}
              className={`flex flex-col items-center gap-0.5 transition-all ${
                isActive ? 'text-sky-500 scale-105 font-black' : 'text-slate-500 font-bold'
              }`}
            >
              <span className="text-xl">{tab.emoji}</span>
              <span className="text-[8px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mockup Outer Frame wrapper - Tighter padding/border on Mobile */}
      <div className="max-w-[1240px] mx-auto bg-white rounded-3xl md:rounded-[32px] shadow-[0_12px_40px_rgba(203,213,225,0.4)] border-4 md:border-8 border-white p-3 md:p-6 relative">
        
        {/* HEADER BAR - EXACT MATCH (Responsive compact) */}
        <header className="flex flex-row justify-between items-center pb-3 mb-4 border-b border-slate-100 gap-2">
          
          {/* Logo with Clock Tower Icon */}
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => { audioSynth.playPop(); setActiveTab('home'); }}>
            {/* SVG Clock Tower similar to Trang clock tower */}
            <div className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 64 64" className="w-full h-full text-sky-500 fill-current">
                <rect x="22" y="10" width="20" height="44" rx="2" fill="#bae6fd" stroke="#0284c7" strokeWidth="2" />
                <rect x="25" y="16" width="14" height="14" rx="7" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
                {/* Clock hands */}
                <path d="M 32 23 L 32 20 M 32 23 L 35 23" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
                <polygon points="32,2 20,10 44,10" fill="#fca5a5" stroke="#e11d48" strokeWidth="2" />
                {/* Windows */}
                <rect x="28" y="36" width="8" height="14" rx="4" fill="#60a5fa" stroke="#0284c7" strokeWidth="1.5" />
              </svg>
            </div>
            
            {/* Branding details */}
            <div className="text-left">
              <h1 className="text-lg sm:text-3xl font-black font-kids tracking-wide flex items-center gap-1 leading-none">
                <span className="text-[#0284c7]">Trang</span>{' '}
                <span className="text-[#f97316]">Kids</span>{' '}
                <span className="text-[#8b5cf6]">Speak</span>
              </h1>
              {/* Cute wavy subtitle banner */}
              <div className="bg-[#fef08a] border border-[#f59e0b] px-2 py-0.5 rounded-full mt-1 inline-block shadow-sm">
                <p className="text-[7px] sm:text-[10px] font-black text-[#b45309] tracking-wider uppercase leading-none">
                  Speak • Practice • Confident • Every Day!
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs - Hidden on Mobile */}
          <nav className="hidden md:flex flex-wrap justify-center gap-1.5 md:gap-3">
            {[
              { id: 'home', label: 'หน้าแรก', emoji: '🏠', activeBg: 'bg-[#60a5fa] text-white border-[#60a5fa]' },
              { id: 'knowledge', label: 'ใบความรู้', emoji: '📖', activeBg: 'bg-emerald-400 text-white border-emerald-400' },
              { id: 'flashcards', label: 'บัตรคำศัพท์', emoji: '🎴', activeBg: 'bg-orange-400 text-white border-orange-400' },
              { id: 'animation', label: 'สื่ออนิเมชัน', emoji: '🎬', activeBg: 'bg-sky-400 text-white border-sky-400' },
              { id: 'roleplay', label: 'กิจกรรมบทบาทสมมติ', emoji: '🎭', activeBg: 'bg-purple-400 text-white border-purple-400' },

            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  audioSynth.playPop();
                  setActiveTab(tab.id);
                }}
                className={`px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs md:text-sm font-black transition-all flex items-center gap-1 border-2 ${
                  activeTab === tab.id
                    ? `${tab.activeBg} shadow-md scale-105`
                    : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-sky-600 border-slate-100'
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* User Profile Avatar Card + Logout Button */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="flex items-center gap-1.5 sm:gap-2.5 bg-sky-50 border border-sky-200/60 rounded-xl sm:rounded-2xl px-2 sm:px-4 py-1 cursor-pointer hover:scale-105 active:scale-95 transition select-none"
              onClick={() => { audioSynth.playPop(); setGender(gender === 'girl' ? 'boy' : 'girl'); }}
              title="คลิกเพื่อสลับรูป เด็กผู้ชาย / เด็กผู้หญิง"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center border border-sky-200 shadow-sm text-lg">
                {gender === 'girl' ? '👧' : '👦'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[10px] font-black text-slate-400 leading-none">สวัสดี {student?.name || 'น้อง'}</p>
                <p className="text-xs font-black text-sky-600 mt-1">{student?.classroom || 'ป.2'} 🌟</p>
              </div>
            </div>
            {/* Logout button */}
            <button
              onClick={() => { audioSynth.playPop(); setShowLogoutConfirm(true); }}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-500 hover:bg-rose-100 hover:text-rose-600 transition text-[10px] sm:text-xs font-black active:scale-95 shrink-0"
              title="ออกจากระบบ"
            >
              <span>🚪</span>
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </header>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[28px] shadow-2xl border-4 border-white max-w-sm w-full p-6 text-center animate-bounce-in">
              <div className="text-5xl mb-3">🚪</div>
              <h3 className="text-xl font-black text-slate-800 font-kids">ออกจากระบบ?</h3>
              <p className="text-sm font-bold text-slate-400 mt-2">
                ต้องการออกจากระบบใช่ไหมจ้า?<br/>
                <span className="text-slate-500 font-black">{student?.name}</span>
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { audioSynth.playPop(); setShowLogoutConfirm(false); }}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm border-2 border-slate-200 border-b-4 active:translate-y-[2px] transition-all"
                >
                  ยังอยู่ต่อ 😊
                </button>
                <button
                  onClick={() => {
                    audioSynth.playPop();
                    localStorage.removeItem('el_student');
                    localStorage.removeItem('trang_kids_speak_flashcard_scores');
                    localStorage.removeItem('trang_kids_speak_completed_roleplays');
                    localStorage.removeItem('trang_kids_speak_active_roleplay_steps');
                    setStudent(null);
                    setLoginId('');
                    setLoginError('');
                    setShowLogoutConfirm(false);
                    setFlashcardScores({});
                    setFlashcardTranscripts({});
                    setCompletedRoleplays({});
                    setActiveRoleplaySteps({});
                    setActiveTab('home');
                  }}
                  className="flex-1 py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-sm border-2 border-rose-600 border-b-4 active:translate-y-[2px] transition-all"
                >
                  ออกจากระบบ 🚪
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================== TABS SWITCHER ==================================== */}
        
        {/* TAB 1: HOME (Dashboard Landing) */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            
            {/* HERO BANNER SECTION - 100% VISUAL MATCH */}
            <div className="relative bg-gradient-to-r from-[#eef7fc] via-[#e2f1fc] to-[#d8eefc] rounded-[32px] p-6 md:p-8 border-4 border-white shadow-[0_8px_20px_rgba(186,230,253,0.3)] overflow-hidden flex flex-col lg:flex-row justify-between items-center">
              
              {/* Fluffy clouds backgrounds */}
              <div className="absolute top-4 left-10 text-5xl opacity-30 pointer-events-none animate-float-slow">☁️</div>
              <div className="absolute top-12 right-20 text-6xl opacity-30 pointer-events-none animate-float">☁️</div>

              {/* Banner Left Details */}
              <div className="lg:w-3/5 text-center lg:text-left z-10 space-y-4">
                
                {/* Pink Badge capsule */}
                <div className="inline-block bg-[#f43f5e]/90 text-white text-[11px] md:text-xs font-black px-4 py-1.5 rounded-full border-2 border-white shadow-md">
                  สำหรับนักเรียนชั้นประถมศึกษาปีที่ 2
                </div>
                
                <h2 className="text-3xl md:text-4xl font-black leading-tight text-[#1e293b] font-kids">
                  เว็บไซต์กิจกรรมออนไลน์<br className="hidden md:inline" />
                  เพื่อพัฒนาทักษะการพูดภาษาอังกฤษเพื่อการสื่อสาร
                </h2>
                
                <p className="text-sm md:text-base font-bold text-[#475569] leading-relaxed max-w-2xl">
                  โดยใช้กิจกรรมบทบาทสมมติ (Role-Play Communication Method) ร่วมกับเทคนิค <span className="text-[#3b82f6] font-black">PRACTICE</span>
                </p>
              </div>

              {/* Banner Right Characters Waving - Identical visual setup */}
              <div className="lg:w-2/5 flex justify-center items-center relative z-10 mt-6 lg:mt-0">
                <div className="relative flex gap-6 items-end">
                  
                  {/* Boy card illustration waving */}
                  <div className="relative flex flex-col items-center animate-float">
                    {/* Comic bubble say Hi */}
                    <div className="absolute -top-12 -left-2 bg-white text-slate-800 font-black text-xs px-3.5 py-1.5 rounded-2xl rounded-bl-none shadow border border-slate-100">
                      Hi!
                    </div>
                    <div className="w-24 h-24 rounded-2xl bg-white border border-sky-100 p-2 shadow flex items-center justify-center text-6xl">
                      👦
                    </div>
                  </div>

                  {/* Girl card illustration waving */}
                  <div className="relative flex flex-col items-center animate-float-slow">
                    {/* Comic bubble say nice to meet you */}
                    <div className="absolute -top-16 -right-6 bg-white text-slate-800 font-black text-[10px] px-3.5 py-1.5 rounded-2xl rounded-br-none shadow border border-slate-100 max-w-[100px] leading-tight">
                      Nice to meet you!
                    </div>
                    <div className="w-24 h-24 rounded-2xl bg-white border border-sky-100 p-2 shadow flex items-center justify-center text-6xl">
                      👧
                    </div>
                  </div>

                  {/* School House building icon next to kids */}
                  <div className="w-20 h-20 shrink-0 bg-white/40 border border-white/60 p-2 rounded-2xl shadow flex flex-col items-center justify-center text-4xl">
                    🏫
                    <span className="text-[8px] font-black text-sky-700 mt-1 uppercase">School</span>
                  </div>

                </div>
              </div>

            </div>

            {/* MIDDLE: 4 ELEMENTS CARDS - EXACT VISUAL MATCH */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: ใบความรู้ */}
              <div className="kids-card rounded-3xl p-5 flex flex-col justify-between items-center text-center border-t-8 border-emerald-400 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xs">1</div>
                  <h3 className="font-black text-slate-700 text-xs md:text-sm">ใบความรู้และแบบฝึกทักษะการพูด</h3>
                </div>
                <p className="text-[10px] text-slate-400 font-bold mb-4 leading-relaxed h-[36px]">เรียนรู้ศัพท์ บทสนทนา และฝึกพูดจากสถานการณ์ใกล้ตัว</p>
                
                {/* Illustration replica: Boy and girl dialog bubbles */}
                <div className="w-full h-24 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center justify-around p-2 mb-4 relative overflow-hidden">
                  <div className="flex flex-col items-center text-3xl">👦</div>
                  <div className="flex flex-col gap-1 text-[8px] font-black text-left max-w-[60px]">
                    <span className="bg-white px-1.5 py-0.5 rounded border border-slate-100">How are you?</span>
                    <span className="bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">I&apos;m fine, thank you!</span>
                  </div>
                  <div className="flex flex-col items-center text-3xl">👧</div>
                </div>

                <button
                  onClick={() => { audioSynth.playPop(); setActiveTab('knowledge'); }}
                  className="btn-3d w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-2xl border-2 border-emerald-600 shadow-emerald-300"
                >
                  เข้าเรียนรู้
                </button>
              </div>

              {/* Card 2: บัตรคำศัพท์ */}
              <div className="kids-card rounded-3xl p-5 flex flex-col justify-between items-center text-center border-t-8 border-orange-400 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-xs">2</div>
                  <h3 className="font-black text-slate-700 text-xs md:text-sm">บัตรคำศัพท์ (Speaking Flashcards)</h3>
                </div>
                <p className="text-[10px] text-slate-400 font-bold mb-4 leading-relaxed h-[36px]">ฝึกอ่านและออกเสียงคำศัพท์ก่อนเข้าสู่กิจกรรมการพูด</p>
                
                {/* Illustration replica: Apple, School, Ball Flashcards */}
                <div className="w-full h-24 bg-orange-50/50 border border-orange-100 rounded-2xl flex items-center justify-center gap-1.5 p-2 mb-4 relative overflow-hidden">
                  {/* Apple Card */}
                  <div className="bg-white border border-slate-150 p-1.5 rounded-lg flex flex-col items-center shadow-sm">
                    <span className="text-xl">🍎</span>
                    <span className="text-[8px] font-black mt-1">apple</span>
                    <span className="text-[6px] text-slate-400 font-extrabold mt-0.5">แอปเปิ้ล</span>
                  </div>
                  {/* School Card */}
                  <div className="bg-white border border-slate-150 p-1.5 rounded-lg flex flex-col items-center shadow-sm">
                    <span className="text-xl">🏫</span>
                    <span className="text-[8px] font-black mt-1">school</span>
                    <span className="text-[6px] text-slate-400 font-extrabold mt-0.5">สคูล</span>
                  </div>
                  {/* Ball Card */}
                  <div className="bg-white border border-slate-150 p-1.5 rounded-lg flex flex-col items-center shadow-sm">
                    <span className="text-xl">⚽</span>
                    <span className="text-[8px] font-black mt-1">ball</span>
                    <span className="text-[6px] text-slate-400 font-extrabold mt-0.5">บอล</span>
                  </div>
                </div>

                <button
                  onClick={() => { audioSynth.playPop(); setActiveTab('flashcards'); }}
                  className="btn-3d w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-2xl border-2 border-orange-600 shadow-orange-300"
                >
                  ฝึกคำศัพท์
                </button>
              </div>

              {/* Card 3: สื่ออนิเมชัน */}
              <div className="kids-card rounded-3xl p-5 flex flex-col justify-between items-center text-center border-t-8 border-sky-400 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center font-black text-xs">3</div>
                  <h3 className="font-black text-slate-700 text-xs md:text-sm">สื่ออนิเมชันบทสนทนา</h3>
                </div>
                <p className="text-[10px] text-slate-400 font-bold mb-4 leading-relaxed h-[36px]">คลิปอนิเมชันบทสนทนาสั้น ๆ พร้อมเสียงสนทนาและคำบรรยาย</p>
                
                {/* Illustration replica: Cartoon video player */}
                <div className="w-full h-24 bg-sky-50/50 border border-sky-100 rounded-2xl flex flex-col justify-between p-1 mb-4 relative overflow-hidden">
                  <div className="flex-1 w-full bg-slate-900 rounded-xl relative flex items-center justify-center text-white text-lg">
                    <span className="bg-white/20 p-2.5 rounded-full backdrop-blur-sm border border-white/20 text-xs">▶️</span>
                    {/* Subtitle simulation inside the player */}
                    <div className="absolute bottom-1 bg-black/60 text-[6px] text-white px-2 py-0.5 rounded font-black max-w-[90%] truncate">
                      Nice to meet you, too.
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => { audioSynth.playPop(); setActiveTab('animation'); }}
                  className="btn-3d w-full py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-black rounded-2xl border-2 border-sky-600 shadow-sky-300"
                >
                  รับชมสื่อ
                </button>
              </div>

              {/* Card 4: กิจกรรมบทบาทสมมติ */}
              <div className="kids-card rounded-3xl p-5 flex flex-col justify-between items-center text-center border-t-8 border-purple-400 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center font-black text-xs">4</div>
                  <h3 className="font-black text-slate-700 text-xs md:text-sm">กิจกรรมบทบาทสมมติ (Role-Play Activity)</h3>
                </div>
                <p className="text-[10px] text-slate-400 font-bold mb-2 leading-relaxed h-[36px]">ฝึกพูดจากสถานการณ์จริง เป็นคู่หรือรายบุคคล</p>
                
                {/* Progress Badge */}
                <div className="bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-black px-3 py-1 rounded-full mb-3 inline-block shadow-sm">
                  ผ่านแล้ว: {Object.values(completedRoleplays).filter(val => val === true).length} / {LESSONS.length} บทเรียน 🏆
                </div>

                {/* Illustration replica: Role play bubbles */}
                <div className="w-full h-24 bg-purple-50/50 border border-purple-100 rounded-2xl flex items-center justify-around p-2 mb-4 relative overflow-hidden">
                  <div className="flex flex-col items-center text-3xl">👦</div>
                  <div className="flex flex-col gap-1 text-[7px] font-black text-left max-w-[65px] leading-tight">
                    <span className="bg-white px-1 py-0.5 rounded border border-slate-100">What&apos;s your favorite color?</span>
                    <span className="bg-purple-100 px-1 py-0.5 rounded border border-purple-200">My favorite color is blue.</span>
                  </div>
                  <div className="flex flex-col items-center text-3xl">👧</div>
                </div>

                <button
                  onClick={() => { audioSynth.playPop(); setActiveTab('roleplay'); }}
                  className="btn-3d w-full py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs font-black rounded-2xl border-2 border-purple-600 shadow-purple-300"
                >
                  ทำกิจกรรม
                </button>
              </div>



            </div>

            {/* BOTTOM SECTION LAYOUT - EXACT REPLICA */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* COLUMN 1: วันนี้ฝึกพูด */}
              <div className="lg:col-span-4 kids-card rounded-3xl p-5 flex flex-col justify-between text-left bg-white relative">
                <div>
                  <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">วันนี้ฝึกพูด</h3>
                  
                  {/* Status tag */}
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full mb-3 inline-block">
                    สถานการณ์
                  </span>
                  
                  <div className="space-y-2 mt-2">
                    <p className="font-black text-slate-800 text-base">การแนะนำตนเอง</p>
                    <p className="text-xs font-extrabold text-slate-400 mt-0.5">(Introducing Oneself)</p>
                    <blockquote className="text-sky-600 font-black text-sm italic mt-2">
                      &ldquo;Hello! What&apos;s your name?&rdquo;
                    </blockquote>
                  </div>
                </div>

                {/* Cartoon Character boy mini waving */}
                <div className="flex justify-center my-3 relative h-16">
                  <span className="text-5xl animate-bounce-gentle absolute bottom-0">👦👋</span>
                </div>

                <button
                  onClick={() => {
                    audioSynth.playPop();
                    setSelectedLesson(LESSONS[0]);
                    setActiveTab('roleplay');
                  }}
                  className="btn-3d w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-black rounded-2xl border-2 border-blue-600 shadow-blue-300 mt-2"
                >
                  เริ่มฝึกเลย
                </button>
              </div>

              {/* COLUMN 2: เทคนิค PRACTICE - EXACT DETAILS */}
              <div className="lg:col-span-4 kids-card rounded-3xl p-5 bg-white text-left">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">เทคนิค PRACTICE</h3>
                  <button 
                    onClick={() => { audioSynth.playPop(); setIsPracticeExpanded(!isPracticeExpanded); }}
                    className="text-[10px] font-black text-sky-500 lg:hidden hover:underline"
                  >
                    {isPracticeExpanded ? 'ย่อ 🔼' : 'ขยาย 🔽'}
                  </button>
                </div>
                
                <div className={`space-y-2.5 text-[10px] font-black ${isPracticeExpanded ? 'block' : 'hidden lg:block'}`}>
                  {[
                    { c: 'bg-orange-500', l: 'P', t: 'Prepare', d: 'เตรียมตัว - อ่านออกเสียง ฝึกคำศัพท์' },
                    { c: 'bg-blue-500', l: 'R', t: 'Role-play', d: 'สวมบทบาท - จำลองสถานการณ์' },
                    { c: 'bg-red-500', l: 'A', t: 'Act & Speak', d: 'แสดงพฤติกรรม และพูดคุย' },
                    { c: 'bg-emerald-500', l: 'C', t: 'Correct', d: 'ตรวจสอบความถูกต้อง' },
                    { c: 'bg-purple-500', l: 'T', t: 'Try Again', d: 'ลองใหม่ - ฝึกฝนซ้ำๆ' },
                    { c: 'bg-teal-500', l: 'I', t: 'Improve', d: 'พัฒนาทักษะอย่างต่อเนื่อง' },
                    { c: 'bg-pink-500', l: 'C', t: 'Confident', d: 'มั่นใจ - กล้าแสดงออก' },
                    { c: 'bg-[#ec4899]', l: 'E', t: 'Enjoy', d: 'สนุกกับการเรียนรู้' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className={`w-5 h-5 rounded-full ${item.c} text-white flex items-center justify-center font-extrabold shrink-0 text-[10px]`}>
                        {item.l}
                      </span>
                      <div className="leading-tight">
                        <span className="text-slate-800 text-[10px] mr-1.5">{item.t}</span>
                        <span className="text-slate-400 font-extrabold text-[9px]">{item.d}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {!isPracticeExpanded && (
                  <button
                    onClick={() => { audioSynth.playPop(); setIsPracticeExpanded(true); }}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-[#475569] text-[10px] font-black rounded-xl border border-slate-200 block lg:hidden text-center transition active:scale-95"
                  >
                    💡 ดูเทคนิคฝึกพูดสุดเก่ง (PRACTICE)
                  </button>
                )}
              </div>

              {/* COLUMN 3: แนะนำสื่อสำหรับคุณ */}
              <div className="lg:col-span-4 kids-card rounded-3xl p-5 bg-white text-left flex flex-col justify-between">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">แนะนำสื่อสำหรับคุณ</h3>
                  <span className="text-[10px] font-black text-slate-400 cursor-pointer hover:text-sky-500">ดูทั้งหมด &gt;</span>
                </div>
                
                <div className="space-y-3">
                  {[
                    { title: 'My Family', desc: 'บทสนทนา : ครอบครัว', emoji: '👨‍👩‍👧‍👦', color: 'bg-orange-50 border-orange-100', lessonIdx: 1 },
                    { title: 'Colors Around Me', desc: 'บทสนทนา : สี', emoji: '🎨', color: 'bg-purple-50 border-purple-100', lessonIdx: 3 },
                    { title: 'My Toys', desc: 'บทสนทนา : ของเล่น', emoji: '🧸', color: 'bg-pink-50 border-pink-100', lessonIdx: 4 },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        audioSynth.playPop();
                        setSelectedLesson(LESSONS[item.lessonIdx]);
                        setActiveTab('knowledge');
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border ${item.color} cursor-pointer hover:scale-[1.02] transition shadow-sm`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl bg-white p-1 rounded-xl shadow-sm border border-slate-50">{item.emoji}</div>
                        <div className="text-left leading-tight">
                          <p className="text-xs font-black text-slate-800">{item.title}</p>
                          <p className="text-[9px] font-extrabold text-slate-400">{item.desc}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-white p-1 rounded-full border border-slate-100 shadow-sm">▶️</span>
                    </div>
                  ))}
                </div>
                
                {/* Dots indicator at bottom */}
                <div className="flex justify-center gap-1 mt-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: KNOWLEDGE SHEETS (ใบความรู้) */}
        {activeTab === 'knowledge' && (
          <div className="kids-card rounded-3xl p-4 md:p-8 bg-white text-left animate-fade-in">
            <style dangerouslySetInnerHTML={{ __html: `
              .bookshelf-wood {
                background: linear-gradient(to bottom, #d97706 0%, #b45309 100%);
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06),
                            0 10px 15px -3px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.3);
              }
              .bookshelf-shadow {
                background: linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 100%);
              }
              .book-3d {
                position: relative;
                transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.4s ease;
                transform-style: preserve-3d;
                perspective: 600px;
              }
              .book-3d:hover {
                transform: perspective(600px) rotateY(-18deg) translateZ(12px) scale(1.03);
                box-shadow: 15px 15px 30px rgba(0,0,0,0.25);
              }
              .book-3d-spine {
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 14px;
                background: rgba(0,0,0,0.2);
                border-radius: 4px 0 0 4px;
                box-shadow: inset -1px 0 0 rgba(255,255,255,0.1), inset 1px 0 2px rgba(255,255,255,0.1);
              }
              .book-3d-pages {
                position: absolute;
                right: 2px;
                top: 3px;
                bottom: 3px;
                width: 6px;
                background: #f8fafc;
                border-radius: 0 4px 4px 0;
                box-shadow: inset 1px 0 2px rgba(0,0,0,0.1);
              }
              .iframe-tablet {
                border: 8px solid #1e293b;
                border-radius: 20px;
                box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.25);
                background: #1e293b;
              }
              @media (min-width: 768px) {
                .iframe-tablet {
                  border: 16px solid #1e293b;
                  border-radius: 32px;
                  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
                }
              }
              .reading-desk {
                background-color: #f8fafc;
                background-image: radial-gradient(#cbd5e1 1px, transparent 0);
                background-size: 24px 24px;
                border: 2px solid #e2e8f0;
              }
            ` }} />

            {!isReaderOpen ? (
              // BOOKSHELF MODE
              <div className="animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-2xl font-black text-sky-600 font-kids flex items-center gap-2">
                      <span>📚</span> ชั้นหนังสือใบความรู้ e-Book (Knowledge Shelf)
                    </h2>
                    <p className="text-xs font-extrabold text-slate-400 mt-1">เลือกยูนิตที่ต้องการเพื่อเปิดอ่านหนังสือเรียนภาษาอังกฤษแสนสนุกของน้องๆ</p>
                  </div>
                  <span className="text-[10px] md:hidden font-black text-amber-500 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full animate-pulse">
                    👉 เลื่อน ซ้าย-ขวา เพื่อดูเล่มอื่น
                  </span>
                </div>

                {/* virtual shelf - scroll horizontally on mobile to keep all books aligned on the wood plank */}
                <div className="relative bg-gradient-to-b from-sky-50/50 to-white border-2 border-slate-200/60 rounded-3xl p-4 md:p-10 pt-16 mb-6 min-h-[360px] md:min-h-[420px] flex flex-col justify-end overflow-hidden shadow-inner">
                  {/* shelf backdrop lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:100%_40px] pointer-events-none" />

                  {/* Books flex row */}
                  <div className="flex overflow-x-auto md:overflow-visible gap-8 justify-start md:justify-center items-end relative z-10 pb-8 px-6 md:px-10 scrollbar-none snap-x snap-mandatory">
                    {LESSONS.map((lesson, idx) => {
                      const colors = [
                        'from-sky-400 to-sky-600 border-sky-500 hover:from-sky-350 hover:to-sky-550',
                        'from-emerald-400 to-emerald-600 border-emerald-500 hover:from-emerald-350 hover:to-emerald-550',
                        'from-pink-400 to-pink-600 border-pink-500 hover:from-pink-350 hover:to-pink-550',
                        'from-amber-400 to-amber-600 border-amber-500 hover:from-amber-350 hover:to-amber-550',
                        'from-purple-400 to-purple-600 border-purple-500 hover:from-purple-350 hover:to-purple-550',
                      ];
                      const coverColor = colors[idx % colors.length];

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => {
                            audioSynth.playPop();
                            setSelectedLesson(lesson);
                            setReaderPage(1);
                            setIsReaderOpen(true);
                          }}
                          className="flex flex-col items-center group cursor-pointer snap-center shrink-0"
                        >
                          {/* 3D Book Cover */}
                          <div className={`book-3d w-28 h-40 md:w-32 md:h-44 bg-gradient-to-br ${coverColor} border-t-2 border-r-2 rounded-r-xl shadow-md flex flex-col justify-between p-3 text-white`}>
                            <div className="book-3d-spine" />
                            <div className="book-3d-pages" />
                            
                            {/* Unit tag & Emoji */}
                            <div className="flex justify-between items-start pl-3">
                              <span className="text-[10px] font-black bg-white/20 px-1.5 py-0.5 rounded-md">
                                Unit {lesson.id}
                              </span>
                              <span className="text-xl md:text-2xl animate-bounce-gentle">{lesson.emoji}</span>
                            </div>
                            
                            {/* Title */}
                            <div className="pl-3 pb-2 text-left">
                              <h4 className="text-xs md:text-sm font-black leading-tight line-clamp-2 drop-shadow-sm font-kids">
                                {lesson.title}
                              </h4>
                              <p className="text-[8px] font-extrabold text-white/80 mt-1 uppercase tracking-wider">
                                English
                              </p>
                            </div>
                          </div>

                          {/* Info under shelf */}
                          <div className="mt-4 text-center max-w-[120px] z-20">
                            <p className="text-[11px] font-black text-slate-700 leading-tight group-hover:text-sky-600 transition">
                              ยูนิต {lesson.id}: {lesson.title}
                            </p>
                            <span className="text-[9px] font-black text-slate-400 bg-slate-100 border border-slate-200/50 rounded-full px-2 py-0.5 mt-1 inline-block">
                              {lesson.vocab.length} คำศัพท์
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bookshelf wood board */}
                  <div className="absolute bottom-20 left-0 right-0 z-0 flex flex-col items-center pointer-events-none">
                    <div className="bookshelf-wood h-5 w-[106%] rounded-lg shadow-lg relative border-b border-amber-950/20" />
                    <div className="w-[102%] h-3 bg-amber-800 rounded-b-lg shadow-inner opacity-90" />
                    <div className="bookshelf-shadow h-8 w-[104%] mt-1 opacity-50" />
                  </div>
                </div>
              </div>
            ) : (
              // READER MODE (FULL-WIDTH E-BOOK WITH PAGE FLIPPING)
              <div className="animate-fade-in">
                {/* Header controls */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { audioSynth.playPop(); setIsReaderOpen(false); }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl border-2 border-slate-200 shadow-sm transition active:scale-95 flex items-center gap-1.5"
                    >
                      🚪 กลับไปที่ชั้นหนังสือ
                    </button>
                    <div>
                      <h3 className="text-base font-black text-slate-800">
                        📖 กำลังอ่าน: ยูนิต {selectedLesson.id}
                      </h3>
                      <p className="text-[10px] font-extrabold text-slate-400">{selectedLesson.title}</p>
                    </div>
                  </div>

                  {/* Quick Lesson switcher */}
                  <div className="flex items-center gap-2">
                    <button
                      disabled={selectedLesson.id === 1}
                      onClick={() => {
                        const prevLesson = LESSONS.find(l => l.id === selectedLesson.id - 1);
                        if (prevLesson) {
                          audioSynth.playPop();
                          setSelectedLesson(prevLesson);
                          setReaderPage(1);
                        }
                      }}
                      className={`p-2 rounded-xl text-xs font-black border-2 transition ${
                        selectedLesson.id === 1
                          ? 'opacity-40 pointer-events-none bg-slate-50 text-slate-400 border-slate-200'
                          : 'bg-white hover:bg-sky-50 text-sky-600 border-sky-100'
                      }`}
                    >
                      ◀ ยูนิตก่อนหน้า
                    </button>
                    
                    <span className="text-xs font-black text-slate-500 px-3 py-1 bg-slate-100 rounded-lg">
                      {selectedLesson.id} / {LESSONS.length}
                    </span>

                    <button
                      disabled={selectedLesson.id === LESSONS.length}
                      onClick={() => {
                        const nextLesson = LESSONS.find(l => l.id === selectedLesson.id + 1);
                        if (nextLesson) {
                          audioSynth.playPop();
                          setSelectedLesson(nextLesson);
                          setReaderPage(1);
                        }
                      }}
                      className={`p-2 rounded-xl text-xs font-black border-2 transition ${
                        selectedLesson.id === LESSONS.length
                          ? 'opacity-40 pointer-events-none bg-slate-50 text-slate-400 border-slate-200'
                          : 'bg-white hover:bg-sky-50 text-sky-600 border-sky-100'
                      }`}
                    >
                      ยูนิตถัดไป ▶
                    </button>
                  </div>
                </div>

                {/* Single Page Reader Workspace */}
                {(() => {
                  const UNIT_PAGE_COUNTS: Record<number, number> = { 1: 5, 2: 3, 3: 4, 4: 3, 5: 3 };
                  const totalPages = UNIT_PAGE_COUNTS[selectedLesson.id] || 3;

                  return (
                    <div className="relative reading-desk p-2 md:p-8 rounded-3xl flex flex-col items-center">
                      
                      {/* Keyboard Tip banner */}
                      <div className="absolute top-2 text-[9px] font-black text-slate-400 tracking-wider bg-white/60 px-2 py-0.5 rounded-full border border-slate-100/50 hidden md:block">
                        💡 กดปุ่มลูกศร ซ้าย-ขวา (← →) บนคีย์บอร์ดเพื่อเปลี่ยนหน้าได้นะจ๊ะ
                      </div>

                      {/* Main Ebook Viewer Layout */}
                      <div className="relative w-full max-w-2xl flex items-center justify-center gap-4 py-2 md:py-4">
                        
                        {/* Page turning arrow buttons (Desktop Left) */}
                        <button
                          disabled={readerPage === 1}
                          onClick={() => {
                            audioSynth.playPop();
                            setReaderPage(p => Math.max(1, p - 1));
                          }}
                          className={`hidden md:flex absolute -left-16 w-12 h-12 bg-white hover:bg-emerald-50 text-emerald-600 rounded-full border-2 border-slate-200 hover:border-emerald-300 items-center justify-center text-lg shadow-md transition-all active:scale-90 select-none ${
                            readerPage === 1 ? 'opacity-30 pointer-events-none' : 'hover:scale-105'
                          }`}
                          title="หน้าก่อนหน้า"
                        >
                          ◀
                        </button>

                        {/* Tablet Device Frame holding converted JPEG page */}
                        <div className="iframe-tablet p-1 md:p-2 w-full">
                          <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-inner flex items-center justify-center min-h-[300px]">
                            <img
                              key={`${selectedLesson.id}_${readerPage}`}
                              src={`/docs/unit${selectedLesson.id}_page_${readerPage}.jpg`}
                              className="w-full h-auto max-h-[60vh] md:max-h-[700px] object-contain mx-auto select-none rounded-lg md:rounded-xl shadow-sm"
                              alt={`Unit ${selectedLesson.id} Page ${readerPage}`}
                            />
                          </div>
                          {/* Home Button */}
                          <div className="flex justify-center pt-2">
                            <button
                              onClick={() => { audioSynth.playPop(); setIsReaderOpen(false); }}
                              className="w-8 h-8 rounded-full border-2 border-slate-600 bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 active:scale-95 transition shadow hover:border-slate-500"
                              title="กลับชั้นหนังสือ"
                            >
                              ⚪
                            </button>
                          </div>
                        </div>

                        {/* Page turning arrow buttons (Desktop Right) */}
                        <button
                          disabled={readerPage === totalPages}
                          onClick={() => {
                            audioSynth.playPop();
                            setReaderPage(p => Math.min(totalPages, p + 1));
                          }}
                          className={`hidden md:flex absolute -right-16 w-12 h-12 bg-white hover:bg-emerald-50 text-emerald-600 rounded-full border-2 border-slate-200 hover:border-emerald-300 items-center justify-center text-lg shadow-md transition-all active:scale-90 select-none ${
                            readerPage === totalPages ? 'opacity-30 pointer-events-none' : 'hover:scale-105'
                          }`}
                          title="หน้าถัดไป"
                        >
                          ▶
                        </button>
                      </div>

                      {/* Mobile Page Controls (Visible under the reader frame) */}
                      <div className="flex items-center justify-between w-full max-w-xs md:hidden mt-3 gap-2">
                        <button
                          disabled={readerPage === 1}
                          onClick={() => {
                            audioSynth.playPop();
                            setReaderPage(p => Math.max(1, p - 1));
                          }}
                          className={`px-3 py-1.5 bg-white text-slate-700 font-black rounded-lg border border-slate-200 text-xs shadow-sm active:scale-90 ${
                            readerPage === 1 ? 'opacity-40 pointer-events-none' : ''
                          }`}
                        >
                          ◀ ย้อนกลับ
                        </button>
                        
                        <span className="text-xs font-black text-slate-600 bg-white border border-slate-100 rounded-lg px-2.5 py-1">
                          หน้า {readerPage} / {totalPages}
                        </span>

                        <button
                          disabled={readerPage === totalPages}
                          onClick={() => {
                            audioSynth.playPop();
                            setReaderPage(p => Math.min(totalPages, p + 1));
                          }}
                          className={`px-3 py-1.5 bg-white text-slate-700 font-black rounded-lg border border-slate-200 text-xs shadow-sm active:scale-90 ${
                            readerPage === totalPages ? 'opacity-40 pointer-events-none' : ''
                          }`}
                        >
                          ถัดไป ▶
                        </button>
                      </div>

                      {/* Dots & Progress Bar Section */}
                      <div className="w-full max-w-sm flex flex-col gap-2 mt-4 text-center">
                        {/* Page Dots Indicator */}
                        <div className="flex justify-center gap-1.5">
                          {Array.from({ length: totalPages }).map((_, pageIdx) => (
                            <button
                              key={pageIdx}
                              onClick={() => { audioSynth.playPop(); setReaderPage(pageIdx + 1); }}
                              className={`w-3 h-3 rounded-full transition-all border-2 ${
                                readerPage === pageIdx + 1
                                  ? 'bg-emerald-400 border-emerald-400 scale-110 shadow-sm'
                                  : 'bg-slate-200 border-transparent hover:bg-slate-350'
                              }`}
                              title={`หน้า ${pageIdx + 1}`}
                            />
                          ))}
                        </div>

                        {/* Page Label */}
                        <span className="text-xs font-black text-slate-400 hidden md:inline">
                          หน้า {readerPage} จากทั้งหมด {totalPages} หน้า
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SPEAKING FLASHCARDS (บัตรคำศัพท์) */}
        {activeTab === 'flashcards' && (
          <div className="kids-card rounded-3xl p-6 md:p-8 bg-white text-left">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl font-black text-orange-500 font-kids flex items-center gap-2">
                  <span>🍎</span> บัตรคำศัพท์อัจฉริยะ (Speaking Flashcards)
                </h2>
                <p className="text-xs font-extrabold text-slate-400 mt-1">คลิกที่บัตรเพื่อพลิกดูคำศัพท์ภาษาอังกฤษ คำอ่าน และความหมาย พร้อมช่องฝึกประเมินเสียงสดๆ!</p>
              </div>

              {/* Select Lesson dropdown */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full -mx-2 px-2 snap-x snap-mandatory">
                {LESSONS.map(lesson => {
                  const vocabProg = getVocabProgress(lesson);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => { audioSynth.playPop(); setSelectedLesson(lesson); }}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border-2 shrink-0 snap-start flex items-center gap-1.5 ${
                        selectedLesson.id === lesson.id
                          ? 'bg-orange-400 text-white border-orange-400 shadow-orange-200'
                          : 'bg-white text-slate-700 hover:bg-orange-50 border-slate-200'
                      }`}
                    >
                      <span>{lesson.emoji} {lesson.title.slice(0, 4)}...</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${
                        selectedLesson.id === lesson.id ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600 border border-orange-100'
                      }`}>{vocabProg}%</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop Flashcards Deck Grid - Hidden on Mobile */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-6">
              {selectedLesson.vocab.map((v, i) => {
                const cardKey = `${selectedLesson.id}-${i}`;
                const isFlipped = flippedCards[cardKey] || false;
                const scoreVal = flashcardScores[cardKey];
                const isMicActive = activeCardMic === cardKey;

                return (
                  <div
                    key={i}
                    className={`h-[280px] w-full cursor-pointer flip-card ${isFlipped ? 'flipped' : ''}`}
                    onClick={() => {
                      if (!isMicActive) {
                        audioSynth.playPop();
                        setFlippedCards(isFlipped ? {} : { [cardKey]: true });
                      }
                    }}
                  >
                    <div className="flip-card-inner relative w-full h-full">
                      
                      {/* FRONT CARD */}
                      <div className="flip-card-front absolute w-full h-full flex flex-col justify-between p-5 items-center border-4 border-orange-200 rounded-3xl shadow-md bg-white">
                        <div className="w-full flex justify-between items-center">
                          <span className="text-[10px] font-black text-orange-400 self-start uppercase tracking-wider">Flashcard Front 🧭</span>
                          {/* Status badge visible on front */}
                          {scoreVal !== undefined ? (
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                              scoreVal >= 80
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                                : 'bg-rose-100 text-rose-700 border-rose-300'
                            }`}>
                              {scoreVal >= 80 ? '✅ ผ่าน' : `🔄 ${scoreVal}%`}
                            </span>
                          ) : (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full border bg-slate-100 text-slate-400 border-slate-200">
                              🎤 ยังไม่ได้พูด
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-6xl animate-bounce-gentle">{v.emoji}</span>
                          <h3 className="text-2xl font-black text-slate-800 mt-2">{v.word}</h3>
                          <p className="text-xs font-extrabold text-slate-400">คำอ่าน: {v.phonetic}</p>
                        </div>

                        <div className="w-full flex justify-between items-center border-t border-slate-100 pt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              speakText(v.word, true);
                            }}
                            className="p-2 bg-sky-100 text-sky-600 rounded-xl hover:bg-sky-200 transition text-sm font-black active:scale-95"
                          >
                            🔊 ฟังเสียง
                          </button>
                          <span className="text-xs font-bold text-slate-400">คลิกเพื่อพลิก 🔄</span>
                        </div>
                      </div>

                      {/* BACK CARD */}
                      <div className="flip-card-back absolute w-full h-full flex flex-col justify-between p-5 items-center border-4 border-yellow-400 rounded-3xl shadow-md bg-yellow-50 text-slate-800">
                        <span className="text-[10px] font-black text-amber-500 self-start uppercase tracking-wider">Flashcard Back 🍎</span>
                        
                        <div className="flex flex-col items-center gap-1">
                          <p className="text-xs font-extrabold text-slate-400">ความหมายภาษาไทย</p>
                          <h4 className="text-2xl font-black text-emerald-600 my-1">{v.translation}</h4>
                          <p className="text-[10px] text-slate-400 font-extrabold italic">ออกเสียง: &ldquo;{v.word}&rdquo;</p>
                          
                          {flashcardTranscripts[cardKey] && (
                            <div className="mt-1 text-center space-y-0.5">
                              <p className="text-[10px] font-extrabold text-slate-500 leading-normal">
                                เสียงที่ระบบได้ยิน: <span className="text-sky-600 font-black italic bg-sky-50 border border-sky-100 rounded px-1.5 py-0.5">&ldquo;{flashcardTranscripts[cardKey]}&rdquo;</span>
                              </p>
                              <p className="text-[10px] font-black text-emerald-600">
                                ตรงกับคำศัพท์: <span className="bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5">{computeEnglishWordDiff(v.word, flashcardTranscripts[cardKey]).filter(d => d.isMatched).length} / {computeEnglishWordDiff(v.word, flashcardTranscripts[cardKey]).length} คำ</span>
                              </p>
                            </div>
                          )}

                          {scoreVal !== undefined && (
                            <div className={`mt-2 px-3 py-1 rounded-full text-xs font-black border-2 ${
                              scoreVal >= 80 ? 'bg-emerald-100 text-emerald-700 border-emerald-300 animate-bounce' : 'bg-rose-100 text-rose-700 border-rose-300'
                            }`}>
                              คะแนน: {scoreVal}% {scoreVal >= 80 ? '⭐ Passed' : 'Try again'}
                            </div>
                          )}
                        </div>

                        <div className="w-full flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              recordFlashcard(v.word, cardKey);
                            }}
                            disabled={isMicActive}
                            className={`btn-3d w-full py-2 flex items-center justify-center gap-1.5 text-xs font-black rounded-xl border-2 transition ${
                              isMicActive
                                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                                : 'bg-emerald-400 hover:bg-emerald-500 text-white border-emerald-500 shadow-emerald-400'
                            }`}
                          >
                            <span>{isMicActive ? '⏹️ กำลังอัด' : '🎙️ ฝึกออกเสียง'}</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Single-Card Slider View - Hidden on Desktop */}
            <div className="block lg:hidden max-w-[340px] mx-auto">
              {(() => {
                const i = activeFlashcardIndex;
                const v = selectedLesson.vocab[i] || selectedLesson.vocab[0];
                if (!v) return null;

                const cardKey = `${selectedLesson.id}-${i}`;
                const isFlipped = flippedCards[cardKey] || false;
                const scoreVal = flashcardScores[cardKey];
                const isMicActive = activeCardMic === cardKey;

                return (
                  <div className="space-y-6">
                    <div
                      className={`h-[300px] w-full cursor-pointer flip-card ${isFlipped ? 'flipped' : ''}`}
                      onClick={() => {
                        if (!isMicActive) {
                          audioSynth.playPop();
                          setFlippedCards(isFlipped ? {} : { [cardKey]: true });
                        }
                      }}
                    >
                      <div className="flip-card-inner relative w-full h-full">
                        
                        {/* FRONT */}
                        <div className="flip-card-front absolute w-full h-full flex flex-col justify-between p-5 items-center border-4 border-orange-200 rounded-3xl shadow-md bg-white">
                          <div className="w-full flex justify-between items-center">
                            <span className="text-[10px] font-black text-orange-400 uppercase tracking-wider">บัตรคำศัพท์ ด้านหน้า 🧭</span>
                            {/* Status badge visible on front */}
                            {scoreVal !== undefined ? (
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                scoreVal >= 80
                                  ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                                  : 'bg-rose-100 text-rose-700 border-rose-300'
                              }`}>
                                {scoreVal >= 80 ? '✅ ผ่าน' : `🔄 ${scoreVal}%`}
                              </span>
                            ) : (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full border bg-slate-100 text-slate-400 border-slate-200">
                                🎤 ยังไม่ได้พูด
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-7xl animate-bounce-gentle">{v.emoji}</span>
                            <h3 className="text-3xl font-black text-slate-800 mt-2">{v.word}</h3>
                            <p className="text-sm font-extrabold text-slate-400">คำอ่าน: {v.phonetic}</p>
                          </div>

                          <div className="w-full flex justify-between items-center border-t border-slate-100 pt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                speakText(v.word, true);
                              }}
                              className="px-3.5 py-2 bg-sky-100 text-sky-600 rounded-xl hover:bg-sky-200 transition text-xs font-black active:scale-95 border border-sky-200"
                            >
                              🔊 ฟังเสียง
                            </button>
                            <span className="text-xs font-bold text-slate-400">คลิกเพื่อดูคำแปล 🔄</span>
                          </div>
                        </div>

                        {/* BACK */}
                        <div className="flip-card-back absolute w-full h-full flex flex-col justify-between p-5 items-center border-4 border-yellow-400 rounded-3xl shadow-md bg-yellow-50 text-slate-800">
                          <span className="text-[10px] font-black text-amber-500 self-start uppercase tracking-wider">บัตรคำศัพท์ ด้านหลัง 🍎</span>
                          
                          <div className="flex flex-col items-center gap-1">
                            <p className="text-xs font-extrabold text-slate-400">ความหมายภาษาไทย</p>
                            <h4 className="text-2xl font-black text-emerald-600 my-1">{v.translation}</h4>
                            <p className="text-[10px] text-slate-400 font-extrabold italic">ออกเสียงตาม: &ldquo;{v.word}&rdquo;</p>
                            
                            {flashcardTranscripts[cardKey] && (
                              <div className="mt-1 text-center space-y-0.5">
                                <p className="text-[10px] font-extrabold text-slate-500 leading-normal">
                                  เสียงที่ระบบได้ยิน: <span className="text-sky-600 font-black italic bg-sky-50 border border-sky-100 rounded px-1.5 py-0.5">&ldquo;{flashcardTranscripts[cardKey]}&rdquo;</span>
                                </p>
                                <p className="text-[10px] font-black text-emerald-600">
                                  ตรงกับคำศัพท์: <span className="bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5">{computeEnglishWordDiff(v.word, flashcardTranscripts[cardKey]).filter(d => d.isMatched).length} / {computeEnglishWordDiff(v.word, flashcardTranscripts[cardKey]).length} คำ</span>
                                </p>
                              </div>
                            )}

                            {scoreVal !== undefined && (
                              <div className={`mt-2 px-3 py-1 rounded-full text-xs font-black border-2 ${
                                scoreVal >= 80 ? 'bg-emerald-100 text-emerald-700 border-emerald-300 animate-bounce' : 'bg-rose-100 text-rose-700 border-rose-300'
                              }`}>
                                คะแนน: {scoreVal}% {scoreVal >= 80 ? '⭐ ผ่านแล้ว' : 'ลองใหม่อีกที'}
                              </div>
                            )}
                          </div>

                          <div className="w-full flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                recordFlashcard(v.word, cardKey);
                              }}
                              disabled={isMicActive}
                              className={`btn-3d w-full py-2 flex items-center justify-center gap-1.5 text-xs font-black rounded-xl border-2 transition ${
                                isMicActive
                                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                                  : 'bg-emerald-400 hover:bg-emerald-500 text-white border-emerald-500 shadow-emerald-400'
                              }`}
                            >
                              <span>{isMicActive ? '⏹️ กำลังตรวจ...' : '🎙️ แตะพูดออกเสียง'}</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex justify-between items-center bg-orange-50/50 border border-orange-100 rounded-2xl p-2">
                      <button
                        onClick={() => {
                          audioSynth.playPop();
                          setActiveFlashcardIndex(prev => Math.max(0, prev - 1));
                        }}
                        disabled={i === 0}
                        className={`w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm font-black transition active:scale-90 shrink-0 shadow-sm ${
                          i === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-orange-50 text-orange-600'
                        }`}
                      >
                        ⬅️
                      </button>

                      <span className="text-xs font-black text-orange-950 font-kids">
                        บัตรที่ {i + 1} / {selectedLesson.vocab.length} 🧭
                      </span>

                      <button
                        onClick={() => {
                          audioSynth.playPop();
                          setActiveFlashcardIndex(prev => Math.min(selectedLesson.vocab.length - 1, prev + 1));
                        }}
                        disabled={i === selectedLesson.vocab.length - 1}
                        className={`w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm font-black transition active:scale-90 shrink-0 shadow-sm ${
                          i === selectedLesson.vocab.length - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-orange-50 text-orange-600'
                        }`}
                      >
                        ➡️
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => {
                  audioSynth.playPop();
                  setActiveTab('animation');
                }}
                className="btn-3d px-6 py-2.5 bg-sky-400 hover:bg-sky-500 text-sky-950 text-xs font-black rounded-2xl border-2 border-sky-500 shadow-sky-300"
              >
                ไปหน้าสื่ออนิเมชันต่อ 📺
              </button>
            </div>

          </div>
        )}

        {/* TAB 4: DIALOGUE ANIMATION (สื่ออนิเมชันบทสนทนา) */}
        {activeTab === 'animation' && (
          <div className="kids-card rounded-3xl p-6 md:p-8 bg-white text-left animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl font-black text-sky-500 font-kids flex items-center gap-2">
                  <span>🎬</span> สื่ออนิเมชันบทสนทนา (Animation Room & Sample Video)
                </h2>
                <p className="text-xs font-extrabold text-slate-400 mt-1">รับชมสื่อวิดีโอตัวอย่าง พร้อมใช้งานระบบการ์ตูนอนิเมชันจำลองเพื่อออกเสียงตามได้ทันที!</p>
              </div>

              {/* Select Lesson buttons */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full -mx-2 px-2 snap-x snap-mandatory">
                {LESSONS.map(lesson => (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      audioSynth.playPop();
                      setSelectedLesson(lesson);
                      stopAnimationSimulation();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border-2 shrink-0 snap-start ${
                      selectedLesson.id === lesson.id
                        ? 'bg-sky-400 text-white border-sky-400'
                        : 'bg-white text-slate-700 hover:bg-sky-50 border-slate-200'
                    }`}
                  >
                    {lesson.emoji} {lesson.title.slice(0, 4)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Selector Buttons */}
            {selectedLesson.dialogueTopics && selectedLesson.dialogueTopics.length > 0 && (
              <div className="mb-6 p-4 bg-sky-50/60 rounded-3xl border-2 border-sky-100">
                <p className="text-xs font-black text-sky-950 mb-2 flex items-center gap-1.5 font-kids">
                  <span>📌</span> เลือกหัวข้อบทสนทนา (Topics):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedLesson.dialogueTopics.map((topic, idx) => {
                    const isSelected = activeAnimTopicIdx === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          audioSynth.playPop();
                          setActiveAnimTopicIdx(idx);
                          stopAnimationSimulation();
                        }}
                        className={`px-4 py-2.5 text-xs font-black rounded-2xl border-2 transition active:scale-95 shadow-sm font-kids ${
                          isSelected
                            ? 'bg-sky-500 text-white border-sky-600 shadow-sky-200'
                            : 'bg-white text-sky-850 hover:bg-sky-50/50 border-sky-200 hover:border-sky-300'
                        }`}
                      >
                        {topic.title} 💬
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Split layout: Real cartoon Video Embed VS CSS Interactive Animation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Column 1: Dialogue Script Board (Left Side) */}
              <div className="lg:col-span-6 bg-slate-50 border-4 border-slate-200 rounded-3xl p-5 flex flex-col justify-between shadow-md min-h-[360px] sm:min-h-[400px] lg:min-h-[420px] text-slate-700">
                <div>
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                    <span className="bg-[#60a5fa] text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                      📜 DIALOGUE SCRIPT
                    </span>
                    <span className="text-xs font-black text-slate-400">ด่านที่ {selectedLesson.id}: {selectedLesson.title}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-extrabold mb-4 leading-relaxed">
                    อ่านและฟังคำพูดของ Dino 🦖 และ Ted 🐻 แล้วลองฝึกออกเสียงตามได้เลยนะจ๊ะ!
                  </p>

                  {/* Scrollable Dialogue List */}
                  <div className="max-h-[280px] sm:max-h-[320px] lg:max-h-[330px] overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-slate-205 scrollbar-track-transparent">
                    {activeAnimDialogue.map((line, idx) => {
                      const isActive = simPlaying && simStep === idx;
                      const isDino = line.character === 'dino';
                      return (
                        <div
                          key={idx}
                          id={`dialogue-line-${idx}`}
                          onClick={() => {
                            audioSynth.playPop();
                            speakText(line.text, isDino);
                          }}
                          className={`group cursor-pointer border-l-4 pl-3 py-2.5 px-3 rounded-r-2xl rounded-bl-2xl shadow-sm text-left flex items-start gap-2.5 transition-all duration-300 hover:scale-[1.01] ${
                            isActive
                              ? 'bg-yellow-100/90 border-yellow-500 ring-2 ring-yellow-350 ring-opacity-50 z-10 scale-[1.02] shadow-md'
                              : isDino
                              ? 'bg-emerald-50/50 hover:bg-emerald-50 text-emerald-950 border-emerald-400'
                              : 'bg-amber-50/50 hover:bg-amber-50 text-amber-950 border-amber-500'
                          }`}
                        >
                          {/* Avatar Circle */}
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm shadow-sm ${
                            isActive 
                              ? 'bg-yellow-200 text-yellow-800' 
                              : isDino 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-amber-100 text-amber-850'
                          }`}>
                            {isDino ? '🦖' : '🐻'}
                          </div>

                          {/* Dialogue Content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 justify-between">
                              <span className="text-[10px] font-black tracking-wider uppercase opacity-80">
                                {isDino ? 'Dino' : 'Ted'} {isActive && '🔊'}
                              </span>
                              <span className="text-[8px] font-black text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                กดเพื่อฟังเสียง 🔊
                              </span>
                            </div>
                            <p className="font-kids font-black text-xs md:text-sm text-slate-800 tracking-wide mt-0.5 leading-snug">
                              {line.text}
                            </p>
                            <p className="font-bold text-[9px] sm:text-[10px] text-slate-500 mt-0.5 leading-tight">
                              {line.translation}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-center mt-3 pt-2 border-t border-slate-100">
                  <p className="text-[9px] text-slate-400 font-extrabold">💡 น้องๆ สามารถกดคลิกที่กล่องคำพูดแต่ละกล่องเพื่อฝึกฟังเสียงพูดทีละประโยคได้ด้วยนะ!</p>
                </div>
              </div>

              {/* Column 2: CSS Interactive Dialogue Simulator (Right Side) */}
              <div className="lg:col-span-6 bg-gradient-to-b from-sky-400 to-sky-500 rounded-3xl p-5 flex flex-col justify-between border-4 border-white shadow-md relative min-h-[360px] sm:min-h-[400px] lg:min-h-[420px] text-white">
                
                {/* Simulator Header */}
                <div className="flex justify-between items-center mb-2 z-10">
                  <span className="bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold border border-white/20 flex items-center gap-1">
                    🎮 Interactive Cartoon Live Simulator
                  </span>
                  
                  {/* Active Lesson Badge */}
                  <span className="bg-sky-600 text-white text-[10px] font-black border border-white/20 rounded-xl px-2.5 py-1 shadow-sm font-kids">
                    {selectedLesson.emoji} {selectedLesson.title}
                  </span>
                </div>

                {/* Subtitle Board overlay */}
                {animationSubtitle && (
                  <div className="bg-black/65 text-yellow-300 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl text-xs md:text-sm font-black text-center z-20 absolute top-14 left-4 right-4 animate-float">
                    {animationSubtitle}
                  </div>
                )}

                {/* Simulated Playground and Characters */}
                <div className="flex-1 w-full bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-100 rounded-2xl relative overflow-hidden flex items-end justify-center py-4 border border-white/20 min-h-[220px]">
                  
                  {/* Moving Clouds in back */}
                  <div className="absolute top-2 left-4 text-4xl opacity-10 animate-float-slow">☁️</div>
                  <div className="absolute top-6 right-6 text-5xl opacity-10 animate-float">☁️</div>

                  {/* Character A: Dino */}
                  <div className={`transition-all duration-1000 transform ${
                    simPlaying && simStep !== -1 && activeAnimDialogue[simStep]?.character === 'dino'
                      ? 'scale-110 shadow-lg'
                      : 'scale-90 opacity-80'
                  }`}>
                    <div className="flex flex-col items-center">
                      <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full mb-1">Dino 🦖</span>
                      <CartoonCharacter type="dino" state={simDinoState} className="w-24 h-24 sm:w-32 sm:h-32 md:w-56 md:h-56" />
                    </div>
                  </div>

                  {/* Character B: Bear */}
                  <div className={`transition-all duration-1000 transform ${
                    simPlaying && simStep !== -1 && activeAnimDialogue[simStep]?.character === 'bear'
                      ? 'scale-110 shadow-lg'
                      : 'scale-90 opacity-80'
                  }`}>
                    <div className="flex flex-col items-center">
                      <span className="bg-amber-700 text-white text-[9px] font-black px-2 py-0.5 rounded-full mb-1">Ted 🐻</span>
                      <CartoonCharacter type="bear" state={simBearState} className="w-24 h-24 sm:w-32 sm:h-32 md:w-56 md:h-56" />
                    </div>
                  </div>
                </div>

                {/* Control Panel */}
                <div className="w-full text-center mt-3 z-10 flex gap-2 justify-center flex-wrap">
                  {simPlaying ? (
                    <button
                      onClick={() => {
                        audioSynth.playPop();
                        pauseAnimationSimulation();
                      }}
                      className="btn-3d px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-2xl border-2 border-amber-600 shadow-amber-300 font-kids"
                    >
                      ⏸️ หยุดชั่วคราว
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        audioSynth.playPop();
                        runAnimationSimulation();
                      }}
                      className="btn-3d px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-2xl border-2 border-emerald-600 shadow-emerald-300 font-kids"
                    >
                      {simStep >= 0 ? '▶️ เล่นต่อ (Resume)' : '▶️ เล่นอนิเมชัน (Play)'}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      audioSynth.playPop();
                      resetAnimationSimulation();
                    }}
                    className={`btn-3d px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black rounded-2xl border-2 border-rose-600 shadow-rose-300 transition-all font-kids ${
                      simStep === -1 ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                    disabled={simStep === -1}
                  >
                    🔄 รีเซ็ต (Reset)
                  </button>

                  <button
                    onClick={() => {
                      audioSynth.playPop();
                      setActiveTab('roleplay');
                    }}
                    className="btn-3d px-5 py-2.5 bg-purple-400 hover:bg-purple-500 text-white text-xs font-black rounded-2xl border-2 border-purple-500 shadow-purple-300 font-kids"
                  >
                    สลับไปโต้ตอบบทบาทสมมติ 🎭
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 5: ROLE-PLAY ACTIVITY (กิจกรรมบทบาทสมมติ) */}
        {activeTab === 'roleplay' && (
          <div className="kids-card rounded-3xl p-6 md:p-8 bg-white text-left animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl font-black text-purple-600 font-kids flex items-center gap-2">
                  <span>🎭</span> กิจกรรมบทบาทสมมติอัจฉริยะ (Role-Play Game)
                </h2>
                <p className="text-xs font-extrabold text-slate-400 mt-1">เลือกตัวละครที่ต้องการสวมบทบาท แล้วสลับกันพูดโต้ตอบภาษาอังกฤษกับคอมพิวเตอร์เพื่อปลดล็อคด่านดาวทองคำ!</p>
              </div>

              {/* Select Lesson buttons */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full -mx-2 px-2 snap-x snap-mandatory font-kids">
                {LESSONS.map(lesson => {
                  const topics = lesson.dialogueTopics || [];
                  const allTopicsDone = topics.length > 0 && topics.every((t, idx) => completedRoleplays[`${lesson.id}_${idx}`]);
                  const anyTopicDone = topics.some((t, idx) => completedRoleplays[`${lesson.id}_${idx}`]);
                  const lessonProg = getLessonOverallProgress(lesson);
                  
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        audioSynth.playPop();
                        setActiveRoleplayTopicIdx(0);
                        startRolePlay(lesson, userRole, false, 0);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border-2 shrink-0 snap-start flex items-center gap-1.5 ${
                        selectedLesson.id === lesson.id
                          ? 'bg-purple-500 text-white border-purple-500 shadow-purple-250'
                          : 'bg-white text-slate-700 hover:bg-purple-50 border-slate-200'
                      }`}
                    >
                      <span>{lesson.emoji} {lesson.title.slice(0, 4)}...</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${
                        selectedLesson.id === lesson.id ? 'bg-purple-650 text-white' : 'bg-purple-50 text-purple-700 border border-purple-100'
                      }`}>{lessonProg}%</span>
                      {allTopicsDone ? <span className="text-[10px]">✅</span> : anyTopicDone ? <span className="text-[10px]">⏳</span> : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Topic Selector Buttons for Role-play */}
            {selectedLesson.dialogueTopics && selectedLesson.dialogueTopics.length > 0 && (
              <div className="mb-6 p-4 bg-purple-50/60 rounded-3xl border-2 border-purple-100">
                <p className="text-xs font-black text-purple-950 mb-2 flex items-center gap-1.5 font-kids">
                  <span>📌</span> เลือกหัวข้อบทสนทนา (Topics):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedLesson.dialogueTopics.map((topic, idx) => {
                    const isSelected = activeRoleplayTopicIdx === idx;
                    const isTopicDone = completedRoleplays[`${selectedLesson.id}_${idx}`];
                    const topicProg = getTopicProgress(selectedLesson, idx);
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          audioSynth.playPop();
                          setActiveRoleplayTopicIdx(idx);
                          startRolePlay(selectedLesson, userRole, false, idx);
                        }}
                        className={`px-4 py-2.5 text-xs font-black rounded-2xl border-2 transition active:scale-95 shadow-sm font-kids flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-purple-500 text-white border-purple-600 shadow-purple-200'
                            : 'bg-white text-purple-850 hover:bg-purple-50/50 border-purple-200 hover:border-purple-300'
                        }`}
                      >
                        <span>{topic.title}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                          isSelected ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 border border-purple-100'
                        }`}>{topicProg}%</span>
                        {isTopicDone || topicProg === 100 ? <span className="text-emerald-500">✅</span> : <span>💬</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Game Setup options */}
            <div className="bg-purple-50/50 p-4 rounded-2xl border-2 border-purple-100 mb-6 flex flex-wrap justify-between items-center gap-4">
              
              {/* Active Lesson Info */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black text-purple-900">บทเรียนขณะนี้:</span>
                <span className="bg-white border-2 border-purple-200 text-purple-900 text-xs font-black rounded-xl px-3 py-1 flex items-center gap-1.5 shadow-sm font-kids">
                  {selectedLesson.emoji} {selectedLesson.title}
                </span>

                {/* Completion Status Badge */}
                {completedRoleplays[`${selectedLesson.id}_${activeRoleplayTopicIdx}`] && (
                  <span className="bg-amber-100 text-amber-800 border-2 border-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse shadow-sm font-kids">
                    🏆 ด่านดาวทองคำสำเร็จแล้ว!
                  </span>
                )}
              </div>

              {/* Choose Role */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-purple-900">บทบาทของนักเรียน:</span>
                <span className="px-3.5 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-black shadow border border-amber-700 flex items-center gap-1.5 active:scale-95 transition-all">
                  พี่หมี 🐻 (Nong Bear)
                </span>
              </div>

              {/* Restart button */}
              <button
                onClick={() => startRolePlay(selectedLesson, userRole, true)}
                className="px-4 py-1.5 bg-purple-600 text-white text-xs font-black rounded-xl border-2 border-purple-700 active:scale-95 transition-all"
              >
                เริ่มเล่นใหม่ 🔄
              </button>

            </div>

            {/* Game Screen Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Visual Characters Stage - Sticky floating on desktop */}
              <div className="lg:col-span-5 lg:sticky lg:top-24 bg-gradient-to-b from-purple-100 to-purple-50 rounded-3xl p-4 sm:p-6 flex flex-col justify-between items-center border-4 border-white shadow-sm min-h-[220px] sm:min-h-[300px] lg:min-h-[360px] h-fit">
                <h4 className="text-[10px] sm:text-xs font-black text-purple-700 bg-purple-100/60 px-3 py-1 rounded-full">เวทีกิจกรรมโต้ตอบสด 🎭</h4>
                
                <div className="flex w-full justify-center gap-4 sm:gap-6 md:gap-12 lg:gap-4 xl:gap-8 items-end mt-2.5 sm:mt-4">
                  {/* Dino character */}
                  <div className="flex flex-col items-center">
                    <span className="bg-emerald-500 text-white text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full mb-1">
                      🦖 Dino (คู่หู)
                    </span>
                    <CartoonCharacter type="dino" state={dinoRoleState} className="w-20 h-20 sm:w-28 sm:h-28 md:w-44 md:h-44 lg:w-36 lg:h-36 xl:w-48 xl:h-48" />
                  </div>

                  {/* Bear character */}
                  <div className="flex flex-col items-center">
                    <span className="bg-amber-600 text-white text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full mb-1">
                      🐻 Bear (หนูเอง)
                    </span>
                    <CartoonCharacter type="bear" state={bearRoleState} className="w-20 h-20 sm:w-28 sm:h-28 md:w-44 md:h-44 lg:w-36 lg:h-36 xl:w-48 xl:h-48" />
                  </div>
                </div>

                <div className="bg-white/80 border border-purple-200 rounded-2xl p-2 sm:p-2.5 w-full text-center mt-2.5 sm:mt-4">
                  <p className="text-[10px] sm:text-[11px] font-black text-purple-900">{rolePlayFeedback || 'เกมพร้อมแล้ว! กดอ่านบรรทัดของหนูเลยคนเก่ง'}</p>
                </div>
              </div>

              {/* Right Column: Game Dialog lines flow with fixed height & scrolling */}
              <div className="lg:col-span-7 bg-white p-4 sm:p-6 rounded-3xl border-2 border-slate-100 shadow-sm flex flex-col justify-between max-h-[520px] sm:max-h-[600px] lg:max-h-[680px]">
                
                {/* Dialogue Progress Stream */}
                <div className="space-y-3 sm:space-y-4 overflow-y-auto py-2 px-2 max-h-[360px] sm:max-h-[440px] lg:max-h-[500px]">
                  {activeRoleplayDialogue.map((line, idx) => {
                    const isUserTurn = line.character === userRole;
                    const isCurrentStep = idx === rolePlayStep;
                    const isPassed = idx < rolePlayStep;
                    const lineScoreKey = `${selectedLesson.id}_${activeRoleplayTopicIdx}_${idx}`;

                    return (
                      <div
                        key={idx}
                        className={`p-2.5 sm:p-3.5 rounded-2xl border-2 transition-all flex justify-between items-center ${
                          isCurrentStep
                            ? 'relative z-10 bg-purple-100/60 border-purple-400 shadow-md ring-4 ring-purple-100 scale-[1.01]'
                            : isPassed
                            ? 'bg-slate-50 border-slate-200 opacity-60'
                            : 'bg-slate-50 border-slate-200 opacity-30 pointer-events-none'
                        }`}
                      >
                        <div className="flex gap-2 sm:gap-3 items-center">
                          <span className="text-xl sm:text-2xl">{line.character === 'dino' ? '🦖' : '🐻'}</span>
                          <div className="text-left">
                            <p className="text-[9px] sm:text-[10px] font-black text-slate-400">
                              {line.character === 'dino' ? 'Dino' : 'Bear'} {isUserTurn ? '(ตาหนูพูด)' : '(คู่หูพูด)'}
                            </p>
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <p className="text-xs sm:text-sm font-black text-slate-800 my-0.5">{line.text}</p>
                              {isUserTurn && (
                                <button
                                  onClick={() => speakText(line.text, false)}
                                  className="p-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center text-[9px] sm:text-[10px] shadow-sm cursor-pointer"
                                  title="ฟังการออกเสียง"
                                >
                                  🔊
                                </button>
                              )}
                            </div>
                            <p className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold">{line.phonetic}</p>
                            {isUserTurn && roleplayTranscripts[lineScoreKey] && (
                              <div className="mt-1 text-[9px] sm:text-[10px] font-bold text-slate-500 leading-normal">
                                เสียงที่ระบบได้ยิน: <span className="text-purple-600 font-black italic bg-purple-50 border border-purple-100 rounded px-1.5 py-0.5">&ldquo;{roleplayTranscripts[lineScoreKey]}&rdquo;</span>
                                {roleplayScores[lineScoreKey] !== undefined && (
                                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black border ${
                                    roleplayScores[lineScoreKey] >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-orange-50 text-orange-750 border-orange-200'
                                  }`}>
                                    คะแนน: {roleplayScores[lineScoreKey]}%
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Interactive action logic */}
                        <div className="flex-shrink-0">
                          {isPassed ? (
                            <span className="text-emerald-500 font-black text-[10px] sm:text-xs">ผ่านแล้ว! ✅</span>
                          ) : isCurrentStep ? (
                            isUserTurn ? (
                              <button
                                onClick={recordRolePlayLine}
                                disabled={isRolePlayListening}
                                className={`btn-3d px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black border-2 transition ${
                                  isRolePlayListening
                                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                                    : 'bg-emerald-400 hover:bg-emerald-500 text-white border-emerald-500 shadow-emerald-400'
                                }`}
                              >
                                {isRolePlayListening ? '⏹️ พูดเลย' : '🎙️ พูดบทนี้'}
                              </button>
                            ) : (
                              <button
                                onClick={() => speakText(line.text, line.character === 'dino')}
                                className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 bg-purple-400 hover:bg-purple-500 text-white rounded-xl text-[10px] sm:text-xs font-black border-2 border-purple-500 shadow active:scale-95"
                              >
                                🔊 ฟังเสียงคู่หู
                              </button>
                            )
                          ) : (
                            <span className="text-slate-400 font-black text-[10px] sm:text-xs">🔒 ล็อค</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Score & Correction Display */}
                {(rolePlayTranscript || rolePlayScore !== null) && (
                  <div className="mt-5 bg-sky-50/60 border-2 border-sky-100 rounded-2xl p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center flex-wrap gap-2 border-b border-sky-100 pb-2">
                      <span className="text-xs font-black text-sky-800 bg-sky-100 px-3 py-1 rounded-full">
                        📝 ข้อความที่จับได้ (English Transcript)
                      </span>
                      {rolePlayScore !== null && (
                        <span className={`text-xs font-black px-2.5 py-1 rounded-full border-2 ${
                          rolePlayScore >= 80 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-orange-100 text-orange-800 border-orange-200'
                        }`}>
                          คะแนนความถูกต้อง: {rolePlayScore}%
                        </span>
                      )}
                    </div>

                    <div className="text-left font-black text-base text-slate-800 italic leading-snug">
                      &ldquo;{rolePlayTranscript || 'ไม่มีสัญญาณเสียง...'}&rdquo;
                    </div>

                    {/* Word highlighting */}
                    {rolePlayDiff.length > 0 && (
                      <div className="border-t border-sky-100 pt-2 text-left">
                        <p className="text-[10px] font-black text-slate-400 mb-1">เปรียบเทียบลายคำ:</p>
                        <div className="flex flex-wrap gap-1">
                          {rolePlayDiff.map((segment, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded-lg text-xs font-black border ${
                                segment.isMatched
                                  ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                                  : 'bg-rose-100 text-rose-700 border-rose-300 line-through'
                              }`}
                            >
                              {segment.word}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>
          </div>
        )}

        {/* BOTTOM BRANDING & FOOTER */}
        <footer className="mt-8 bg-white/70 backdrop-blur-md rounded-3xl p-5 border-4 border-white shadow-md text-slate-400 font-black text-[11px] flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛡️</span>
            <span>Trang Kids Speak © 2026. ปลอดภัยสำหรับนักเรียน 100% | พัฒนาทักษะการเรียนรู้บทสนทนาภาษาอังกฤษเพื่อการสื่อสาร</span>
          </div>

          <div className="flex gap-4">
            <span className="hover:text-sky-500 cursor-pointer">เงื่อนไขการใช้งาน</span>
            <span className="hover:text-sky-500 cursor-pointer">นโยบายความเป็นส่วนตัว</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
