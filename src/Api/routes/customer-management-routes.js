import express from 'express';
const router = express.Router();
import customerController from '../controllers/customer-management-controller.js';
import verifyUser from '../../middleware/verification.js';

router.post('/create', verifyUser, customerController.handleCreateCustomer);
router.get('/:id', verifyUser, customerController.handleGetCustomerDetails);

export default router;
