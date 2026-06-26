import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';
import { z } from 'zod';

const salesReportQuerySchema = z.object({
  startDate: z.string().datetime('Start date must be a valid ISO datetime').transform((val) => new Date(val)),
  endDate: z.string().datetime('End date must be a valid ISO datetime').transform((val) => new Date(val)),
});

export class AnalyticsController {
  // Get overview administrative metrics (Admin-only)
  public async getDashboardStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await analyticsService.getDashboardStats();
      res.status(200).json({
        status: 'success',
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get detailed sales aggregates by date range (Admin-only)
  public async getSalesReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = salesReportQuerySchema.parse(req.query);
      const report = await analyticsService.getSalesReport(startDate, endDate);

      res.status(200).json({
        status: 'success',
        data: { report },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
export default analyticsController;
