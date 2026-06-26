import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { protect } from '@shared/middlewares/auth.middleware';

const router = Router();

// Protected: Get shipment tracking updates
router.get('/:id', protect, orderController.getTracking.bind(orderController));

export default router;
