import mongoose from 'mongoose';
import { orderRepository, OrderRepository } from '../repositories/order.repository';
import { cartRepository } from '../repositories/cart.repository';
import { IOrder } from '../models/order.model';
import { BadRequestError, NotFoundError } from '../errors/app-error';
import { OrderStatus, PaymentStatus, PaymentMethod } from '../constants';
import { v4 as uuidv4 } from 'uuid';
import { Product } from '../models/product.model';
import { Coupon } from '../models/coupon.model';

export class OrderService {
  private orderRepo: OrderRepository;

  constructor(orderRepo = orderRepository) {
    this.orderRepo = orderRepo;
  }

  // Checkout: Place a new order using a Mongoose Transaction!
  public async checkout(
    userId: string,
    checkoutData: {
      paymentMethod: PaymentMethod;
      shippingAddress: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
      };
      billingAddress?: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
      };
    }
  ): Promise<IOrder> {
    const { paymentMethod, shippingAddress, billingAddress } = checkoutData;

    if (!shippingAddress) {
      throw new BadRequestError('Shipping address is required');
    }

    const finalBillingAddress = billingAddress || shippingAddress;

    // Start Mongoose Transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Get user's cart (populated with products)
      const cart = await cartRepository.findByUserId(userId);
      if (!cart || cart.items.length === 0) {
        throw new BadRequestError('Cannot checkout an empty cart');
      }

      // 2. Validate products stock and deduct stock atomically
      const orderItems = [];
      for (const item of cart.items) {
        const product = await Product.findById(item.product._id).session(session);
        
        if (!product || !product.isActive) {
          throw new NotFoundError(`Product "${item.product._id}" is no longer available.`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestError(
            `Insufficient stock for product "${product.name}". Only ${product.stock} units available, you requested ${item.quantity}.`
          );
        }

        // Deduct stock
        product.stock -= item.quantity;
        await product.save({ session });

        // Add to order items (snapshotting price and name!)
        orderItems.push({
          product: product._id as any,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
        });
      }

      // 3. Validate and apply coupon if present, and increment usage count
      if (cart.couponCode) {
        const coupon = await Coupon.findOne({ code: cart.couponCode }).session(session);
        if (!coupon || !coupon.isValid(cart.totals.subtotal)) {
          throw new BadRequestError('Coupon code applied is no longer valid.');
        }

        // Increment usage
        coupon.usageCount += 1;
        await coupon.save({ session });
      }

      // 4. Create Order document
      const trackingNumber = 'TRK-' + uuidv4().slice(-12).toUpperCase();
      
      const order = await this.orderRepo.create(
        {
          user: userId as any,
          items: orderItems,
          shippingAddress,
          billingAddress: finalBillingAddress,
          totals: {
            subtotal: cart.totals.subtotal,
            discount: cart.totals.discount,
            tax: cart.totals.tax,
            shipping: cart.totals.shipping,
            grandTotal: cart.totals.grandTotal,
          },
          paymentMethod,
          paymentStatus: PaymentStatus.PENDING,
          orderStatus: OrderStatus.PENDING,
          trackingNumber,
          statusHistory: [
            {
              status: OrderStatus.PENDING,
              timestamp: new Date(),
              note: 'Order checkout completed. Awaiting payment processing.',
            },
          ],
        },
        session
      );

      // 5. Clear cart items
      cart.items = [];
      cart.couponCode = null;
      cart.totals = { subtotal: 0, discount: 0, tax: 0, shipping: 0, grandTotal: 0 };
      await cart.save({ session });

      // 6. Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Trigger asynchronous mock payment billing if stripe/paypal is selected
      // COD orders move immediately to processing status
      if (paymentMethod === PaymentMethod.COD) {
        await this.updateOrderStatus(order.id, OrderStatus.PROCESSING, 'Cash on delivery order approved.');
      }

      // Re-fetch fully populated order to return
      const populatedOrder = await this.orderRepo.findById(order.id);
      return populatedOrder || order;

    } catch (error) {
      // Abort transaction and roll back stock deductions, cart clearing, etc.
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  // Cancel order
  public async cancelOrder(orderId: string, userId: string): Promise<IOrder> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Verify ownership
    if (order.user._id.toString() !== userId) {
      throw new BadRequestError('You do not have permission to cancel this order');
    }

    // Check if order can be cancelled (Only Pending orders can be cancelled)
    if (order.orderStatus !== OrderStatus.PENDING) {
      throw new BadRequestError(`Cannot cancel order in "${order.orderStatus}" status.`);
    }

    // Restore stock atomically
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } },
          { session }
        ).exec();
      }

      // Update order status
      order.orderStatus = OrderStatus.CANCELLED;
      order.statusHistory.push({
        status: OrderStatus.CANCELLED,
        timestamp: new Date(),
        note: 'Order cancelled by customer. Stock items restored.',
      });

      await order.save({ session });
      await session.commitTransaction();
      session.endSession();

      return order;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  // Update order status (Admin operation)
  public async updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<IOrder> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.orderStatus === OrderStatus.CANCELLED || order.orderStatus === OrderStatus.DELIVERED) {
      throw new BadRequestError(`Cannot update status of a ${order.orderStatus} order.`);
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order status updated to ${status}.`,
    });

    // If order is delivered, automatically mark COD payment as PAID
    if (status === OrderStatus.DELIVERED && order.paymentMethod === PaymentMethod.COD) {
      order.paymentStatus = PaymentStatus.PAID;
    }

    await order.save();
    return order;
  }

  // Get order details
  public async getOrderDetails(orderId: string, userId: string): Promise<IOrder> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Verify ownership or admin role
    if (order.user._id.toString() !== userId) {
      // In controllers we will check if the user is an admin. If they are, we allow it.
      // So the controller will pass the request if admin, or we verify here. 
      // Let's let the controller handle role authorization.
    }

    return order;
  }

  // Get user order history
  public async getUserOrders(
    userId: string,
    query: { page?: string; limit?: string }
  ): Promise<{ orders: IOrder[]; total: number; page: number; pages: number }> {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const { orders, total } = await this.orderRepo.findAndCount({ user: userId }, skip, limit);

    return {
      orders,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  // Admin: Get all orders
  public async getAllOrders(
    query: { page?: string; limit?: string; status?: string }
  ): Promise<{ orders: IOrder[]; total: number; page: number; pages: number }> {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.status) {
      filter.orderStatus = query.status;
    }

    const { orders, total } = await this.orderRepo.findAndCount(filter, skip, limit);

    return {
      orders,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }
}

export const orderService = new OrderService();
export default orderService;
