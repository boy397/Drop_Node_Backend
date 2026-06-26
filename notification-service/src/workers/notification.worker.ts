import { createClient } from 'redis';
import { notificationService } from '../services/notification.service';
import { NotificationType } from '@shared/constants';
import { logger } from '@shared/utils/logger';

export const startNotificationWorker = async (): Promise<void> => {
  const enabled = process.env.REDIS_ENABLED === 'true' || true;
  if (!enabled) {
    logger.warn('⚠️ Redis is disabled. Notification Worker will not start.');
    return;
  }

  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const subscriber = createClient({ url });

  subscriber.on('error', (err) => {
    logger.error(`❌ [Notification Worker] Redis Subscriber error: ${err.message}`);
  });

  subscriber.on('connect', () => {
    logger.info('🧠 [Notification Worker] Redis subscriber connecting...');
  });

  subscriber.on('ready', () => {
    logger.info('🧠 [Notification Worker] Redis Subscriber Connected and Subscribed to Events');
  });

  try {
    await subscriber.connect();

    // Subscribe to order.placed channel
    await subscriber.subscribe('order.placed', async (message: string) => {
      try {
        const event = JSON.parse(message) as {
          orderId: string;
          userId: string;
          grandTotal: number;
          trackingNumber: string;
          itemsCount: number;
          timestamp: string;
        };

        logger.info(`🔔 [Notification Worker] Received event "order.placed":`, event);

        // 1. Create in-app notification in database
        const notification = await notificationService.createNotification(
          event.userId,
          'Order Placed Successfully',
          `Your order with tracking number ${event.trackingNumber} has been placed. Grand Total: $${event.grandTotal}. Awaiting payment confirmation.`,
          NotificationType.ORDER
        );

        logger.info(`✅ [Notification Worker] Created inbox notification: ${notification.id}`);

        // 2. Dispatch mock transactional email
        console.log('\n============================================================');
        console.log(`📧 [NOTIFICATION SERVICE] [Mock Email Dispatch]`);
        console.log(`   To: Customer ID ${event.userId}`);
        console.log(`   Subject: Order Placed Successfully - Order #${event.trackingNumber}`);
        console.log(`   Message: Hello! Thank you for your order.`);
        console.log(`            Your order #${event.trackingNumber} for $${event.grandTotal} is now pending processing.`);
        console.log(`            You can track your shipping using tracking number ${event.trackingNumber}.`);
        console.log('============================================================\n');
        
        logger.info(`✅ [Notification Worker] Transactional confirmation email dispatched.`);
      } catch (err) {
        logger.error('❌ [Notification Worker] Failed to process order.placed event:', err);
      }
    });
  } catch (error) {
    logger.error('❌ [Notification Worker] Failed to boot Redis subscriber worker:', error);
    logger.warn('⚠️ Running Notification Service API without background event subscriber.');
  }
};

export default startNotificationWorker;
