/* eslint-disable @typescript-eslint/no-explicit-any */
import * as xlsx from 'xlsx';
import fs from 'fs';
import dbConnect from '@/lib/database';
import Student from '@/models/Student';
import Progress from '@/models/Progress';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();

    // 1. Delete all students who are not in Grade 2 (classroom does not start with 'p2' case-insensitive)
    const nonP2Students = await Student.find({ classroom: { $not: /^p2/i } }).select('studentId');
    const nonP2StudentIds = nonP2Students.map((s) => s.studentId);
    let deletedStudentsCount = 0;
    let deletedProgressCount = 0;

    if (nonP2StudentIds.length > 0) {
      const delStudentResult = await Student.deleteMany({ studentId: { $in: nonP2StudentIds } });
      const delProgressResult = await Progress.deleteMany({ studentId: { $in: nonP2StudentIds } });
      deletedStudentsCount = delStudentResult.deletedCount || 0;
      deletedProgressCount = delProgressResult.deletedCount || 0;
    }

    const filePath = '/Users/surachartlimrattanaphun/Desktop/My Project/EL/data/นวัตกรรม รายชื่อนักเรียน อ.1-ป.6 ปี 69 18 พค.69 มีเล.xlsx';

    const fileBuffer = fs.readFileSync(filePath);
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetNames = workbook.SheetNames;
    const studentsToUpsert = [];

    for (const sheetName of sheetNames) {
      // Only process sheets representing Grade 2 (e.g. p2-1, p2-2, etc.)
      if (!sheetName.toLowerCase().startsWith('p2')) continue;

      const worksheet = workbook.Sheets[sheetName];
      const rows: any[][] = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

      for (let idx = 0; idx < rows.length; idx++) {
        if (idx < 3) continue; // Skip title and header rows
        const r = rows[idx];
        if (r && r.length > 1 && r[1] !== undefined && r[1] !== null) {
          const val = String(r[1]).trim();
          if (val && (!isNaN(Number(val)) || /^\d+$/.test(val))) {
            let studentId = val;
            if (val.includes('.')) {
              studentId = String(Math.floor(Number(val)));
            }

            const title = r[2] ? String(r[2]).trim() : '';
            const firstName = r[3] ? String(r[3]).trim() : '';
            const lastName = r[4] ? String(r[4]).trim() : '';
            const name = `${title}${firstName} ${lastName}`.trim();

            if (studentId && name) {
              studentsToUpsert.push({
                studentId,
                name,
                classroom: sheetName,
              });
            }
          }
        }
      }
    }

    let seededCount = 0;
    let modifiedCount = 0;

    if (studentsToUpsert.length > 0) {
      const bulkOps = studentsToUpsert.map((student) => ({
        updateOne: {
          filter: { studentId: student.studentId },
          update: { $set: student },
          upsert: true,
        },
      }));

      const bulkResult = await Student.bulkWrite(bulkOps);
      seededCount = bulkResult.upsertedCount;
      modifiedCount = bulkResult.modifiedCount;
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully seeded database and cleaned other levels',
      deletedStudents: deletedStudentsCount,
      deletedProgress: deletedProgressCount,
      totalP2StudentsParsed: studentsToUpsert.length,
      inserted: seededCount,
      modified: modifiedCount,
    });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
