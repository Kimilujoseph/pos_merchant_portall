import { ReturnService } from '../../services/return-service.js';
import { handleResponse } from '../../helpers/responseUtils.js';
import { checkRole } from '../../helpers/authorisation.js';
import { APIError, STATUS_CODE } from '../../Utils/app-error.js';

const returnService = new ReturnService();

const handleCreateReturn = async (req, res, next) => {
  try {
    if (!checkRole(req.user.role, ['manager', 'superuser'])) {
      throw new APIError("Not authorized", STATUS_CODE.UNAUTHORIZED, "You are not authorized to process returns.");
    }

    const returnData = {
      ...req.body,
      processedById: req.user.id,
    };

    const result = await returnService.createReturn(returnData);

    handleResponse({
      res,
      statusCode: STATUS_CODE.CREATED,
      message: "Return processed successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export { handleCreateReturn };
