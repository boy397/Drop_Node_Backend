import { Schema, model, Document } from 'mongoose';
import { NotificationType } from '@shared/constants';

export interface INotification extends Document {
  user: Schema.Types.ObjectId;
  title: string;
  message: string;
  read: boolean;
  type: NotificationType;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      default: NotificationType.SYSTEM,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = model<INotification>('Notification', NotificationSchema);
export default Notification;
