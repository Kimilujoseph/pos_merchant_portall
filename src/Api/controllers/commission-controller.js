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
      statusCode: STATUS_CODE.CREATED,
      message: "Commission payment created successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export { handleCreateCommissionPayment };
