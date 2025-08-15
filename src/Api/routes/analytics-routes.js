import express from 'express';
import { getTopProducts, getShopPerformanceSummary, getSalesByStatus } from './controllers/analytics-controller.js';
import { userAuth } from '../../middleware/verification.js';

const router = express.Router();

router.get('/top-products', userAuth, getTopProducts);
router.get('/shop-performance-summary', userAuth, getShopPerformanceSummary);
router.get('/sales-by-status', userAuth, getSalesByStatus);

export default router;
