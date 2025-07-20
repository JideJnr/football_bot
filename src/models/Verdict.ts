import mongoose, { Schema, Document } from 'mongoose';

export interface EngineVerdict extends Document {
  matchId: string;
  result: string;
  prediction: string;
  confidence: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const VerdictSchema = new Schema<EngineVerdict>(
  {
    matchId: { type: String, required: true },
    result: { type: String, required: true },
    prediction: { type: String, required: true },
    confidence: { type: Number, required: true },
  },
  { timestamps: true }
);

export const VerdictModel = mongoose.model<EngineVerdict>('OfflineVerdict', VerdictSchema);
