import express from 'express';
import verifyUser from '../../middleware/verification.js';
import { handleCreateSalaryPayment, handleGetSalaryPayments, handleVoidSalaryPayment } from '../controllers/salary-controller.js';
import { parseDateQuery } from '../../middleware/query-parser.js';

const route = express.Router();

route.post('/pay', verifyUser, handleCreateSalaryPayment);
route.get('/', verifyUser, parseDateQuery, handleGetSalaryPayments);
route.post('/pay/:id/void', verifyUser, handleVoidSalaryPayment);

export default route;
