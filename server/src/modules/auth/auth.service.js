const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('./auth.repository');
const { ConflictError, UnauthorizedError, NotFoundError } = require('../../shared/errors/app-error');
const env = require('../../config/env');

class AuthService {
  constructor(repository = authRepository) {
    this.repository = repository;
  }

  generateToken(user) {
    return jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );
  }

  async registerUser({ name, email, password, role }) {
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await this.repository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await this.repository.createUser({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'CITIZEN'
    });

    const token = this.generateToken(newUser);
    return {
      user: newUser.toJSON(),
      token
    };
  }

  async loginUser({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.repository.findByEmail(normalizedEmail);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = this.generateToken(user);
    return {
      user: user.toJSON(),
      token
    };
  }

  async getCurrentUser(userId) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user.toJSON();
  }
}

module.exports = new AuthService();
module.exports.AuthService = AuthService;
