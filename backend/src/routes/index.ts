import { Router } from 'express';
import * as authController from '@/controllers/auth.controller';
import * as productController from '@/controllers/product.controller';
import * as orderController from '@/controllers/order.controller';
import { authMiddleware } from '@/middleware/auth';
import { orderLimiter } from '@/middleware/rateLimiter';

const router = Router();

router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);

router.get('/products', authMiddleware, productController.listProducts);
router.get('/products/:id', authMiddleware, productController.getProduct);
router.post('/products', authMiddleware, productController.createProduct);
router.put('/products/:id', authMiddleware, productController.updateProduct);
router.delete('/products/:id', authMiddleware, productController.deleteProduct);

router.get('/orders', authMiddleware, orderController.listOrders);
router.get('/orders/:id', authMiddleware, orderController.getOrder);
router.post('/orders', authMiddleware, orderLimiter, orderController.createOrder);

export default router;
