import { CommissionService } from '../../services/commission-service.js';
import { handleResponse } from '../../helpers/responseUtils.js';
import { checkRole } from '../../helpers/authorisation.js';
import { APIError, STATUS_CODE } from '../../Utils/app-error.js';

const commissionService = new CommissionService();

const handleCreateCommissionPayment = async (req, res, next) => {
  try {
    if (!checkRole(req.user.role, ['manager', 'superuser'])) {
      throw new APIError("Not authorized", STATUS_CODE.UNAUTHORIZED, "You are not authorized to create commission payments.");
    }

    const paymentData = {
      ...req.body,
      processedById: req.user.id,
    };

    const result = await commissionService.createCommissionPayment(paymentData);

    handleResponse({
      res,
      statusCode: 201,
      message: "Commission payment created successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const handleGetCommissionPayments = async (req, res, next) => {
  try {
    const { user } = req;
    const { page = 1, limit = 10 } = req.query;
    const options = { page: parseInt(page, 10), limit: parseInt(limit, 10) };


    if (checkRole(user.role, ['seller'])) {
      options.sellerId = user.id;
    } else if (!checkRole(user.role, ['manager', 'superuser'])) {
      throw new APIError("Not authorized", STATUS_CODE.UNAUTHORIZED, "You are not authorized to view commission payments.");
    }

    const result = await commissionService.getCommissionPayments(options);

    handleResponse({
      res,
      message: "Commission payments retrieved successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const handleVoidCommissionPayment = async (req, res, next) => {
  try {
    if (!checkRole(req.user.role, ['manager', 'superuser'])) {
      throw new APIError("Not authorized", STATUS_CODE.UNAUTHORIZED, "You are not authorized to void commission payments.");
    }

    const { id } = req.params;
    const paymentId = parseInt(id, 10);

    const result = await commissionService.voidCommissionPayment(paymentId);

    handleResponse({
      res,
      message: "Commission payment voided successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export { handleCreateCommissionPayment, handleGetCommissionPayments, handleVoidCommissionPayment };
