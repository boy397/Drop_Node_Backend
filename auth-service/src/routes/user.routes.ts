import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '@shared/constants';

const router = Router();

// Protect all routes under user router
router.use(protect);

// Customer & general user profile routes
router.get('/profile', userController.getProfile.bind(userController));
router.put('/profile', userController.updateProfile.bind(userController));

// Address management routes
router.get('/addresses', userController.getAddresses.bind(userController));
router.post('/addresses', userController.addAddress.bind(userController));
router.delete('/addresses/:id', userController.deleteAddress.bind(userController));

// Admin-only user management routes
router.get('/', restrictTo(UserRole.ADMIN), userController.getAllUsers.bind(userController));
router.put('/:id/role', restrictTo(UserRole.ADMIN), userController.updateUserRole.bind(userController));

export default router;
