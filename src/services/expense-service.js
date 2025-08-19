import { ExpenseRepository } from '../databases/repository/expense-repository.js';
import { ShopmanagementRepository } from '../databases/repository/shop-repository.js';
import { APIError, STATUS_CODE } from '../Utils/app-error.js';

class ExpenseService {
    constructor() {
        this.repository = new ExpenseRepository();
        this.shopRepository = new ShopmanagementRepository();
    }

    async createExpense(expenseData, user) {
        const { shopId } = expenseData;
        const { id: userId, role } = user;

        if (role !== 'manager' && role !== 'superuser') {
            const assignment = await this.shopRepository.findUserAssignment(userId, shopId);
            if (!assignment) {
                throw new APIError("Not authorized", STATUS_CODE.UNAUTHORIZED, "You are not assigned to this shop.");
            }
        }

        return this.repository.createExpense(expenseData);
    }

    async getExpenses(shopId) {
        return this.repository.getExpenses(shopId);
    }
}

export { ExpenseService };
