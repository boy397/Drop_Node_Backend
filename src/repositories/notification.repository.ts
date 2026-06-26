import { Notification, INotification } from '../models/notification.model';

export class NotificationRepository {
  // Find notifications for a user
  public async findByUserId(userId: string): Promise<INotification[]> {
    return Notification.find({ user: userId }).sort({ createdAt: -1 }).exec();
  }

  // Create a notification
  public async create(notificationData: Partial<INotification>): Promise<INotification> {
    const notification = new Notification(notificationData);
    return notification.save();
  }

  // Mark a specific notification as read
  public async markAsRead(userId: string, notificationId: string): Promise<INotification | null> {
    return Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true },
      { new: true }
    ).exec();
  }

  // Mark all notifications as read for a user
  public async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany({ user: userId, read: false }, { read: true }).exec();
  }
}

export const notificationRepository = new NotificationRepository();
export default notificationRepository;
