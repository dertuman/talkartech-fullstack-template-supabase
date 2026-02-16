import mongoose, { Document } from 'mongoose';

export interface Notification {
  _id?: string;
  userId: string;
  message: string;
  link: string;
  read: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface INotification extends Omit<Notification, '_id'>, Document {}

const notificationSchema = new mongoose.Schema<INotification>(
  {
    userId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: false,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const NotificationModel =
  mongoose.models?.notifications ||
  mongoose.model<INotification>('notifications', notificationSchema);
