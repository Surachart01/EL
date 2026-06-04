/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import CartoonCharacter, { CharacterState, CharacterType } from '../components/CartoonCharacter';
import Confetti from '../components/Confetti';
import { calculateSimilarity, computeEnglishWordDiff, WordDiffSegment } from '../utils/similarity';
import { audioSynth } from '../utils/audio';

// Topics and English lesson dataset suitable for Grade 2 (Primary 2) students
interface VocabItem {
  word: string;
  phonetic: string;
  translation: string;
  emoji: string;
}

interface DialogueLine {
  speaker: 'A' | 'B';
  character: CharacterType;
  text: string;
  translation: string;
  phonetic: string;
}

interface LessonData {
  id: number;
  title: string;
  englishTitle: string;
  emoji: string;
  description: string;
  color: string; // Tailwind color theme
  borderColor: string;
  vocab: VocabItem[];
  dialogue: DialogueLine[];
  tip: string;
}

const LESSONS: LessonData[] = [
  {
    id: 1,
    title: 'Hello!',
    englishTitle: 'Hello Friends, Welcome to Trang',
    emoji: '👋',
    description: 'ทักทายเพื่อนใหม่และยินดีต้อนรับสู่จังหวัดตรัง',
    color: 'emerald',
    borderColor: 'border-emerald-300',
    vocab: [
      { word: 'Hello', phonetic: 'เฮลโล', translation: 'สวัสดี', emoji: '👋' },
      { word: 'Friend', phonetic: 'เฟรนด์', translation: 'เพื่อน', emoji: '🧑‍🤝‍🧑' },
      { word: 'Name', phonetic: 'เนม', translation: 'ชื่อ', emoji: '📛' },
      { word: 'Boy', phonetic: 'บอย', translation: 'เด็กผู้ชาย', emoji: '👦' },
      { word: 'Girl', phonetic: 'เกิร์ล', translation: 'เด็กผู้หญิง', emoji: '👧' },
      { word: 'City', phonetic: 'ซิตี้', translation: 'เมือง', emoji: '🏙️' },
      { word: 'Trang', phonetic: 'ตรัง', translation: 'จังหวัดตรัง', emoji: '🏛️' },
      { word: 'Thailand', phonetic: 'ไทยแลนด์', translation: 'ประเทศไทย', emoji: '🇹🇭' },
      { word: 'From', phonetic: 'ฟรอม', translation: 'มาจาก', emoji: '🛫' },
      { word: 'Live', phonetic: 'ลิฟ', translation: 'อาศัยอยู่', emoji: '🏠' },
      { word: 'Si Trang flower', phonetic: 'สี ตรัง ฟลาวเวอร์', translation: 'ดอกศรีตรัง', emoji: '🌸' },
      { word: 'Rubber tree', phonetic: 'รับเบอร์ ทรี', translation: 'ต้นยางพารา', emoji: '🌳' }
    ],
    dialogue: [
      { speaker: 'A', character: 'dino', text: 'Hello! Welcome to Trang.', phonetic: 'เฮลโล! เวลคัม ทู ตรัง.', translation: 'สวัสดีครับ! ยินดีต้อนรับสู่ตรังนะครับ' },
      { speaker: 'B', character: 'bear', text: 'Hello friend! My name is Aom.', phonetic: 'เฮลโล เฟรนด์! มาย เนม อีส ออม.', translation: 'สวัสดีเพื่อน! ฉันชื่อออมค่ะ' },
      { speaker: 'A', character: 'dino', text: 'I am a boy from Thailand. I live in this city.', phonetic: 'ไอ แอม อะ บอย ฟรอม ไทยแลนด์. ไอ ลิฟ อิน ดิส ซิตี้.', translation: 'ผมเป็นเด็กผู้ชายมาจากประเทศไทยครับ ผมอาศัยอยู่ในเมืองนี้' }
    ],
    tip: 'อย่าลืมยิ้มแย้มและสบตากับเพื่อนคู่สนทนาขณะทักทายนะจ๊ะคนเก่ง!'
  },
  {
    id: 2,
    title: 'School',
    englishTitle: 'My Classroom & Food at School',
    emoji: '🏫',
    description: 'เรียนรู้คำศัพท์ในห้องเรียนและของกินแสนอร่อยที่โรงเรียน',
    color: 'sky',
    borderColor: 'border-sky-300',
    vocab: [
      { word: 'School', phonetic: 'สคูล', translation: 'โรงเรียน', emoji: '🏫' },
      { word: 'Classroom', phonetic: 'คลาสรูม', translation: 'ห้องเรียน', emoji: '📖' },
      { word: 'Teacher', phonetic: 'ทีเชอร์', translation: 'ครู', emoji: '👩‍🏫' },
      { word: 'Student', phonetic: 'สตูเดนท์', translation: 'นักเรียน', emoji: '🎒' },
      { word: 'Book', phonetic: 'บุ๊ก', translation: 'หนังสือ', emoji: '📚' },
      { word: 'Pencil', phonetic: 'เพนซิล', translation: 'ดินสอ', emoji: '✏️' },
      { word: 'Lunch', phonetic: 'ลันช์', translation: 'อาหารกลางวัน', emoji: '🍱' },
      { word: 'Food', phonetic: 'ฟูด', translation: 'อาหาร', emoji: '🍽️' },
      { word: 'Roasted pork', phonetic: 'โรสเต็ด พอร์ก', translation: 'หมูย่างตรัง', emoji: '🥩' },
      { word: 'Cake', phonetic: 'เค้ก', translation: 'เค้กเมืองตรัง', emoji: '🍰' },
      { word: 'Dim sum', phonetic: 'ติ่มซำ', translation: 'ติ่มซำ', emoji: '🥟' }
    ],
    dialogue: [
      { speaker: 'A', character: 'dino', text: 'Look at my book and pencil in the classroom.', phonetic: 'ลุค แอท มาย บุ๊ก แอนด์ เพนซิล อิน เดอะ คลาสรูม.', translation: 'ดูหนังสือและดินสอของผมในห้องเรียนสิครับ' },
      { speaker: 'B', character: 'bear', text: 'It is time for lunch. I love dim sum and roasted pork!', phonetic: 'อิท อีส ไทม์ ฟอร์ ลันช์. ไอ ลัฟ ติ่มซำ แอนด์ โรสเต็ด พอร์ก!', translation: 'ถึงเวลาอาหารกลางวันแล้วค่ะ ฉันชอบติ่มซำและหมูย่างมากเลยค่ะ!' }
    ],
    tip: 'ออกเสียงตัว L ในคำว่า "School" และ "Pencil" ให้ปลายลิ้นยกแตะเพดานปากท้ายเสียงนะคนเก่ง!'
  },
  {
    id: 3,
    title: 'Family',
    englishTitle: 'Family Members, My Hometown & Trang Landmarks',
    emoji: '👨‍👩‍👧‍👦',
    description: 'แนะนำคนในครอบครัวและสถานที่ท่องเที่ยวชื่อดังในตรัง',
    color: 'orange',
    borderColor: 'border-orange-300',
    vocab: [
      { word: 'Family', phonetic: 'แฟมิลี', translation: 'ครอบครัว', emoji: '👨‍👩‍👧‍👦' },
      { word: 'Father', phonetic: 'ฟาเธอร์', translation: 'พ่อ', emoji: '👨' },
      { word: 'Mother', phonetic: 'มัทเธอร์', translation: 'แม่', emoji: '👩' },
      { word: 'Brother', phonetic: 'บราเธอร์', translation: 'พี่ชาย/น้องชาย', emoji: '👦' },
      { word: 'Sister', phonetic: 'ซิสเทอร์', translation: 'พี่สาว/น้องสาว', emoji: '👧' },
      { word: 'Hometown', phonetic: 'โฮมทาวน์', translation: 'บ้านเกิด', emoji: '🏡' },
      { word: 'Clock tower', phonetic: 'คล็อก ทาวเวอร์', translation: 'หอนาฬิกา', emoji: '🗼' },
      { word: 'Island', phonetic: 'ไอแลนด์', translation: 'เกาะ', emoji: '🏝️' },
      { word: 'Cave', phonetic: 'เคฟ', translation: 'ถ้ำ', emoji: '🕳️' },
      { word: 'Waterfall', phonetic: 'วอเทอร์ฟอล', translation: 'น้ำตก', emoji: '🌊' },
      { word: 'Phraya Ratsadanupradit', phonetic: 'พระยา รัษฎานุประดิษฐ์', translation: 'พระยารัษฎานุประดิษฐ์', emoji: '🎖️' },
      { word: 'Koh Kradan', phonetic: 'เกาะ กระดาน', translation: 'เกาะกระดาน', emoji: '🏝️' },
      { word: 'Emerald Cave', phonetic: 'เอมเมอรัลด์ เคฟ', translation: 'ถ้ำมรกต', emoji: '🧗' },
      { word: 'Ton Te Waterfall', phonetic: 'ต้นเตะ วอเทอร์ฟอล', translation: 'น้ำตกโตนเตะ', emoji: '⛲' }
    ],
    dialogue: [
      { speaker: 'A', character: 'dino', text: 'This is my mother and father. Trang is our hometown.', phonetic: 'ดิส อีส มาย มัทเธอร์ แอนด์ ฟาเธอร์. ตรัง อีส เอาเออร์ โฮมทาวน์.', translation: 'นี่คือคุณแม่และคุณพ่อของผมครับ ตรังคือบ้านเกิดของเรา' },
      { speaker: 'B', character: 'bear', text: "Let's visit the clock tower and Emerald Cave!", phonetic: 'เล็ทส์ วิสิท เดอะ คล็อก ทาวเวอร์ แอนด์ เอมเมอรัลด์ เคฟ!', translation: 'ไปเที่ยวหอนาฬิกาและถ้ำมรกตกันเถอะค่ะ!' }
    ],
    tip: 'พูดคำว่า "Mother" และ "Father" โดยเอาปลายลิ้นแตะฟันบนเบาๆ นะจ๊ะ!'
  },
  {
    id: 4,
    title: 'Colour',
    englishTitle: 'What Colour Is It? & Fruits',
    emoji: '🎨',
    description: 'บอกสีสันต่างๆ รอบตัวและผลไม้รสชาติหวานอร่อย',
    color: 'purple',
    borderColor: 'border-purple-300',
    vocab: [
      { word: 'Red', phonetic: 'เรด', translation: 'สีแดง', emoji: '🔴' },
      { word: 'Blue', phonetic: 'บลู', translation: 'สีน้ำเงิน', emoji: '🔵' },
      { word: 'Green', phonetic: 'กรีน', translation: 'สีเขียว', emoji: '🟢' },
      { word: 'Yellow', phonetic: 'เยลโล', translation: 'สีเหลือง', emoji: '🟡' },
      { word: 'Purple', phonetic: 'เพอร์เพิล', translation: 'สีม่วง', emoji: '🟣' },
      { word: 'Apple', phonetic: 'แอปเปิล', translation: 'แอปเปิล', emoji: '🍎' },
      { word: 'Banana', phonetic: 'บานานา', translation: 'กล้วย', emoji: '🍌' },
      { word: 'Mango', phonetic: 'แมงโก', translation: 'มะม่วง', emoji: '🥭' },
      { word: 'Watermelon', phonetic: 'วอเทอร์เมลอน', translation: 'แตงโม', emoji: '🍉' },
      { word: 'Fruit', phonetic: 'ฟรุต', translation: 'ผลไม้', emoji: '🍎' }
    ],
    dialogue: [
      { speaker: 'A', character: 'dino', text: 'Look! This red apple is a sweet fruit.', phonetic: 'ลุค! ดิส เรด แอปเปิล อีส อะ สวีท ฟรุต.', translation: 'ดูสิ! แอปเปิลสีแดงผลนี้เป็นผลไม้รสหวานนะ' },
      { speaker: 'B', character: 'bear', text: 'I like green mango and yellow banana.', phonetic: 'ไอ ไลค์ กรีน แมงโก แอนด์ เยลโล บานานา.', translation: 'หนูชอบมะม่วงสีเขียวและกล้วยสีเหลืองค่ะ' }
    ],
    tip: 'ฝึกม้วนลิ้นออกเสียงตัว R ในคำว่า "Red" โดยระวังอย่าให้ริมฝีปากแตะกันนะจ๊ะ!'
  },
  {
    id: 5,
    title: 'Toys',
    englishTitle: 'Fun with Toys & Trang Look Lom Festival',
    emoji: '🧸',
    description: 'สนุกสนานกับของเล่นและเทศกาลลูกลมเมืองตรัง',
    color: 'pink',
    borderColor: 'border-pink-300',
    vocab: [
      { word: 'Toy', phonetic: 'ทอย', translation: 'ของเล่น', emoji: '🧸' },
      { word: 'Ball', phonetic: 'บอล', translation: 'ลูกบอล', emoji: '⚽' },
      { word: 'Doll', phonetic: 'ดอล', translation: 'ตุ๊กตา', emoji: '🪆' },
      { word: 'Kite', phonetic: 'ไคท์', translation: 'ว่าว', emoji: '🪁' },
      { word: 'Robot', phonetic: 'โรบอท', translation: 'หุ่นยนต์', emoji: '🤖' },
      { word: 'Game', phonetic: 'เกม', translation: 'เกม', emoji: '🎮' },
      { word: 'Festival', phonetic: 'เฟสติวัล', translation: 'เทศกาล', emoji: '🎉' },
      { word: 'Seed', phonetic: 'ซีด', translation: 'เมล็ด', emoji: '🌱' },
      { word: 'Whistle', phonetic: 'วิสเซิล', translation: 'เป่านกหวีด', emoji: '📣' },
      { word: 'Fun', phonetic: 'ฟัน', translation: 'ความสนุก', emoji: '🥳' },
      { word: 'Underwater Wedding Festival', phonetic: 'อันเดอร์วอเทอร์ เวดดิง เฟสติวัล', translation: 'งานวิวาห์ใต้สมุทร', emoji: '🤿' },
      { word: 'Look Lom Festival', phonetic: 'ลุค ลม เฟสติวัล', translation: 'เทศกาลลูกลม', emoji: '🌀' }
    ],
    dialogue: [
      { speaker: 'A', character: 'dino', text: "I have a robot and a kite. Let's play a game!", phonetic: 'ไอ แฮฟ อะ โรบอท แอนด์ อะ ไคท์. เล็ทส์ เพลย์ อะ เกม!', translation: 'ผมมีหุ่นยนต์และว่าวครับ มาเล่นเกมกันเถอะ' },
      { speaker: 'B', character: 'bear', text: 'We can whistle and have fun at the Look Lom Festival!', phonetic: 'วี แคน วิสเซิล แอนด์ แฮฟ ฟัน แอท เดอะ ลุค ลม เฟสติวัล!', translation: 'เราสามารถเป่านกหวีดและสนุกสนานกันในเทศกาลลูกลมได้ค่ะ!' }
    ],
    tip: 'คำว่า "Cool" ออกเสียงท้ายสั้นด้วยเสียง "ล" เบาๆ เพื่อให้ถูกต้องสมบูรณ์แบบ!'
  }
];


