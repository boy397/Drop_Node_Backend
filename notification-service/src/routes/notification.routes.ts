import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { protect } from '@shared/middlewares/auth.middleware';

const router = Router();

// Protect all notification routes
router.use(protect);

router.get('/', notificationController.get.bind(notificationController));
router.put('/:id/read', notificationController.markRead.bind(notificationController));
router.put('/mark-all-read', notificationController.markAllRead.bind(notificationController));

export default router;
