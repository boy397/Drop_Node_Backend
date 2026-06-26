import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../constants';

const router = Router();

// Protect all inventory routes to Admin and Vendor roles
router.use(protect);
router.use(restrictTo(UserRole.ADMIN, UserRole.VENDOR));

// Inventory management endpoints
router.get('/', productController.getProducts.bind(productController)); // Lists all products with stock levels
router.put('/:id', productController.restock.bind(productController)); // Restocks or adjusts stock of a product
router.get('/alerts', productController.getLowStockAlerts.bind(productController)); // Fetches items under low stock threshold

export default router;
