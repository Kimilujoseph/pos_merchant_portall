import express from 'express';
import verifyUser from '../../middleware/verification.js';
import { handleCreateCommissionPayment } from '../controllers/commission-controller.js';

const route = express.Router();

route.post('/pay', verifyUser, handleCreateCommissionPayment);

export default route;
