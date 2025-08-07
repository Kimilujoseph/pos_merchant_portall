import { AccessoryManagementService } from "../../services/accessory-controller-service.js";
import { APIError, STATUS_CODE } from "../../Utils/app-error.js";

const accessoryManagementService = new AccessoryManagementService();

const addNewAccessoryProduct = async (req, res, next) => {
  try {
    const user = req.user;
    if (!["superuser", "manager"].includes(user.role)) {
      throw new APIError(
        "Not authorised",
        STATUS_CODE.UNAUTHORIZED,
        "Not authorised to add new accessory"
      );
    }
    const { accessoryDetails, financeDetails } = req.body;
    const { supplierId } = accessoryDetails;
    const newAccessoryProduct = await accessoryManagementService.createNewAccessoryProduct(
      {
        accessoryDetails,
        financeDetails,
        user: user.id,
        supplierId,
      }
    );
    res.status(201).json({
      message: "Accessory successfully added",
      data: newAccessoryProduct,
      error: false,
    });
  } catch (err) {
    if (err instanceof APIError) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, error: true });
    } else {
      return res
        .status(STATUS_CODE.INTERNAL_ERROR)
        .json({ message: "Internal Server Error", error: true });
    }
  }
};

const findSpecificAccessoryProduct = async (req, res, next) => {
  try {
    const productID = req.params.id;
    const id = parseInt(productID, 10);
    const user = req.user;
    if (user.role !== "manager" && user.role !== "superuser") {
      throw new APIError("Not allowed", 403, "Not allowed to view the product");
    }
    const foundProduct =
      await accessoryManagementService.findSpecificAccessoryProduct(id);
    return res.status(200).json({ status: 200, data: foundProduct });
  } catch (err) {
    if (err instanceof APIError) {
      return res.status(err.statusCode).json({ message: err.message });
    } else {
      return res.status(STATUS_CODE.INTERNAL_ERROR).json({ message: "Internal Server Error" });
    }
  }
};

const findSpecificProductHistory = async (req, res, next) => {
  try {
    const id = req.params.id;
    const productHistory = await accessoryManagementService.getProductHistory({
      id,
    });
    return res.status(200).json({ message: productHistory, error: false });
  } catch (err) {
    if (err instanceof APIError) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, error: true });
    } else {
      return res
        .status(STATUS_CODE.INTERNAL_ERROR)
        .json({ message: "Internal Server Error", error: false });
    }
  }
};

const findSpecificProductTransferHistory = async (req, res, next) => {
  try {
    const id = req.params.id;
    const productTransferHistory =
      await accessoryManagementService.getProductTransferHistory({ id });
    return res
      .status(200)
      .json({ message: productTransferHistory, error: false });
  } catch (err) {
    if (err instanceof APIError) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, error: true });
    } else {
      return res
        .status(STATUS_CODE.INTERNAL_ERROR)
        .json({ message: "Internal Server Error", error: false });
    }
  }
};

const findAllAccessoryProduct = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const user = req.user;
    if (user.role !== "superuser" && user.role !== "manager") {
      throw new APIError(
        "Unauthorized",
        STATUS_CODE.UNAUTHORIZED,
        "Not allowed to distribute the product"
      );
    }
    const { filteredItem, totalItems } =
      await accessoryManagementService.findAllAccessoryProduct(page, limit);
    res.status(200).json({
      message: "All mobile accessories",
      data: filteredItem,
      totalItems,
      page,
    });
  } catch (err) {
    if (err instanceof APIError) {
      return res.status(err.statusCode).json({ message: err.message });
    } else {
      return res.status(STATUS_CODE.INTERNAL_ERROR).json({ message: "Internal Server Error" });
    }
  }
};

const createNewProductUpdate = async (req, res, next) => {
  try {
    const user = req.user;
    const userId = user.id;
    const id = req.params.id;
    const updates = req.body;

    if (!["manager", "superuser"].includes(user.role)) {
      throw new APIError(
        "Not authorised",
        STATUS_CODE.UNAUTHORIZED,
        "Not authorised to commit an update"
      );
    }
    const updatedAccessory = await accessoryManagementService.updateAccessoryStock(
      id,
      updates,
      userId
    );

    return res.status(200).json({
      status: 200,
      data: updatedAccessory,
      message: "Accessory stock updated successfully",
    });
  } catch (err) {
    if (err instanceof APIError) {
      return res.status(err.statusCode).json({ message: err.message });
    } else {
      return res.status(STATUS_CODE.INTERNAL_ERROR).json({ message: "Internal Server Error" });
    }
  }
};

const confirmAccessoryArrival = async (req, res, next) => {
  try {
    let userId;
    const { shopname, productId, transferId, quantity } = req.body;
    const user = req.user;
    const stockId = parseInt(productId, 10);
    const transferID = parseInt(transferId, 10);
    userId = parseInt(user.id, 10);
    await accessoryManagementService.confirmDistribution({
      userId,
      shopname,
      stockId,
      quantity,
      transferID,
    });

    return res.status(200).json({
      message: "Successfully confirmed arrival",
      status: 200,
      error: false,
    });
  } catch (err) {
    if (err instanceof APIError) {
      return res
        .status(err.statusCode)
        .json({ message: err.message, error: true });
    } else {
      return res
        .status(STATUS_CODE.INTERNAL_ERROR)
        .json({ message: "Internal Server Error", error: true });
    }
  }
};

const createNewSoftDeletion = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.role !== "superuser" && user.role !== "manager") {
      throw new APIError(
        "Unauthorized",
        STATUS_CODE.UNAUTHORIZED,
        "Not allowed to update the product"
      );
    }

    const accessoryId = req.params.id;

    await accessoryManagementService.createNewSoftDeletion(accessoryId);

    return res.status(200).json({
      status: 200,
      data: "Successfully deleted the product",
    });
  } catch (err) {
    if (err instanceof APIError) {
      return res.status(err.statusCode).json({ message: err.message });
    } else {
      return res.status(STATUS_CODE.INTERNAL_ERROR).json({ message: "Internal Server Error" });
    }
  }
};

export {
  addNewAccessoryProduct,
  createNewProductUpdate,
  confirmAccessoryArrival,
  findAllAccessoryProduct,
  findSpecificAccessoryProduct,
  createNewSoftDeletion,
  findSpecificProductTransferHistory,
  findSpecificProductHistory,
};
