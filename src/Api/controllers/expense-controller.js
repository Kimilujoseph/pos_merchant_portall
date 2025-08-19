import { ExpenseService } from '../../services/expense-service.js';
import { handleResponse } from '../../helpers/responseUtils.js';
import { checkRole } from '../../helpers/authorisation.js';
import { APIError, STATUS_CODE } from '../../Utils/app-error.js';

const expenseService = new ExpenseService();

const handleCreateExpense = async (req, res, next) => {
    try {
        const expenseData = {
            ...req.body,
            processedById: req.user.id,
        };

        const result = await expenseService.createExpense(expenseData, req.user);

        handleResponse({
            res,
            statusCode: STATUS_CODE.CREATED,
            message: "Expense created successfully",
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

const handleGetExpenses = async (req, res, next) => {
    try {
        if (!checkRole(req.user.role, ['manager', 'superuser'])) {
            throw new APIError("Not authorized", STATUS_CODE.UNAUTHORIZED, "You are not authorized to view expenses.");
        }

        const { shopId } = req.params;
        const expenses = await expenseService.getExpenses(parseInt(shopId, 10));

        handleResponse({
            res,
            statusCode: STATUS_CODE.OK,
            message: "Expenses retrieved successfully",
            data: expenses,
        });
    } catch (err) {
        next(err);
    }
};

export { handleCreateExpense, handleGetExpenses };
