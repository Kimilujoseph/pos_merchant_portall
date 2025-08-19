import express from 'express';
import { handleCreateExpense, handleGetExpenses } from '../controllers/expense-controller.js';
import verifyUser from '../../middleware/verification.js';

const router = express.Router();

router.post('/create', verifyUser, handleCreateExpense);
router.get('/:shopId', verifyUser, handleGetExpenses);

export default router;
