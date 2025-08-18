import express from 'express';
import verifyUser from '../../middleware/verification.js';
import { handleCreateSalaryPayment, handleGetSalaryPayments, handleVoidSalaryPayment } from '../controllers/salary-controller.js';

const route = express.Router();

route.post('/pay', verifyUser, handleCreateSalaryPayment);
route.get('/', verifyUser, handleGetSalaryPayments);
route.post('/pay/:id/void', verifyUser, handleVoidSalaryPayment);

export default route;
