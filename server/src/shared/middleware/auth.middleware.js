const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const { UnauthorizedError, ForbiddenError } = require('../errors/app-error');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Authentication token missing or invalid format'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = decoded; // { id, email, role, iat, exp }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Authentication token has expired'));
    }
    return next(new UnauthorizedError('Invalid authentication token'));
  }
}

/**
 * Middleware factory to enforce specific roles (e.g. 'ADMIN' or 'CITIZEN')
 * @param {...string} allowedRoles 
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access forbidden: required role ${allowedRoles.join(' or ')}, but current role is ${req.user.role}`
        )
      );
    }

    next();
  };
}

const requireAdmin = requireRole('ADMIN');
const requireCitizen = requireRole('CITIZEN');

module.exports = {
  authenticate,
  requireRole,
  requireAdmin,
  requireCitizen
};
