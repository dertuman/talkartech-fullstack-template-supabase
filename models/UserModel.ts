import mongoose, { Document } from 'mongoose';

export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
  emailVerified: boolean;
  isAdmin: boolean;
  forgotPasswordToken?: string;
  forgotPasswordTokenExpiry?: Date;
  verifyToken?: string;
  verifyTokenExpiry?: Date;
  provider?: string;
  bio?: string;
  dob?: Date;
  profilePicture?: string;
  font?: string;
  theme?: string;
  language?: string;

  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: Date;
}

interface IUser extends Omit<User, '_id'>, Document {}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      // eslint-disable-next-line no-unused-vars
      required: function (this: IUser) {
        return this.isNew;
      },
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },

    // Authentication fields
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    verifyToken: String,
    verifyTokenExpiry: Date,
    provider: {
      type: String,
      default: 'credentials',
    },

    // Profile fields
    bio: String,
    dob: Date,
    profilePicture: String,
    font: String,
    theme: String,
    language: {
      type: String,
      default: 'en',
    },

    // Soft delete fields
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

export const UserModel =
  mongoose.models?.users || mongoose.model<IUser>('users', userSchema);
