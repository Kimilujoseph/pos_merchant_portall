import express from 'express';
import verifyUser from '../../middleware/verification.js';
import { handleCreateCommissionPayment, handleGetCommissionPayments, handleVoidCommissionPayment } from '../controllers/commission-controller.js';

const route = express.Router();

route.post('/pay', verifyUser, handleCreateCommissionPayment);
route.get('/', verifyUser, handleGetCommissionPayments);
route.post('/pay/:id/void', verifyUser, handleVoidCommissionPayment);

export default route;
