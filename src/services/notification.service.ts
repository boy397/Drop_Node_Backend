import { notificationRepository, NotificationRepository } from '../repositories/notification.repository';
import { INotification } from '../models/notification.model';
import { NotificationType } from '../constants';
import { NotFoundError } from '../errors/app-error';

export class NotificationService {
  private notificationRepo: NotificationRepository;

  constructor(notificationRepo = notificationRepository) {
    this.notificationRepo = notificationRepo;
  }

  // Create a new notification (Can be called internally by other services!)
  public async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.SYSTEM
  ): Promise<INotification> {
    return this.notificationRepo.create({
      user: userId as any,
      title,
      message,
      type,
      read: false,
    });
  }

  // Get notifications for a user
  public async getNotifications(userId: string): Promise<INotification[]> {
    return this.notificationRepo.findByUserId(userId);
  }

  // Mark a notification as read
  public async markAsRead(userId: string, notificationId: string): Promise<INotification> {
    const notification = await this.notificationRepo.markAsRead(userId, notificationId);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }
    return notification;
  }

  // Mark all notifications as read
  public async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepo.markAllAsRead(userId);
  }
}

export const notificationService = new NotificationService();
export default notificationService;
