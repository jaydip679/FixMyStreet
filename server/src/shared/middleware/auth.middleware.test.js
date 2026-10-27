const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const {
  authenticate,
  requireRole,
  requireAdmin,
  requireCitizen
} = require('./auth.middleware');
const { UnauthorizedError, ForbiddenError } = require('../errors/app-error');

describe('Auth Middleware — Unit Tests', () => {
  let mockReq;
  let mockRes;
  let nextFn;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {};
    nextFn = jest.fn();
  });

  test('authenticate_with_valid_bearer_token_attaches_user_to_request', () => {
    // Arrange
    const payload = { id: 'user_1', email: 'citizen@example.com', role: 'CITIZEN' };
    const token = jwt.sign(payload, env.jwtSecret);
    mockReq.headers.authorization = `Bearer ${token}`;

    // Act
    authenticate(mockReq, mockRes, nextFn);

    // Assert
    expect(nextFn).toHaveBeenCalledWith();
    expect(mockReq.user).toMatchObject({
      id: 'user_1',
      email: 'citizen@example.com',
      role: 'CITIZEN'
    });
  });

  test('authenticate_without_authorization_header_calls_next_with_unauthorized_error', () => {
    // Arrange
    mockReq.headers.authorization = undefined;

    // Act
    authenticate(mockReq, mockRes, nextFn);

    // Assert
    expect(nextFn).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  test('authenticate_with_malformed_token_calls_next_with_unauthorized_error', () => {
    // Arrange
    mockReq.headers.authorization = 'Bearer invalid.jwt.token';

    // Act
    authenticate(mockReq, mockRes, nextFn);

    // Assert
    expect(nextFn).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  test('require_admin_allows_admin_user', () => {
    // Arrange
    mockReq.user = { id: 'admin_1', role: 'ADMIN' };

    // Act
    requireAdmin(mockReq, mockRes, nextFn);

    // Assert
    expect(nextFn).toHaveBeenCalledWith();
  });

  test('require_admin_rejects_citizen_with_forbidden_error', () => {
    // Arrange
    mockReq.user = { id: 'citizen_1', role: 'CITIZEN' };

    // Act
    requireAdmin(mockReq, mockRes, nextFn);

    // Assert
    expect(nextFn).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  test('require_citizen_allows_citizen_user', () => {
    // Arrange
    mockReq.user = { id: 'citizen_1', role: 'CITIZEN' };

    // Act
    requireCitizen(mockReq, mockRes, nextFn);

    // Assert
    expect(nextFn).toHaveBeenCalledWith();
  });
});
