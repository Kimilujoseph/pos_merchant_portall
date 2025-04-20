const handleResponse = ({
  res,
  message = "Success",
  data = {},
  statusCode = 200,
}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(Object.keys(data).length > 0 && { data }),
  });
};

const handleSalesResponse = ({
  res,
  message = "success",
  successfulSales,
  failedSales,
  statusCode = 200,
}) => {
  return res.status(statusCode).json({
    message: message,
    successfulSales: successfulSales.length,
    failedSales: failedSales.length,
    error: failedSales.length > 0,
    details: failedSales.map((failure) => ({
      reason: failure.reason.message || "Unknown error",
    })),
  });
};
const handleError = (res, err) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    error: message,
  });
};

export { handleResponse, handleError, handleSalesResponse };