interface SubmissionRecord {
  id: number;
  topic: string;
  type: 'เสียง' | 'วิดีโอ';
  date: string;
  status: 'ตรวจแล้ว' | 'กำลังตรวจ' | 'รอส่ง';
  score?: number;
}

export default function TrangKidsSpeakApp() {
  // Student Auth states
  const [student, setStudent] = useState<{ studentId: string; name: string; classroom: string } | null>(null);
  const [loginId, setLoginId] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Navigation tabs: 'home' | 'knowledge' | 'flashcards' | 'animation' | 'roleplay' | 'submission'
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedLesson, setSelectedLesson] = useState<LessonData>(LESSONS[0]);
  const [gender, setGender] = useState<'boy' | 'girl'>('girl'); // default matching Nong Aom 👧
  const [isPracticeExpanded, setIsPracticeExpanded] = useState<boolean>(false);
  
  // Confetti celebration state
  const [confettiActive, setConfettiActive] = useState(false);

  // Global Speech/Mic Support & Permission
  const [speechSupported, setSpeechSupported] = useState(true);
  const [micPermissionState, setMicPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Dashboard states
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);

  // Flashcards state
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [flashcardScores, setFlashcardScores] = useState<Record<string, number>>({});
  const [activeCardMic, setActiveCardMic] = useState<string | null>(null);
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [completedRoleplays, setCompletedRoleplays] = useState<Record<string, boolean>>({});

  // Helper to save progress to DB
  const saveProgressToDB = async (
    studentId: string,
    update: {
      flashcardScores?: Record<string, number>;
      completedRoleplays?: Record<string, boolean>;
      submission?: { lessonId: number; score: number; mediaType: 'audio' | 'video'; status: string; date: string };
    }
  ) => {
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
        if (data.progress.submissions && data.progress.submissions.length > 0) {
          const localSubs = data.progress.submissions.map((sub: any, sIdx: number) => {
            const lesson = LESSONS.find(l => l.id === sub.lessonId);
            return {
              id: sIdx + 1,
              topic: lesson ? lesson.title : `บทเรียนที่ ${sub.lessonId}`,
              type: sub.mediaType === 'audio' ? 'เสียง' : 'วิดีโอ',
              date: sub.date,
              status: sub.status as any,
              score: sub.score,
            };
          });
          setSubmissions(localSubs);
        } else {
          setSubmissions([]);
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

  // Animation simulator state
  const [simPlaying, setSimPlaying] = useState(false);
  const [simStep, setSimStep] = useState<number>(-1);
  const [simDinoState, setSimDinoState] = useState<CharacterState>('idle');
  const [simBearState, setSimBearState] = useState<CharacterState>('idle');
  const [animationSubtitle, setAnimationSubtitle] = useState<string>('');

  // Role Play game states
  const [userRole, setUserRole] = useState<'dino' | 'bear'>('bear');
  const [rolePlayStep, setRolePlayStep] = useState<number>(0);
  const [rolePlayScore, setRolePlayScore] = useState<number | null>(null);
  const [rolePlayDiff, setRolePlayDiff] = useState<WordDiffSegment[]>([]);
  const [rolePlayTranscript, setRolePlayTranscript] = useState<string>('');
  const [isRolePlayListening, setIsRolePlayListening] = useState<boolean>(false);
  const [dinoRoleState, setDinoRoleState] = useState<CharacterState>('idle');
  const [bearRoleState, setBearRoleState] = useState<CharacterState>('idle');
  const [rolePlayFeedback, setRolePlayFeedback] = useState<string>('');

  // Speaking Submission tab states
  const [submitSelectedLesson, setSubmitSelectedLesson] = useState<LessonData>(LESSONS[0]);
  const [submitMediaType, setSubmitMediaType] = useState<'audio' | 'video'>('audio');
  const [isSubmittingRecord, setIsSubmittingRecord] = useState(false);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);
  const [submittedTranscript, setSubmittedTranscript] = useState<string>('');
  const [submittedDiff, setSubmittedDiff] = useState<WordDiffSegment[]>([]);
  const [isSubmissionListening, setIsSubmissionListening] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState('');
  
  // Live Camera preview state for Video recording
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // References for Web Speech API
  const recognitionRef = useRef<any>(null);

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
        setErrorMessage('เบราว์เซอร์นี้ไม่รองรับการจำเสียงพูดจ้า แนะนำให้เปิดใน Google Chrome นะจ๊ะ');
      }
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'microphone' as PermissionName })
          .then((permissionStatus) => {
            setMicPermissionState(permissionStatus.state as any);
            permissionStatus.onchange = () => { setMicPermissionState(permissionStatus.state as any); };
          })
          .catch(() => console.log('Permission query not supported'));
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

  // Reset flashcard index when topic changes
  useEffect(() => {
    setActiveFlashcardIndex(0);
  }, [selectedLesson]);

  // Web Camera stream controller
  useEffect(() => {
    if (activeTab === 'submission' && submitMediaType === 'video') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab, submitMediaType]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setVideoStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      console.log('Camera access denied or unavailable');
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
  };

  // Speaks any English phrase using Web Speech Synthesis
  const speakText = (text: string, isDino: boolean = true) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
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
      const cardScore = calculateSimilarity(vocabWord.toLowerCase().trim(), resultText.toLowerCase().trim());
      setFlashcardScores(prev => {
        const next = { ...prev, [indexKey]: cardScore };
        if (student) saveProgressToDB(student.studentId, { flashcardScores: { [indexKey]: cardScore } });
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
    setSimStep(0);
    
    const lines = selectedLesson.dialogue;
    let index = 0;

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
      setTimeout(playNextLine, textDuration);
    };

    playNextLine();
  };

  // Role Play Step logic
  const startRolePlay = (topic: LessonData) => {
    audioSynth.playPop();
    setSelectedLesson(topic);
    setRolePlayStep(0);
    setRolePlayScore(null);
    setRolePlayDiff([]);
    setRolePlayTranscript('');
    setRolePlayFeedback('');
    setDinoRoleState('idle');
    setBearRoleState('idle');
    
    // Automatically trigger the first line if computer goes first
    setTimeout(() => {
      triggerRolePlayComputerTurn(0, topic);
    }, 400);
  };

  const triggerRolePlayComputerTurn = (stepIndex: number, lesson: LessonData) => {
    const lines = lesson.dialogue;
    if (stepIndex >= lines.length) return;

    const currentLine = lines[stepIndex];
    const otherRole = userRole === 'dino' ? 'bear' : 'dino';

    // If it is the computer's role
    if (currentLine.character === otherRole) {
      setRolePlayFeedback(`${currentLine.character === 'dino' ? 'น้องไดโน 🦖' : 'พี่หมี 🐻'} กำลังพูด...`);
      speakText(currentLine.text, currentLine.character === 'dino');
    }
  };

  const recordRolePlayLine = async () => {
    if (!speechSupported) {
      alert('ขออภัยด้วยจ้า ระบบถอดความเสียงไม่พร้อมทำงานบนบราวเซอร์นี้');
      return;
    }
    const lines = selectedLesson.dialogue;
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
          if (nextStep < lines.length) {
            triggerRolePlayComputerTurn(nextStep, selectedLesson);
          } else {
            setRolePlayFeedback('🎉 ว้าว! คุณทำกิจกรรมบทบาทสมมติเสร็จสมบูรณ์แล้ว ยอดเยี่ยมมากจ้า!');
            audioSynth.playSuccess();
            setConfettiActive(true);
            setCompletedRoleplays(prev => {
              const next = { ...prev, [selectedLesson.id]: true };
              if (student) saveProgressToDB(student.studentId, { completedRoleplays: { [selectedLesson.id]: true } });
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

  // Custom AI speaking assessment in Submission console
  const recordSubmissionSpeech = async () => {
    if (!speechSupported) {
      alert('ขออภัยด้วยจ้า ระบบไมโครโฟนจำคำพูดไม่รองรับบนเบราว์เซอร์นี้');
      return;
    }
    // Abort any existing session and create a fresh instance
    if (recognitionRef.current) { try { recognitionRef.current.abort(); } catch { /* ignore */ } }
    const rec = createRecognition();
    if (!rec) { alert('ขออภัยด้วยจ้า ระบบไมโครโฟนจำคำพูดไม่รองรับบนเบราว์เซอร์นี้'); return; }
    recognitionRef.current = rec;

    audioSynth.playPop();
    setIsSubmissionListening(true);
    setSubmittedScore(null);
    setSubmittedTranscript('');
    setSubmittedDiff([]);
    setSubmissionFeedback('🎙️ กำลังอัดเสียงประเมิน... ออกเสียงตามบทสนทนาได้เลย!');

    const targetText = submitSelectedLesson.dialogue
      .filter(line => line.speaker === 'B')
      .map(line => line.text)
      .join(' ');

    rec.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      setSubmittedTranscript(resultText);
      const similarityScore = calculateSimilarity(targetText, resultText);
      setSubmittedScore(similarityScore);
      setSubmittedDiff(computeEnglishWordDiff(targetText, resultText));
      if (similarityScore >= 80) {
        audioSynth.playSuccess();
        setConfettiActive(true);
        setSubmissionFeedback('สุดยอดไปเลย! หนูออกเสียงประโยคภาษาอังกฤษของบทเรียนนี้ได้ถูกต้องแม่นยำมาก 🏆');
      } else {
        audioSynth.playTryAgain();
        setSubmissionFeedback('เกือบถูกแล้วคนเก่ง! ดูจุดสะกดไฮไลท์สีแดง แล้วพยายามฝึกออกเสียงใหม่อีกครั้งนะจ๊ะ 💪');
      }
    };
    rec.onerror = () => { setIsSubmissionListening(false); setSubmissionFeedback('⚠️ เอ๊ะ...ไม่ได้ยินเสียงเลยจ้า ลองขยับไมค์และพูดใหม่อีกครั้งนะ'); };
    rec.onend = () => { setIsSubmissionListening(false); };
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      rec.start();
    } catch {
      alert('กรุณากดเปิดใช้งานไมโครโฟนเพื่อส่งเสียงพูดน้า');
      setIsSubmissionListening(false);
    }
  };

  // Keypad login handlers
  const handleKeyPress = (num: string) => { audioSynth.playPop(); if (loginId.length < 10) setLoginId(prev => prev + num); };
  const handleBackspace = () => { audioSynth.playPop(); setLoginId(prev => prev.slice(0, -1)); };
  const handleClear = () => { audioSynth.playPop(); setLoginId(''); };
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

  // Submit speaking score dynamically to dashboard submissions list
  const submitToTeacher = () => {
    if (submittedScore === null) return;
    setIsSubmittingRecord(true);
    setTimeout(() => {
      audioSynth.playSuccess();
      setConfettiActive(true);
      const today = new Date();
      const thaiMonths = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
      const formattedDate = `${today.getDate()} ${thaiMonths[today.getMonth()]} ${String(today.getFullYear()+543).slice(-2)}`;
      const newSub: SubmissionRecord = {
        id: submissions.length + 1,
        topic: submitSelectedLesson.title,
        type: submitMediaType === 'audio' ? 'เสียง' : 'วิดีโอ',
        date: formattedDate,
        status: 'ตรวจแล้ว',
        score: submittedScore
      };
      setSubmissions([newSub, ...submissions]);
      setIsSubmittingRecord(false);
      if (student) {
        saveProgressToDB(student.studentId, { submission: { lessonId: submitSelectedLesson.id, score: submittedScore, mediaType: submitMediaType, status: 'ตรวจแล้ว', date: formattedDate } });
      }
      alert('ส่งผลงานการพูดของหนูให้คุณครูตรวจผ่านระบบออนไลน์สำเร็จแล้วจ้า! เก่งมากเลยลูก! ⭐');
      setSubmittedScore(null);
      setSubmittedTranscript('');
      setSubmittedDiff([]);
      setActiveTab('home');
    }, 1200);
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
          </div>
        </div>
      </div>
    );
  }

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
          { id: 'submission', label: 'ส่งผลงาน', emoji: '💖' },
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
              { id: 'submission', label: 'ส่งผลงาน', emoji: '💖', activeBg: 'bg-pink-400 text-white border-pink-400' },
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
                    setStudent(null);
                    setLoginId('');
                    setLoginError('');
                    setShowLogoutConfirm(false);
                    setFlashcardScores({});
                    setCompletedRoleplays({});
                    setSubmissions([]);
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

            {/* MIDDLE: 5 ELEMENTS CARDS - EXACT VISUAL MATCH */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              
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
                <p className="text-[10px] text-slate-400 font-bold mb-4 leading-relaxed h-[36px]">ฝึกพูดจากสถานการณ์จริง เป็นคู่หรือรายบุคคล</p>
                
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

              {/* Card 5: ระบบส่งผลงาน */}
              <div className="kids-card rounded-3xl p-4 sm:p-5 flex flex-col justify-between items-center text-center border-t-8 border-pink-400 bg-white col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center font-black text-xs">5</div>
                  <h3 className="font-black text-slate-700 text-xs md:text-sm">ส่งคลิปเสียงและวิดีโอ (Speaking Submission)</h3>
                </div>
                <p className="text-[10px] text-slate-400 font-bold mb-4 leading-relaxed h-[36px]">อัดคลิปเสียงหรือวิดีโอการพูด ส่งผ่านระบบออนไลน์</p>
                
                {/* Illustration replica: Mic & Cam Icons */}
                <div className="w-full h-24 bg-pink-50/50 border border-pink-100 rounded-2xl flex items-center justify-center gap-4 p-2 mb-4 relative overflow-hidden">
                  <div className="text-3xl bg-white p-3 rounded-full shadow-sm text-sky-500 border border-slate-100 shrink-0">🎙️</div>
                  <div className="text-3xl bg-white p-3 rounded-full shadow-sm text-pink-500 border border-slate-100 shrink-0">📹</div>
                </div>

                <button
                  onClick={() => { audioSynth.playPop(); setActiveTab('submission'); }}
                  className="btn-3d w-full py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs font-black rounded-2xl border-2 border-pink-600 shadow-pink-300"
                >
                  ส่งผลงาน
                </button>
              </div>

            </div>

            {/* BOTTOM SECTION LAYOUT - EXACT REPLICA */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* COLUMN 1: วันนี้ฝึกพูด */}
              <div className="lg:col-span-3 kids-card rounded-3xl p-5 flex flex-col justify-between text-left bg-white relative">
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
                    setSubmitSelectedLesson(LESSONS[0]);
                    setActiveTab('submission');
                  }}
                  className="btn-3d w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-black rounded-2xl border-2 border-blue-600 shadow-blue-300 mt-2"
                >
                  เริ่มฝึกเลย
                </button>
              </div>

              {/* COLUMN 2: เทคนิค PRACTICE - EXACT DETAILS */}
              <div className="lg:col-span-3 kids-card rounded-3xl p-5 bg-white text-left">
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
              <div className="lg:col-span-3 kids-card rounded-3xl p-5 bg-white text-left flex flex-col justify-between">
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

              {/* COLUMN 4: สถานะส่งผลงานล่าสุด */}
              <div className="lg:col-span-3 kids-card rounded-3xl p-5 bg-white text-left flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">สถานะการส่งผลงานล่าสุด</h3>
                    <span className="text-[10px] font-black text-slate-400 cursor-pointer hover:text-sky-500">ดูทั้งหมด &gt;</span>
                  </div>
                  
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full text-left text-[10px] font-black">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-100 pb-1">
                          <th className="pb-1.5 font-black">หัวข้อ</th>
                          <th className="pb-1.5 font-black text-center hidden sm:table-cell">ประเภท</th>
                          <th className="pb-1.5 font-black text-right hidden md:table-cell">วันที่ส่ง</th>
                          <th className="pb-1.5 font-black text-right">สถานะ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map((sub, idx) => (
                          <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/20">
                            <td className="py-2.5 text-slate-700 font-extrabold truncate max-w-[80px]" title={sub.topic}>
                              {sub.topic}
                            </td>
                            <td className="py-2.5 text-center text-slate-500 font-extrabold hidden sm:table-cell">{sub.type}</td>
                            <td className="py-2.5 text-right text-slate-400 font-bold hidden md:table-cell">{sub.date}</td>
                            <td className="py-2.5 text-right">
                              {sub.status === 'ตรวจแล้ว' ? (
                                <span className="text-emerald-500 font-black flex items-center justify-end gap-1" title={`${sub.score}%`}>
                                  ตรวจแล้ว <span className="w-3.5 h-3.5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold">✓</span>
                                </span>
                              ) : sub.status === 'กำลังตรวจ' ? (
                                <span className="text-orange-500 font-black flex items-center justify-end gap-1 animate-pulse">
                                  กำลังตรวจ <span className="w-3.5 h-3.5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin inline-block" />
                                </span>
                              ) : (
                                <span className="text-slate-400 font-black flex items-center justify-end gap-1">
                                  รอส่ง <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 inline-block" />
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <button
                  onClick={() => { audioSynth.playPop(); setActiveTab('submission'); }}
                  className="w-full py-2 bg-white hover:bg-pink-50 text-pink-500 text-[10px] font-black rounded-2xl border-2 border-pink-200 active:scale-95 transition mt-3 text-center"
                >
                  ส่งผลงานใหม่
                </button>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: KNOWLEDGE SHEETS (ใบความรู้) */}
        {activeTab === 'knowledge' && (
          <div className="kids-card rounded-3xl p-6 md:p-8 bg-white text-left">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl font-black text-sky-600 font-kids flex items-center gap-2">
                  <span>📖</span> ใบความรู้และแบบฝึกทักษะการพูด (Knowledge Sheets)
                </h2>
                <p className="text-xs font-extrabold text-slate-400 mt-1">บทเรียนภาษาอังกฤษและตารางคำอ่าน-คำแปล สำหรับน้องๆ ชั้น ป.2</p>
              </div>

              {/* Select Lesson dropdown */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full -mx-2 px-2 snap-x snap-mandatory">
                {LESSONS.map(lesson => (
                  <button
                    key={lesson.id}
                    onClick={() => { audioSynth.playPop(); setSelectedLesson(lesson); }}
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

            {/* Lesson Detail Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Vocabulary Table (Left Side) */}
              <div className="lg:col-span-7 bg-sky-50/50 p-6 rounded-3xl border-2 border-dashed border-sky-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{selectedLesson.emoji}</span>
                  <h3 className="font-black text-slate-700">คำศัพท์บทเรียนที่ {selectedLesson.id}: {selectedLesson.title}</h3>
                </div>

                {/* Desktop View Table - Hidden on Mobile */}
                <div className="hidden lg:block overflow-x-auto rounded-2xl border-2 border-white bg-white shadow-sm">
                  <table className="w-full text-left text-xs md:text-sm font-black">
                    <thead className="bg-sky-100 text-sky-800">
                      <tr>
                        <th className="p-3">รูป</th>
                        <th className="p-3">คำศัพท์ (English)</th>
                        <th className="p-3">คำอ่านไทย (Phonetic)</th>
                        <th className="p-3">คำแปลไทย (Translation)</th>
                        <th className="p-3 text-center">เสียง</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedLesson.vocab.map((v, i) => (
                        <tr key={i} className="border-b border-sky-50 last:border-0 hover:bg-sky-50/30">
                          <td className="p-3 text-2xl">{v.emoji}</td>
                          <td className="p-3 text-slate-800 font-extrabold">{v.word}</td>
                          <td className="p-3 text-sky-600 font-bold">{v.phonetic}</td>
                          <td className="p-3 text-emerald-600 font-bold">{v.translation}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => speakText(v.word, true)}
                              className="p-1.5 rounded-full bg-sky-100 hover:bg-sky-200 transition text-sky-600 active:scale-90"
                              title="ฟังออกเสียง"
                            >
                              🔊
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Interactive Grid Cards - Hidden on Desktop */}
                <div className="block lg:hidden space-y-3">
                  {selectedLesson.vocab.map((v, i) => (
                    <div 
                      key={i} 
                      className="bg-white border-2 border-sky-100 rounded-2xl p-3 flex items-center justify-between shadow-sm hover:border-sky-300 transition active:scale-[0.99]"
                      onClick={() => speakText(v.word, true)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl shrink-0 bg-sky-50 w-12 h-12 flex items-center justify-center rounded-xl border border-sky-100">{v.emoji}</span>
                        <div className="text-left">
                          <h4 className="text-base font-black text-slate-800 leading-tight">{v.word}</h4>
                          <p className="text-[11px] font-extrabold text-sky-600">คำอ่าน: {v.phonetic}</p>
                          <p className="text-xs font-black text-emerald-600 mt-0.5">แปล: {v.translation}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => { e.stopPropagation(); speakText(v.word, true); }}
                        className="w-10 h-10 rounded-full bg-sky-100 hover:bg-sky-200 flex items-center justify-center text-sky-600 active:scale-90 transition shadow-sm border border-sky-200 shrink-0 font-bold text-sm"
                      >
                        🔊
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-2xl mt-5">
                  <h4 className="text-amber-800 font-black text-xs flex items-center gap-1.5">
                    <span>💡</span> เคล็ดลับจากคุณครู:
                  </h4>
                  <p className="text-amber-900 font-extrabold text-xs mt-1 leading-relaxed">
                    {selectedLesson.tip}
                  </p>
                </div>
              </div>

              {/* Short Dialogue Section (Right Side) */}
              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm space-y-6">
                <div className="border-b border-slate-50 pb-3">
                  <h3 className="font-black text-slate-800 flex items-center gap-1.5">
                    <span>🗣️</span> บทสนทนาสั้นสำหรับการเรียนรู้
                  </h3>
                  <p className="text-[11px] font-extrabold text-slate-400 mt-1">คลิกปุ่มเสียงที่ฟองพูดเพื่อฝึกฟังสำเนียงนำจ้า</p>
                </div>

                {/* Simulated cartoon chat dialogue box */}
                <div className="space-y-4 bg-slate-50 p-4 rounded-2xl max-h-[350px] overflow-y-auto border border-slate-100">
                  {selectedLesson.dialogue.map((line, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 items-start ${line.speaker === 'A' ? 'flex-row' : 'flex-row-reverse'}`}
                    >
                      {/* Avatar */}
                      <span className="text-3xl bg-white p-2 rounded-full border border-slate-100 shadow-sm animate-bounce-gentle shrink-0">
                        {line.character === 'dino' ? '🦖' : '🐻'}
                      </span>

                      {/* Bubble */}
                      <div className={`p-3 rounded-2xl max-w-[75%] border shadow-sm text-left relative ${
                        line.speaker === 'A'
                          ? 'bg-sky-50 text-sky-950 border-sky-200 rounded-tl-none'
                          : 'bg-pink-50 text-pink-950 border-pink-200 rounded-tr-none'
                      }`}>
                        {/* Bubble hook */}
                        <span className={`absolute -top-1 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] ${
                          line.speaker === 'A'
                            ? '-left-1 border-b-sky-50'
                            : '-right-1 border-b-pink-50'
                        }`} />
                        
                        <div className="flex justify-between items-center gap-3">
                          <p className="font-black text-sm">{line.text}</p>
                          <button
                            onClick={() => speakText(line.text, line.character === 'dino')}
                            className="text-xs p-1 rounded-full hover:bg-black/5 active:scale-90 select-none shrink-0"
                            title="ฟังประโยคนี้"
                          >
                            🔊
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 font-extrabold">{line.phonetic}</p>
                        <p className="text-[10px] text-emerald-600 font-black mt-1.5 border-t border-black/5 pt-1">{line.translation}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => {
                      audioSynth.playPop();
                      setActiveTab('flashcards');
                    }}
                    className="btn-3d px-6 py-2.5 bg-orange-400 hover:bg-orange-500 text-orange-950 text-xs font-black rounded-2xl border-2 border-orange-500 shadow-orange-350"
                  >
                    ไปฝึกคำศัพท์ต่อ 🍎
                  </button>
                </div>

              </div>

            </div>
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
                {LESSONS.map(lesson => (
                  <button
                    key={lesson.id}
                    onClick={() => { audioSynth.playPop(); setSelectedLesson(lesson); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border-2 shrink-0 snap-start ${
                      selectedLesson.id === lesson.id
                        ? 'bg-orange-400 text-white border-orange-400'
                        : 'bg-white text-slate-700 hover:bg-orange-50 border-slate-200'
                    }`}
                  >
                    {lesson.emoji} {lesson.title.slice(0, 4)}...
                  </button>
                ))}
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
                        setFlippedCards(prev => ({ ...prev, [cardKey]: !isFlipped }));
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
                          setFlippedCards(prev => ({ ...prev, [cardKey]: !isFlipped }));
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
          <div className="kids-card rounded-3xl p-6 md:p-8 bg-white text-left">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-2xl font-black text-sky-500 font-kids flex items-center gap-2">
                <span>🎬</span> สื่ออนิเมชันบทสนทนา (Animation Room & Sample Video)
              </h2>
              <p className="text-xs font-extrabold text-slate-400 mt-1">รับชมสื่อวิดีโอตัวอย่าง พร้อมใช้งานระบบการ์ตูนอนิเมชันจำลองเพื่อออกเสียงตามได้ทันที!</p>
            </div>

            {/* Split layout: Real cartoon Video Embed VS CSS Interactive Animation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Column 1: Video Player (Left Side) */}
              <div className="lg:col-span-6 bg-slate-900 rounded-3xl p-4 flex flex-col justify-between border-4 border-slate-800 shadow-lg min-h-[280px] sm:min-h-[320px] lg:min-h-[420px] text-white">
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping inline-block" />
                    SAMPLE CARTOON VIDEO
                  </span>
                  <span className="text-xs font-bold text-slate-400">บทสนทนาแสนสนุก</span>
                </div>

                {/* Embedded Kid English Video Sample */}
                <div className="flex-1 rounded-2xl overflow-hidden bg-black relative flex items-center justify-center border border-slate-700 min-h-[200px] sm:min-h-[260px]">
                  <iframe 
                    className="w-full h-full absolute inset-0"
                    src="https://www.youtube.com/embed/fD3MeejO46g?si=vP8Q3d2TqLd8yL7G" 
                    title="English Conversation Greeting cartoon for kids" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                  />
                </div>

                <div className="text-center mt-3">
                  <p className="text-xs text-slate-400 font-extrabold">📺 วิดีโอตัวอย่างบทสนทนาเบื้องต้น สามารถฝึกฟังสำเนียงและพูดโต้ตอบไปพร้อมกันได้นะจ๊ะ!</p>
                </div>
              </div>

              {/* Column 2: CSS Interactive Dialogue Simulator (Right Side) */}
              <div className="lg:col-span-6 bg-gradient-to-b from-sky-400 to-sky-500 rounded-3xl p-5 flex flex-col justify-between border-4 border-white shadow-md relative min-h-[360px] sm:min-h-[400px] lg:min-h-[420px] text-white">
                
                {/* Simulator Header */}
                <div className="flex justify-between items-center mb-2 z-10">
                  <span className="bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold border border-white/20 flex items-center gap-1">
                    🎮 Interactive Cartoon Live Simulator
                  </span>
                  
                  {/* Select Lesson dropdown */}
                  <select
                    value={selectedLesson.id}
                    onChange={(e) => {
                      audioSynth.playPop();
                      const lesson = LESSONS.find(l => l.id === parseInt(e.target.value));
                      if (lesson) setSelectedLesson(lesson);
                    }}
                    className="bg-sky-600 text-white text-xs font-black border border-white/20 rounded-xl px-2 py-1 outline-none cursor-pointer"
                  >
                    {LESSONS.map(l => (
                      <option key={l.id} value={l.id}>ด่านที่ {l.id}</option>
                    ))}
                  </select>
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
                    simPlaying && simStep !== -1 && selectedLesson.dialogue[simStep].character === 'dino'
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
                    simPlaying && simStep !== -1 && selectedLesson.dialogue[simStep].character === 'bear'
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
                <div className="w-full text-center mt-3 z-10 flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      audioSynth.playPop();
                      runAnimationSimulation();
                    }}
                    disabled={simPlaying}
                    className={`btn-3d px-6 py-2.5 text-xs font-black rounded-2xl border-2 transition ${
                      simPlaying
                        ? 'bg-sky-600 text-sky-300 border-sky-700'
                        : 'bg-yellow-400 hover:bg-yellow-500 text-yellow-950 border-yellow-500 shadow-yellow-300'
                    }`}
                  >
                    {simPlaying ? '🎬 กำลังแสดงจำลอง...' : '🎬 เล่นอนิเมชันจำลองการพูด'}
                  </button>

                  <button
                    onClick={() => {
                      audioSynth.playPop();
                      setActiveTab('roleplay');
                    }}
                    className="btn-3d px-6 py-2.5 bg-purple-400 hover:bg-purple-500 text-white text-xs font-black rounded-2xl border-2 border-purple-500 shadow-purple-300"
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
          <div className="kids-card rounded-3xl p-6 md:p-8 bg-white text-left">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-2xl font-black text-purple-600 font-kids flex items-center gap-2">
                <span>🎭</span> กิจกรรมบทบาทสมมติอัจฉริยะ (Role-Play Game)
              </h2>
              <p className="text-xs font-extrabold text-slate-400 mt-1">เลือกตัวละครที่ต้องการสวมบทบาท แล้วสลับกันพูดโต้ตอบภาษาอังกฤษกับคอมพิวเตอร์เพื่อปลดล็อคด่านดาวทองคำ!</p>
            </div>

            {/* Game Setup options */}
            <div className="bg-purple-50/50 p-4 rounded-2xl border-2 border-purple-100 mb-6 flex flex-wrap justify-between items-center gap-4">
              
              {/* Choose Topic */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-purple-900">เลือกบทสนทนา:</span>
                <select
                  value={selectedLesson.id}
                  onChange={(e) => {
                    const l = LESSONS.find(lesson => lesson.id === parseInt(e.target.value));
                    if (l) startRolePlay(l);
                  }}
                  className="bg-white border-2 border-purple-200 text-purple-900 text-xs font-black rounded-xl px-3 py-1 outline-none cursor-pointer"
                >
                  {LESSONS.map(l => (
                    <option key={l.id} value={l.id}>{l.emoji} บทเรียนที่ {l.id}: {l.title}</option>
                  ))}
                </select>
              </div>

              {/* Choose Role */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-purple-900">สวมบทบาทเป็น:</span>
                <div className="flex bg-white p-0.5 rounded-xl border border-purple-200 shadow-inner">
                  <button
                    onClick={() => {
                      audioSynth.playPop();
                      setUserRole('dino');
                      setRolePlayStep(0);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition ${
                      userRole === 'dino'
                        ? 'bg-emerald-500 text-white shadow'
                        : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    น้องไดโน 🦖
                  </button>
                  <button
                    onClick={() => {
                      audioSynth.playPop();
                      setUserRole('bear');
                      setRolePlayStep(0);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition ${
                      userRole === 'bear'
                        ? 'bg-amber-600 text-white shadow'
                        : 'text-amber-800 hover:bg-amber-50'
                    }`}
                  >
                    พี่หมี 🐻
                  </button>
                </div>
              </div>

              {/* Restart button */}
              <button
                onClick={() => startRolePlay(selectedLesson)}
                className="px-4 py-1 bg-purple-600 text-white text-xs font-black rounded-xl border-2 border-purple-700 active:scale-95"
              >
                เริ่มเล่นใหม่ 🔄
              </button>

            </div>

            {/* Game Screen Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Column: Visual Characters Stage */}
              <div className="lg:col-span-5 bg-gradient-to-b from-purple-100 to-purple-50 rounded-3xl p-6 flex flex-col justify-between items-center border-4 border-white shadow-sm min-h-[360px]">
                <h4 className="text-xs font-black text-purple-700 bg-purple-100/60 px-3 py-1 rounded-full">เวทีกิจกรรมโต้ตอบสด 🎭</h4>
                
                <div className="flex w-full justify-around items-end mt-4">
                  {/* Dino character */}
                  <div className={`flex flex-col items-center transition ${
                    userRole === 'dino' ? 'border-b-4 border-emerald-400 pb-1' : ''
                  }`}>
                    <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full mb-1">
                      🦖 Dino {userRole === 'dino' ? '(หนูเอง)' : '(คู่หู)'}
                    </span>
                    <CartoonCharacter type="dino" state={dinoRoleState} className="w-24 h-24 sm:w-32 sm:h-32 md:w-56 md:h-56" />
                  </div>

                  {/* Bear character */}
                  <div className={`flex flex-col items-center transition ${
                    userRole === 'bear' ? 'border-b-4 border-amber-500 pb-1' : ''
                  }`}>
                    <span className="bg-amber-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full mb-1">
                      🐻 Bear {userRole === 'bear' ? '(หนูเอง)' : '(คู่หู)'}
                    </span>
                    <CartoonCharacter type="bear" state={bearRoleState} className="w-24 h-24 sm:w-32 sm:h-32 md:w-56 md:h-56" />
                  </div>
                </div>

                <div className="bg-white/80 border border-purple-200 rounded-2xl p-2.5 w-full text-center mt-4">
                  <p className="text-[11px] font-black text-purple-900">{rolePlayFeedback || 'เกมพร้อมแล้ว! กดอ่านบรรทัดของหนูเลยคนเก่ง'}</p>
                </div>
              </div>

              {/* Right Column: Game Dialog lines flow */}
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm flex flex-col justify-between">
                
                {/* Dialogue Progress Stream */}
                <div className="space-y-4">
                  {selectedLesson.dialogue.map((line, idx) => {
                    const isUserTurn = line.character === userRole;
                    const isCurrentStep = idx === rolePlayStep;
                    const isPassed = idx < rolePlayStep;

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border-2 transition-all flex justify-between items-center ${
                          isCurrentStep
                            ? 'bg-purple-100/60 border-purple-400 shadow-md ring-4 ring-purple-100 scale-[1.01]'
                            : isPassed
                            ? 'bg-slate-50 border-slate-200 opacity-60'
                            : 'bg-slate-50 border-slate-200 opacity-30 pointer-events-none'
                        }`}
                      >
                        <div className="flex gap-3 items-center">
                          <span className="text-2xl">{line.character === 'dino' ? '🦖' : '🐻'}</span>
                          <div className="text-left">
                            <p className="text-[10px] font-black text-slate-400">
                              {line.character === 'dino' ? 'Dino' : 'Bear'} {isUserTurn ? '(ตาหนูพูด)' : '(คู่หูพูด)'}
                            </p>
                            <p className="text-sm font-black text-slate-800 my-0.5">{line.text}</p>
                            <p className="text-[10px] text-slate-400 font-extrabold">{line.phonetic}</p>
                          </div>
                        </div>

                        {/* Interactive action logic */}
                        <div>
                          {isPassed ? (
                            <span className="text-emerald-500 font-black text-xs">ผ่านแล้ว! ✅</span>
                          ) : isCurrentStep ? (
                            isUserTurn ? (
                              <button
                                onClick={recordRolePlayLine}
                                disabled={isRolePlayListening}
                                className={`btn-3d px-3.5 py-1.5 rounded-xl text-xs font-black border-2 transition ${
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
                                className="px-3.5 py-1.5 bg-purple-400 hover:bg-purple-500 text-white rounded-xl text-xs font-black border-2 border-purple-500 shadow active:scale-95"
                              >
                                🔊 ฟังเสียงคู่หู
                              </button>
                            )
                          ) : (
                            <span className="text-slate-400 font-black text-xs">🔒 ล็อค</span>
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

        {/* TAB 6: ONLINE SPEAKING SUBMISSION */}
        {activeTab === 'submission' && (
          <div className="kids-card rounded-3xl p-6 md:p-8 bg-white text-left">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-2xl font-black text-pink-500 font-kids flex items-center gap-2">
                <span>🎙️</span> ระบบประเมินและส่งผลงานการพูดออนไลน์ (Speaking Submission & AI Score)
              </h2>
              <p className="text-xs font-extrabold text-slate-400 mt-1">อัดเสียงพูดโต้ตอบหรืออัดคลิปวิดีโอประเมินผลคะแนนความแม่นยำภาษาอังกฤษแบบ Real-time คำต่อคำ และบันทึกคะแนนส่งครูผ่านออนไลน์ได้ทันที!</p>
            </div>

            {(!speechSupported || micPermissionState === 'denied') && (
              <div className="mb-6 bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 text-left animate-pulse">
                <p className="text-rose-700 text-xs font-black flex items-center gap-2">
                  <span>⚠️</span> {errorMessage || 'ไมโครโฟนถูกปิดกั้นอยู่จ้า! กรุณาคลิกรูปกุญแจที่ช่อง URL ด้านบนและเลือก อนุญาตการเข้าถึงไมโครโฟน เพื่อให้น้องการ์ตูนประเมินผลการพูดได้นะคนเก่ง!'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Column: Interactive Mic / Video submission panel */}
              <div className="lg:col-span-6 bg-gradient-to-b from-pink-50 to-pink-100/50 rounded-3xl p-6 flex flex-col justify-between border-4 border-white shadow-sm min-h-[480px]">
                
                <div className="space-y-4">
                  
                  {/* Select Lesson Topic */}
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-xs font-black text-pink-900">1. เลือกหัวข้อที่จะส่งผลงาน:</label>
                    <select
                      value={submitSelectedLesson.id}
                      onChange={(e) => {
                        const l = LESSONS.find(lesson => lesson.id === parseInt(e.target.value));
                        if (l) {
                          setSubmitSelectedLesson(l);
                          setSubmittedScore(null);
                          setSubmittedTranscript('');
                          setSubmittedDiff([]);
                          setSubmissionFeedback('');
                        }
                      }}
                      className="bg-white border-2 border-pink-200 text-pink-900 text-sm font-black rounded-2xl px-4 py-2 outline-none cursor-pointer w-full"
                    >
                      {LESSONS.map(l => (
                        <option key={l.id} value={l.id}>{l.emoji} บทเรียนที่ {l.id}: {l.title} ({l.englishTitle})</option>
                      ))}
                    </select>
                  </div>

                  {/* Select Media type: Audio VS Video */}
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-xs font-black text-pink-900">2. เลือกประเภทการส่งงาน:</label>
                    <div className="grid grid-cols-2 gap-3 bg-white p-1 rounded-2xl border-2 border-pink-200">
                      <button
                        onClick={() => {
                          audioSynth.playPop();
                          setSubmitMediaType('audio');
                        }}
                        className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                          submitMediaType === 'audio'
                            ? 'bg-pink-400 text-white shadow'
                            : 'text-pink-600 hover:bg-pink-50'
                        }`}
                      >
                        <span>🎙️ อัดคลิปเสียง</span>
                      </button>
                      <button
                        onClick={() => {
                          audioSynth.playPop();
                          setSubmitMediaType('video');
                        }}
                        className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                          submitMediaType === 'video'
                            ? 'bg-rose-500 text-white shadow'
                            : 'text-rose-600 hover:bg-rose-50'
                        }`}
                      >
                        <span>📹 อัดคลิปวิดีโอ (กล้องสด)</span>
                      </button>
                    </div>
                  </div>

                  {/* Target Phrase Box */}
                  <div className="bg-white rounded-2xl p-4 border border-pink-200 text-left">
                    <p className="text-[10px] font-black text-slate-400">ประโยคภาษาอังกฤษเป้าหมาย (Target Sentence):</p>
                    <h4 className="text-lg font-black text-slate-800 my-1">
                      &ldquo;{submitSelectedLesson.dialogue
                        .filter(l => l.speaker === 'B')
                        .map(l => l.text)
                        .join(' ')}&rdquo;
                    </h4>
                    <p className="text-[10px] font-extrabold text-slate-400">คำอ่านไทย: {submitSelectedLesson.dialogue
                      .filter(l => l.speaker === 'B')
                      .map(l => l.phonetic)
                      .join(' ')}</p>
                    <p className="text-[10px] font-extrabold text-emerald-600 mt-1 border-t border-slate-50 pt-1">คำแปลไทย: {submitSelectedLesson.dialogue
                      .filter(l => l.speaker === 'B')
                      .map(l => l.translation)
                      .join(' ')}</p>
                  </div>

                </div>

                {/* Simulated Webcam or Waveform Container */}
                <div className="flex-1 w-full bg-slate-900 rounded-2xl overflow-hidden relative flex items-center justify-center border-2 border-white/40 min-h-[200px] my-4 shadow-inner">
                  {submitMediaType === 'video' ? (
                    videoStream ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover absolute inset-0"
                      />
                    ) : (
                      <div className="text-center text-slate-400 text-xs p-4 space-y-2">
                        <span className="text-5xl animate-bounce-gentle block">📹</span>
                        <p className="font-black">กรุณาอนุญาตเข้าถึงกล้องเว็บแคม...</p>
                        <p className="text-[10px] text-slate-500">ระบบจะแสดงกล้องสดขณะอัดส่งประเมินผลจ้า</p>
                      </div>
                    )
                  ) : (
                    // Waveform active ripple visualizer
                    <div className="h-20 flex items-center justify-center gap-1.5 w-full max-w-[220px]">
                      {isSubmissionListening ? (
                        Array.from({ length: 9 }).map((_, i) => (
                          <span
                            key={i}
                            className="w-2 bg-gradient-to-t from-pink-400 to-rose-500 rounded-full animate-wave-pulse"
                            style={{
                              height: `${[24, 48, 64, 32, 56, 72, 44, 28, 16][i]}px`,
                              animationDelay: `${i * 0.12}s`,
                              animationDuration: '1.2s'
                            }}
                          />
                        ))
                      ) : (
                        <div className="text-center text-slate-400 text-xs">
                          <span className="text-4xl block mb-2">🎙️</span>
                          <span className="font-black text-[10px] tracking-wider">ไมโครโฟนบันทึกเสียงระบบส่งงานพร้อมใช้</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Red flashing dot when listening */}
                  {isSubmissionListening && (
                    <div className="absolute top-3 right-3 bg-rose-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse border border-white">
                      <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />
                      REC
                    </div>
                  )}
                </div>

                {/* Micro record triggering button */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    {isSubmissionListening && (
                      <>
                        <span className="absolute inset-0 rounded-full bg-pink-500 animate-pulse-ring -z-10" />
                        <span className="absolute inset-0 rounded-full bg-rose-400 animate-pulse-ring -z-10" style={{ animationDelay: '0.6s' }} />
                      </>
                    )}

                    <button
                      onClick={recordSubmissionSpeech}
                      disabled={isSubmissionListening}
                      className={`btn-3d w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg transition ${
                        isSubmissionListening
                          ? 'bg-rose-600 text-white border-4 border-rose-700'
                          : 'bg-pink-400 hover:bg-pink-500 text-white border-4 border-pink-400 shadow-pink-300'
                      }`}
                    >
                      {isSubmissionListening ? '⏹️' : '🎙️'}
                    </button>
                  </div>

                  <p className="text-[11px] font-black text-pink-700">
                    {isSubmissionListening ? '🔴 กำลังอัดเสียงพูด... พูดให้เสียงดังชัดเจนนะจ๊ะ' : '👆 กดปุ่มไมค์เพื่อเริ่มพูดและอัดเสียงประเมิน'}
                  </p>
                </div>

              </div>

              {/* Right Column: AI Results & submission status table history */}
              <div className="lg:col-span-6 bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm flex flex-col justify-between">
                
                {/* Result Board */}
                <div className="space-y-5">
                  <h3 className="font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <span>📊</span> ผลการประเมินเสียงพูดจากระบบอัจฉริยะ (AI Speaking Score)
                  </h3>

                  {(submittedTranscript || submittedScore !== null) ? (
                    <div className="space-y-4">
                      
                      {/* Score circular display */}
                      {submittedScore !== null && (
                        <div className="flex items-center justify-between bg-sky-50/50 p-4 rounded-2xl border border-sky-100 gap-4">
                          <div className="text-left flex-1">
                            <span className="bg-sky-100 text-sky-700 font-black text-[9px] px-2.5 py-0.5 rounded-full">Transcript</span>
                            <p className="font-black text-base text-slate-800 italic mt-1.5">&ldquo;{submittedTranscript}&rdquo;</p>
                          </div>

                          <div className="shrink-0 flex flex-col items-center">
                            <div className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center font-black ${
                              submittedScore >= 80
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-600'
                                : 'bg-orange-50 border-orange-400 text-orange-600'
                            }`}>
                              <span className="text-xl">{submittedScore}%</span>
                              <span className="text-[8px] uppercase tracking-wider">Accuracy</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Word highlighting correct / incorrect */}
                      {submittedDiff.length > 0 && (
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left">
                          <p className="text-[10px] font-black text-slate-400 mb-1.5">เปรียบเทียบคำพูดสะกด (เขียว = ถูก | แดง = ผิด):</p>
                          <div className="flex flex-wrap gap-1.5">
                            {submittedDiff.map((seg, idx) => (
                              <span
                                key={idx}
                                className={`px-2.5 py-1 rounded-xl text-xs font-black border transition ${
                                  seg.isMatched
                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                    : 'bg-rose-100 text-rose-700 border-rose-200 line-through'
                                }`}
                              >
                                {seg.word}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Teacher message */}
                      {submissionFeedback && (
                        <div className={`p-4 rounded-2xl border-2 text-center ${
                          submittedScore !== null && submittedScore >= 80
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-orange-50 border-orange-200 text-orange-950'
                        }`}>
                          <span className="text-3xl animate-bounce block mb-1">
                            {submittedScore !== null && submittedScore >= 80 ? '👑🌟🤩' : '🍀💪❤️'}
                          </span>
                          <p className="text-xs font-black leading-relaxed">{submissionFeedback}</p>
                        </div>
                      )}

                      {/* Pink Submit button */}
                      {submittedScore !== null && (
                        <button
                          onClick={submitToTeacher}
                          disabled={isSubmittingRecord}
                          className={`btn-3d w-full py-3 text-white text-sm font-black rounded-2xl border-2 transition ${
                            isSubmittingRecord
                              ? 'bg-slate-400 border-slate-500 cursor-not-allowed'
                              : 'bg-pink-400 hover:bg-pink-500 border-pink-500 shadow-pink-300 active:translate-y-1'
                          }`}
                        >
                          {isSubmittingRecord ? 'กำลังอัปโหลดส่งผลงาน... 📤' : 'ส่งผลงานการประเมินนี้ไปยังคุณครู 💖⭐'}
                        </button>
                      )}

                    </div>
                  ) : (
                    <div className="text-center text-slate-400 text-xs py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <span className="text-4xl block mb-2">📊</span>
                      <p className="font-black">ยังไม่มีข้อมูลการประเมินการส่ง</p>
                      <p className="text-[10px] text-slate-400">กรุณาเลือกหัวข้อบทเรียนและกดไมโครโฟนอัดเสียงซ้ายมือจ้า!</p>
                    </div>
                  )}

                </div>

                {/* Summary scoreboard table */}
                <div className="border-t border-slate-100 pt-5 mt-6">
                  <h4 className="text-xs font-black text-slate-700 mb-3 text-left">📊 ตารางประวัติการส่งผลงานของน้องออม (Dashboard Feed):</h4>
                  
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-[11px] font-black">
                      <thead className="bg-slate-50 text-slate-400">
                        <tr>
                          <th className="p-2 font-black">บทเรียน</th>
                          <th className="p-2 text-center font-black hidden sm:table-cell">ประเภท</th>
                          <th className="p-2 text-center font-black">คะแนน</th>
                          <th className="p-2 text-right font-black">สถานะ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map((sub, i) => (
                          <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                            <td className="p-2 text-slate-700 font-extrabold truncate max-w-[140px]" title={sub.topic}>{sub.topic}</td>
                            <td className="p-2 text-center font-bold text-slate-400 hidden sm:table-cell">{sub.type}</td>
                            <td className="p-2 text-center text-sky-600 font-black">{sub.score ? `${sub.score}%` : '-'}</td>
                            <td className="p-2 text-right">
                              {sub.status === 'ตรวจแล้ว' ? (
                                <span className="text-emerald-600 font-black">ตรวจเสร็จสิ้น ✅</span>
                              ) : (
                                <span className="text-orange-500 font-black animate-pulse">กำลังตรวจ... ⏳</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

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
