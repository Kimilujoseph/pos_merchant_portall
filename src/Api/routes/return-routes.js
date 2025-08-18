import express from 'express';
import verifyUser from '../../middleware/verification.js';
import { handleCreateReturn } from '../controllers/return-controller.js';

const route = express.Router();

route.post('/', verifyUser, handleCreateReturn);

export default route;
