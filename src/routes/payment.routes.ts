import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Protected: Charge credit card for an order
router.post('/charge/:id', protect, orderController.charge.bind(orderController));

// Public: Mock Stripe Webhook endpoint
router.post('/webhook', orderController.webhook.bind(orderController));

export default router;
