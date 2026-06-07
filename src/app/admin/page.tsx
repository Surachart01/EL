'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LESSONS, LessonData } from '../../utils/lessons';

interface StudentSubmission {
  lessonId: number;
  score: number;
  mediaType: string;
  status: string;
  date: string;
}

interface StudentProgressData {
  studentId: string;
  name: string;
  classroom: string;
  progress: {
    flashcardScores: Record<string, number>;
    completedRoleplays: Record<string, boolean>;
    roleplayScores?: Record<string, number>;
    submissions: StudentSubmission[];
  };
}

export default function AdminDashboard() {
  // Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Roster / Data States
  const [students, setStudents] = useState<StudentProgressData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedClassroom, setSelectedClassroom] = useState<string>('All');
  const [selectedProgressFilter, setSelectedProgressFilter] = useState<string>('All');

  // Detail Modal state
  const [selectedStudent, setSelectedStudent] = useState<StudentProgressData | null>(null);
  const [viewedDetailLessonId, setViewedDetailLessonId] = useState<number>(1);

  // CRUD Modal states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [studentToEdit, setStudentToEdit] = useState<StudentProgressData | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<StudentProgressData | null>(null);

  // Form input states
  const [studentIdInput, setStudentIdInput] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [classroomInput, setClassroomInput] = useState<string>('p2-1');
  const [formError, setFormError] = useState<string>('');
  const [submittingForm, setSubmittingForm] = useState<boolean>(false);

  // Check auth on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('admin_auth');
      if (auth === 'true') {
        setIsAuthenticated(true);
      }
      setCheckingAuth(false);
    }
  }, []);

  // Fetch students on mount (or when authenticated changes)
  useEffect(() => {
    if (isAuthenticated) {
      fetchStudents();
    }
  }, [isAuthenticated]);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/students');
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
      } else {
        setError(data.error || 'ไม่สามารถโหลดข้อมูลนักเรียนได้');
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (adminUsername === 'admin' && adminPassword === 'admin123') {
      localStorage.setItem('admin_auth', 'true');
      setIsAuthenticated(true);
    } else {
      setLoginError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
    setAdminUsername('');
    setAdminPassword('');
  };

  // Helper: Format classroom name (e.g. p2-1 -> ป.2/1)
  const formatClassroom = (classroomName: string) => {
    if (!classroomName) return '';
    const clean = classroomName.toLowerCase();
    if (clean.startsWith('p')) {
      return `ป.${classroomName.slice(1).replace('-', '/')}`;
    }
    if (clean.startsWith('k')) {
      return `อ.${classroomName.slice(1).replace('-', '/')}`;
    }
    return classroomName;
  };

  // Helper: Get unique classroom names for filter dropdown
  const classrooms = ['All', ...Array.from(new Set(students.map((s) => s.classroom))).sort()];

  // Helper: Calculate progress percentage for a specific lesson
  const calculateLessonProgress = (student: StudentProgressData, lesson: LessonData) => {
    const { progress } = student;
    if (!progress) return 0;

    // 1. Flashcard progress
    const totalVocab = lesson.vocab.length;
    const passedFlashcards = lesson.vocab.filter((vocab, idx) => {
      const cardKey = `${lesson.id}-${idx}`;
      const score = (progress.flashcardScores && progress.flashcardScores[cardKey]) || 0;
      return score >= 80;
    }).length;
    const flashcardPct = totalVocab > 0 ? (passedFlashcards / totalVocab) * 100 : 0;

    // 2. Roleplay progress (percentage of dialogue user lines passed)
    const topics = lesson.dialogueTopics || [];
    let roleplayPct = 0;
    if (topics.length > 0) {
      const userRole = 'bear'; // Student is hardcoded to Bear 🐻 in page.tsx
      let totalTopicPct = 0;
      topics.forEach((topic, topicIdx) => {
        const userLines = topic.dialogue.filter(line => line.character === userRole);
        if (userLines.length === 0) {
          totalTopicPct += 100;
        } else {
          const passedLines = topic.dialogue.filter((line, lineIdx) => {
            if (line.character !== userRole) return false;
            const scoreKey = `${lesson.id}_${topicIdx}_${lineIdx}`;
            const score = (progress.roleplayScores && progress.roleplayScores[scoreKey]) || 0;
            return score >= 80;
          }).length;
          totalTopicPct += (passedLines / userLines.length) * 100;
        }
      });
      roleplayPct = totalTopicPct / topics.length;
    } else {
      // Fallback to old boolean check
      roleplayPct = (progress.completedRoleplays && progress.completedRoleplays[String(lesson.id)]) ? 100 : 0;
    }

    // Combined overall lesson progress (50% vocab, 50% roleplay)
    const overall = (flashcardPct + roleplayPct) / 2;
    return Math.round(overall);
  };

  // Helper: Calculate overall completion rate across all 6 lessons for a student
  const calculateOverallProgress = (student: StudentProgressData) => {
    if (LESSONS.length === 0) return 0;
    const sum = LESSONS.reduce((acc, lesson) => acc + calculateLessonProgress(student, lesson), 0);
    return Math.round(sum / LESSONS.length);
  };

  // CRUD Operations
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!studentIdInput || !nameInput || !classroomInput) {
      setFormError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    setSubmittingForm(true);
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentIdInput.trim(),
          name: nameInput.trim(),
          classroom: classroomInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setStudentIdInput('');
        setNameInput('');
        setClassroomInput('p2-1');
        fetchStudents();
      } else {
        setFormError(data.error || 'ไม่สามารถเพิ่มข้อมูลนักเรียนได้');
      }
    } catch {
      setFormError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!studentToEdit) return;

    if (!nameInput || !classroomInput) {
      setFormError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setSubmittingForm(true);
    try {
      const res = await fetch('/api/admin/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentToEdit.studentId,
          name: nameInput.trim(),
          classroom: classroomInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowEditModal(false);
        setStudentToEdit(null);
        setNameInput('');
        fetchStudents();
      } else {
        setFormError(data.error || 'ไม่สามารถแก้ไขข้อมูลได้');
      }
    } catch {
      setFormError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    setSubmittingForm(true);
    setFormError('');
    try {
      const res = await fetch(`/api/admin/students?studentId=${studentToDelete.studentId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setShowDeleteModal(false);
        setStudentToDelete(null);
        fetchStudents();
      } else {
        setFormError(data.error || 'ไม่สามารถลบข้อมูลนักเรียนได้');
      }
    } catch {
      setFormError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setSubmittingForm(false);
    }
  };

  // Filter students based on search, classroom, and progress level
  const filteredStudents = students.filter((student) => {
    // 1. Search filter
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.includes(searchTerm);

    // 2. Classroom filter
    const matchesClassroom = selectedClassroom === 'All' || student.classroom === selectedClassroom;

    // 3. Progress filter
    const overallProgress = calculateOverallProgress(student);
    let matchesProgress = true;
    if (selectedProgressFilter === 'Not Started') {
      matchesProgress = overallProgress === 0;
    } else if (selectedProgressFilter === 'In Progress') {
      matchesProgress = overallProgress > 0 && overallProgress < 100;
    } else if (selectedProgressFilter === 'Completed') {
      matchesProgress = overallProgress === 100;
    }

    return matchesSearch && matchesClassroom && matchesProgress;
  });

  // Summary Metrics calculations
  const totalStudents = students.length;

  const activeStudents = students.filter((student) => {
    const hasScores = student.progress.flashcardScores && Object.values(student.progress.flashcardScores).some(score => score >= 80);
    const hasRoleplays = student.progress.completedRoleplays && Object.values(student.progress.completedRoleplays).some(val => val === true);
    const hasSubmissions = student.progress.submissions && student.progress.submissions.length > 0;
    return hasScores || hasRoleplays || hasSubmissions;
  }).length;

  const averageOverallProgress = totalStudents > 0
    ? Math.round(students.reduce((sum, s) => sum + calculateOverallProgress(s), 0) / totalStudents)
    : 0;

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // --- LOGIN PAGE ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f3f9fc] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background clouds */}
        <div className="absolute top-16 left-6 text-6xl opacity-10 pointer-events-none animate-float-slow hidden md:block">☁️</div>
        <div className="absolute top-32 right-12 text-7xl opacity-10 pointer-events-none animate-float hidden md:block">☁️</div>

        <div className="max-w-md w-full bg-white rounded-3xl shadow-[0_10px_35px_rgba(203,213,225,0.4)] border-4 border-white p-8 text-center relative z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="text-5xl animate-bounce-gentle">🔑</div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight font-kids">
              ระบบผู้ดูแลระบบ (Admin)
            </h1>
            <p className="text-xs font-bold text-slate-400">กรุณาป้อนข้อมูลบัญชีผู้ใช้เพื่อความปลอดภัย</p>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div className="space-y-3">
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="ชื่อผู้ใช้งาน (Username)"
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-indigo-400 focus:outline-none font-bold text-sm text-slate-800 transition"
                required
              />
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="รหัสผ่าน (Password)"
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-indigo-400 focus:outline-none font-bold text-sm text-slate-800 transition"
                required
              />
            </div>

            {loginError && (
              <p className="text-xs font-black text-rose-500 animate-pulse bg-rose-50 border border-rose-100 rounded-xl py-2 px-3">
                ⚠️ {loginError}
              </p>
            )}

            <button
              type="submit"
              className="btn-3d w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-black rounded-2xl border-2 border-indigo-600 shadow-indigo-300 transition-all flex items-center justify-center gap-2"
            >
              เข้าสู่ระบบ 🚀
            </button>

            <Link
              href="/"
              className="block text-xs font-bold text-slate-400 hover:text-indigo-600 transition mt-2"
            >
              🏠 กลับไปยังหน้าหลักของนักเรียน
            </Link>
          </form>
        </div>
      </div>
    );
  }

  // --- DASHBOARD UI ---
  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 px-4 md:px-8 font-sans select-none text-slate-800 relative">
      {/* Background clouds */}
      <div className="absolute top-16 left-6 text-6xl opacity-10 pointer-events-none animate-float-slow hidden md:block">☁️</div>
      <div className="absolute top-32 right-12 text-7xl opacity-10 pointer-events-none animate-float hidden md:block">☁️</div>

      <div className="max-w-[1280px] mx-auto space-y-6 relative z-10">
        
        {/* Header Bar */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-white p-5 rounded-3xl border-4 border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] gap-4">
          <div className="flex items-center gap-3">
            {/* Logo replica */}
            <div className="w-12 h-12 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 64 64" className="w-full h-full text-indigo-500 fill-current">
                <rect x="22" y="10" width="20" height="44" rx="2" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2" />
                <rect x="25" y="16" width="14" height="14" rx="7" fill="#ffffff" stroke="#4f46e5" strokeWidth="2" />
                <path d="M 32 23 L 32 20 M 32 23 L 35 23" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
                <polygon points="32,2 20,10 44,10" fill="#fecaca" stroke="#dc2626" strokeWidth="2" />
                <rect x="28" y="36" width="8" height="14" rx="4" fill="#818cf8" stroke="#4f46e5" strokeWidth="1.5" />
              </svg>
            </div>

            <div className="text-left">
              <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
                <span>ระบบรายงานความคืบหน้า</span>
                <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-black">Admin Panel</span>
              </h1>
              <p className="text-xs font-bold text-slate-400 mt-1">ติดตามพัฒนาการและผลคะแนนวิชาภาษาอังกฤษของนักเรียน โรงเรียนเทศบาล ๘</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setFormError('');
                setStudentIdInput('');
                setNameInput('');
                setClassroomInput('p2-1');
                setShowAddModal(true);
              }}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-black rounded-2xl border-2 border-emerald-600 shadow-sm active:scale-95 transition flex items-center gap-1.5"
            >
              ➕ เพิ่มนักเรียนใหม่
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-black rounded-2xl border-2 border-rose-600 shadow-sm active:scale-95 transition flex items-center gap-1.5"
            >
              🚪 ออกจากระบบ
            </button>

            <Link
              href="/"
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-black rounded-2xl border-2 border-slate-200 shadow-sm active:scale-95 transition flex items-center gap-1.5"
            >
              🏠 กลับหน้าเรียน
            </Link>
          </div>
        </header>

        {/* METRICS SUMMARY BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Total Students */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[28px] p-6 text-white border-4 border-white shadow-lg relative overflow-hidden flex items-center justify-between">
            <div className="space-y-1 text-left">
              <p className="text-xs font-black text-indigo-100 uppercase tracking-wider">นักเรียนในระบบทั้งหมด</p>
              <h3 className="text-4xl font-black">{totalStudents} <span className="text-lg font-bold">คน</span></h3>
              <p className="text-[10px] text-indigo-200">นำเข้าจากระบบประวัติการศึกษา ปีการศึกษา 2569</p>
            </div>
            <span className="text-5xl opacity-20">🎒</span>
          </div>

          {/* Card 2: Active Students */}
          <div className="bg-gradient-to-br from-emerald-400 to-teal-600 rounded-[28px] p-6 text-white border-4 border-white shadow-lg relative overflow-hidden flex items-center justify-between">
            <div className="space-y-1 text-left">
              <p className="text-xs font-black text-emerald-100 uppercase tracking-wider">นักเรียนที่มีความเคลื่อนไหว</p>
              <h3 className="text-4xl font-black">
                {activeStudents} <span className="text-lg font-bold">คน</span>
                <span className="text-xs font-black bg-white/20 px-2 py-0.5 rounded-full ml-2">
                  {totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0}%
                </span>
              </h3>
              <p className="text-[10px] text-emerald-100">มีกิจกรรมการออกเสียงคำศัพท์ เข้าฝึก หรือมีการส่งการพูด</p>
            </div>
            <span className="text-5xl opacity-20">⚡</span>
          </div>

          {/* Card 3: Avg overall completion */}
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[28px] p-6 text-white border-4 border-white shadow-lg relative overflow-hidden flex items-center justify-between">
            <div className="space-y-1 text-left">
              <p className="text-xs font-black text-amber-100 uppercase tracking-wider">ความคืบหน้าเฉลี่ยโปรแกรม</p>
              <h3 className="text-4xl font-black">{averageOverallProgress}%</h3>
              {/* Overall Progress Bar */}
              <div className="w-full bg-white/20 h-2.5 rounded-full mt-2 overflow-hidden border border-white/10">
                <div className="bg-white h-full transition-all duration-500" style={{ width: `${averageOverallProgress}%` }} />
              </div>
            </div>
            <span className="text-5xl opacity-20">📊</span>
          </div>
        </div>

        {/* FILTERS & SEARCH MODULE */}
        <div className="bg-white p-5 rounded-3xl border-4 border-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          {/* Search bar */}
          <div className="flex-1 min-w-[240px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 ค้นหารหัสนักเรียน หรือ ชื่อ-สกุล..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-indigo-400 focus:outline-none font-bold text-sm text-slate-800 placeholder-slate-400 transition"
            />
          </div>

          {/* Classroom Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-400 shrink-0">ห้องเรียน:</span>
            <select
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              className="bg-slate-50 border-2 border-slate-100 text-slate-700 text-xs font-black rounded-xl px-3 py-2.5 outline-none cursor-pointer hover:bg-slate-100 transition"
            >
              {classrooms.map((cls) => (
                <option key={cls} value={cls}>
                  {cls === 'All' ? 'ทุกห้องเรียน' : formatClassroom(cls)}
                </option>
              ))}
            </select>
          </div>

          {/* Progress State Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-400 shrink-0">ความคืบหน้า:</span>
            <select
              value={selectedProgressFilter}
              onChange={(e) => setSelectedProgressFilter(e.target.value)}
              className="bg-slate-50 border-2 border-slate-100 text-slate-700 text-xs font-black rounded-xl px-3 py-2.5 outline-none cursor-pointer hover:bg-slate-100 transition"
            >
              <option value="All">ทั้งหมด</option>
              <option value="Not Started">ยังไม่เริ่มต้น (0%)</option>
              <option value="In Progress">กำลังเรียนรู้ (1-99%)</option>
              <option value="Completed">เสร็จสมบูรณ์ (100%)</option>
            </select>
          </div>

          {/* Reset Filters button */}
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedClassroom('All');
              setSelectedProgressFilter('All');
            }}
            className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-black rounded-xl border border-slate-200 transition"
          >
            🧹 ล้างตัวกรอง
          </button>
        </div>

        {/* DATA CONTAINER */}
        <div className="bg-white rounded-3xl border-4 border-white shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-black text-slate-400">กำลังดาวน์โหลดข้อมูลนักเรียนและวิเคราะห์รายงาน...</p>
            </div>
          ) : error ? (
            <div className="p-16 text-center space-y-4">
              <span className="text-5xl">⚠️</span>
              <p className="text-rose-500 font-black text-base">{error}</p>
              <button
                onClick={fetchStudents}
                className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-black rounded-xl transition"
              >
                🔄 ลองใหม่อีกครั้ง
              </button>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-16 text-center space-y-2">
              <span className="text-5xl">🔍</span>
              <p className="text-slate-500 font-black text-base">ไม่พบข้อมูลนักเรียนที่สอดคล้องกับเงื่อนไข</p>
              <p className="text-xs text-slate-400">ลองแก้ไขคำค้นหา หรือเปลี่ยนตัวกรองห้องเรียน/ความคืบหน้าดูนะจ๊ะ</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 border-b border-slate-100 text-[11px] font-black uppercase tracking-wider">
                    <th className="p-4 w-[12%]">รหัสนักเรียน</th>
                    <th className="p-4 w-[25%]">ชื่อ-นามสกุล</th>
                    <th className="p-4 w-[12%] text-center">ห้องเรียน</th>
                    <th className="p-4 w-[15%] text-center">ความคืบหน้ารวม</th>
                    <th className="p-4 w-[25%] hidden md:table-cell">ด่านบทเรียน (1-6)</th>
                    <th className="p-4 w-[16%] text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {filteredStudents.map((student) => {
                    const overallProgress = calculateOverallProgress(student);
                    return (
                      <tr
                        key={student.studentId}
                        className="hover:bg-slate-50/40 transition duration-150"
                      >
                        {/* Student ID */}
                        <td className="p-4 font-black text-slate-500">{student.studentId}</td>

                        {/* Student Name */}
                        <td className="p-4 font-black text-slate-800 text-base">{student.name}</td>

                        {/* Classroom */}
                        <td className="p-4 text-center">
                          <span className="bg-slate-100 text-slate-700 text-xs font-black px-2.5 py-1 rounded-lg">
                            {formatClassroom(student.classroom)}
                          </span>
                        </td>

                        {/* Overall progress bar */}
                        <td className="p-4">
                          <div className="flex flex-col items-center gap-1.5">
                            <span className={`text-xs font-black ${
                              overallProgress === 100 ? 'text-emerald-600' : overallProgress > 0 ? 'text-indigo-600' : 'text-slate-400'
                            }`}>
                              {overallProgress}%
                            </span>
                            <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  overallProgress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                                }`}
                                style={{ width: `${overallProgress}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* 6 Lesson mini dots */}
                        <td className="p-4 hidden md:table-cell">
                          <div className="flex gap-1.5 items-center justify-start">
                            {LESSONS.map((lesson) => {
                              const lessonProg = calculateLessonProgress(student, lesson);
                              return (
                                <div
                                  key={lesson.id}
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[9px] border transition-all ${
                                    lessonProg === 100
                                      ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                                      : lessonProg > 0
                                      ? 'bg-indigo-50 border-indigo-200 text-indigo-650'
                                      : 'bg-slate-50 border-slate-200 text-slate-400'
                                  }`}
                                  title={`บทที่ ${lesson.id}: ${lesson.title} - ${lessonProg}%`}
                                >
                                  {lesson.id}
                                </div>
                              );
                            })}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedStudent(student)}
                              className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl border border-indigo-200 transition"
                              title="ดูประวัติการเรียน"
                            >
                              🔍
                            </button>
                            <button
                              onClick={() => {
                                setStudentToEdit(student);
                                setNameInput(student.name);
                                setClassroomInput(student.classroom);
                                setFormError('');
                                setShowEditModal(true);
                              }}
                              className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl border border-amber-200 transition"
                              title="แก้ไขข้อมูลนักเรียน"
                            >
                              📝
                            </button>
                            <button
                              onClick={() => {
                                setStudentToDelete(student);
                                setFormError('');
                                setShowDeleteModal(true);
                              }}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 transition"
                              title="ลบนักเรียน"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* --- ADD STUDENT MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border-4 border-white shadow-2xl max-w-md w-full overflow-hidden p-6 relative">
            <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
              <span>➕</span> เพิ่มนักเรียนใหม่
            </h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-black text-slate-500">รหัสนักเรียน (เลขรหัสสำหรับเข้าเรียน)</label>
                <input
                  type="text"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  placeholder="เช่น 201"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-indigo-400 focus:outline-none font-bold text-sm text-slate-800 transition"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-black text-slate-500">ชื่อ - นามสกุล</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="เช่น เด็กชายรักเรียน ดีเด่น"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-indigo-400 focus:outline-none font-bold text-sm text-slate-800 transition"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-black text-slate-500">ห้องเรียน (Classroom)</label>
                <select
                  value={classroomInput}
                  onChange={(e) => setClassroomInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-white focus:border-indigo-400 focus:outline-none font-bold text-sm text-slate-800 transition cursor-pointer"
                >
                  <option value="p2-1">ประถมศึกษาปีที่ 2/1 (ป.2/1)</option>
                  <option value="p2-2">ประถมศึกษาปีที่ 2/2 (ป.2/2)</option>
                  <option value="p2-3">ประถมศึกษาปีที่ 2/3 (ป.2/3)</option>
                  <option value="p2-4">ประถมศึกษาปีที่ 2/4 (ป.2/4)</option>
                </select>
              </div>

              {formError && (
                <p className="text-xs font-black text-rose-500 animate-pulse bg-rose-50 border border-rose-100 rounded-xl py-2 px-3">
                  ⚠️ {formError}
                </p>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 font-black rounded-xl border border-slate-200 transition text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl border-2 border-emerald-600 transition text-xs flex items-center gap-1.5 shadow-sm"
                >
                  {submittingForm && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT STUDENT MODAL --- */}
      {showEditModal && studentToEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border-4 border-white shadow-2xl max-w-md w-full overflow-hidden p-6 relative">
            <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
              <span>📝</span> แก้ไขข้อมูลนักเรียน
            </h3>
            <form onSubmit={handleEditStudent} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-black text-slate-400">รหัสนักเรียน (ไม่สามารถแก้ไขได้)</label>
                <input
                  type="text"
                  value={studentToEdit.studentId}
                  disabled
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold text-sm text-slate-400 outline-none"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-black text-slate-500">ชื่อ - นามสกุล</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="เช่น เด็กชายรักเรียน ดีเด่น"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-indigo-400 focus:outline-none font-bold text-sm text-slate-800 transition"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-black text-slate-500">ห้องเรียน (Classroom)</label>
                <select
                  value={classroomInput}
                  onChange={(e) => setClassroomInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-white focus:border-indigo-400 focus:outline-none font-bold text-sm text-slate-800 transition cursor-pointer"
                >
                  <option value="p2-1">ประถมศึกษาปีที่ 2/1 (ป.2/1)</option>
                  <option value="p2-2">ประถมศึกษาปีที่ 2/2 (ป.2/2)</option>
                  <option value="p2-3">ประถมศึกษาปีที่ 2/3 (ป.2/3)</option>
                  <option value="p2-4">ประถมศึกษาปีที่ 2/4 (ป.2/4)</option>
                </select>
              </div>

              {formError && (
                <p className="text-xs font-black text-rose-500 animate-pulse bg-rose-50 border border-rose-100 rounded-xl py-2 px-3">
                  ⚠️ {formError}
                </p>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 font-black rounded-xl border border-slate-200 transition text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-xl border-2 border-indigo-600 transition text-xs flex items-center gap-1.5 shadow-sm"
                >
                  {submittingForm && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  อัปเดตข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border-4 border-white shadow-2xl max-w-sm w-full overflow-hidden p-6 relative">
            <h3 className="text-xl font-black text-rose-600 mb-2 flex items-center gap-2">
              <span>⚠️</span> ลบข้อมูลนักเรียน
            </h3>
            <p className="text-slate-600 font-bold text-sm leading-relaxed text-left">
              คุณต้องการลบข้อมูลของ <span className="font-black text-slate-800">&ldquo;{studentToDelete.name}&rdquo;</span> (รหัส {studentToDelete.studentId}) ใช่หรือไม่?
            </p>
            <p className="text-xs font-bold text-rose-500 mt-2 bg-rose-50 border border-rose-100 p-2.5 rounded-xl leading-normal text-left">
              🚨 คำเตือน: ข้อมูลคะแนนและประวัติการเรียนรู้ (ความก้าวหน้าบัตรคำศัพท์ บทบาทสมมติ และคลิปเสียงผลงานทั้งหมด) จะถูกลบออกอย่างถาวรและไม่สามารถกู้คืนได้!
            </p>

            {formError && (
              <p className="text-xs font-black text-rose-500 mt-3 animate-pulse bg-rose-50 border border-rose-100 rounded-xl py-2 px-3">
                ⚠️ {formError}
              </p>
            )}

            <div className="flex gap-3 justify-end pt-4 mt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 font-black rounded-xl border border-slate-200 transition text-xs"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeleteStudent}
                disabled={submittingForm}
                className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-xl border-2 border-rose-600 transition text-xs flex items-center gap-1.5 shadow-sm"
              >
                {submittingForm && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DETAIL MODAL --- */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#f8fafc] rounded-[36px] border-4 border-white shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4 mb-4">
              <div className="text-left">
                <span className="text-xs font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-lg">ประวัติประเมินการเรียนรายบุคคล</span>
                <h3 className="text-2xl font-black text-slate-800 mt-2 flex items-center gap-2">
                  <span>👧</span> {selectedStudent.name}
                </h3>
                <p className="text-xs font-bold text-slate-400 mt-1">
                  รหัสประจำตัว: {selectedStudent.studentId} | ชั้นเรียน: {formatClassroom(selectedStudent.classroom)}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-6 flex-1 text-left">
              {/* Overall Course Progress */}
              <div className="bg-white rounded-3xl p-5 border border-slate-150 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="font-black text-slate-800 text-sm">ความก้าวหน้ารวมในบทเรียนทั้งหมด</h4>
                  <p className="text-xs text-slate-400 mt-0.5">รวมสถิติจากทั้ง 5 บทเรียนหลักในระบบ</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="w-full md:w-48 bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="bg-indigo-500 h-full transition-all duration-500"
                      style={{ width: `${calculateOverallProgress(selectedStudent)}%` }}
                    />
                  </div>
                  <span className="text-lg font-black text-indigo-700">
                    {calculateOverallProgress(selectedStudent)}%
                  </span>
                </div>
              </div>

              {/* 5 Lessons grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {LESSONS.map((lesson) => {
                  const lessonProg = calculateLessonProgress(selectedStudent, lesson);
                  const totalVocab = lesson.vocab.length;
                  const passedVocab = lesson.vocab.filter((_, idx) => {
                    const cardKey = `${lesson.id}-${idx}`;
                    return ((selectedStudent.progress.flashcardScores && selectedStudent.progress.flashcardScores[cardKey]) || 0) >= 80;
                  }).length;
                  
                  // Roleplay progress percentage
                  const topics = lesson.dialogueTopics || [];
                  let roleplayPct = 0;
                  if (topics.length > 0) {
                    const userRole = 'bear';
                    let totalTopicPct = 0;
                    topics.forEach((topic, topicIdx) => {
                      const userLines = topic.dialogue.filter(line => line.character === userRole);
                      if (userLines.length === 0) {
                        totalTopicPct += 100;
                      } else {
                        const passedLines = topic.dialogue.filter((line, lineIdx) => {
                          if (line.character !== userRole) return false;
                          const scoreKey = `${lesson.id}_${topicIdx}_${lineIdx}`;
                          const score = (selectedStudent.progress.roleplayScores && selectedStudent.progress.roleplayScores[scoreKey]) || 0;
                          return score >= 80;
                        }).length;
                        totalTopicPct += (passedLines / userLines.length) * 100;
                      }
                    });
                    roleplayPct = totalTopicPct / topics.length;
                  }

                  return (
                    <div
                      key={lesson.id}
                      className={`bg-white rounded-3xl p-4 border transition-all ${
                        lessonProg === 100 ? 'border-emerald-300 shadow-emerald-50' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{lesson.emoji}</span>
                          <div>
                            <h5 className="font-black text-slate-800 text-xs">บทที่ {lesson.id}: {lesson.title}</h5>
                            <p className="text-[9px] font-bold text-slate-400">{lesson.englishTitle}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          lessonProg === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {lessonProg}%
                        </span>
                      </div>

                      {/* Activities checklist */}
                      <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-[10px] font-bold">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">🎴 บัตรคำศัพท์ (Flashcard)</span>
                          <span className={passedVocab === totalVocab ? 'text-emerald-600' : 'text-slate-650'}>
                            {passedVocab === totalVocab ? '✅ ผ่านครบ' : `${passedVocab}/${totalVocab}`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">🎭 บทบาทสมมติ (Roleplay)</span>
                          <span className={roleplayPct === 100 ? 'text-emerald-600' : 'text-slate-650'}>
                            {roleplayPct === 100 ? '✅ สำเร็จ' : `⏳ ${Math.round(roleplayPct)}%`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detailed Speaking Progress History */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-black text-slate-800 text-sm">รายละเอียดประวัติการพูดราย Unit & Topic</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-bold">ตรวจสอบระดับคะแนนแยกรายคำศัพท์และประโยคบทบาทสมมติ</p>
                  </div>
                  
                  {/* Select Lesson to inspect */}
                  <div className="flex gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
                    {LESSONS.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => setViewedDetailLessonId(l.id)}
                        className={`px-3 py-1 rounded-xl text-[10px] font-black border transition ${
                          viewedDetailLessonId === l.id
                            ? 'bg-indigo-500 text-white border-indigo-500'
                            : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Unit {l.id}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inspect Content */}
                {(() => {
                  const lesson = LESSONS.find((l) => l.id === viewedDetailLessonId);
                  if (!lesson) return null;

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                      
                      {/* Vocabulary list (Left) */}
                      <div className="lg:col-span-5 bg-orange-50/20 p-4 rounded-3xl border border-orange-100 shadow-sm space-y-3">
                        <div className="flex items-center gap-1.5 border-b border-orange-100 pb-2">
                          <span className="text-xl">🎴</span>
                          <h5 className="font-black text-xs text-orange-950">ประวัติการทดสอบคำศัพท์ (Vocabulary Scores)</h5>
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 text-left">
                          {lesson.vocab.map((v, vIdx) => {
                            const cardKey = `${lesson.id}-${vIdx}`;
                            const score = (selectedStudent.progress.flashcardScores && selectedStudent.progress.flashcardScores[cardKey]) || 0;
                            const isPassed = score >= 80;
                            return (
                              <div key={vIdx} className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center text-[11px] font-bold">
                                <div>
                                  <p className="text-slate-800 font-black">{v.word}</p>
                                  <p className="text-[9px] text-slate-400">{v.translation} ({v.phonetic})</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 ${
                                  score > 0
                                    ? isPassed
                                      ? 'bg-emerald-100 text-emerald-850'
                                      : 'bg-rose-100 text-rose-850'
                                    : 'bg-slate-100 text-slate-400'
                                }`}>
                                  {score > 0 ? `${score}% ${isPassed ? '⭐ ผ่าน' : 'ไม่ผ่าน'}` : 'ยังไม่ได้ฝึก'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Role-play dialogues (Right) */}
                      <div className="lg:col-span-7 bg-purple-50/20 p-4 rounded-3xl border border-purple-100 shadow-sm space-y-3">
                        <div className="flex items-center gap-1.5 border-b border-purple-100 pb-2">
                          <span className="text-xl">🎭</span>
                          <h5 className="font-black text-xs text-purple-950">ประวัติการทดสอบบทบาทสมมติ (Roleplay Dialogue Scores)</h5>
                        </div>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                          {lesson.dialogueTopics && lesson.dialogueTopics.length > 0 ? (
                            lesson.dialogueTopics.map((topic, topicIdx) => {
                              const userRole = 'bear'; // Student role
                              const userLines = topic.dialogue.filter(line => line.character === userRole);
                              const passedLinesCount = topic.dialogue.filter((line, lineIdx) => {
                                if (line.character !== userRole) return false;
                                const scoreKey = `${lesson.id}_${topicIdx}_${lineIdx}`;
                                const score = (selectedStudent.progress.roleplayScores && selectedStudent.progress.roleplayScores[scoreKey]) || 0;
                                return score >= 80;
                              }).length;
                              const topicPercent = userLines.length > 0 ? Math.round((passedLinesCount / userLines.length) * 100) : 100;

                              return (
                                <div key={topicIdx} className="bg-white p-3 rounded-2xl border border-slate-150 shadow-sm space-y-2">
                                  <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                                    <h6 className="font-black text-[11px] text-purple-900 text-left">หัวข้อ: {topic.title}</h6>
                                    <span className="text-[10px] font-black px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">{topicPercent}% ผ่าน</span>
                                  </div>
                                  <div className="space-y-1.5 text-left">
                                    {topic.dialogue.map((line, lineIdx) => {
                                      const isUserLine = line.character === userRole;
                                      const scoreKey = `${lesson.id}_${topicIdx}_${lineIdx}`;
                                      const score = (selectedStudent.progress.roleplayScores && selectedStudent.progress.roleplayScores[scoreKey]) || 0;
                                      const isPassed = score >= 80;
                                      
                                      if (!isUserLine) {
                                        return (
                                          <div key={lineIdx} className="bg-slate-50/50 p-2 rounded-xl text-[10px] text-slate-400 font-bold border border-slate-100/50 flex justify-between items-center">
                                            <span>💬 {line.character === 'dino' ? 'Dino 🦖' : 'Bear 🐻'}: {line.text}</span>
                                            <span className="text-[9px] text-slate-400">คู่หู</span>
                                          </div>
                                        );
                                      }

                                      return (
                                        <div key={lineIdx} className="bg-purple-50/30 p-2 rounded-xl text-[10px] font-bold border border-purple-100 flex justify-between items-center">
                                          <div>
                                            <p className="text-purple-900 font-black">Bear 🐻: {line.text}</p>
                                            <p className="text-[8px] text-slate-400 font-bold">{line.translation}</p>
                                          </div>
                                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 ${
                                            score > 0
                                              ? isPassed
                                                ? 'bg-emerald-100 text-emerald-850'
                                                : 'bg-rose-100 text-rose-850'
                                              : 'bg-slate-100 text-slate-400'
                                          }`}>
                                            {score > 0 ? `${score}% ${isPassed ? 'ผ่าน' : 'ไม่ผ่าน'}` : 'ยังไม่พูด'}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-xs text-slate-400 font-bold text-center py-4 bg-slate-50 rounded-2xl">ไม่มีข้อมูลหัวข้อบทสนทนา</p>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}