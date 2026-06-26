import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../constants';

const router = Router();

// Protect all analytics routes to Admin role only
router.use(protect);
router.use(restrictTo(UserRole.ADMIN));

router.get('/dashboard', analyticsController.getDashboardStats.bind(analyticsController));
router.get('/sales', analyticsController.getSalesReport.bind(analyticsController));

export default router;
