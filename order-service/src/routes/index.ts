import { Router } from 'express';
import orderRouter from './order.routes';
import paymentRouter from './payment.routes';
import trackingRouter from './tracking.routes';

const router = Router();

// Mount individual module routers
router.use('/orders', orderRouter);
router.use('/payments', paymentRouter);
router.use('/tracking', trackingRouter);

export default router;
