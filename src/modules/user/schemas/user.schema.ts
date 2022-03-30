import { Schema } from 'mongoose';

const parameterSchema = new Schema(
  {
    appoinmentTime: { type: Date, required: true },
  },
  { versionKey: false },
);

export const UserSchema = new Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    userType: { type: String, enum: ['professional', 'user'], default: 'user' },
    document: { type: String, require: true },
    phone: { type: String, required: true },
    crn: {
      type: String,
      required: function () {
        return this.userType === 'professional';
      },
    },
    parameters: {
      type: parameterSchema,
      required: function () {
        return this.userType === 'professional';
      },
    },
    active: { type: Boolean, default: true },
  },
  { versionKey: false, timestamps: true },
);
