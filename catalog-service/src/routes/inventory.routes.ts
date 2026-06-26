import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { protect, restrictTo } from '@shared/middlewares/auth.middleware';
import { UserRole } from '@shared/constants';

const router = Router();

// Protect all inventory routes to Admin and Vendor roles
router.use(protect);
router.use(restrictTo(UserRole.ADMIN, UserRole.VENDOR));

// Inventory management endpoints
router.get('/', productController.getProducts.bind(productController));
router.put('/:id', productController.restock.bind(productController));
router.get('/alerts', productController.getLowStockAlerts.bind(productController));

export default router;
