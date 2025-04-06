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
const handleError = (res, err) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    error: message,
  });
};

export { handleResponse, handleError };
