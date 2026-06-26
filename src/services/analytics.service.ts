import { Order } from '../models/order.model';
import { Product } from '../models/product.model';
import { User } from '../models/user.model';
import { PaymentStatus, OrderStatus, UserRole } from '../constants';

export interface IDashboardStats {
  totals: {
    revenue: number;
    orders: number;
    products: number;
    customers: number;
  };
  salesTrend: { _id: string; totalSales: number; count: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  orderStatuses: { _id: string; count: number }[];
}

export class AnalyticsService {
  // Get main administrative dashboard metrics
  public async getDashboardStats(): Promise<IDashboardStats> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // 1. Calculate Totals
    const [revenueStats, ordersCount, productsCount, customersCount] = await Promise.all([
      // Total Revenue
      Order.aggregate([
        {
          $match: {
            paymentStatus: PaymentStatus.PAID,
            orderStatus: { $ne: OrderStatus.CANCELLED },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totals.grandTotal' },
          },
        },
      ]).exec(),
      // Total Orders
      Order.countDocuments({}).exec(),
      // Total Products
      Product.countDocuments({ isActive: true }).exec(),
      // Total Customers
      User.countDocuments({ role: UserRole.CUSTOMER }).exec(),
    ]);

    const totalRevenue = revenueStats.length > 0 ? Math.round(revenueStats[0].totalRevenue * 100) / 100 : 0;

    // 2. Sales Trend (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          paymentStatus: PaymentStatus.PAID,
          orderStatus: { $ne: OrderStatus.CANCELLED },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalSales: { $sum: '$totals.grandTotal' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]).exec();

    // Round sales figures in trend
    const formattedSalesTrend = salesTrend.map((item) => ({
      _id: item._id,
      totalSales: Math.round(item.totalSales * 100) / 100,
      count: item.count,
    }));

    // 3. Top 5 Selling Products
    const topProducts = await Order.aggregate([
      {
        $match: {
          paymentStatus: PaymentStatus.PAID,
          orderStatus: { $ne: OrderStatus.CANCELLED },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 },
    ]).exec();

    const formattedTopProducts = topProducts.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      revenue: Math.round(item.revenue * 100) / 100,
    }));

    // 4. Order Status distribution
    const orderStatuses = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
        },
      },
    ]).exec();

    return {
      totals: {
        revenue: totalRevenue,
        orders: ordersCount,
        products: productsCount,
        customers: customersCount,
      },
      salesTrend: formattedSalesTrend,
      topProducts: formattedTopProducts,
      orderStatuses,
    };
  }

  // Get detailed sales report by date range
  public async getSalesReport(startDate: Date, endDate: Date): Promise<any> {
    const report = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: PaymentStatus.PAID,
          orderStatus: { $ne: OrderStatus.CANCELLED },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totals.grandTotal' },
          subtotalSum: { $sum: '$totals.subtotal' },
          discountSum: { $sum: '$totals.discount' },
          taxSum: { $sum: '$totals.tax' },
          shippingSum: { $sum: '$totals.shipping' },
          count: { $sum: 1 },
        },
      },
    ]).exec();

    if (report.length === 0) {
      return {
        totalRevenue: 0,
        subtotalSum: 0,
        discountSum: 0,
        taxSum: 0,
        shippingSum: 0,
        count: 0,
      };
    }

    const r = report[0];
    return {
      totalRevenue: Math.round(r.totalRevenue * 100) / 100,
      subtotalSum: Math.round(r.subtotalSum * 100) / 100,
      discountSum: Math.round(r.discountSum * 100) / 100,
      taxSum: Math.round(r.taxSum * 100) / 100,
      shippingSum: Math.round(r.shippingSum * 100) / 100,
      count: r.count,
    };
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
