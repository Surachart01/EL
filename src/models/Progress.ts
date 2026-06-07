/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProgress extends Document {
  studentId: string;
  flashcardScores: Map<string, number>;
  completedRoleplays: Map<string, boolean>;
  activeRoleplaySteps: Map<string, number>;
  roleplayScores: Map<string, number>;
  submissions: Array<{
    lessonId: number;
    score: number;
    mediaType: string;
    status: string;
    date: string;
  }>;
}

const ProgressSchema: Schema = new Schema(
  {
    studentId: { type: String, required: true, unique: true, index: true },
    flashcardScores: { type: Map, of: Number, default: {} },
    completedRoleplays: { type: Map, of: Boolean, default: {} },
    activeRoleplaySteps: { type: Map, of: Number, default: {} },
    roleplayScores: { type: Map, of: Number, default: {} },
    submissions: [
      {
        lessonId: { type: Number, required: true },
        score: { type: Number, required: true },
        mediaType: { type: String, required: true },
        status: { type: String, required: true },
        date: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Progress: Model<IProgress> =
  mongoose.models.Progress || mongoose.model<IProgress>('Progress', ProgressSchema);

export default Progress;
