import { orderRepository } from '../repositories/order.repository';
import { PaymentStatus, OrderStatus } from '../constants';
import { BadRequestError, NotFoundError } from '../errors/app-error';
import { logger } from '../config/logger.config';
import crypto from 'crypto';

export class PaymentService {
  // Simulate charging a card via Stripe
  public async chargeCard(
    orderId: string,
    cardDetails: {
      cardNumber: string;
      expMonth: string;
      expYear: string;
      cvc: string;
    }
  ): Promise<{ transactionId: string; status: 'success' | 'failed' }> {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestError('Order is already paid');
    }

    logger.info(`💳 [Stripe Mock] Charging card for order: ${orderId}, amount: $${order.totals.grandTotal}`);

    // Simple Card validation simulation
    const { cardNumber } = cardDetails;
    
    // Simulate declined card if number ends in '0000'
    const isDeclined = cardNumber.endsWith('0000');

    if (isDeclined) {
      logger.warn(`💳 [Stripe Mock] Card declined for order: ${orderId}`);
      
      // Update order to failed payment
      order.paymentStatus = PaymentStatus.FAILED;
      order.statusHistory.push({
        status: order.orderStatus, // Keep current status
        timestamp: new Date(),
        note: 'Payment attempt failed: Card was declined.',
      });
      await order.save();

      return {
        transactionId: 'txn_declined_' + crypto.randomBytes(8).toString('hex'),
        status: 'failed',
      };
    }

    // Simulate successful transaction
    const transactionId = 'ch_stripe_' + crypto.randomBytes(12).toString('hex');
    
    // Asynchronously process the webhook to simulate the Stripe callback
    // This replicates the asynchronous nature of third-party payment gates!
    setTimeout(async () => {
      try {
        await this.processPaymentWebhook({
          type: 'charge.succeeded',
          data: {
            object: {
              id: transactionId,
              amount: Math.round(order.totals.grandTotal * 100), // Stripe uses cents
              orderId: order.id,
              payment_method_details: {
                card: {
                  brand: 'visa',
                  last4: cardNumber.slice(-4),
                },
              },
            },
          },
        });
      } catch (err) {
        logger.error('Error processing mock payment webhook:', err);
      }
    }, 1000); // 1 second delay

    return {
      transactionId,
      status: 'success',
    };
  }

  // Handle mock Stripe webhook events
  public async processPaymentWebhook(event: {
    type: string;
    data: { object: Record<string, any> };
  }): Promise<void> {
    const { type, data } = event;
    logger.info(`🔌 [Webhook Mock] Received Stripe event: ${type}`);

    if (type === 'charge.succeeded') {
      const charge = data.object;
      const orderId = charge.orderId;

      const order = await orderRepository.findById(orderId);
      if (!order) {
        logger.error(`❌ [Webhook Mock] Order not found for webhook ID: ${orderId}`);
        return;
      }

      if (order.paymentStatus === PaymentStatus.PAID) {
        logger.info(`🔌 [Webhook Mock] Order ${orderId} is already marked as Paid. Skipping.`);
        return;
      }

      // Update order to Paid and Processing
      order.paymentStatus = PaymentStatus.PAID;
      order.orderStatus = OrderStatus.PROCESSING;
      order.paymentDetails = {
        transactionId: charge.id,
        cardBrand: charge.payment_method_details?.card?.brand || 'unknown',
        cardLast4: charge.payment_method_details?.card?.last4 || '0000',
        paidAt: new Date().toISOString(),
      };
      
      order.statusHistory.push({
        status: OrderStatus.PROCESSING,
        timestamp: new Date(),
        note: `Payment successful. Transaction ID: ${charge.id}. Order moved to Processing.`,
      });

      await order.save();
      logger.info(`✅ [Webhook Mock] Order ${orderId} marked as Paid & Processing successfully.`);
      
      // TODO: Trigger real-time notification or invoice email!
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;
