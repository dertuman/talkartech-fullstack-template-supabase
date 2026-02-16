import mongoose, { Document } from 'mongoose';

export interface Account {
  _id?: string;
  userId: mongoose.Types.ObjectId;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface IAccount extends Omit<Account, '_id'>, Document {}

const accountSchema = new mongoose.Schema<IAccount>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    type: { type: String, required: true },
    provider: { type: String, required: true },
    providerAccountId: { type: String, required: true },
    refresh_token: String,
    access_token: String,
    expires_at: Number,
    token_type: String,
    scope: String,
    id_token: String,
    session_state: String,
  },
  {
    timestamps: true,
  }
);

// Compound index for provider + providerAccountId
accountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });
accountSchema.index({ userId: 1 });

export const AccountModel =
  mongoose.models?.accounts ||
  mongoose.model<IAccount>('accounts', accountSchema);
