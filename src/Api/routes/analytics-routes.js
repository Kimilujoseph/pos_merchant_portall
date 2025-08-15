import express from 'express';
import { getTopProducts, getShopPerformanceSummary, getSalesByStatus } from '../controllers/analytics-controller.js';
import verifyUser from '../../middleware/verification.js';

const router = express.Router();

router.get('/top-products', verifyUser, getTopProducts);
router.get('/shop-performance-summary', verifyUser, getShopPerformanceSummary);
router.get('/sales-by-status', verifyUser, getSalesByStatus);

export default router;
