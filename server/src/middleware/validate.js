const { validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return res.status(400).json({
      message: extractedErrors[0].message,
      errors: extractedErrors,
    });
  };
};

module.exports = { validate };

