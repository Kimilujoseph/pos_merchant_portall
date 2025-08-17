import { SalaryService } from '../../services/salary-service.js';
import { handleResponse } from '../../helpers/responseUtils.js';
import { checkRole } from '../../helpers/authorisation.js';
import { APIError, STATUS_CODE } from '../../Utils/app-error.js';

const salaryService = new SalaryService();

const handleCreateSalaryPayment = async (req, res, next) => {
  try {
    if (!checkRole(req.user.role, ['manager', 'superuser'])) {
      throw new APIError("Not authorized", STATUS_CODE.UNAUTHORIZED, "You are not authorized to create salary payments.");
    }

    const paymentData = {
      ...req.body,
      processedById: req.user.id,
    };

    const result = await salaryService.createSalaryPayment(paymentData);

    handleResponse({
      res,
      statusCode: STATUS_CODE.CREATED,
      message: "Salary payment created successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export { handleCreateSalaryPayment };
