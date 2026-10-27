const { AuthService } = require('./auth.service');
const { ConflictError, UnauthorizedError, NotFoundError } = require('../../shared/errors/app-error');
const bcrypt = require('bcryptjs');

describe('AuthService — Unit Tests', () => {
  let authService;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      createUser: jest.fn()
    };
    authService = new AuthService(mockRepository);
  });

  test('register_with_valid_citizen_details_creates_user_and_returns_token', async () => {
    // Arrange
    const input = {
      name: 'Ramesh Patel',
      email: 'ramesh@example.com',
      password: 'password123',
      role: 'CITIZEN'
    };
    mockRepository.findByEmail.mockResolvedValue(null);
    mockRepository.createUser.mockImplementation(async (userData) => ({
      _id: 'user_123',
      ...userData,
      toJSON: () => ({
        _id: 'user_123',
        name: userData.name,
        email: userData.email,
        role: userData.role
      })
    }));

    // Act
    const result = await authService.registerUser(input);

    // Assert
    expect(result).toHaveProperty('token');
    expect(result.user).toEqual({
      _id: 'user_123',
      name: 'Ramesh Patel',
      email: 'ramesh@example.com',
      role: 'CITIZEN'
    });
    expect(mockRepository.createUser).toHaveBeenCalledTimes(1);
  });

  test('register_with_existing_email_is_rejected_with_conflict', async () => {
    // Arrange
    const input = {
      name: 'Duplicate User',
      email: 'existing@example.com',
      password: 'password123'
    };
    mockRepository.findByEmail.mockResolvedValue({
      _id: 'existing_user_id',
      email: 'existing@example.com'
    });

    // Act & Assert (linear async assertion without if statement)
    await expect(authService.registerUser(input)).rejects.toThrow(ConflictError);
  });

  test('login_with_valid_credentials_succeeds_and_returns_token', async () => {
    // Arrange
    const rawPassword = 'SecretPassword123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const existingUser = {
      _id: 'user_456',
      email: 'valid@example.com',
      password: hashedPassword,
      role: 'CITIZEN',
      toJSON: () => ({ _id: 'user_456', email: 'valid@example.com', role: 'CITIZEN' })
    };
    mockRepository.findByEmail.mockResolvedValue(existingUser);

    // Act
    const result = await authService.loginUser({
      email: 'valid@example.com',
      password: rawPassword
    });

    // Assert
    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('valid@example.com');
  });

  test('login_with_incorrect_password_is_rejected', async () => {
    // Arrange
    const hashedPassword = await bcrypt.hash('CorrectPassword', 10);
    mockRepository.findByEmail.mockResolvedValue({
      _id: 'user_456',
      email: 'valid@example.com',
      password: hashedPassword
    });

    // Act & Assert
    await expect(
      authService.loginUser({ email: 'valid@example.com', password: 'WrongPassword' })
    ).rejects.toThrow(UnauthorizedError);
  });

  test('login_with_unregistered_email_is_rejected', async () => {
    // Arrange
    mockRepository.findByEmail.mockResolvedValue(null);

    // Act & Assert
    await expect(
      authService.loginUser({ email: 'unknown@example.com', password: 'password123' })
    ).rejects.toThrow(UnauthorizedError);
  });

  test('get_current_user_with_nonexistent_id_is_rejected', async () => {
    // Arrange
    mockRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(authService.getCurrentUser('nonexistent_id')).rejects.toThrow(NotFoundError);
  });
});
