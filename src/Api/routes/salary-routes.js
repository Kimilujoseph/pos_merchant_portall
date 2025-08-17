import express from 'express';
import verifyUser from '../../middleware/verification.js';
import { handleCreateSalaryPayment } from '../controllers/salary-controller.js';

const route = express.Router();

route.post('/pay', verifyUser, handleCreateSalaryPayment);

export default route;
