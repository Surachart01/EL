/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConnect from '@/lib/database';
import Student from '@/models/Student';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกรหัสนักเรียน' },
        { status: 400 }
      );
    }

    const cleanId = String(studentId).trim();
    const student = await Student.findOne({ studentId: cleanId });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบรหัสนักเรียนนี้ในระบบ กรุณาตรวจสอบอีกครั้ง' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      student: {
        studentId: student.studentId,
        name: student.name,
        classroom: student.classroom,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อระบบ' },
      { status: 500 }
    );
  }
}
