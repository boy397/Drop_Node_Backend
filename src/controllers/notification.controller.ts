import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';

export class NotificationController {
  // Get all notifications for authenticated user
  public async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const notifications = await notificationService.getNotifications(userId);

      res.status(200).json({
        status: 'success',
        data: { notifications },
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark specific notification as read
  public async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const notificationId = req.params.id;
      const notification = await notificationService.markAsRead(userId, notificationId);

      res.status(200).json({
        status: 'success',
        message: 'Notification marked as read',
        data: { notification },
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark all user notifications as read
  public async markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      await notificationService.markAllAsRead(userId);

      res.status(200).json({
        status: 'success',
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
export default notificationController;
