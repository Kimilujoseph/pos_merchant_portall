import Joi from "joi";
const userinputvalidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phonenumber: Joi.string().required(),
    nextofkinname: Joi.string(),
    nextofkinphonenumber: Joi.string(),
  });
  return schema.validate(data);
};
// Schema for phone details
const phoneDetailsSchema = Joi.object({
  CategoryId: Joi.string().required().label("CategoryId"),
  IMEI: Joi.string()
    .pattern(/^\d{1,20}$/)
    .required()
    .label("IMEI")
    .messages({
      "string.pattern.base": "IMEI must be numeric and a maximum of 20 digits.",
    }),
  productType: Joi.string().label("productType"),
  storage: Joi.string().label("storage"),
  supplierName: Joi.string().required().label("supplierName"),
  productcost: Joi.number()
    .max(30000)
    .required()
    .label("productcost")
    .messages({
      "number.max": "Product cost must not exceed 30000.",
    }),
  color: Joi.string().required().label("color"),
  commission: Joi.number().required().label("commission"),
  batchNumber: Joi.string().required().label("batchNumber"),
  discount: Joi.number().required().label("discount"),
});
const financeDetailsSchema = Joi.object({
  financer: Joi.string().default("Captech limited").label("financer"),
  financeAmount: Joi.number().default(0).label("financeAmount"),
  financeStatus: Joi.string().default("paid").label("financeStatus"),
});
const salesPayloadSchema = Joi.object({
  phoneDetails: phoneDetailsSchema.required(),
  financeDetails: financeDetailsSchema.required(),
});

function validateSalesPayload(req, res, next) {
  const { error, value } = salesPayloadSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      error: error.details.map((detail) => detail.message),
    });
  }
  req.body = value;
  next();
}

export { userinputvalidation, validateSalesPayload };
