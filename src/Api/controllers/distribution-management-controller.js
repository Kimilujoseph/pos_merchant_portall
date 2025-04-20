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

    const mainShop = shopDetails.mainShop;
    const distributedShop = shopDetails.distributedShop;
    const userId = parseInt(user.id, 10);
    const processDistribution = (distributions, distributionMethod) => {
      return distributions.map((distribution) => {
        const distributionData = {
          ...distribution,
          mainShop: mainShop,
          distributedShop: distributedShop,
          userId: userId,
        };
        return distributionMethod.call(distributionManager, distributionData);
      });
    };
    let productDistribution;
    let processProductDistribution;
    if (category === "mobiles") {
      productDistribution = bulkDistribution.filter(
        (item) => item.stockId !== null
      );
      processProductDistribution =
        productDistribution.length > 0
          ? processDistribution(
              productDistribution,
              distributionManager.createnewMobileDistribution
            )
          : [];
    } else {
      productDistribution = bulkDistribution.filter(
        (item) => item.stockId !== null
      );
      console.log("wwe", productDistribution);
      processProductDistribution =
        productDistribution.length > 0
          ? processDistribution(
              productDistribution,
              distributionManager.createnewAccessoryDistribution
            )
          : [];
    }
    const allPromises = [...processProductDistribution];

    if (allPromises.length > 0) {
      const results = await Promise.allSettled(allPromises);

      const successfulDistributions = results.filter(
        (result) => result.status === "fulfilled"
      );
      const failedDistributions = results.filter(
        (result) => result.status === "rejected"
      );
      if (failedDistributions.length > 0) {
        console.error("Some distributions failed:", failedDistributions);
      }

      return res.status(200).json({
        message: "Distribution process completed",
        successfulDistributions: successfulDistributions.length,
        failedDistributions: failedDistributions.length,
        error: failedDistributions.length > 0,
        details: failedDistributions.map((failure) => ({
          reason: failure.reason.message || "Unknown error",
        })),
      });
    } else {
      throw new APIError(
        "No distribution made",
        STATUS_CODE.BAD_REQUEST,
        "No distribution made"
      );
    }
  } catch (err) {
    if (err instanceof APIError) {
      res.status(err.statusCode).json({ error: true, message: err.message });
    }
    res.status(err.statusCode).json({ error: true, message: err.message });
  }
};

export { handleBulkDistibution };
