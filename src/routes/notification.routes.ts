import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Protect all routes under this router
router.use(protect);

router.get('/', notificationController.get.bind(notificationController));
router.put('/:id/read', notificationController.markRead.bind(notificationController));
router.put('/read-all', notificationController.markAllRead.bind(notificationController));

export default router;
