import express from 'express';
import verifyUser from '../../middleware/verification.js';
import { handleCreateCommissionPayment, handleGetCommissionPayments } from '../controllers/commission-controller.js';

const route = express.Router();

route.post('/pay', verifyUser, handleCreateCommissionPayment);
route.get('/', verifyUser, handleGetCommissionPayments);

export default route;
