import { Router } from 'express';
import notificationRouter from './notification.routes';

const router = Router();

// Mount individual module routers
router.use('/notifications', notificationRouter);

export default router;
