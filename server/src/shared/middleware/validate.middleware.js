const { ValidationError } = require('../errors/app-error');

/**
 * Higher-order middleware to validate incoming request data using Zod
 * @param {import('zod').ZodSchema} schema 
 * @param {'body' | 'query' | 'params'} source 
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const formattedErrors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return next(new ValidationError('Request validation failed', formattedErrors));
    }
    req[source] = result.data;
    next();
  };
}

module.exports = validate;
