import { constants } from "./constants.js";

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  
  switch (statusCode) {
    case constants.VALIDATION_ERROR:
      res.json({
        title: "Validation error",
        message: err.message,
        stackTrace: process.env.NODE_ENV === "production" ? null : err.stack,
      });
      break;
    case constants.UNAUTHORIZED:
      res.json({
        title: "Unauthorized",
        message: err.message,
        stackTrace: process.env.NODE_ENV === "production" ? null : err.stack,
      });
      break;
    case constants.FORBIDDEN:
      res.json({
        title: "Forbidden Entry",
        message: err.message,
        stackTrace: process.env.NODE_ENV === "production" ? null : err.stack,
      });
      break;
    case constants.NOT_FOUND:
      res.json({
        title: "Not found",
        message: err.message,
        stackTrace: process.env.NODE_ENV === "production" ? null : err.stack,
      });
      break;
    case constants.SERVER_ERROR:
      res.json({
        title: "Server error",
        message: err.message,
        stackTrace: process.env.NODE_ENV === "production" ? null : err.stack,
      });
      break;

    default:
      console.error(err);
      res.status(500).json({ message: "An unexpected error occurred" });
      break;
  }
};

export default errorHandler;
