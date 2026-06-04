/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConnect from '@/lib/database';
import Student from '@/models/Student';
import Progress from '@/models/Progress';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();

    const [students, progresses] = await Promise.all([
      Student.find({}).lean(),
      Progress.find({}).lean(),
    ]);

    const progressMap = new Map();
    for (const prog of progresses) {
      progressMap.set(prog.studentId, {
        flashcardScores: prog.flashcardScores ? Object.fromEntries(prog.flashcardScores instanceof Map ? prog.flashcardScores : new Map(Object.entries(prog.flashcardScores))) : {},
        completedRoleplays: prog.completedRoleplays ? Object.fromEntries(prog.completedRoleplays instanceof Map ? prog.completedRoleplays : new Map(Object.entries(prog.completedRoleplays))) : {},
        submissions: prog.submissions || [],
      });
    }

    const studentsWithProgress = students.map((std: any) => {
      const prog = progressMap.get(std.studentId) || {
        flashcardScores: {},
        completedRoleplays: {},
        submissions: [],
      };
      return {
        studentId: std.studentId,
        name: std.name,
        classroom: std.classroom,
        progress: prog,
      };
    });

    // Sort numerically by studentId
    studentsWithProgress.sort((a: any, b: any) => {
      const numA = parseInt(a.studentId.replace(/[^0-9]/g, ''), 10) || 0;
      const numB = parseInt(b.studentId.replace(/[^0-9]/g, ''), 10) || 0;
      return numA - numB;
    });

    return NextResponse.json({
      success: true,
      students: studentsWithProgress,
    });
  } catch (error: any) {
    console.error('Fetch admin students error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { studentId, name, classroom } = body;

    if (!studentId || !name || !classroom) {
      return NextResponse.json({ success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }

    // Check if studentId already exists
    const existing = await Student.findOne({ studentId });
    if (existing) {
      return NextResponse.json({ success: false, error: 'รหัสนักเรียนนี้มีในระบบแล้ว' }, { status: 400 });
    }

    const newStudent = await Student.create({ studentId, name, classroom });
    
    // Create empty progress
    await Progress.create({
      studentId,
      flashcardScores: {},
      completedRoleplays: {},
      submissions: [],
    });

    return NextResponse.json({ success: true, student: newStudent });
  } catch (error: any) {
    console.error('Create student error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { studentId, name, classroom } = body;

    if (!studentId || !name || !classroom) {
      return NextResponse.json({ success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }

    const updatedStudent = await Student.findOneAndUpdate(
      { studentId },
      { name, classroom },
      { new: true }
    );

    if (!updatedStudent) {
      return NextResponse.json({ success: false, error: 'ไม่พบข้อมูลนักเรียน' }, { status: 404 });
    }

    return NextResponse.json({ success: true, student: updatedStudent });
  } catch (error: any) {
    console.error('Update student error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ success: false, error: 'ไม่พบรหัสนักเรียน' }, { status: 400 });
    }

    await Student.deleteOne({ studentId });
    await Progress.deleteOne({ studentId });

    return NextResponse.json({
      success: true,
      message: 'ลบข้อมูลนักเรียนและประวัติการเรียนรู้เรียบร้อยแล้ว',
    });
  } catch (error: any) {
    console.error('Delete student error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}