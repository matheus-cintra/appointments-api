import { Schema } from 'mongoose';

export const UserSchema = new Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    userType: { type: String, enum: ['admin', 'user'], default: 'user' },
    active: { type: Boolean, default: true },
  },
  { versionKey: false, timestamps: true },
);
