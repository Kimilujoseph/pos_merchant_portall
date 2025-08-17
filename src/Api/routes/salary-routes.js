import express from 'express';
import verifyUser from '../../middleware/verification.js';
import { handleCreateSalaryPayment, handleGetSalaryPayments } from '../controllers/salary-controller.js';

const route = express.Router();

route.post('/pay', verifyUser, handleCreateSalaryPayment);
route.get('/', verifyUser, handleGetSalaryPayments);

export default route;
