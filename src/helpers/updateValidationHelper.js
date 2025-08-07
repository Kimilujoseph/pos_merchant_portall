import { type } from "os";
import { APIError, STATUS_CODE } from "../Utils/app-error.js";
const validateUpdateInputs = (updates) => {
  //lets update the  update objetc first
  if (
    !updates ||
    typeof updates !== "object" ||
    Object.keys(updates).length === 0
  ) {
    throw new APIError(
      "service error",
      STATUS_CODE.BAD_REQUEST,
      "update values not provided"
    );
  }
  //lets create a validation  object
  const VALID_OBJECT = {
    IMEI: (value) => typeof value === "string" && value.length <= 15,
    stockStatus: (value) =>
      typeof value === "string" &&
      ["faulty", "reserved", "available"].includes(value),
    commission: (value) => !isNaN(value) && value >= 0,
    productCost: (value) => !isNaN(value) && value >= 0,
    discount: (value) => !isNaN(value) && value >= 0,
  };

  //lets lop through the updates of object while validating
  const validUpdates = {};
  for (const [field, value] of Object.entries(updates)) {
    if (!VALID_OBJECT[field]) {
      throw new APIError(
        "bad request",
        STATUS_CODE.BAD_REQUEST,
        `invalid field ${field} provided`
      );
    }
    if (!VALID_OBJECT[field](value)) {
      throw new APIError(
        "service error",
        STATUS_CODE.BAD_REQUEST,
        `invalid value for ${field} is provided`
      );
    }
    validUpdates[field] = [
      "availableStock",
      "commissssion",
      "productcost",
      "discount",
    ].includes(field)
      ? Number(value)
      : value;
  }
  return validUpdates;
};

const validateItemsInputs = (accessoryDetails) => {
  if (
    !accessoryDetails ||
    typeof accessoryDetails !== "object" ||
    Object.keys(accessoryDetails).length === 0
  ) {
    throw new APIError(
      "service error",
      STATUS_CODE.BAD_REQUEST,
      "DATA PROVIDED IS NOT VALID"
    );
  }
  const validObjects = {
    CategoryId: (value) => !isNaN(value) && value >= 0,
    availableStock: (value) => !isNaN(value) && value >= 0,
    stockStatus: (value) =>
      ["available", "suspended"].includes(value) && typeof value === "string",
    commission: (value) => !isNaN(value) && value >= 0,
    discount: (value) => !isNaN(value) && value >= 0,
    productcost: (value) => !isNaN(value) && value >= 0,
    faultyItems: (value) => !isNaN(value) && value >= 0,
    supplierName: (value) => typeof value === "string",
    productType: (value) => typeof value === "string",
    batchNumber: (value) => typeof value === "string",
    user: (value) => !isNaN(value),
  };
  const validValues = {};
  for (const [field, value] of Object.entries(accessoryDetails)) {
    if (!validObjects[field]) {
      throw new APIError(
        "bad request",
        STATUS_CODE.BAD_REQUEST,
        `invalid field ${field} provided`
      );
    }

    if (!validObjects[field](value)) {
      throw new APIError(
        "bad request",
        STATUS_CODE.BAD_REQUEST,
        `invalid value for ${field} provided`
      );
    }
    validValues[field] = [
      "CategoryId",
      "availbleStock",
      "commission",
      "productcost",
      "faultyItems",
      "user",
    ].includes(field)
      ? parseInt(value, 10)
      : value;
  }

  return validValues;
};

export { validateUpdateInputs, validateItemsInputs };
