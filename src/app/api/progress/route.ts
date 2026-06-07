/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConnect from '@/lib/database';
import Progress from '@/models/Progress';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ success: false, error: 'Missing studentId' }, { status: 400 });
    }

    let progress = await Progress.findOne({ studentId });
    if (!progress) {
      progress = await Progress.create({
        studentId,
        flashcardScores: {},
        completedRoleplays: {},
        activeRoleplaySteps: {},
        roleplayScores: {},
        flashcardTranscripts: {},
        roleplayTranscripts: {},
        submissions: [],
      });
    }

    return NextResponse.json({
      success: true,
      progress: {
        studentId: progress.studentId,
        flashcardScores: Object.fromEntries(progress.flashcardScores || new Map()),
        completedRoleplays: Object.fromEntries(progress.completedRoleplays || new Map()),
        activeRoleplaySteps: Object.fromEntries(progress.activeRoleplaySteps || new Map()),
        roleplayScores: Object.fromEntries(progress.roleplayScores || new Map()),
        flashcardTranscripts: Object.fromEntries(progress.flashcardTranscripts || new Map()),
        roleplayTranscripts: Object.fromEntries(progress.roleplayTranscripts || new Map()),
        submissions: progress.submissions || [],
      },
    });
  } catch (error: any) {
    console.error('Fetch progress error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { studentId, flashcardScores, completedRoleplays, activeRoleplaySteps, roleplayScores, flashcardTranscripts, roleplayTranscripts, submission } = body;

    if (!studentId) {
      return NextResponse.json({ success: false, error: 'Missing studentId' }, { status: 400 });
    }

    let progress = await Progress.findOne({ studentId });
    if (!progress) {
      progress = new Progress({
        studentId,
        flashcardScores: {},
        completedRoleplays: {},
        activeRoleplaySteps: {},
        roleplayScores: {},
        flashcardTranscripts: {},
        roleplayTranscripts: {},
        submissions: [],
      });
    }

    if (flashcardScores) {
      for (const [key, value] of Object.entries(flashcardScores)) {
        progress.flashcardScores.set(key, value as number);
      }
    }

    if (completedRoleplays) {
      for (const [key, value] of Object.entries(completedRoleplays)) {
        progress.completedRoleplays.set(key, value as boolean);
      }
    }

    if (activeRoleplaySteps) {
      for (const [key, value] of Object.entries(activeRoleplaySteps)) {
        progress.activeRoleplaySteps.set(key, value as number);
      }
    }

    if (roleplayScores) {
      for (const [key, value] of Object.entries(roleplayScores)) {
        progress.roleplayScores.set(key, value as number);
      }
    }

    if (flashcardTranscripts) {
      for (const [key, value] of Object.entries(flashcardTranscripts)) {
        progress.flashcardTranscripts.set(key, value as string);
      }
    }

    if (roleplayTranscripts) {
      for (const [key, value] of Object.entries(roleplayTranscripts)) {
        progress.roleplayTranscripts.set(key, value as string);
      }
    }

    if (submission) {
      progress.submissions.push({
        lessonId: submission.lessonId,
        score: submission.score,
        mediaType: submission.mediaType,
        status: submission.status,
        date: submission.date,
      });
    }

    await progress.save();

    return NextResponse.json({
      success: true,
      progress: {
        studentId: progress.studentId,
        flashcardScores: Object.fromEntries(progress.flashcardScores),
        completedRoleplays: Object.fromEntries(progress.completedRoleplays),
        activeRoleplaySteps: Object.fromEntries(progress.activeRoleplaySteps),
        roleplayScores: Object.fromEntries(progress.roleplayScores),
        flashcardTranscripts: Object.fromEntries(progress.flashcardTranscripts || new Map()),
        roleplayTranscripts: Object.fromEntries(progress.roleplayTranscripts || new Map()),
        submissions: progress.submissions,
      },
    });
  } catch (error: any) {
    console.error('Update progress error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
