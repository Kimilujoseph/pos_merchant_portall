import { distributionService } from "../../services/distribution-contoller-service.js";
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";
const distributionManager = new distributionService();

const handleBulkDistibution = async (req, res) => {
  try {
    const user = req.user;
    const { bulkDistribution, shopDetails, category } = req.body;

    if (!["manager", "superuser"].includes(user.role)) {
      throw new APIError(
        "unauthorised",
        STATUS_CODE.UNAUTHORIZED,
        `DEAR ${user.name} you are not authorised to commit a distribution`
      );
    }
    if (!bulkDistribution || bulkDistribution.length === 0) {
      throw new APIError(
        "BAD REQUEST",
        STATUS_CODE.BAD_REQUEST,
        "distribution entries empty"
      );
    }

    if (category === "mobiles") {
      const successfulDistributions = await distributionManager.createBulkMobileDistribution({
        bulkDistribution,
        mainShop: shopDetails.mainShop,
        distributedShop: shopDetails.distributedShop,
        userId: parseInt(user.id, 10),
      });

      return res.status(200).json({
        message: "Distribution process completed successfully.",
        successfulDistributions: successfulDistributions.length,
        error: false,
      });

    } else {
      // This part remains non-transactional for now
      // You can implement a similar transactional method for accessories later
      throw new APIError("Not Implemented", STATUS_CODE.NOT_IMPLEMENTED, "Accessory distribution is not yet transactional.");
    }
  } catch (err) {
    // If the transaction fails for ANY reason, this catch block will be executed
    console.error("Distribution failed and was rolled back:", err);
    const statusCode = err instanceof APIError ? err.statusCode : 500;
    const message = err.message || "An unexpected error occurred during the distribution process.";
    res.status(statusCode).json({ error: true, message: message });
  }
};

export { handleBulkDistibution };