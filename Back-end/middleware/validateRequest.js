export const validateRequest = (schema) => async (req, res, next) => {
  try {
    await schema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    return res.status(400).json({
      error: "Validation Failed",
      details: error.inner.map((err) => ({
        path: err.path,
        message: err.message,
      })),
    });
  }
};
