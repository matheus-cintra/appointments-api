import { Schema } from 'mongoose';

export const AppointmentSchema = new Schema(
  {
    providerId: { type: Schema.Types.ObjectId, required: true, ref: 'users' },
    customerId: { type: Schema.Types.ObjectId, required: true, ref: 'users' },
    scheduleDate: { type: Date, required: true, default: Date.now },
  },
  { versionKey: false, timestamps: true },
);
